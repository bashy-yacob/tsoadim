"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const completeOAuthFlow = async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        router.replace("/auth");
        return;
      }

      const { error } = await supabase.auth.getSession();
      if (error) {
        router.replace("/auth");
        return;
      }

      router.replace("/dashboard");
    };

    void completeOAuthFlow();
  }, [router]);

  return null;
}
