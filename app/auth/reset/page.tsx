"use client";

import { IconAlertCircle, IconArrowLeft, IconTargetArrow } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { updatePassword } from "@/lib/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      Promise.resolve().then(() => {
        if (isMounted) {
          setError("שירות האימות אינו זמין כרגע");
          setIsReady(true);
        }
      });
      return;
    }

    let isMounted = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setIsReady(true);
      if (!data.session) {
        setError("קישור איפוס הסיסמה אינו תקף או שפג תוקפו");
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== passwordConfirmation) {
      setError("הסיסמאות אינן תואמות");
      return;
    }

    setIsSubmitting(true);
    const result = await updatePassword(newPassword);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error || "לא ניתן לעדכן את הסיסמה");
      return;
    }

    setSuccess("הסיסמה עודכנה בהצלחה. מעבירים אתכם להתחברות...");
    window.setTimeout(() => router.replace("/auth"), 1200);
  };

  return (
    <main className="flex min-h-screen flex-col bg-[#FAF9F6] px-4 py-6" dir="rtl">
      <div className="mx-auto w-full max-w-[420px]">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/auth"
            className="flex h-[36px] w-[36px] items-center justify-center rounded-full transition-colors hover:bg-[#F5F3EF]"
            aria-label="חזרה להתחברות"
          >
            <IconArrowLeft size={20} className="text-[#6B6459]" />
          </Link>
          <h1 className="text-[20px] font-medium text-[#1F1B16]">איפוס סיסמה</h1>
        </div>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-[60px] w-[60px] items-center justify-center rounded-[16px] bg-[#F5C4B3]">
            <IconTargetArrow size={32} className="text-[#B94A26]" />
          </div>
          <h2 className="mb-2 text-[22px] font-medium text-[#1F1B16]">בחרו סיסמה חדשה</h2>
          <p className="text-[14px] leading-6 text-[#6B6459]">הסיסמה צריכה להכיל לפחות 8 תווים, אות גדולה ומספר</p>
        </div>

        {(error || success) && (
          <div className={`mb-4 flex gap-3 rounded-[12px] p-3 ${success ? "bg-[#E6F4EA]" : "bg-[#FDE5E5]"}`}>
            {!success && <IconAlertCircle size={20} className="flex-shrink-0 text-[#D85A30]" />}
            <p className={`text-[13px] ${success ? "text-[#23613A]" : "text-[#5A3A32]"}`}>{error || success}</p>
          </div>
        )}

        {isReady && !error && !success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-[13px] font-medium text-[#1F1B16]">סיסמה חדשה</label>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="••••••••"
                required
                disabled={isSubmitting}
                className="w-full rounded-[12px] border border-[#E5E1D8] bg-white px-4 py-3 text-[14px] outline-none transition-colors focus:border-[#D85A30]"
              />
            </div>
            <div>
              <label className="mb-2 block text-[13px] font-medium text-[#1F1B16]">אימות סיסמה</label>
              <input
                type="password"
                value={passwordConfirmation}
                onChange={(event) => setPasswordConfirmation(event.target.value)}
                placeholder="••••••••"
                required
                disabled={isSubmitting}
                className="w-full rounded-[12px] border border-[#E5E1D8] bg-white px-4 py-3 text-[14px] outline-none transition-colors focus:border-[#D85A30]"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-[12px] bg-[#D85A30] px-4 py-3 text-[14px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isSubmitting ? "מעדכן..." : "עדכון סיסמה"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
