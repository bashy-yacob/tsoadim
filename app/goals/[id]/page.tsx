"use client";

import {
  IconCheck,
  IconEdit,
  IconArrowRight,
} from "@tabler/icons-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ScreenShell } from "@/components/screen-shell";
import { StreakTimer } from "@/components/streak-timer";
import { addProgressEntry } from "@/lib/database";
import { getGoalById } from "@/lib/supabase-data";
import type { GoalHistoryPoint, GoalRecord } from "@/types/goals";

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

export default function GoalDetailsPage() {
  const params = useParams<{ id: string }>();
  const [goal, setGoal] = useState<GoalRecord | null>(null);
  const [chartData, setChartData] = useState<GoalHistoryPoint[]>([]);
  const [progressValue, setProgressValue] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
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
        <p className="text-[14px] text-[#6b5346]">טוען את נתוני היעד...</p>
      </ScreenShell>
    );
  }

  const progress = Math.round(getGoalProgress(goal));
  const today = new Date().toISOString().split("T")[0];
  const completedToday = chartData.some((item) => item.date === today);

  const handleProgressUpdate = async () => {
    if (isUpdating || (goal.type === "streak" && completedToday) || goal.is_completed) return;

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
          durationMinutes={Number(goal.details.duration_minutes)}
          onCompleted={() => window.location.reload()}
        />
      )}

      <div className="mb-5 h-[180px] rounded-[16px] bg-[#fff6f1] p-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid stroke="#F0DFD5" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6B6459" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#6B6459" }} axisLine={false} tickLine={false} width={28} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#D85A30" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-5 rounded-[16px] bg-[#fff6f1] p-3">
        <p className="mb-3 text-[13px] text-[#6b5346]">הדרך עד עכשיו</p>
        {chartData.map((item: GoalHistoryPoint) => (
          <div key={item.date} className="flex items-center justify-between border-b border-[#f0dfd5] py-2 last:border-b-0">
            <span className="text-[13px] text-[#6b5346]">{item.date}</span>
            <span className="text-[13px] font-medium text-[#2d120b]">
              {goal.type === "quantitative" ? `${item.value} ${goal.details?.unit ?? ""}` : `${item.value} ${goal.type === "streak" ? "דק'" : "השלמות"}`}
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
        disabled={isUpdating || (goal.type === "streak" && completedToday) || goal.is_completed}
        className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-[#D85A30] px-4 py-[14px] text-[14px] font-medium text-[#FAECE7] disabled:opacity-50"
      >
        <IconCheck size={18} />
        {goal.type === "streak"
          ? completedToday ? "בוצע היום" : "סמן שעשיתי את זה היום"
          : goal.type === "milestone"
            ? goal.is_completed ? "היעד הושלם" : "סמן כהושלם"
            : "עדכון התקדמות"}
      </button>
      {updateMessage && <p className="mt-2 text-center text-[12px] text-[#6b5346]">{updateMessage}</p>}
    </ScreenShell>
  );
}
