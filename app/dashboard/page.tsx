"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardScreen } from "@/components/dashboard-screen";
import { getCurrentUser } from "@/lib/auth";
import { getGoals, getProfile } from "@/lib/database";
import type { GoalRecord, ProfileRecord } from "@/types/dashboard";
import { initialGoals, profile as fallbackProfile } from "@/lib/mock-data";

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileRecord | null>(fallbackProfile);
  const [goals, setGoals] = useState<GoalRecord[]>(initialGoals);
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

      if (!isMounted) return;

      setProfile(
        profileData
          ? {
              id: profileData.id,
              display_name: profileData.display_name,
              total_points: profileData.total_points,
              avatar_url: profileData.avatar_url ?? null,
            }
          : fallbackProfile
      );

      setGoals(
        goalsData.length > 0
          ? goalsData.map((goal) => ({
              id: goal.id,
              title: goal.title,
              type: goal.type,
              status: goal.status,
              current_streak: goal.current_streak ?? 0,
              longest_streak: goal.longest_streak ?? 0,
              created_at: goal.created_at,
              completed_at: goal.completed_at ?? null,
              details: goal.details ?? {},
              current_value: Number(goal.details?.start_value ?? 0),
              is_completed: goal.status === "completed",
            }))
          : initialGoals
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
      <main className="flex min-h-screen items-center justify-center bg-[#f4efe9] text-[#2d120b]" dir="rtl">
        <div className="text-center">
          <div className="mb-3 text-[18px] font-medium">טוען את לוח הבקרה...</div>
          <div className="text-[14px] text-[#6b5346]">מייבא נתונים מה-Supabase</div>
        </div>
      </main>
    );
  }

  return <DashboardScreen profile={profile} goals={goals} />;
}
