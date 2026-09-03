"use client";

import {
  IconArrowLeft,
  IconBrandGoogle,
  IconTargetArrow,
  IconAlertCircle,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  resetPassword,
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
} from "@/lib/auth";

export function AuthScreen() {
  const router = useRouter();
  const submitLockRef = useRef(false);
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting || submitLockRef.current) {
      return;
    }

    submitLockRef.current = true;
    setError(null);
    setIsSubmitting(true);

    try {
      if (isForgotPassword) {
        const result = await resetPassword(email);
        if (!result.success) {
          setError(result.error || "לא ניתן לאפס סיסמה");
          return;
        }

        setError("נשלח אליכם אימייל עם קישור לאיפוס הסיסמה.");
        return;
      }

      if (mode === "signup") {
        if (!displayName.trim()) {
          setError("שם תצוגה הוא חובה");
          return;
        }
        const result = await signUpWithEmail(email, password, displayName);
        if (!result.success) {
          setError(result.error || "נכשל הרישום");
          return;
        }

        if (result.needsEmailConfirmation) {
          setError("נשלח אימייל אישור. אמת את החשבון לפני הכניסה.");
          setMode("signin");
          return;
        }
      } else {
        const result = await signInWithEmail(email, password);
        if (!result.success) {
          setError(result.error || "נכשלה ההתחברות");
          return;
        }
      }

      router.push("/dashboard");
    } catch (err) {
      setError("אירעה שגיאה בתהליך");
    } finally {
      setIsSubmitting(false);
      submitLockRef.current = false;
    }
  };

  const handleGoogleSignIn = async () => {
    if (isSubmitting || submitLockRef.current) {
      return;
    }

    submitLockRef.current = true;
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await signInWithGoogle();
      if (!result.success) {
        setError(result.error || "נכשלה ההתחברות עם Google");
      }
    } finally {
      setIsSubmitting(false);
      submitLockRef.current = false;
    }
  };

  return (
    <main
      className="flex min-h-screen flex-col bg-[#FAF9F6] px-4 py-6"
      dir="rtl"
    >
      <div className="mx-auto w-full max-w-[420px]">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/"
            className="flex h-[36px] w-[36px] items-center justify-center rounded-full hover:bg-[#F5F3EF] transition-colors"
            aria-label="חזרה"
          >
            <IconArrowLeft size={20} className="text-[#6B6459]" />
          </Link>
          <h1 className="text-[20px] font-medium text-[#1F1B16]">
            {isForgotPassword ? "איפוס סיסמה" : mode === "signup" ? "רגע לפני שנתחיל" : "טוב לראות אותך שוב"}
          </h1>
        </div>

        {/* Logo & Title */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-[60px] w-[60px] items-center justify-center rounded-[16px] bg-[#F5C4B3]">
            <IconTargetArrow size={32} className="text-[#B94A26]" />
          </div>
          <h2 className="mb-2 text-[22px] font-medium text-[#1F1B16]">
            {isForgotPassword ? "נחזיר אותך לצועדים" : mode === "signup" ? "בואו נתחיל לצעוד" : "חזרו לצועדים"}
          </h2>
          <p className="text-[14px] leading-6 text-[#6B6459]">
            {isForgotPassword
              ? "הזינו את כתובת הדוא״ל שלכם ונשלח לכם קישור לאיפוס הסיסמה"
              : mode === "signup"
              ? "רשמו יעדים, עקבו אחרי ההתקדמות, וחגגו כל צעד"
              : "היעדים שלך עדיין כאן ומחכים לך"}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 flex gap-3 rounded-[12px] bg-[#FDE5E5] p-3">
            <IconAlertCircle size={20} className="flex-shrink-0 text-[#D85A30]" />
            <p className="text-[13px] text-[#5A3A32]">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
          {mode === "signup" && !isForgotPassword && (
            <div>
              <label className="mb-2 block text-[13px] font-medium text-[#1F1B16]">
                איך קוראים לך?
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="למשל: בשי"
                className="w-full rounded-[12px] border border-[#E5E1D8] bg-white px-4 py-3 text-[14px] outline-none focus:border-[#D85A30] transition-colors"
                disabled={isSubmitting}
              />
            </div>
          )}

          <div>
            <label className="mb-2 block text-[13px] font-medium text-[#1F1B16]">
                אימייל (לא נשלח ספאם, מבטיחים)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-[12px] border border-[#E5E1D8] bg-white px-4 py-3 text-[14px] outline-none focus:border-[#D85A30] transition-colors"
              disabled={isSubmitting}
            />
          </div>

          {!isForgotPassword && <div>
            <label className="mb-2 block text-[13px] font-medium text-[#1F1B16]">
                סיסמה (8 תווים ומעלה – כן, שוב)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-[12px] border border-[#E5E1D8] bg-white px-4 py-3 text-[14px] outline-none focus:border-[#D85A30] transition-colors"
              disabled={isSubmitting}
            />
          </div>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-[12px] bg-[#D85A30] px-4 py-3 text-[14px] font-medium text-white transition-opacity disabled:opacity-60 hover:opacity-90"
          >
            {isSubmitting
              ? "טוען..."
              : isForgotPassword
              ? "שלחו לי קישור לאיפוס"
              : mode === "signup"
              ? "צור חשבון"
              : "היכנס/י"}
          </button>
        </form>

        {!isForgotPassword && mode === "signin" && (
          <button
            type="button"
            onClick={() => {
              setIsForgotPassword(true);
              setError(null);
            }}
            className="mb-6 w-full text-center text-[13px] font-medium text-[#D85A30] hover:underline"
          >
            שכחתם את הסיסמה? קורה לכולם
          </button>
        )}

        {/* Divider */}
        {!isForgotPassword && <div className="mb-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#E5E1D8]" />
          <span className="text-[12px] text-[#9C9585]">או</span>
          <div className="h-px flex-1 bg-[#E5E1D8]" />
        </div>}

        {/* Google Sign In */}
        {!isForgotPassword && <button
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
          className="w-full rounded-[12px] border border-[#E5E1D8] bg-white px-4 py-3 flex items-center justify-center gap-2 text-[14px] font-medium text-[#1F1B16] transition-colors hover:bg-[#F5F3EF] disabled:opacity-60"
        >
          <IconBrandGoogle size={18} />
          <span>התחברות עם Google</span>
        </button>}

        {/* Mode Toggle */}
        <div className="mt-6 text-center">
          <p className="text-[13px] text-[#6B6459]">
            {isForgotPassword ? "נזכרתם בסיסמה?" : mode === "signup" ? "יש לכם חשבון?" : "אין לכם חשבון?"}
            <button
              onClick={() => {
                if (isForgotPassword) {
                  setIsForgotPassword(false);
                  setMode("signin");
                } else {
                  setMode(mode === "signup" ? "signin" : "signup");
                }
                setError(null);
              }}
              className="mr-1 font-medium text-[#D85A30] hover:underline"
            >
              {isForgotPassword ? "חזרו להתחברות" : mode === "signup" ? "התחברו" : "הרשמו"}
            </button>
          </p>
        </div>

        {/* Terms */}
        <p className="mt-6 text-center text-[12px] leading-5 text-[#9C9585]">
          בהמשך, אתם מסכימים לתנאי השימוש שלנו
          <br />
          ול<span className="inline cursor-pointer hover:underline">מדיניות הפרטיות</span>
        </p>
      </div>
    </main>
  );
}
