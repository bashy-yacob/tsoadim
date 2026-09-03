export type GoalType = "quantitative" | "streak" | "milestone";

export type GoalRecord = {
  id: string;
  title: string;
  type: GoalType;
  category?: string | null;
  status: string;
  current_streak: number;
  longest_streak: number;
  created_at: string;
  completed_at: string | null;
  details: Record<string, unknown> & {
    start_value?: number | null;
    target_value?: number | null;
    unit?: string | null;
    target_per_week?: number | null;
    frequency?: string | null;
    duration_minutes?: number | null;
    due_date?: string | null;
  };
  current_value: number;
  is_completed: boolean;
};

export type ProfileRecord = {
  id: string;
  display_name: string;
  total_points: number;
  avatar_url?: string | null;
};

export type GoalHistoryPoint = {
  id?: string;
  date: string;
  createdAt?: string;
  timestamp?: number;
  entryValue?: number;
  value: number;
};
