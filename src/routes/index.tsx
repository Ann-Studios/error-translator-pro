import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import {
  AlertCircle,
  Sparkles,
  Copy,
  Check,
  Search,
  Wrench,
  Lightbulb,
  Loader2,
  Terminal,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { translateError } from "@/lib/translate-error.functions";
import { cn } from "@/lib/utils";

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

type Result = Awaited<ReturnType<typeof translateError>>;

function Index() {
  const translate = useServerFn(translateError);
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (input: { errorText: string; language?: string }) =>
      translate({ data: input }),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 3) return;
    mutation.mutate({
      errorText: text.trim(),
      language: language.trim() || undefined,
    });
  };

  const copy = async (key: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const result: Result | undefined = mutation.data;

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/60 backdrop-blur-sm sticky top-0 z-10 bg-background/70">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-lg bg-primary/15 grid place-items-center border border-primary/30">
              <Terminal className="size-4 text-primary" />
            </div>
            <div>
              <div className="font-mono text-sm font-semibold tracking-tight">
                error<span className="text-primary">.translate</span>()
              </div>
              <div className="text-[11px] text-muted-foreground -mt-0.5">
                stack traces → plain English
              </div>
            </div>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors hidden sm:inline-flex items-center gap-1"
          >
            Open source soon <ChevronRight className="size-3" />
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 sm:py-16">
        <section className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/50 text-xs text-muted-foreground mb-5">
            <Sparkles className="size-3 text-accent" />
            AI-powered error analysis
          </div>
          <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.05]">
            Make any error{" "}
            <span className="text-gradient">make sense</span>.
          </h1>
          <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Paste a stack trace, compiler error, or cryptic log line. Get a plain-English
            breakdown, likely causes, concrete fixes, and curated searches.
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
              <Button
                type="submit"
                disabled={mutation.isPending || text.trim().length < 3}
                className="font-medium"
              >
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
          <div className="mt-6 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive-foreground flex gap-3">
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

        {result && !mutation.isPending && (
          <div className="mt-10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Summary */}
            <section className="rounded-2xl border border-border bg-card p-6 glow-border">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="text-xs font-mono text-accent uppercase tracking-wider mb-1.5">
                    {result.likelyLanguage}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
                    {result.title}
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copy("summary", result.plainEnglish)}
                  className="text-muted-foreground"
                >
                  {copied === "summary" ? <Check /> : <Copy />}
                  {copied === "summary" ? "Copied" : "Copy"}
                </Button>
              </div>
              <p className="mt-4 text-foreground/90 leading-relaxed">
                {result.plainEnglish}
              </p>
            </section>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Causes */}
              <Section
                icon={<Lightbulb className="size-4" />}
                title="Common causes"
                accent="warning"
              >
                <ul className="space-y-2.5">
                  {result.causes.map((c, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="font-mono text-xs text-warning mt-0.5 flex-shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-foreground/85 leading-relaxed">{c}</span>
                    </li>
                  ))}
                </ul>
              </Section>

              {/* Searches */}
              <Section
                icon={<Search className="size-4" />}
                title="Related discussions"
                accent="accent"
              >
                <ul className="space-y-2">
                  {result.searchQueries.map((q, i) => (
                    <li key={i} className="grid grid-cols-[1fr_auto_auto] gap-2 items-center">
                      <span className="font-mono text-xs text-foreground/80 truncate">
                        {q}
                      </span>
                      <a
                        href={`https://stackoverflow.com/search?q=${encodeURIComponent(q)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-medium px-2 py-1 rounded-md bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20 transition-colors"
                      >
                        Stack Overflow
                      </a>
                      <a
                        href={`https://github.com/search?type=issues&q=${encodeURIComponent(q)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-medium px-2 py-1 rounded-md bg-secondary text-secondary-foreground border border-border hover:border-accent/50 transition-colors"
                      >
                        GitHub
                      </a>
                    </li>
                  ))}
                </ul>
              </Section>
            </div>

            {/* Fixes */}
            <Section
              icon={<Wrench className="size-4" />}
              title="Suggested fixes"
              accent="primary"
            >
              <div className="space-y-4">
                {result.fixes.map((fix, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-border bg-background/40 p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="size-5 rounded-md bg-primary/15 text-primary text-xs font-mono grid place-items-center border border-primary/30">
                        {i + 1}
                      </span>
                      <h4 className="font-medium text-foreground">{fix.title}</h4>
                    </div>
                    <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap">
                      {fix.steps}
                    </p>
                    {fix.code && (
                      <div className="relative mt-3 group">
                        <pre className="font-mono text-xs bg-background border border-border rounded-md p-3 overflow-x-auto text-foreground/90">
                          <code>{fix.code}</code>
                        </pre>
                        <button
                          type="button"
                          onClick={() => copy(`fix-${i}`, fix.code!)}
                          className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-secondary/80 text-muted-foreground border border-border opacity-0 group-hover:opacity-100 transition-opacity hover:text-foreground"
                        >
                          {copied === `fix-${i}` ? "Copied" : "Copy"}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}

        <footer className="mt-20 pt-8 border-t border-border/60 text-center text-xs text-muted-foreground">
          Built with Lovable AI · Paste responsibly — don't share secrets or PII.
        </footer>
      </main>
    </div>
  );
}

function Section({
  icon,
  title,
  accent,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  accent: "primary" | "accent" | "warning";
  children: React.ReactNode;
}) {
  const colorMap = {
    primary: "text-primary bg-primary/10 border-primary/30",
    accent: "text-accent bg-accent/10 border-accent/30",
    warning: "text-warning bg-warning/10 border-warning/30",
  };
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-2.5 mb-4">
        <span
          className={cn(
            "size-7 rounded-md grid place-items-center border",
            colorMap[accent],
          )}
        >
          {icon}
        </span>
        <h3 className="font-semibold tracking-tight">{title}</h3>
      </div>
      {children}
    </section>
  );
}
