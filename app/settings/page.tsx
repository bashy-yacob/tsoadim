"use client";

import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ScreenShell } from "@/components/screen-shell";
import { getCurrentUser, signOut } from "@/lib/auth";
import { getProfile, isOptedInLeaderboard, setLeaderboardOptIn } from "@/lib/database";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("משתמש");
  const [email, setEmail] = useState("");
  const [optedIn, setOptedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      const user = await getCurrentUser();
      if (!user) {
        setIsLoading(false);
        return;
      }
      const [profile, leaderboardOptIn] = await Promise.all([
        getProfile(user.id),
        isOptedInLeaderboard(user.id),
      ]);
      setDisplayName(profile?.display_name || user.email.split("@")[0]);
      setEmail(user.email);
      setOptedIn(leaderboardOptIn);
      setIsLoading(false);
    };

    void loadSettings();
  }, []);

  const toggleLeaderboard = async () => {
    const user = await getCurrentUser();
    if (!user) return;
    const nextValue = !optedIn;
    const saved = await setLeaderboardOptIn(user.id, nextValue);
    if (saved) setOptedIn(nextValue);
    setMessage(saved ? "ההגדרה נשמרה" : "לא ניתן לשמור את ההגדרה");
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth");
  };

  return (
    <ScreenShell>
      <div className="mb-4 flex items-center gap-3">
        <Link href="/dashboard" className="text-[18px] text-[#6b5346]" aria-label="חזרה">
          <IconArrowLeft size={18} />
        </Link>
        <p className="text-[15px] font-medium text-[#2d120b]">הגדרות</p>
      </div>

      {isLoading ? <p className="text-[14px] text-[#6b5346]">טוען הגדרות...</p> : <>
      <div className="mb-4 rounded-[16px] bg-[#fff8f3] p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[14px] font-medium text-[#2d120b]">{displayName}</p>
            <p className="text-[12px] text-[#6B6459]">{email}</p>
          </div>
          <span className="rounded-full bg-[#f0dfd5] px-2 py-1 text-[10px] font-medium text-[#6b5346]">חינמי</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-[12px] bg-[#f6f0eb] px-3 py-3">
          <span className="text-[13px] text-[#2d120b]">לוח מנצחים</span>
          <button type="button" onClick={toggleLeaderboard} className="rounded-full bg-[#D85A30] px-2 py-1 text-[11px] font-medium text-white">{optedIn ? "פעיל" : "כבוי"}</button>
        </div>
        {message && <p className="text-[12px] text-[#6b5346]">{message}</p>}
        <Link href="/leaderboard" className="block rounded-[12px] bg-[#f6f0eb] px-3 py-3 text-[13px] text-[#2d120b]">פתיחת לוח המנצחים</Link>
        <button type="button" onClick={handleSignOut} className="w-full rounded-[12px] bg-[#f6f0eb] px-3 py-3 text-right text-[13px] text-[#2d120b]">התנתקות</button>
      </div>
      </>}
    </ScreenShell>
  );
}
