import { getGoal, getProgressEntries, type Goal } from "@/lib/database";
import type { GoalHistoryPoint, GoalRecord } from "@/types/goals";

function toGoalRecord(row: Goal, currentValue?: number): GoalRecord {
  const details = row.details as GoalRecord["details"];

  return {
    id: row.id,
    title: row.title,
    type: row.type,
    category: row.category ?? null,
    status: row.status,
    current_streak: row.current_streak,
    longest_streak: row.longest_streak,
    created_at: row.created_at,
    completed_at: row.completed_at ?? null,
    details,
    current_value: currentValue ?? row.current_value ?? Number(details.start_value ?? 0),
    is_completed: row.status === "completed",
  };
}

export async function getGoalById(goalId: string): Promise<{ goal: GoalRecord; chartData: GoalHistoryPoint[] } | null> {
  const goal = await getGoal(goalId);
  if (!goal) {
    return null;
  }

  const progressEntries = (await getProgressEntries(goal.id)).sort(
    (first, second) => new Date(first.created_at).getTime() - new Date(second.created_at).getTime()
  );
  let cumulativeValue = Number(goal.details.start_value ?? 0);
  const chartData = progressEntries.map((entry) => {
    const entryValue = Number(entry.value ?? 0);
    cumulativeValue += entryValue;
    return {
      id: entry.id,
      date: entry.entry_date,
      createdAt: entry.created_at,
      timestamp: new Date(entry.created_at).getTime(),
      entryValue,
      value: goal.type === "quantitative" ? cumulativeValue : entryValue,
    };
  });
  const currentValue = goal.type === "quantitative"
    ? goal.current_value ?? cumulativeValue
    : Number(progressEntries[progressEntries.length - 1]?.value ?? goal.details.start_value ?? 0);

  return {
    goal: toGoalRecord(goal, currentValue),
    chartData,
  };
}
