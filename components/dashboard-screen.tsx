import type { GoalRecord, ProfileRecord } from "@/types/dashboard";

type DashboardScreenProps = {
  profile: ProfileRecord | null;
  goals: GoalRecord[];
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

const goalBadge = (goal: GoalRecord) => {
  if (goal.type === "quantitative") {
    const target = Number(goal.details?.target_value ?? 0);
    const current = Number(goal.current_value ?? 0);
    return `${formatValue(current, goal.details?.unit)} / ${formatValue(target, goal.details?.unit)}`;
  }

  if (goal.type === "streak") {
    return `${goal.current_streak} ימים ברצף`;
  }

  return goal.is_completed ? "הושלם" : "באבן דרך";
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
    <div
      key={goal.id}
      className="flex items-center gap-3 rounded-[16px] bg-[#f6f0eb] p-3 shadow-[inset_0_0_0_1px_rgba(96,65,52,0.06)]"
    >
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
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-medium text-[#2d120b]">{goal.title}</p>
        <p className="mt-1 text-[12px] text-[#6b5346]">{progressText}</p>
      </div>
      <span className="text-[11px] font-medium text-[#BA7517]">{chipText}</span>
    </div>
  );
};

export function DashboardScreen({ profile, goals }: DashboardScreenProps) {
  const totalPoints = profile?.total_points ?? 0;
  const longestStreak = goals.reduce((max, goal) => Math.max(max, goal.current_streak), 0);
  const primaryGoal = goals[0];

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4efe9] p-5">
      <div className="w-full max-w-[420px] rounded-[30px] border border-[#e8d7cd] bg-[#fffaf6] p-4 shadow-[0_20px_50px_rgba(86,45,23,0.08)]" dir="rtl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <p className="text-[20px] font-medium text-[#2d120b]">היי {profile?.display_name ?? "משתמש"} 👋</p>
          <div className="flex items-center gap-2 rounded-full bg-[#FAC775] px-[10px] py-[5px] pr-[6px] text-[#412402]">
            <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#EF9F27] text-[13px]">⚡</span>
            <span className="text-[13px] font-medium">{totalPoints}</span>
          </div>
        </div>

        <div className="mb-5 rounded-[20px] bg-[#F0997B] p-4 text-[#4A1B0C]">
          <p className="mb-1 text-[12px] font-medium opacity-85">רצף נוכחי</p>
          <div className="flex items-baseline gap-2">
            <span className="text-[40px] font-medium">{longestStreak || 0}</span>
            <span className="text-[15px]">ימים ברצף 🔥</span>
          </div>
        </div>

        <div className="space-y-3">
          {goals.length > 0 ? goals.slice(0, 2).map(renderGoalCard) : (
            <div className="rounded-[16px] border border-dashed border-[#d8c2b4] bg-[#fff7f1] p-4 text-center text-[13px] text-[#6b5346]">
              עדיין אין יעדים פעילים. בוא ניצור את הראשון שלך.
            </div>
          )}
        </div>

        <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-[16px] bg-[#D85A30] px-4 py-[14px] text-[14px] font-medium text-[#FAECE7] shadow-[0_8px_18px_rgba(216,90,48,0.2)]">
          <span className="text-[18px]">＋</span>
          יעד חדש
        </button>

        {primaryGoal && (
          <div className="mt-5 rounded-[16px] border border-[#f0dfd4] bg-[#fff8f3] p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-[12px] text-[#6b5346]">יעד מוביל</span>
              <span className="text-[11px] font-medium text-[#BA7517]">{goalBadge(primaryGoal)}</span>
            </div>
            <p className="text-[14px] font-medium text-[#2d120b]">{primaryGoal.title}</p>
          </div>
        )}
      </div>
    </main>
  );
}
