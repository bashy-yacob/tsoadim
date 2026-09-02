"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IconArrowRight, IconPlus } from "@tabler/icons-react";
import { GoalCard } from "@/components/goal-card";
import { getCurrentUser } from "@/lib/auth";
import { getGoals } from "@/lib/database";
import type { Goal } from "@/lib/database";

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadGoals = async () => {
      const user = await getCurrentUser();

      if (!user) {
        if (isMounted) {
          setIsUnauthorized(true);
          setIsLoading(false);
        }
        return;
      }

      const userGoals = await getGoals(user.id);
      if (!isMounted) return;

      setGoals(userGoals);
      setIsLoading(false);
    };

    void loadGoals();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isUnauthorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4efe9] p-5" dir="rtl">
        <div className="text-center">
          <p className="mb-3 text-[14px] text-[#6b5346]">צריך להתחבר כדי לראות את היעדים שלך.</p>
          <Link href="/auth" className="text-[14px] font-medium text-[#D85A30]">לכניסה</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4efe9] p-5" dir="rtl">
      <div className="mx-auto w-full max-w-[600px] rounded-[30px] border border-[#e8d7cd] bg-[#fffaf6] p-4 shadow-[0_20px_50px_rgba(86,45,23,0.08)]">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/dashboard" className="flex h-9 w-9 items-center justify-center rounded-full text-[#6b5346] hover:bg-[#f5ebe5]" aria-label="חזרה לדף הבית">
            <IconArrowRight size={18} />
          </Link>
          <h1 className="flex-1 text-[22px] font-medium text-[#2d120b]">כל היעדים</h1>
          <Link href="/goals/new" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D85A30] text-white" aria-label="יעד חדש" title="יעד חדש">
            <IconPlus size={18} />
          </Link>
        </div>

        {isLoading ? (
          <p className="py-8 text-center text-[14px] text-[#6b5346]">טוען את היעדים...</p>
        ) : goals.length === 0 ? (
          <div className="rounded-[16px] border border-dashed border-[#d8c2b4] bg-[#fff7f1] p-6 text-center text-[13px] text-[#6b5346]">
            עדיין אין יעדים פעילים.
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map((goal) => <GoalCard key={goal.id} goal={goal} />)}
          </div>
        )}
      </div>
    </main>
  );
}
