"use client";

import { IconChartBar, IconCheck, IconChevronLeft, IconFlame, IconTargetArrow } from "@tabler/icons-react";
import Link from "next/link";
import { Goal } from "@/lib/database";

interface GoalCardProps {
  goal: Goal;
}

export function GoalCard({ goal }: GoalCardProps) {
  const getProgressPercentage = (): number => {
    if (goal.type === "quantitative") {
      const start = goal.details.start_value || 0;
      const target = goal.details.target_value || 100;
      const current = Number(goal.details.start_value ?? 0);
      return Math.min(100, Math.max(0, ((current - start) / (target - start || 1)) * 100));
    } else if (goal.type === "streak") {
      return (goal.current_streak / (goal.details.target_per_week || 7)) * 100;
    } else if (goal.type === "milestone") {
      return goal.status === "completed" ? 100 : 0;
    }
    return 0;
  };

  const getGoalIcon = () => {
    switch (goal.type) {
      case "quantitative":
        return <IconChartBar size={18} stroke={1.8} />;
      case "streak":
        return <IconFlame size={18} stroke={1.8} />;
      case "milestone":
        return <IconTargetArrow size={18} stroke={1.8} />;
      default:
        return <IconTargetArrow size={18} stroke={1.8} />;
    }
  };

  const getTypeLabel = () => {
    switch (goal.type) {
      case "quantitative":
        return "כמותי";
      case "streak":
        return "רצף";
      case "milestone":
        return "אבן דרך";
      default:
        return "";
    }
  };

  const getStreakDisplay = () => {
    if (goal.type !== "streak") return null;
    return (
      <div className="rounded-[12px] bg-[#F0997B] px-3 py-2">
        <p className="text-[11px] font-medium text-[#4A1B0C] opacity-80">רצף נוכחי</p>
        <div className="flex items-baseline gap-1">
          <span className="text-[22px] font-medium text-[#4A1B0C]">
            {goal.current_streak}
          </span>
          <span className="text-[12px] text-[#4A1B0C]">ימים</span>
        </div>
      </div>
    );
  };

  const getProgressInfo = () => {
    if (goal.type === "quantitative") {
      const current = goal.details.start_value || 0;
      const target = goal.details.target_value || 100;
      const unit = goal.details.unit || "";
      return `${current}/${target} ${unit}`;
    } else if (goal.type === "milestone") {
      if (goal.status === "completed") return <span className="inline-flex items-center gap-1"><IconCheck size={14} /> הושלם</span>;
      const dueDate = new Date(goal.details.due_date || "");
      return dueDate.toLocaleDateString("he-IL");
    }
    return "";
  };

  return (
    <div className="rounded-[16px] border border-[#E5E1D8] bg-white p-4 transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[#D85A30]">{getGoalIcon()}</span>
            <span className="text-[11px] font-medium text-[#9C9585] uppercase">
              {getTypeLabel()}
            </span>
          </div>
          <h3 className="text-[15px] font-medium text-[#1F1B16]">{goal.title}</h3>
          {goal.category && (
            <p className="mt-1 text-[12px] text-[#9C9585]">{goal.category}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/goals/${goal.id}`}
            className="flex h-[32px] w-[32px] items-center justify-center rounded-[8px] transition-colors hover:bg-[#F5F3EF]"
            aria-label="פתיחה"
          >
            <IconChevronLeft size={18} className="text-[#6B6459]" />
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="mb-3 space-y-3">
        {getStreakDisplay()}

        {/* Progress Bar */}
        {goal.type !== "streak" && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[12px] font-medium text-[#6B6459]">
                התקדמות
              </span>
              <span className="text-[12px] font-medium text-[#D85A30]">
                {Math.round(getProgressPercentage())}%
              </span>
            </div>
            <div className="h-[6px] w-full rounded-full bg-[#F0DFD5]">
              <div
                className="h-full rounded-full bg-[#D85A30] transition-all"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>
        )}

        {/* Info */}
        {getProgressInfo() && (
          <p className="text-[12px] font-medium text-[#6B6459]">
            {getProgressInfo()}
          </p>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex gap-2 border-t border-[#F5F3EF] pt-3">
        <Link
          href={`/goals/${goal.id}`}
          className="flex-1 rounded-[8px] bg-[#F5F3EF] px-3 py-2 text-center text-[12px] font-medium text-[#1F1B16] transition-colors hover:bg-[#EEE9E1]"
        >
          {goal.type === "streak" ? "עדכן רצף" : "עדכן התקדמות"}
        </Link>
      </div>
    </div>
  );
}
