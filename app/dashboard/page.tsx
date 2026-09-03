"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardScreen } from "@/components/dashboard-screen";
import { getCurrentUser } from "@/lib/auth";
import { getGoals, getLatestProgressEntries, getProfile } from "@/lib/database";
import type { GoalRecord, ProfileRecord } from "@/types/dashboard";

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [goals, setGoals] = useState<GoalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      const user = await getCurrentUser();

      if (!user) {
        router.replace("/auth");
        return;
      }

      const [profileData, goalsData] = await Promise.all([
        getProfile(user.id),
        getGoals(user.id),
      ]);
      const latestProgressEntries = await getLatestProgressEntries(
        goalsData.map((goal) => goal.id)
      );

      if (!isMounted) return;

      setProfile(
        profileData
          ? {
              id: profileData.id,
              display_name: profileData.display_name,
              total_points: profileData.total_points,
              avatar_url: profileData.avatar_url ?? null,
            }
          : null
      );

      setGoals(
        goalsData.map((goal) => ({
          id: goal.id,
          title: goal.title,
          type: goal.type,
          category: goal.category ?? null,
          status: goal.status,
          current_streak: goal.current_streak ?? 0,
          longest_streak: goal.longest_streak ?? 0,
          created_at: goal.created_at,
          completed_at: goal.completed_at ?? null,
          details: goal.details ?? {},
          current_value: Number(
            latestProgressEntries.get(goal.id)?.value ?? goal.details?.start_value ?? 0
          ),
          is_completed: goal.status === "completed",
        }))
      );

      setIsLoading(false);
    };

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#f4efe9] px-4 py-6" dir="rtl" aria-busy="true">
        <div className="mx-auto w-full max-w-[420px] animate-pulse rounded-[30px] border border-[#e8d7cd] bg-[#fffaf6] p-4">
          <div className="mb-8 h-10 w-48 rounded-[12px] bg-[#e5d8cf]" />
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <div className="h-28 rounded-[16px] bg-[#eaded6]" />
            <div className="h-28 rounded-[16px] bg-[#eaded6]" />
            <div className="h-28 rounded-[16px] bg-[#eaded6]" />
          </div>
          <div className="h-48 rounded-[16px] bg-[#eaded6]" />
        </div>
      </main>
    );
  }

  return <DashboardScreen profile={profile} goals={goals} />;
}
