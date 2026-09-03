"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IconAlertCircle, IconArrowLeft } from "@tabler/icons-react";
import { getCurrentUser } from "@/lib/auth";
import { createGoal, updateGoal, type GoalType } from "@/lib/database";
import { getGoalById } from "@/lib/supabase-data";
import type { GoalRecord } from "@/types/goals";

type GoalFormProps = {
  goalId?: string;
};

export function GoalFormComponent({ goalId }: GoalFormProps) {
  const router = useRouter();
  const isEditMode = Boolean(goalId);

  const [goalType, setGoalType] = useState<GoalType>("quantitative");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("בריאות");

  const [startValue, setStartValue] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("");

  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");
  const [targetPerWeek, setTargetPerWeek] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");

  const [dueDate, setDueDate] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);

  useEffect(() => {
    if (!goalId) return;

    let isMounted = true;

    const loadGoal = async () => {
      const result = await getGoalById(goalId);

      if (!isMounted) return;

      if (!result) {
        setError("לא ניתן לטעון את היעד");
        setIsLoading(false);
        return;
      }

      const goal: GoalRecord = result.goal;
      const details = goal.details ?? {};
      setGoalType(goal.type);
      setTitle(goal.title);
      setCategory(goal.category || "בריאות");
      setStartValue(details.start_value == null ? "" : String(details.start_value));
      setTargetValue(details.target_value == null ? "" : String(details.target_value));
      setUnit(details.unit == null ? "" : String(details.unit));
      setFrequency(details.frequency === "weekly" ? "weekly" : "daily");
      setTargetPerWeek(details.target_per_week == null ? "" : String(details.target_per_week));
      setDurationMinutes(details.duration_minutes == null ? "" : String(details.duration_minutes));
      setDueDate(details.due_date == null ? "" : String(details.due_date));
      setIsLoading(false);
    };

    void loadGoal();

    return () => {
      isMounted = false;
    };
  }, [goalId]);

  const validateForm = (): boolean => {
    if (!title.trim()) {
      setError("שם היעד הוא חובה");
      return false;
    }

    if (goalType === "quantitative") {
      if (!startValue || !targetValue) {
        setError("ערכים התחלתיים ויעד הם חובה");
        return false;
      }
      if (!unit.trim()) {
        setError("יחידה היא חובה");
        return false;
      }
    }

    if (goalType === "streak") {
      if (!targetPerWeek) {
        setError("יעד לשבוע הוא חובה");
        return false;
      }
    }

    if (goalType === "milestone") {
      if (!dueDate) {
        setError("תאריך יעד הוא חובה");
        return false;
      }

      const selectedDate = new Date(dueDate);
      if (Number.isNaN(selectedDate.getTime()) || selectedDate <= new Date()) {
        setError("תאריך יעד חייב להיות בעתיד");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const user = await getCurrentUser();
      if (!user) {
        setError("משתמש לא מחובר");
        return;
      }

      const details: Record<string, unknown> = {};

      if (goalType === "quantitative") {
        details.start_value = Number(startValue);
        details.target_value = Number(targetValue);
        details.unit = unit.trim();
      }

      if (goalType === "streak") {
        details.frequency = frequency;
        details.target_per_week = Number(targetPerWeek);
        if (durationMinutes) {
          details.duration_minutes = Number(durationMinutes);
        }
      }

      if (goalType === "milestone") {
        details.due_date = dueDate;
      }

      const savedGoal = goalId
        ? await updateGoal(goalId, {
            title: title.trim(),
            type: goalType,
            details,
            category: category || undefined,
          })
        : await createGoal(user.id, title.trim(), goalType, details, category || undefined);

      if (!savedGoal) {
        setError(isEditMode ? "נכשל עדכון היעד" : "נכשל יצירת היעד");
        return;
      }

      router.push(`/goals/${savedGoal.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בעת יצירת היעד");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    "בריאות",
    "כושר גופני",
    "למידה",
    "עבודה",
    "משפחה",
    "כספי",
    "אחר",
  ];

  return (
    <main className="min-h-screen bg-[#FAF9F6] px-4 py-6" dir="rtl">
      <div className="mx-auto max-w-[600px]">
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex h-[36px] w-[36px] items-center justify-center rounded-full transition-colors hover:bg-[#F5F3EF]"
            aria-label="חזור"
          >
            <IconArrowLeft size={20} className="text-[#6B6459]" />
          </Link>
          <h1 className="text-[24px] font-medium text-[#1F1B16]">
            {isEditMode ? "ערוך יעד" : "מה הפעם?"}
          </h1>
        </div>

        {error && (
          <div className="mb-6 flex gap-3 rounded-[12px] bg-[#FDE5E5] p-4">
            <IconAlertCircle size={20} className="flex-shrink-0 text-[#D85A30]" />
            <p className="text-[13px] text-[#5A3A32]">{error}</p>
          </div>
        )}

        {isLoading ? (
          <p className="text-[14px] text-[#6B6459]">טוען את נתוני היעד...</p>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-3 block text-[13px] font-medium text-[#1F1B16]">
              איזה סוג יעד זה?
            </label>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { type: "quantitative", label: "כמותי", emoji: "📊" },
                { type: "streak", label: "רצף", emoji: "🔥" },
                { type: "milestone", label: "אבן דרך", emoji: "🎯" },
              ].map((option) => (
                <button
                  key={option.type}
                  type="button"
                  onClick={() => setGoalType(option.type as GoalType)}
                  className={`rounded-[12px] border-2 p-4 text-center transition-all ${
                    goalType === option.type
                      ? "border-[#D85A30] bg-[#FFF4EE]"
                      : "border-[#E5E1D8] bg-white hover:border-[#D85A30]"
                  }`}
                >
                  <div className="mb-2 text-[24px]">{option.emoji}</div>
                  <p className="text-[13px] font-medium text-[#1F1B16]">{option.label}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[13px] font-medium text-[#1F1B16]">
              איך נקרא לזה?
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="למשל: לרוץ 5 ק״מ"
              className="w-full rounded-[12px] border border-[#E5E1D8] bg-white px-4 py-3 text-[14px] outline-none transition-colors focus:border-[#D85A30]"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="mb-2 block text-[13px] font-medium text-[#1F1B16]">
              קטגוריה
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-[12px] border border-[#E5E1D8] bg-white px-4 py-3 text-[14px] outline-none transition-colors focus:border-[#D85A30]"
              disabled={isSubmitting}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {goalType === "quantitative" && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[13px] font-medium text-[#1F1B16]">
                    מתחילים מ־
                  </label>
                  <input
                    type="number"
                    value={startValue}
                    onChange={(e) => setStartValue(e.target.value)}
                    placeholder="0"
                    step="0.1"
                    className="w-full rounded-[12px] border border-[#E5E1D8] bg-white px-4 py-3 text-[14px] outline-none transition-colors focus:border-[#D85A30]"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[13px] font-medium text-[#1F1B16]">
                    מגיעים עד
                  </label>
                  <input
                    type="number"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    placeholder="100"
                    step="0.1"
                    className="w-full rounded-[12px] border border-[#E5E1D8] bg-white px-4 py-3 text-[14px] outline-none transition-colors focus:border-[#D85A30]"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[13px] font-medium text-[#1F1B16]">
                  יחידה
                </label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder={'ק\"מ, ק\"ג, ש\"ח וכו\''}
                  className="w-full rounded-[12px] border border-[#E5E1D8] bg-white px-4 py-3 text-[14px] outline-none transition-colors focus:border-[#D85A30]"
                  disabled={isSubmitting}
                />
              </div>
            </>
          )}

          {goalType === "streak" && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[13px] font-medium text-[#1F1B16]">
                    תדירות
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as "daily" | "weekly")}
                    className="w-full rounded-[12px] border border-[#E5E1D8] bg-white px-4 py-3 text-[14px] outline-none transition-colors focus:border-[#D85A30]"
                    disabled={isSubmitting}
                  >
                    <option value="daily">יומי</option>
                    <option value="weekly">שבועי</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-[13px] font-medium text-[#1F1B16]">
                    יעד לשבוע
                  </label>
                  <input
                    type="number"
                    value={targetPerWeek}
                    onChange={(e) => setTargetPerWeek(e.target.value)}
                    placeholder="3"
                    className="w-full rounded-[12px] border border-[#E5E1D8] bg-white px-4 py-3 text-[14px] outline-none transition-colors focus:border-[#D85A30]"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[13px] font-medium text-[#1F1B16]">
                    משך בדקות (אופציונלי)
                </label>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  placeholder="20"
                  className="w-full rounded-[12px] border border-[#E5E1D8] bg-white px-4 py-3 text-[14px] outline-none transition-colors focus:border-[#D85A30]"
                  disabled={isSubmitting}
                />
              </div>
            </>
          )}

          {goalType === "milestone" && (
            <div>
              <label className="mb-2 block text-[13px] font-medium text-[#1F1B16]">
                עד מתי? (אופציונלי)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-[12px] border border-[#E5E1D8] bg-white px-4 py-3 text-[14px] outline-none transition-colors focus:border-[#D85A30]"
                disabled={isSubmitting}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-[12px] bg-[#D85A30] px-4 py-3 text-[14px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isSubmitting ? "שומרים..." : isEditMode ? "שמור שינויים" : "שמור יעד"}
          </button>
        </form>
        )}
      </div>
    </main>
  );
}
