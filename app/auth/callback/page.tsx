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

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4efe9] text-[#2d120b]" dir="rtl">
      <div className="text-center">
        <div className="mb-3 text-[18px] font-medium">מסיים התחברות...</div>
        <div className="text-[14px] text-[#6b5346]">מעביר אותך ללוח הבקרה</div>
      </div>
    </main>
  );
}
