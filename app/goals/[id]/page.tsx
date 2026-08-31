"use client";

import {
  IconArrowRight,
} from "@tabler/icons-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ScreenShell } from "@/components/screen-shell";
import { initialGoals } from "@/lib/mock-data";
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
  const [goal, setGoal] = useState<GoalRecord>(initialGoals[0]);
  const [chartData, setChartData] = useState<GoalHistoryPoint[]>([
    { date: "היום", value: 0 },
    { date: "שבוע", value: 25 },
    { date: "חודש", value: 50 },
  ]);

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

  const progress = Math.round(getGoalProgress(goal));

  return (
    <ScreenShell>
      <div className="mb-4 flex items-center gap-3">
        <Link href="/dashboard" className="text-[18px] text-[#6b5346]" aria-label="חזרה">
          <IconArrowRight size={18} />
        </Link>
        <p className="text-[15px] font-medium text-[#2d120b]">{goal.title}</p>
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
        <p className="mb-3 text-[13px] text-[#6b5346]">היסטוריה</p>
        {chartData.map((item: GoalHistoryPoint) => (
          <div key={item.date} className="flex items-center justify-between border-b border-[#f0dfd5] py-2 last:border-b-0">
            <span className="text-[13px] text-[#6b5346]">{item.date}</span>
            <span className="text-[13px] font-medium text-[#2d120b]">
              {goal.type === "quantitative" ? `${item.value} ${goal.details?.unit ?? ""}` : `${item.value} ${goal.type === "streak" ? "דק'" : "השלמות"}`}
            </span>
          </div>
        ))}
      </div>

      <button type="button" className="w-full rounded-[16px] bg-[#D85A30] px-4 py-[14px] text-[14px] font-medium text-[#FAECE7]">
        עדכון התקדמות
      </button>
    </ScreenShell>
  );
}
