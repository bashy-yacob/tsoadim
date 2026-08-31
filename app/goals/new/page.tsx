"use client";

import {
  IconArrowLeft,
  IconFlag,
  IconFlame,
  IconTargetArrow,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ScreenShell } from "@/components/screen-shell";
import { createGoalRecord } from "@/lib/supabase-data";
import type { GoalType } from "@/types/goals";

export default function NewGoalPage() {
  const router = useRouter();
  const [goalType, setGoalType] = useState<GoalType>("quantitative");
  const [title, setTitle] = useState('לרוץ 5 ק"מ');
  const [category, setCategory] = useState("כושר");
  const [startValue, setStartValue] = useState(0);
  const [targetValue, setTargetValue] = useState(5);
  const [unit, setUnit] = useState('ק"מ');
  const [frequency, setFrequency] = useState("יומי");
  const [targetPerWeek, setTargetPerWeek] = useState(5);
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [dueDate, setDueDate] = useState("2026-09-10");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goalTypeMeta = {
    quantitative: { icon: <IconTargetArrow size={20} />, label: "כמותי" },
    streak: { icon: <IconFlame size={20} />, label: "סטריק" },
    milestone: { icon: <IconFlag size={20} />, label: "אבן דרך" },
  };

  const handleSave = async () => {
    setError(null);
    setIsSubmitting(true);

    const details: Record<string, unknown> = {};

    if (goalType === "quantitative") {
      Object.assign(details, {
        start_value: startValue,
        target_value: targetValue,
        unit,
      });
    }

    if (goalType === "streak") {
      Object.assign(details, {
        frequency,
        target_per_week: targetPerWeek,
        duration_minutes: durationMinutes,
      });
    }

    if (goalType === "milestone") {
      Object.assign(details, {
        due_date: dueDate,
      });
    }

    const result = await createGoalRecord({
      title: title.trim() || "יעד חדש",
      category,
      type: goalType,
      details,
    });

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error.message || "לא ניתן היה לשמור את היעד");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <ScreenShell>
      <div className="mb-4 flex items-center gap-3">
        <Link href="/dashboard" className="text-[18px] text-[#6b5346]" aria-label="חזרה">
          <IconArrowLeft size={18} />
        </Link>
        <p className="text-[15px] font-medium text-[#2d120b]">יעד חדש</p>
      </div>

      <div className="mb-4">
        <p className="mb-2 text-[13px] text-[#6b5346]">סוג היעד</p>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(goalTypeMeta).map(([key, value]) => (
            <button
              key={key}
              type="button"
              onClick={() => setGoalType(key as GoalType)}
              className={`rounded-[12px] border p-3 text-center ${
                goalType === key ? "border-[#E8A78F] bg-[#fff7f3]" : "border-[#efdfd5] bg-[#fff7f3]"
              }`}
            >
              <div className="flex justify-center text-[#D85A30]">{value.icon}</div>
              <p className="mt-1 text-[12px] text-[#6b5346]">{value.label}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="mb-2 text-[13px] text-[#6b5346]">שם היעד</p>
          <input value={title} onChange={(event) => setTitle(event.target.value)} className="w-full rounded-[12px] border border-[#e8d7cd] bg-[#fff] px-3 py-2 text-[14px] outline-none" />
        </div>

        <div>
          <p className="mb-2 text-[13px] text-[#6b5346]">קטגוריה</p>
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full rounded-[12px] border border-[#e8d7cd] bg-[#fff] px-3 py-2 text-[14px] outline-none">
            <option>כושר</option>
            <option>הרגל אישי</option>
            <option>אחר</option>
          </select>
        </div>

        {goalType === "quantitative" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="mb-2 text-[13px] text-[#6b5346]">ערך התחלתי</p>
                <input type="number" value={startValue} onChange={(event) => setStartValue(Number(event.target.value))} className="w-full rounded-[12px] border border-[#e8d7cd] bg-[#fff] px-3 py-2 text-[14px] outline-none" />
              </div>
              <div>
                <p className="mb-2 text-[13px] text-[#6b5346]">ערך יעד</p>
                <input type="number" value={targetValue} onChange={(event) => setTargetValue(Number(event.target.value))} className="w-full rounded-[12px] border border-[#e8d7cd] bg-[#fff] px-3 py-2 text-[14px] outline-none" />
              </div>
            </div>
            <div>
              <p className="mb-2 text-[13px] text-[#6b5346]">יחידה</p>
              <input value={unit} onChange={(event) => setUnit(event.target.value)} className="w-full rounded-[12px] border border-[#e8d7cd] bg-[#fff] px-3 py-2 text-[14px] outline-none" />
            </div>
          </>
        )}

        {goalType === "streak" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="mb-2 text-[13px] text-[#6b5346]">תדירות</p>
                <select value={frequency} onChange={(event) => setFrequency(event.target.value)} className="w-full rounded-[12px] border border-[#e8d7cd] bg-[#fff] px-3 py-2 text-[14px] outline-none">
                  <option>יומי</option>
                  <option>שבועי</option>
                </select>
              </div>
              <div>
                <p className="mb-2 text-[13px] text-[#6b5346]">יעד לשבוע</p>
                <input type="number" value={targetPerWeek} onChange={(event) => setTargetPerWeek(Number(event.target.value))} className="w-full rounded-[12px] border border-[#e8d7cd] bg-[#fff] px-3 py-2 text-[14px] outline-none" />
              </div>
            </div>
            <div>
              <p className="mb-2 text-[13px] text-[#6b5346]">משך בדקות</p>
              <input type="number" value={durationMinutes} onChange={(event) => setDurationMinutes(Number(event.target.value))} className="w-full rounded-[12px] border border-[#e8d7cd] bg-[#fff] px-3 py-2 text-[14px] outline-none" />
            </div>
          </>
        )}

        {goalType === "milestone" && (
          <div>
            <p className="mb-2 text-[13px] text-[#6b5346]">תאריך יעד</p>
            <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="w-full rounded-[12px] border border-[#e8d7cd] bg-[#fff] px-3 py-2 text-[14px] outline-none" />
          </div>
        )}
      </div>

      {error && <p className="mt-4 text-[12px] text-[#b8482d]">{error}</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={isSubmitting}
        className="mt-5 block w-full rounded-[16px] bg-[#D85A30] px-4 py-[14px] text-center text-[14px] font-medium text-[#FAECE7] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "שומר..." : "שמור יעד"}
      </button>
    </ScreenShell>
  );
}
