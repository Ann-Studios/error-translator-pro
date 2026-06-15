import { useState } from "react";
import { Lightbulb, Search, Wrench, Copy, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type TranslationResult = {
  title: string;
  plainEnglish: string;
  likelyLanguage: string;
  causes: string[];
  fixes: { title: string; steps: string; code?: string }[];
  searchQueries: string[];
};

export function ResultView({ result }: { result: TranslationResult }) {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (key: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
        <p className="mt-4 text-foreground/90 leading-relaxed">{result.plainEnglish}</p>
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        <Section icon={<Lightbulb className="size-4" />} title="Common causes" accent="warning">
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

        <Section icon={<Search className="size-4" />} title="Related discussions" accent="accent">
          <ul className="space-y-2">
            {result.searchQueries.map((q, i) => (
              <li key={i} className="grid grid-cols-[1fr_auto_auto] gap-2 items-center">
                <span className="font-mono text-xs text-foreground/80 truncate">{q}</span>
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

      <Section icon={<Wrench className="size-4" />} title="Suggested fixes" accent="primary">
        <div className="space-y-4">
          {result.fixes.map((fix, i) => (
            <div key={i} className="rounded-lg border border-border bg-background/40 p-4">
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
        <span className={cn("size-7 rounded-md grid place-items-center border", colorMap[accent])}>
          {icon}
        </span>
        <h3 className="font-semibold tracking-tight">{title}</h3>
      </div>
      {children}
    </section>
  );
}
