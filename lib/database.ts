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

export async function addProgressEntry(
  goalId: string,
  value?: number,
  note?: string,
  entryDate: string = new Date().toISOString().split("T")[0]
): Promise<ProgressEntry | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data, error } = await (supabase.from("progress_entries") as any)
    .upsert({
      goal_id: goalId,
      value: value || null,
      entry_date: entryDate,
      note: note || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding progress entry:", error);
    return null;
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
