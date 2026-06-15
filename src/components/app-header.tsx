import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, History, Terminal, User } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  const [email, setEmail] = useState<string | null>(null);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { location } = useRouterState();

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user.email ?? null);
    });
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user.email ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const onHistory = location.pathname.startsWith("/history");

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <header className="border-b border-border/60 backdrop-blur-sm sticky top-0 z-10 bg-background/70">
      <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5">
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
        </Link>

        <div className="flex items-center gap-2">
          {email ? (
            <>
              {!onHistory && (
                <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
                  <Link to="/history">
                    <History /> History
                  </Link>
                </Button>
              )}
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-secondary/50 border border-border text-xs text-muted-foreground">
                <User className="size-3" />
                <span className="max-w-[160px] truncate">{email}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground">
                <LogOut /> Sign out
              </Button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
