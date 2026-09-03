import type { GoalRecord, ProfileRecord } from "@/types/dashboard";
import Link from "next/link";
import { IconBolt, IconClock, IconFlame, IconPlus } from "@tabler/icons-react";

type DashboardScreenProps = {
  profile?: ProfileRecord | null;
  goals?: GoalRecord[];
};

const formatValue = (value: number | null | undefined, unit?: string | null) => {
  if (value == null || Number.isNaN(value)) {
    return "0";
  }

  const formatted = value % 1 === 0 ? value.toFixed(0) : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  return unit ? `${formatted} ${unit}` : formatted;
};

const goalProgress = (goal: GoalRecord) => {
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
};

// A streak goal with a duration attached (e.g. "10 min daily workout") gets a
// clock icon instead of the flame, so it visually reads as "timed" — adjust
// the `details` key below to whatever your schema actually calls this field.
const isTimedStreak = (goal: GoalRecord) =>
  goal.type === "streak" && Boolean(goal.details?.duration_minutes);

const renderGoalIcon = (goal: GoalRecord, percent: number) => {
  if (goal.type === "streak") {
    if (isTimedStreak(goal)) {
      return (
        <div
          className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-[#FAC775] text-[#633806]"
          aria-label={`יעד עם משך זמן, ${goal.current_streak} ימים ברצף`}
        >
          <IconClock size={20} />
        </div>
      );
    }
    return (
      <div
        className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-[#F0997B] text-[20px]"
        aria-label={`${goal.current_streak} ימים ברצף`}
      >
        🔥
      </div>
    );
  }

  return (
    <div
      className="relative flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full"
      style={{
        background: `conic-gradient(#D85A30 0% ${percent}%, #F5EEE8 ${percent}% 100%)`,
      }}
    >
      <div className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#f6f0eb] text-[10px] font-medium text-[#D85A30]">
        {percent}%
      </div>
    </div>
  );
};

const renderGoalCard = (goal: GoalRecord) => {
  const percent = Math.round(goalProgress(goal));
  const progressText = goal.type === "quantitative"
    ? `${formatValue(goal.current_value, goal.details?.unit)} מתוך ${formatValue(Number(goal.details?.target_value ?? 0), goal.details?.unit)}`
    : goal.type === "streak"
      ? `${goal.current_streak} ימים רצופים`
      : "מטרה מושלמת";

  const chipText = goal.type === "quantitative"
    ? `+${Math.max(10, Math.round(percent * 1.2))}`
    : goal.type === "streak"
      ? `+${goal.current_streak}/יום`
      : "+120";

  return (
    <Link
      href={`/goals/${goal.id}`}
      key={goal.id}
      aria-label={`פתיחת היעד ${goal.title}`}
      className="flex items-center gap-3 rounded-[16px] bg-[#f6f0eb] p-3 shadow-[inset_0_0_0_1px_rgba(96,65,52,0.06)]"
    >
      {renderGoalIcon(goal, percent)}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-medium text-[#2d120b]">{goal.title}</p>
        <p className="mt-1 text-[12px] text-[#6b5346]">{progressText}</p>
      </div>
      <span className="text-[11px] font-medium text-[#BA7517]">{chipText}</span>
    </Link>
  );
};

export function DashboardScreen({ profile = null, goals = [] }: DashboardScreenProps) {
  const totalPoints = profile?.total_points ?? 0;
  const longestStreak = goals.reduce((max, goal) => Math.max(max, goal.current_streak), 0);
  const displayName = profile?.display_name?.trim() || "משתמש";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4efe9] p-5">
      <div className="w-full max-w-[420px] rounded-[30px] border border-[#e8d7cd] bg-[#fffaf6] p-4 shadow-[0_20px_50px_rgba(86,45,23,0.08)]" dir="rtl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <p className="text-[20px] font-medium text-[#2d120b]">היי {displayName} 👋</p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FAC775] py-1 pr-1 pl-2.5">
            <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#EF9F27]">
              <IconBolt size={10} className="text-[#412402]" />
            </span>
            <span className="text-[11px] font-medium text-[#412402]">{totalPoints}</span>
          </span>
        </div>

        <div className="mb-5 rounded-[20px] bg-[#F0997B] p-4 text-[#4A1B0C]">
          <p className="mb-1 text-[12px] font-medium opacity-85">רצף נוכחי</p>
          <div className="flex items-baseline gap-2">
            <span className="text-[40px] font-medium">{longestStreak || 0}</span>
            <span className="inline-flex items-center gap-1 text-[15px]">ימים ברצף <IconFlame size={17} aria-hidden="true" /></span>
          </div>
        </div>

        <div className="space-y-3">
          {goals.length > 0 ? goals.slice(0, 2).map(renderGoalCard) : (
            <div className="rounded-[16px] border border-dashed border-[#d8c2b4] bg-[#fff7f1] p-4 text-center text-[13px] text-[#6b5346]">
              המקום הזה מחכה ליעד הראשון שלך
            </div>
          )}
        </div>

        {goals.length > 2 && (
          <Link href="/goals" className="mt-3 block text-center text-[13px] font-medium text-[#D85A30]">
            לכל היעדים ({goals.length})
          </Link>
        )}

        <Link href="/goals/new" className="mt-5 flex w-full items-center justify-center gap-2 rounded-[16px] bg-[#D85A30] px-4 py-[14px] text-[14px] font-medium text-[#FAECE7] shadow-[0_8px_18px_rgba(216,90,48,0.2)]">
          <IconPlus size={18} aria-hidden="true" />
          יעד חדש
        </Link>
      </div>
    </main>
  );
}