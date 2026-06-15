import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2, ChevronRight, Inbox, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { listTranslations, deleteTranslation } from "@/lib/translations.functions";

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
        <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Saved errors</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Every translation you run is saved here automatically.
            </p>
          </div>
          <Button onClick={() => navigate({ to: "/" })}>New translation</Button>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="size-4 animate-spin" /> Loading…
          </div>
        ) : !data || data.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <Inbox className="size-8 text-muted-foreground mx-auto mb-3" />
            <h2 className="font-medium">No saved errors yet</h2>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Translate your first error and it'll show up here.
            </p>
            <Button onClick={() => navigate({ to: "/" })}>Translate an error</Button>
          </div>
        ) : (
          <ul className="space-y-2">
            {data.map((row) => (
              <li
                key={row.id}
                className="group rounded-xl border border-border bg-card hover:border-accent/40 transition-colors"
              >
                <div className="flex items-stretch">
                  <Link
                    to="/_authenticated/history/$id"
                    params={{ id: row.id }}
                    className="flex-1 min-w-0 p-4 flex items-center gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {row.language && (
                          <span className="text-[10px] font-mono uppercase tracking-wider text-accent">
                            {row.language}
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(row.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <h3 className="font-medium truncate">{row.title}</h3>
                      <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">
                        {row.error_text.split("\n")[0]}
                      </p>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground group-hover:text-accent transition-colors flex-shrink-0" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => deleteMut.mutate(row.id)}
                    disabled={deleteMut.isPending}
                    aria-label="Delete"
                    className="px-4 border-l border-border text-muted-foreground hover:text-destructive transition-colors"
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
