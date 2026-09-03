"use client";

import {
  IconCheck,
  IconEdit,
  IconArrowRight,
} from "@tabler/icons-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ScreenShell } from "@/components/screen-shell";
import { StreakTimer } from "@/components/streak-timer";
import { addProgressEntry, deleteGoal } from "@/lib/database";
import { getGoalById } from "@/lib/supabase-data";
import type { GoalHistoryPoint, GoalRecord } from "@/types/goals";

type ProgressTooltipProps = {
  active?: boolean;
  payload?: Array<{ value?: number; payload?: GoalHistoryPoint }>;
  label?: number | string;
  unit?: string | null;
};

function ProgressTooltip({ active, payload, label, unit }: ProgressTooltipProps) {
  if (!active || !payload?.length) return null;

  const point = payload[0].payload;
  const entryValue = point?.entryValue ?? payload[0].value;
  const timestamp = point?.createdAt ? new Date(point.createdAt) : null;
  const formattedTimestamp = timestamp && !Number.isNaN(timestamp.getTime())
    ? timestamp.toLocaleString("he-IL", { dateStyle: "short", timeStyle: "short" })
    : point?.date;

  return (
    <div className="border border-[#E8D7CD] bg-[#FFFAF6] px-3 py-2 shadow-sm">
      <p className="text-[12px] text-[#6B6459]">{formattedTimestamp || label}</p>
      <p className="mt-1 text-[13px] text-[#6B6459]">
        עדכון: {formatValue(entryValue, unit)}
      </p>
      <p className="mt-1 text-[13px] font-medium text-[#D85A30]">
        ערך: {formatValue(payload[0].value, unit)}
      </p>
    </div>
  );
}

function formatValue(value: number | null | undefined, unit?: string | null) {
  if (value == null || Number.isNaN(value)) return "0";
  const formatted = value % 1 === 0 ? value.toFixed(0) : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  return unit ? `${formatted} ${unit}` : formatted;
}

function getYAxisTicks(values: number[]): number[] {
  const maximum = Math.max(...values, 0);
  if (maximum === 0) return [0, 1, 2, 3, 4];

  const rawStep = maximum / 4;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const normalizedStep = rawStep / magnitude;
  const niceStep = normalizedStep <= 1
    ? 1
    : normalizedStep <= 2
      ? 2
      : normalizedStep <= 5
        ? 5
        : 10;
  const step = niceStep * magnitude;
  const topTick = Math.ceil(maximum / step) * step;

  return Array.from({ length: Math.round(topTick / step) + 1 }, (_, index) =>
    Math.round(index * step)
  );
}

function getGoalProgress(goal: GoalRecord) {
  if (goal.type === "quantitative") {
    const target = Number(goal.details?.target_value ?? 0);
    const current = Number(goal.current_value ?? 0);
    if (!target) return 0;
    return Math.min(100, Math.max(0, (current / (target || 1)) * 100));
  }

  if (goal.type === "streak") {
    const target = Number(goal.details?.target_per_week ?? goal.current_streak ?? 0);
    if (!target) return 0;
    return Math.min(100, Math.max(0, (goal.current_streak / target) * 100));
  }

  return goal.is_completed ? 100 : 0;
}

export default function GoalDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [goal, setGoal] = useState<GoalRecord | null>(null);
  const [chartData, setChartData] = useState<GoalHistoryPoint[]>([]);
  const [progressValue, setProgressValue] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadGoal() {
      const nextGoal = await getGoalById(params.id);
      if (!isMounted || !nextGoal) return;
      setGoal(nextGoal.goal);
      setChartData(nextGoal.chartData);
    }

    void loadGoal();

    return () => {
      isMounted = false;
    };
  }, [params.id]);

  if (!goal) {
    return (
      <ScreenShell>
        <div className="animate-pulse" aria-busy="true" aria-label="טוענים את היעד">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#f0dfd5]" />
            <div className="h-5 w-40 rounded-full bg-[#eaded6]" />
            <div className="mr-auto h-9 w-9 rounded-full bg-[#f0dfd5]" />
          </div>
          <div className="mb-5 h-9 w-48 rounded-full bg-[#eaded6]" />
          <div className="mb-5 h-2 rounded-full bg-[#f0dfd5]" />
          <div className="mb-5 h-[180px] rounded-[16px] bg-[#fff1e9]" />
          <div className="rounded-[16px] bg-[#fff1e9] p-4">
            <div className="mb-4 h-4 w-24 rounded-full bg-[#eaded6]" />
            <div className="mb-3 h-4 rounded-full bg-[#eaded6]" />
            <div className="h-4 w-3/4 rounded-full bg-[#eaded6]" />
          </div>
        </div>
      </ScreenShell>
    );
  }

  const progress = Math.round(getGoalProgress(goal));
  const yTicks = getYAxisTicks(chartData.map((point) => point.value));
  const today = new Date().toISOString().split("T")[0];
  const isDailyStreak = goal.type === "streak" && goal.details.frequency !== "weekly";
  const completedToday = isDailyStreak && chartData.some((item) => item.date === today);

  const handleProgressUpdate = async () => {
    if (isUpdating || isDeleting || (isDailyStreak && completedToday) || goal.is_completed) return;

    const value = goal.type === "quantitative" ? Number(progressValue) : 1;
    if (goal.type === "quantitative" && (!progressValue || Number.isNaN(value))) {
      setUpdateMessage("הזיני ערך כדי לעדכן את ההתקדמות");
      return;
    }

    setIsUpdating(true);
    setUpdateMessage(null);
    const entry = await addProgressEntry(goal.id, value);
    setIsUpdating(false);

    if (!entry) {
      setUpdateMessage("לא ניתן לשמור את העדכון");
      return;
    }

    setUpdateMessage(goal.type === "streak" ? "סומן להיום וקיבלת ניקוד" : "ההתקדמות נשמרה וקיבלת ניקוד");
    window.location.reload();
  };

  const handleDelete = async () => {
    if (isDeleting || !window.confirm("בטוח/ה? היעד יוסר מהרשימה, אך ההיסטוריה תישמר.")) return;

    setIsDeleting(true);
    const deleted = await deleteGoal(goal.id);
    if (deleted) {
      router.push("/goals");
      return;
    }

    setIsDeleting(false);
    setUpdateMessage("לא ניתן למחוק את היעד");
  };

  return (
    <ScreenShell>
      <div className="mb-4 flex items-center gap-3">
        <Link href="/dashboard" className="text-[18px] text-[#6b5346]" aria-label="חזרה">
          <IconArrowRight size={18} />
        </Link>
        <p className="flex-1 text-[15px] font-medium text-[#2d120b]">{goal.title}</p>
        <Link
          href={`/goals/${goal.id}/edit`}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#6b5346] transition-colors hover:bg-[#f5ebe5]"
          aria-label="עריכת יעד"
          title="עריכת יעד"
        >
          <IconEdit size={18} />
        </Link>
      </div>

      <div className="mb-5 flex items-baseline gap-2">
        <span className="text-[28px] font-medium text-[#2d120b]">
          {goal.type === "quantitative" ? formatValue(goal.current_value, goal.details?.unit) : goal.current_streak}
        </span>
        <span className="text-[14px] text-[#6b5346]">
          {goal.type === "quantitative"
            ? `מתוך ${formatValue(Number(goal.details?.target_value ?? 0), goal.details?.unit)} (${progress}%)`
            : `${goal.current_streak} ימים ברצף`}
        </span>
      </div>

      <div className="mb-5 h-[8px] overflow-hidden rounded-full bg-[#f0dfd5]">
        <div className="h-full rounded-full bg-[#D85A30]" style={{ width: `${progress}%` }} />
      </div>

      {goal.type === "streak" && Number(goal.details.duration_minutes) > 0 && (
        <StreakTimer
          goalId={goal.id}
          goalTitle={goal.title}
          currentStreak={goal.current_streak}
          durationMinutes={Number(goal.details.duration_minutes)}
          onCompleted={() => window.location.reload()}
        />
      )}

      <div className="mb-5 h-[180px] rounded-[16px] bg-[#fff6f1] p-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid stroke="#F0DFD5" strokeDasharray="4 4" vertical={false} />
            <XAxis
              type="number"
              dataKey="timestamp"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
              tick={{ fontSize: 11, fill: "#6B6459" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, yTicks[yTicks.length - 1]]}
              ticks={yTicks}
              allowDecimals={false}
              tickFormatter={(value) => Math.round(Number(value)).toString()}
              tick={{ fontSize: 11, fill: "#6B6459" }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip content={<ProgressTooltip unit={goal.details?.unit} />} />
            <Line type="monotone" dataKey="value" stroke="#D85A30" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-5 rounded-[16px] bg-[#fff6f1] p-3">
        <p className="mb-3 text-[13px] text-[#6b5346]">הדרך עד עכשיו</p>
        {chartData.map((item: GoalHistoryPoint, index) => (
          <div key={item.id ?? `${item.date}-${index}`} className="flex items-center justify-between border-b border-[#f0dfd5] py-2 last:border-b-0">
            <span className="text-[13px] text-[#6b5346]">{item.date}</span>
            <span className="text-[13px] font-medium text-[#2d120b]">
              {goal.type === "quantitative"
                ? `עדכון ${formatValue(item.entryValue, goal.details?.unit)}`
                : `${item.value} ${goal.type === "streak" ? "דק'" : "השלמות"}`}
            </span>
          </div>
        ))}
      </div>

      {goal.type === "quantitative" && (
        <input
          type="number"
          value={progressValue}
          onChange={(event) => setProgressValue(event.target.value)}
          placeholder={`כמה השלמת הפעם? (${goal.details?.unit ?? ""})`}
          className="mb-2 w-full rounded-[12px] border border-[#e8d7cd] bg-[#fffaf6] px-4 py-3 text-[14px] outline-none focus:border-[#D85A30]"
          disabled={isUpdating}
        />
      )}

      <button
        type="button"
        onClick={handleProgressUpdate}
        disabled={isUpdating || isDeleting || (isDailyStreak && completedToday) || goal.is_completed}
        className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-[#D85A30] px-4 py-[14px] text-[14px] font-medium text-[#FAECE7] disabled:opacity-50"
      >
        <IconCheck size={18} />
        {goal.type === "streak"
          ? completedToday ? "בוצע היום" : "סמן שעשיתי את זה היום"
          : goal.type === "milestone"
            ? goal.is_completed ? "היעד הושלם" : "סמן כהושלם"
            : "עדכון התקדמות"}
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isUpdating || isDeleting}
        className="mt-3 w-full rounded-[12px] border border-[#E8D7CD] px-4 py-3 text-[13px] font-medium text-[#9B3B2D] disabled:opacity-50"
      >
        {isDeleting ? "מוחקים..." : "מחק יעד"}
      </button>
      {updateMessage && <p className="mt-2 text-center text-[12px] text-[#6b5346]">{updateMessage}</p>}
    </ScreenShell>
  );
}
