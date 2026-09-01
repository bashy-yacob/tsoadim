import { getSupabaseBrowserClient } from "@/lib/supabase";
import { goalHistory, initialGoals, profile as fallbackProfile } from "@/lib/mock-data";
import type { GoalHistoryPoint, GoalRecord, ProfileRecord } from "@/types/goals";

type SupabaseGoalRow = {
  id: string;
  title: string;
  type: GoalRecord["type"] | string;
  status: string;
  current_streak?: number | null;
  longest_streak?: number | null;
  created_at?: string | null;
  completed_at?: string | null;
  details?: Record<string, unknown> | null;
  current_value?: number | null;
  is_completed?: boolean | null;
};

type SupabaseProfileRow = {
  id: string;
  display_name?: string | null;
  total_points?: number | null;
  avatar_url?: string | null;
};

function toGoalRecord(row: SupabaseGoalRow): GoalRecord {
  return {
    id: row.id,
    title: row.title,
    type: (row.type as GoalRecord["type"]) || "quantitative",
    status: row.status || "active",
    current_streak: Number(row.current_streak ?? 0),
    longest_streak: Number(row.longest_streak ?? 0),
    created_at: row.created_at || new Date().toISOString(),
    completed_at: row.completed_at ?? null,
    details: (row.details ?? {}) as GoalRecord["details"],
    current_value: Number(row.current_value ?? 0),
    is_completed: Boolean(row.is_completed),
  };
}

function toProfileRecord(row?: SupabaseProfileRow | null): ProfileRecord {
  return {
    id: row?.id || fallbackProfile.id,
    display_name: row?.display_name || fallbackProfile.display_name,
    total_points: Number(row?.total_points ?? fallbackProfile.total_points),
    avatar_url: row?.avatar_url || fallbackProfile.avatar_url || null,
  };
}

export async function getDashboardData(): Promise<{ profile: ProfileRecord; goals: GoalRecord[] }> {
  const client = getSupabaseBrowserClient();

  if (!client) {
    return { profile: fallbackProfile, goals: initialGoals };
  }

  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError || !user) {
    return { profile: fallbackProfile, goals: initialGoals };
  }

  const [{ data: profileData, error: profileError }, { data: goalsData, error: goalsError }] = await Promise.all([
    (client.from("profiles") as any).select("*").eq("id", user.id).maybeSingle(),
    (client.from("goals") as any).select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);

  if (profileError && profileError.code !== "PGRST116") {
    return { profile: fallbackProfile, goals: initialGoals };
  }

  if (goalsError) {
    return { profile: toProfileRecord(profileData), goals: initialGoals };
  }

  const safeProfile = toProfileRecord(profileData) || fallbackProfile;
  const safeGoals = (goalsData ?? []).map(toGoalRecord);

  return {
    profile: {
      ...safeProfile,
      display_name: safeProfile.display_name || user.user_metadata?.full_name || user.email?.split("@")[0] || fallbackProfile.display_name,
    },
    goals: safeGoals.length > 0 ? safeGoals : initialGoals,
  };
}

export async function getGoalById(goalId: string): Promise<{ goal: GoalRecord; chartData: GoalHistoryPoint[] } | null> {
  const client = getSupabaseBrowserClient();

  if (!client) {
    const fallbackGoal = initialGoals.find((goal) => goal.id === goalId) ?? initialGoals[0];
    return { goal: fallbackGoal, chartData: goalHistory[fallbackGoal.id] ?? [] };
  }

  const { data, error } = await (client.from("goals") as any).select("*").eq("id", goalId).maybeSingle();

  if (error || !data) {
    const fallbackGoal = initialGoals.find((goal) => goal.id === goalId) ?? initialGoals[0];
    return { goal: fallbackGoal, chartData: goalHistory[fallbackGoal.id] ?? [] };
  }

  const goal = toGoalRecord(data);

  return {
    goal,
    chartData: goalHistory[goal.id] ?? [
      { date: "היום", value: goal.current_value },
      { date: "שבוע", value: Math.max(goal.current_value * 0.8, 0) },
      { date: "חודש", value: Math.max(goal.current_value * 1.2, 0) },
    ],
  };
}

export async function ensureProfileForUser(userId: string, displayName: string) {
  const client = getSupabaseBrowserClient();

  if (!client) {
    return null;
  }

  return (client.from("profiles") as any).upsert(
    {
      id: userId,
      display_name: displayName,
      avatar_url: null,
      total_points: 0,
    },
    { onConflict: "id" }
  );
}

export async function createGoalRecord(input: {
  title: string;
  category: string;
  type: GoalRecord["type"];
  details: Record<string, unknown>;
}) {
  const client = getSupabaseBrowserClient();

  if (!client) {
    return { error: null, created: false };
  }

  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError || !user) {
    return { error: new Error("המשתמש לא מחובר"), created: false };
  }

  const { error } = await (client.from("goals") as any).insert([
    {
      user_id: user.id,
      title: input.title,
      category: input.category,
      type: input.type,
      details: input.details,
      current_streak: 0,
      longest_streak: 0,
      status: "active",
      current_value: Number((input.details as any).start_value ?? 0),
      is_completed: false,
    },
  ]);

  return { error, created: !error };
}
