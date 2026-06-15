import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  Sparkles,
  Loader2,
  Bookmark,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

import { AppHeader } from "@/components/app-header";
import { ResultView, type TranslationResult } from "@/components/result-view";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { translateError } from "@/lib/translate-error.functions";
import { saveTranslation } from "@/lib/translations.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Error Translator — Plain-English Fixes for Dev Errors" },
      {
        name: "description",
        content:
          "Paste any stack trace or error message and get a plain-English explanation, likely causes, suggested fixes, and curated Stack Overflow & GitHub searches.",
      },
      { property: "og:title", content: "Error Translator for Developers" },
      {
        property: "og:description",
        content:
          "Turn cryptic errors into clear explanations, root causes, and fixes — instantly.",
      },
    ],
  }),
  component: Index,
});

const SAMPLES = [
  {
    label: "TypeError",
    text: `TypeError: Cannot read properties of undefined (reading 'map')
    at UserList (UserList.tsx:14:23)
    at renderWithHooks (react-dom.development.js:14985:18)`,
  },
  {
    label: "Python",
    text: `Traceback (most recent call last):
  File "app.py", line 42, in <module>
    result = data["users"][0]["email"]
KeyError: 'users'`,
  },
  {
    label: "CORS",
    text: `Access to fetch at 'https://api.example.com/v1/data' from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.`,
  },
];

function Index() {
  const translate = useServerFn(translateError);
  const save = useServerFn(saveTranslation);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setIsAuthed(!!data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setIsAuthed(!!s));
    return () => data.subscription.unsubscribe();
  }, []);

  const mutation = useMutation({
    mutationFn: async (input: { errorText: string; language?: string }) => {
      const result = (await translate({ data: input })) as TranslationResult;
      let id: string | null = null;
      if (isAuthed) {
        try {
          const saved = await save({
            data: {
              errorText: input.errorText,
              language: input.language,
              title: result.title,
              result: result as unknown as Record<string, unknown>,
            },
          });
          id = saved.id;
          qc.invalidateQueries({ queryKey: ["translations"] });
          toast.success("Saved to your history");
        } catch (e) {
          console.error("Save failed", e);
        }
      }
      return { result, id };
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 3) return;
    setSavedId(null);
    mutation.mutate(
      { errorText: text.trim(), language: language.trim() || undefined },
      { onSuccess: ({ id }) => setSavedId(id) },
    );
  };

  return (
    <div className="min-h-screen">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-6 py-10 sm:py-16">
        <section className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/50 text-xs text-muted-foreground mb-5">
            <Sparkles className="size-3 text-accent" />
            AI-powered error analysis
          </div>
          <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.05]">
            Make any error <span className="text-gradient">make sense</span>.
          </h1>
          <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Paste a stack trace, compiler error, or cryptic log line. Get a plain-English
            breakdown, likely causes, concrete fixes, and curated searches.
            {isAuthed ? (
              <span className="block mt-1.5 text-success text-sm">
                <Bookmark className="inline size-3.5 mr-1" />
                Every translation is auto-saved to your history.
              </span>
            ) : (
              <span className="block mt-1.5 text-sm">
                <button
                  onClick={() => navigate({ to: "/auth" })}
                  className="text-accent hover:underline font-medium"
                >
                  Sign in
                </button>{" "}
                to save translations and revisit them later.
              </span>
            )}
          </p>
        </section>

        <form onSubmit={onSubmit} className="relative">
          <div className="rounded-2xl border border-border bg-card glow-border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/70 bg-background/40">
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-destructive/70" />
                <span className="size-2.5 rounded-full bg-warning/70" />
                <span className="size-2.5 rounded-full bg-success/70" />
                <span className="ml-3 font-mono text-xs text-muted-foreground">
                  paste-your-error.log
                </span>
              </div>
              <input
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="optional: language/framework"
                className="bg-transparent text-xs text-right text-muted-foreground placeholder:text-muted-foreground/60 focus:outline-none w-48 font-mono"
              />
            </div>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Paste error here…\n\nTypeError: Cannot read properties of undefined (reading 'map')\n    at UserList (UserList.tsx:14:23)`}
              className="font-mono text-sm min-h-[220px] border-0 rounded-none focus-visible:ring-0 bg-transparent resize-y"
            />
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-border/70 bg-background/40">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground mr-1">Try:</span>
                {SAMPLES.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => setText(s.text)}
                    className="text-xs font-mono px-2 py-1 rounded-md border border-border bg-secondary/50 text-secondary-foreground hover:border-accent/50 hover:text-accent transition-colors"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <Button type="submit" disabled={mutation.isPending || text.trim().length < 3}>
                {mutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <Sparkles />
                    Translate error
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

        {mutation.isError && (
          <div className="mt-6 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm flex gap-3">
            <AlertCircle className="size-5 flex-shrink-0 text-destructive" />
            <div>
              <div className="font-medium text-destructive">Couldn't analyze</div>
              <div className="text-muted-foreground mt-0.5">
                {(mutation.error as Error)?.message ?? "Something went wrong."}
              </div>
            </div>
          </div>
        )}

        {mutation.isPending && (
          <div className="mt-10 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card p-5 animate-pulse"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div className="h-4 w-1/3 bg-muted rounded mb-3" />
                <div className="h-3 w-full bg-muted/60 rounded mb-2" />
                <div className="h-3 w-4/5 bg-muted/60 rounded" />
              </div>
            ))}
          </div>
        )}

        {mutation.data && !mutation.isPending && (
          <div className="mt-10">
            {savedId && (
              <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-success/30 bg-success/10 px-4 py-2.5 text-sm">
                <span className="flex items-center gap-2 text-success">
                  <Bookmark className="size-4" /> Saved to your history
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate({ to: "/history" })}
                  className="text-success hover:text-success"
                >
                  View history <ArrowRight className="size-3" />
                </Button>
              </div>
            )}
            <ResultView result={mutation.data.result} />
          </div>
        )}

        <footer className="mt-20 pt-8 border-t border-border/60 text-center text-xs text-muted-foreground">
          Built with Lovable AI · Paste responsibly — don't share secrets or PII.
        </footer>
      </main>
    </div>
  );
}
