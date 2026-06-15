import { supabase } from "../supabase/client";

type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
};

export const lovable = {
  auth: {
    signInWithOAuth: async (
      provider: "google" | "apple" | "microsoft" | "lovable",
      opts?: SignInOptions
    ) => {
      if (provider === "lovable") {
        return { error: new Error("Lovable auth is not available on Vercel.") };
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: opts?.redirect_uri ?? `${window.location.origin}/auth`,
          queryParams: opts?.extraParams,
        },
      });

      if (error) return { error };

      return {
        redirected: true,
        data,
      };
    },
  },
};