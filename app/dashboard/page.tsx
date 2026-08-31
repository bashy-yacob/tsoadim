"use client";

import {
  IconBolt,
  IconFlag,
  IconFlame,
  IconPlus,
  IconSettings,
  IconTargetArrow,
} from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ScreenShell } from "@/components/screen-shell";
import { dashboardGreetings, initialGoals } from "@/lib/mock-data";
import { getDashboardData } from "@/lib/supabase-data";
import type { GoalRecord, ProfileRecord } from "@/types/goals";

function formatValue(value: number | null | undefined, unit?: string | null) {
  if (value == null || Number.isNaN(value)) return "0";
  const formatted = value % 1 === 0 ? value.toFixed(0) : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  return unit ? `${formatted} ${unit}` : formatted;
}

function getGoalProgress(goal: GoalRecord) {
  if (goal.type === "quantitative") {
    const start = Number(goal.details?.start_value ?? 0);
    const target = Number(goal.details?.target_value ?? 0);
    const current = Number(goal.current_value ?? 0);
    if (!target) return 0;
    return Math.min(100, Math.max(0, ((current - start) / (target - start || 1)) * 100));
  }

  if (goal.type === "streak") {
    const target = Number(goal.details?.target_per_week ?? goal.current_streak ?? 0);
    if (!target) return 0;
    return Math.min(100, Math.max(0, (goal.current_streak / target) * 100));
  }

  return goal.is_completed ? 100 : 0;
}

export default function DashboardPage() {
  const [goals, setGoals] = useState<GoalRecord[]>(initialGoals);
  const [profile, setProfile] = useState<ProfileRecord>({
    id: "demo-user",
    display_name: "בשי",
    total_points: 890,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      const data = await getDashboardData();
      if (!isMounted) return;
      setProfile(data.profile);
      setGoals(data.goals);
      setIsLoading(false);
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  const longestStreak = useMemo(
    () => goals.reduce((max, goal) => Math.max(max, goal.current_streak), 0),
    [goals]
  );
  const primaryGoal = goals[0];
  const greeting = dashboardGreetings[0].replace("{name}", profile.display_name || "משתמש");

  return (
    <ScreenShell>
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-[20px] font-medium text-[#2d120b]">{isLoading ? "טוען..." : greeting}</p>
        <Link href="/settings" className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-[#F5F3EF] text-[#2d120b]" aria-label="הגדרות">
          <IconSettings size={18} />
        </Link>
      </div>

      <div className="mb-5 flex items-center justify-end gap-2 rounded-full bg-[#FAC775] px-[10px] py-[5px] pr-[6px] text-[#412402]">
        <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#EF9F27] text-[13px]">
          <IconBolt size={12} />
        </span>
        <span className="text-[13px] font-medium">{profile.total_points}</span>
      </div>

      <div className="mb-5 rounded-[20px] bg-[#F0997B] p-4 text-[#4A1B0C]">
        <p className="mb-1 text-[12px] font-medium opacity-85">רצף נוכחי</p>
        <div className="flex items-baseline gap-2">
          <span className="text-[40px] font-medium">{longestStreak || 0}</span>
          <span className="text-[15px]">ימים ברצף 🔥</span>
        </div>
        <p className="mt-2 text-[12px] text-[#4A1B0C] opacity-80">עוד 3 ימים לשבירת שיא!</p>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2.5">
        <div className="rounded-[16px] bg-[#f6f0eb] p-3 text-center">
          <p className="text-[22px] font-medium text-[#D85A30]">{goals.length || 0}</p>
          <p className="mt-1 text-[12px] text-[#6b5346]">יעדים פעילים</p>
        </div>
        <div className="rounded-[16px] bg-[#f6f0eb] p-3 text-center">
          <p className="text-[22px] font-medium text-[#BA7517]">{goals.filter((goal) => goal.is_completed).length || 0}</p>
          <p className="mt-1 text-[12px] text-[#6b5346]">הישגים החודש</p>
        </div>
      </div>

      <div className="mb-2 text-[13px] font-medium text-[#6b5346]">היעדים שלי</div>

      <div className="space-y-3">
        {goals.slice(0, 2).map((goal) => {
          const percent = Math.round(getGoalProgress(goal));
          const progressText =
            goal.type === "quantitative"
              ? `${formatValue(goal.current_value, goal.details?.unit)} מתוך ${formatValue(Number(goal.details?.target_value ?? 0), goal.details?.unit)}`
              : goal.type === "streak"
                ? `${goal.current_streak} ימים רצופים`
                : "מטרה מושלמת";

          return (
            <Link
              key={goal.id}
              href={`/goals/${goal.id}`}
              className="flex w-full items-center gap-3 rounded-[16px] bg-[#f6f0eb] p-3 text-right shadow-[inset_0_0_0_1px_rgba(96,65,52,0.06)]"
            >
              <div
                className="relative flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full"
                style={{ background: `conic-gradient(#D85A30 0% ${percent}%, #F5EEE8 ${percent}% 100%)` }}
              >
                <div className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#f6f0eb] text-[10px] font-medium text-[#D85A30]">
                  {percent}%
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium text-[#2d120b]">{goal.title}</p>
                <p className="mt-1 text-[12px] text-[#6b5346]">{progressText}</p>
              </div>
              <span className="text-[11px] font-medium text-[#BA7517]">
                {goal.type === "quantitative"
                  ? `+${Math.max(10, Math.round(percent * 1.2))}`
                  : goal.type === "streak"
                    ? `+${goal.current_streak}/יום`
                    : "+120"}
              </span>
            </Link>
          );
        })}
      </div>

      <Link href="/goals/new" className="mt-5 flex w-full items-center justify-center gap-2 rounded-[16px] bg-[#D85A30] px-4 py-[14px] text-[14px] font-medium text-[#FAECE7] shadow-[0_8px_18px_rgba(216,90,48,0.2)]">
        <IconPlus size={18} />
        יעד חדש
      </Link>

      <Link href="/leaderboard" className="mt-3 flex w-full items-center justify-center rounded-[14px] border border-[#ecd8cf] bg-[#fff8f5] px-3 py-2 text-[13px] font-medium text-[#6b5346]">
        לוח מנצחים
      </Link>

      {primaryGoal && (
        <div className="mt-5 rounded-[16px] border border-[#f0dfd4] bg-[#fff8f3] p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-[12px] text-[#6b5346]">יעד מוביל</span>
            <span className="text-[11px] font-medium text-[#BA7517]">
              {primaryGoal.type === "quantitative"
                ? `${formatValue(primaryGoal.current_value, primaryGoal.details?.unit)} / ${formatValue(Number(primaryGoal.details?.target_value ?? 0), primaryGoal.details?.unit)}`
                : primaryGoal.type === "streak"
                  ? `${primaryGoal.current_streak} ימים ברצף`
                  : "הושלם"}
            </span>
          </div>
          <p className="text-[14px] font-medium text-[#2d120b]">{primaryGoal.title}</p>
        </div>
      )}
    </ScreenShell>
  );
}
