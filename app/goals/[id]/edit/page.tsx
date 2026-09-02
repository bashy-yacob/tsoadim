"use client";

import { useParams } from "next/navigation";
import { GoalFormComponent } from "@/components/goal-form";

export default function EditGoalPage() {
  const params = useParams<{ id: string }>();

  return <GoalFormComponent goalId={params.id} />;
}