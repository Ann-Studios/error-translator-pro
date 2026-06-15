import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { AppHeader } from "@/components/app-header";
import { ResultView, type TranslationResult } from "@/components/result-view";
import { getTranslation } from "@/lib/translations.functions";

export const Route = createFileRoute("/_authenticated/history/$id")({
  head: () => ({ meta: [{ title: "Saved error — Error Translator" }] }),
  component: DetailPage,
});

function DetailPage() {
  const { id } = Route.useParams();
  const get = useServerFn(getTranslation);
  const { data, isLoading, error } = useQuery({
    queryKey: ["translation", id],
    queryFn: () => get({ data: { id } }),
  });

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <Link
          to="/history"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="size-4" /> Back to history
        </Link>

        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="size-4 animate-spin" /> Loading…
          </div>
        )}
        {error && (
          <div className="text-sm text-destructive">{(error as Error).message}</div>
        )}
        {data && (
          <>
            <div className="text-xs text-muted-foreground mb-4">
              Saved {formatDistanceToNow(new Date(data.created_at), { addSuffix: true })}
            </div>
            <details className="mb-6 rounded-xl border border-border bg-card">
              <summary className="cursor-pointer px-4 py-3 text-sm font-mono text-muted-foreground">
                Original error
              </summary>
              <pre className="px-4 pb-4 text-xs font-mono whitespace-pre-wrap text-foreground/80 overflow-x-auto">
                {data.error_text}
              </pre>
            </details>
            <ResultView result={data.result as TranslationResult} />
          </>
        )}
      </main>
    </div>
  );
}
