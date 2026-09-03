/**
 * Supabase Database Utilities
 * Centralized CRUD operations and real-time listeners for צועדים
 */

import { getSupabaseBrowserClient } from "./supabase";
import { GoalRecord, ProfileRecord } from "@/types/goals";

// Type definitions for database operations
export type GoalType = "quantitative" | "streak" | "milestone";

export type Goal = {
  id: string;
  user_id: string;
  type: GoalType;
  title: string;
  category?: string | null;
  details: {
    start_value?: number;
    target_value?: number;
    unit?: string;
    frequency?: string;
    target_per_week?: number;
    duration_minutes?: number;
    due_date?: string;
  };
  current_streak: number;
  longest_streak: number;
  status: "active" | "completed" | "archived";
  created_at: string;
  completed_at?: string;
};

export type ProgressEntry = {
  id: string;
  goal_id: string;
  value?: number;
  entry_date: string;
  note?: string;
  created_at: string;
};

export type Profile = {
  id: string;
  display_name: string;
  avatar_url?: string;
  total_points: number;
  created_at: string;
};

export type Subscription = {
  id: string;
  user_id: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  status: "free" | "trial" | "active" | "past_due" | "canceled";
  current_period_end?: string;
  created_at: string;
  updated_at: string;
};

/**
 * PROFILE OPERATIONS
 */

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data, error } = await (supabase.from("profiles") as any)
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return data as Profile;
}

export async function createProfile(
  userId: string,
  displayName: string,
  avatarUrl?: string
): Promise<Profile | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data, error } = await (supabase.from("profiles") as any)
    .insert({
      id: userId,
      display_name: displayName,
      avatar_url: avatarUrl || null,
      total_points: 0,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating profile:", error);
    return null;
  }

  return data as Profile;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Omit<Profile, "id" | "created_at">>
): Promise<Profile | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data, error } = await (supabase.from("profiles") as any)
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating profile:", error);
    return null;
  }

  return data as Profile;
}

/**
 * GOAL OPERATIONS
 */

export async function getGoals(userId: string): Promise<Goal[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];

  const { data, error } = await (supabase.from("goals") as any)
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching goals:", error);
    return [];
  }

  return data as Goal[];
}

export async function getGoal(goalId: string): Promise<Goal | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data, error } = await (supabase.from("goals") as any)
    .select("*")
    .eq("id", goalId)
    .single();

  if (error) {
    console.error("Error fetching goal:", error);
    return null;
  }

  return data as Goal;
}

export async function createGoal(
  userId: string,
  title: string,
  type: GoalType,
  details: Goal["details"],
  category?: string
): Promise<Goal | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data, error } = await (supabase.from("goals") as any)
    .insert({
      user_id: userId,
      title,
      type,
      details,
      category: category || null,
      status: "active",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating goal:", error);
    return null;
  }

  return data as Goal;
}

export async function updateGoal(
  goalId: string,
  updates: Partial<Omit<Goal, "id" | "user_id" | "created_at">>
): Promise<Goal | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data, error } = await (supabase.from("goals") as any)
    .update(updates)
    .eq("id", goalId)
    .select()
    .single();

  if (error) {
    console.error("Error updating goal:", error);
    return null;
  }

  return data as Goal;
}

export async function deleteGoal(goalId: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;

  const { error } = await (supabase.from("goals") as any)
    .update({ status: "archived" })
    .eq("id", goalId);

  if (error) {
    console.error("Error deleting goal:", error);
    return false;
  }

  return true;
}

/**
 * PROGRESS ENTRY OPERATIONS
 */

export async function getProgressEntries(goalId: string): Promise<ProgressEntry[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];

  const { data, error } = await (supabase.from("progress_entries") as any)
    .select("*")
    .eq("goal_id", goalId)
    .order("entry_date", { ascending: false });

  if (error) {
    console.error("Error fetching progress entries:", error);
    return [];
  }

  return data as ProgressEntry[];
}

export async function getLatestProgressEntries(goalIds: string[]): Promise<Map<string, ProgressEntry>> {
  const latestEntries = new Map<string, ProgressEntry>();
  if (goalIds.length === 0) return latestEntries;

  const supabase = getSupabaseBrowserClient();
  if (!supabase) return latestEntries;

  const { data, error } = await (supabase.from("progress_entries") as any)
    .select("*")
    .in("goal_id", goalIds)
    .order("entry_date", { ascending: false });

  if (error) {
    console.error("Error fetching latest progress entries:", error);
    return latestEntries;
  }

  for (const entry of (data ?? []) as ProgressEntry[]) {
    if (!latestEntries.has(entry.goal_id)) {
      latestEntries.set(entry.goal_id, entry);
    }
  }

  return latestEntries;
}

export async function addProgressEntry(
  goalId: string,
  value?: number,
  note?: string,
  entryDate: string = new Date().toISOString().split("T")[0]
): Promise<ProgressEntry | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const [{ data: goal, error: goalError }, { data: existingEntry, error: existingEntryError }, { data: profile, error: profileError }] = await Promise.all([
    (supabase.from("goals") as any).select("id, user_id, type, details, current_streak, longest_streak, status").eq("id", goalId).single(),
    (supabase.from("progress_entries") as any).select("id").eq("goal_id", goalId).eq("entry_date", entryDate).maybeSingle(),
    (supabase.from("profiles") as any).select("total_points").eq("id", (await supabase.auth.getUser()).data.user?.id ?? "").maybeSingle(),
  ]);

  if (goalError || existingEntryError || profileError || !goal) {
    console.error("Error preparing progress entry:", goalError || existingEntryError || profileError);
    return null;
  }

  const isDailyStreak = goal.type === "streak" && goal.details?.frequency !== "weekly";
  if (isDailyStreak && existingEntry) {
    return null;
  }

  const { data, error } = await (supabase.from("progress_entries") as any)
    .insert({
      goal_id: goalId,
      value: value ?? null,
      entry_date: entryDate,
      note: note || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding progress entry:", error);
    return null;
  }

  if (!existingEntry || goal.type !== "streak") {
    const { data: entries, error: entriesError } = await (supabase.from("progress_entries") as any)
      .select("entry_date")
      .eq("goal_id", goalId)
      .order("entry_date", { ascending: false });

    if (entriesError) {
      console.error("Error calculating streak:", entriesError);
      return data as ProgressEntry;
    }

    if (goal.type === "streak") {
      const entryDates = new Set((entries ?? []).map((entry: { entry_date: string }) => entry.entry_date));
      let currentStreak = 0;
      const date = new Date(`${entryDate}T00:00:00Z`);

      while (entryDates.has(date.toISOString().split("T")[0])) {
        currentStreak += 1;
        date.setUTCDate(date.getUTCDate() - 1);
      }

      const longestStreak = Math.max(Number(goal.longest_streak ?? 0), currentStreak);
      const { error: goalUpdateError } = await (supabase.from("goals") as any)
        .update({ current_streak: currentStreak, longest_streak: longestStreak })
        .eq("id", goalId);

      if (goalUpdateError) {
        console.error("Error updating goal streak:", goalUpdateError);
      }
    }

    const points = goal.type === "milestone"
      ? XP_VALUES.MILESTONE_COMPLETION
      : calculateXPForEntry(goal as Goal, data as ProgressEntry);

    if (goal.type === "milestone") {
      const { error: completionError } = await (supabase.from("goals") as any)
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", goalId);

      if (completionError) {
        console.error("Error completing milestone:", completionError);
      }
    }

    if (points > 0) {
      const { error: pointsError } = await (supabase.from("profiles") as any)
        .update({ total_points: Number(profile?.total_points ?? 0) + points })
        .eq("id", goal.user_id);

      if (pointsError) {
        console.error("Error updating profile points:", pointsError);
      }
    }
  }

  return data as ProgressEntry;
}

export async function deleteProgressEntry(entryId: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;

  const { error } = await (supabase.from("progress_entries") as any)
    .delete()
    .eq("id", entryId);

  if (error) {
    console.error("Error deleting progress entry:", error);
    return false;
  }

  return true;
}

/**
 * SUBSCRIPTION OPERATIONS (read-only for client)
 */

export async function getSubscription(userId: string): Promise<Subscription | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data, error } = await (supabase.from("subscriptions") as any)
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    // Subscription might not exist yet (new user)
    console.log("No subscription found for user");
    return null;
  }

  return data as Subscription;
}

/**
 * LEADERBOARD OPERATIONS
 */

export async function getGlobalLeaderboard(limit: number = 100): Promise<ProfileRecord[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];

  const { data, error } = await (supabase.rpc as any)("get_global_leaderboard", {
    limit_count: limit,
  });

  if (error) {
    console.error("Error fetching global leaderboard:", error);
    return [];
  }

  return data as ProfileRecord[];
}

export async function getGroupLeaderboard(
  groupId: string,
  limit: number = 100
): Promise<ProfileRecord[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];

  const { data, error } = await (supabase.rpc as any)("get_group_leaderboard", {
    group_id: groupId,
    limit_count: limit,
  });

  if (error) {
    console.error("Error fetching group leaderboard:", error);
    return [];
  }

  return data as ProfileRecord[];
}

/**
 * LEADERBOARD OPT-IN OPERATIONS
 */

export async function isOptedInLeaderboard(userId: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;

  const { data, error } = await (supabase.from("leaderboard_opt_in") as any)
    .select("opted_in")
    .eq("user_id", userId)
    .single();

  if (error) {
    return false; // Default to not opted in
  }

  return data?.opted_in || false;
}

export async function setLeaderboardOptIn(
  userId: string,
  optedIn: boolean
): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;

  const { error } = await (supabase.from("leaderboard_opt_in") as any)
    .upsert({
      user_id: userId,
      opted_in: optedIn,
    });

  if (error) {
    console.error("Error updating leaderboard opt-in:", error);
    return false;
  }

  return true;
}

/**
 * REAL-TIME LISTENERS
 */

export function subscribeToGoals(
  userId: string,
  callback: (goals: Goal[]) => void
) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return () => {};

  const channel = supabase
    .channel(`goals:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "goals",
        filter: `user_id=eq.${userId}`,
      },
      () => {
        // Refetch goals when changes detected
        getGoals(userId).then(callback);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToProgressEntries(
  goalId: string,
  callback: (entries: ProgressEntry[]) => void
) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return () => {};

  const channel = supabase
    .channel(`progress:${goalId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "progress_entries",
        filter: `goal_id=eq.${goalId}`,
      },
      () => {
        // Refetch entries when changes detected
        getProgressEntries(goalId).then(callback);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * POINTS CALCULATION (PLACEHOLDER - Adjust these values as needed)
 */

export const XP_VALUES = {
  // Points for streak-type goals
  STREAK_DAILY: 10,
  STREAK_WEEKLY: 50,

  // Points for quantitative goals (per update)
  QUANTITATIVE_UPDATE: 5,

  // Milestone bonus points
  MILESTONE_COMPLETION: 100,

  // Streak milestones
  STREAK_MILESTONE_7: 25,
  STREAK_MILESTONE_30: 100,
  STREAK_MILESTONE_100: 300,
};

/**
 * Helper: Calculate XP for a progress entry
 */
export function calculateXPForEntry(goal: Goal, progressEntry: ProgressEntry): number {
  if (goal.type === "streak") {
    return XP_VALUES.STREAK_DAILY;
  } else if (goal.type === "quantitative") {
    return XP_VALUES.QUANTITATIVE_UPDATE;
  } else if (goal.type === "milestone") {
    // Check if this entry completes the milestone
    if (goal.status === "completed") {
      return XP_VALUES.MILESTONE_COMPLETION;
    }
  }
  return 0;
}
