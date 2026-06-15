import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2, ChevronRight, Inbox, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import {
  listTranslations,
  deleteTranslation,
} from "@/lib/translations.functions";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({
    meta: [
      { title: "History — Error Translator" },
      { name: "description", content: "Your saved error analyses." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const list = useServerFn(listTranslations);
  const del = useServerFn(deleteTranslation);
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["translations"],
    queryFn: () => list(),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["translations"] });
      toast.success("Deleted");
    },
    onError: (e) => toast.error((e as Error).message),
  });

  return (
    <div className="min-h-screen">
      <AppHeader />

      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Saved errors
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Every translation you run is saved here automatically.
            </p>
          </div>

          <Button onClick={() => navigate({ to: "/" })}>
            New translation
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading…
          </div>
        ) : !data || data.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <Inbox className="mx-auto mb-3 size-8 text-muted-foreground" />
            <h2 className="font-medium">No saved errors yet</h2>
            <p className="mb-4 mt-1 text-sm text-muted-foreground">
              Translate your first error and it&apos;ll show up here.
            </p>
            <Button onClick={() => navigate({ to: "/" })}>
              Translate an error
            </Button>
          </div>
        ) : (
          <ul className="space-y-2">
            {data.map((row) => (
              <li
                key={row.id}
                className="group rounded-xl border border-border bg-card transition-colors hover:border-accent/40"
              >
                <div className="flex items-stretch">
                  <Link
                    to="/history/$id"
                    params={{ id: row.id }}
                    className="flex min-w-0 flex-1 items-center gap-3 p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        {row.language && (
                          <span className="text-[10px] font-mono uppercase tracking-wider text-accent">
                            {row.language}
                          </span>
                        )}

                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(row.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>

                      <h3 className="truncate font-medium">{row.title}</h3>

                      <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                        {row.error_text.split("\n")[0]}
                      </p>
                    </div>

                    <ChevronRight className="size-4 flex-shrink-0 text-muted-foreground transition-colors group-hover:text-accent" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => deleteMut.mutate(row.id)}
                    disabled={deleteMut.isPending}
                    aria-label="Delete"
                    className="border-l border-border px-4 text-muted-foreground transition-colors hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}