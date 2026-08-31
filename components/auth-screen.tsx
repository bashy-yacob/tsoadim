"use client";

import {
  IconArrowLeft,
  IconBrandGoogle,
  IconTargetArrow,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ScreenShell } from "@/components/screen-shell";
import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase";
import { ensureProfileForUser } from "@/lib/supabase-data";

export function AuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<"register" | "login">("register");
  const [fullName, setFullName] = useState("בשי קליין");
  const [email, setEmail] = useState("name@example.com");
  const [password, setPassword] = useState("12345678");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError(null);

    if (!hasSupabaseConfig) {
      router.push("/dashboard");
      return;
    }

    const client = getSupabaseBrowserClient();
    if (!client) {
      router.push("/dashboard");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "register") {
        const { data, error: signUpError } = await client.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName.trim() || "משתמש חדש",
            },
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }

        const userId = data.user?.id;
        if (userId) {
          await ensureProfileForUser(userId, fullName.trim() || "משתמש חדש");
        }
      } else {
        const { error: loginError } = await client.auth.signInWithPassword({
          email,
          password,
        });

        if (loginError) {
          setError(loginError.message);
          return;
        }
      }

      router.push("/dashboard");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "אירעה שגיאה בהתחברות");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenShell>
      <div className="mb-4 flex items-center justify-between">
        <Link href="/" className="text-[18px] text-[#6b5346]" aria-label="חזרה">
          <IconArrowLeft size={18} />
        </Link>
        <div className="text-[15px] font-medium text-[#2d120b]">התחברות</div>
      </div>

      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-[56px] w-[56px] items-center justify-center rounded-[16px] bg-[#F5C4B3]">
          <IconTargetArrow size={28} color="#B94A26" />
        </div>
        <p className="text-[18px] font-medium text-[#2d120b]">בואו נתחיל להתקדם</p>
        <p className="mt-1 text-[13px] text-[#6B6459]">רשמו יעדים, עקבו אחרי התקדמות, חגגו הישגים</p>
      </div>

      <div className="mb-5 flex gap-2 rounded-[12px] bg-[#F5F3EF] p-1">
        {[
          { key: "register", label: "הרשמה" },
          { key: "login", label: "התחברות" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setMode(tab.key as "register" | "login")}
            className={`flex-1 rounded-[8px] px-2 py-2 text-[13px] font-medium ${
              mode === tab.key ? "bg-[#fff] text-[#2d120b] shadow-sm" : "text-[#6B6459]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {mode === "register" && (
        <>
          <label className="mb-3 block text-[13px] text-[#6B6459]">שם מלא</label>
          <input
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="בשי קליין"
            className="mb-4 w-full rounded-[10px] border border-[#D9C9BF] bg-white px-3 py-2.5 text-[14px] outline-none"
          />
          <label className="mb-3 block text-[13px] text-[#6B6459]">אימייל</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@example.com"
            className="mb-4 w-full rounded-[10px] border border-[#D9C9BF] bg-white px-3 py-2.5 text-[14px] outline-none"
          />
          <label className="mb-3 block text-[13px] text-[#6B6459]">סיסמה</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="לפחות 8 תווים"
            className="mb-5 w-full rounded-[10px] border border-[#D9C9BF] bg-white px-3 py-2.5 text-[14px] outline-none"
          />
        </>
      )}

      {mode === "login" && (
        <>
          <label className="mb-3 block text-[13px] text-[#6B6459]">אימייל</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@example.com"
            className="mb-4 w-full rounded-[10px] border border-[#D9C9BF] bg-white px-3 py-2.5 text-[14px] outline-none"
          />
          <label className="mb-3 block text-[13px] text-[#6B6459]">סיסמה</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            className="mb-5 w-full rounded-[10px] border border-[#D9C9BF] bg-white px-3 py-2.5 text-[14px] outline-none"
          />
        </>
      )}

      {error && <p className="mb-4 text-[12px] text-[#b8482d]">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="mb-4 block w-full rounded-[12px] bg-[#D85A30] px-4 py-3 text-center text-[14px] font-medium text-[#FAECE7] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "מעבד..." : mode === "register" ? "יצירת חשבון" : "התחברות"}
      </button>

      <div className="mb-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-[#E5E1D8]" />
        <span className="text-[12px] text-[#9C9585]">או</span>
        <div className="h-px flex-1 bg-[#E5E1D8]" />
      </div>

      <button type="button" className="flex w-full items-center justify-center gap-2 rounded-[12px] border border-[#D9C9BF] bg-transparent px-4 py-3 text-[14px] text-[#2d120b]">
        <IconBrandGoogle size={18} />
        המשך עם Google
      </button>
    </ScreenShell>
  );
}
