import type { GoalHistoryPoint, GoalRecord, ProfileRecord } from "@/types/goals";

export const profile: ProfileRecord = {
  id: "demo-user",
  display_name: "בשי",
  total_points: 890,
};

export const initialGoals: GoalRecord[] = [
  {
    id: "goal-1",
    title: 'לרוץ 5 ק"מ',
    type: "quantitative",
    status: "active",
    current_streak: 12,
    longest_streak: 14,
    created_at: "2026-08-10T00:00:00.000Z",
    completed_at: null,
    details: { start_value: 0, target_value: 5, unit: 'ק"מ' },
    current_value: 3.25,
    is_completed: false,
  },
  {
    id: "goal-2",
    title: "אימון יומי - 10 דק'",
    type: "streak",
    status: "active",
    current_streak: 12,
    longest_streak: 18,
    created_at: "2026-08-15T00:00:00.000Z",
    completed_at: null,
    details: { frequency: "daily", target_per_week: 5, duration_minutes: 10 },
    current_value: 0,
    is_completed: false,
  },
  {
    id: "goal-3",
    title: "להשלים 3 שיחות עם לקוחות",
    type: "milestone",
    status: "active",
    current_streak: 0,
    longest_streak: 0,
    created_at: "2026-08-20T00:00:00.000Z",
    completed_at: null,
    details: { due_date: "2026-09-10" },
    current_value: 2,
    is_completed: false,
  },
];

export const leaderboardRows = [
  { name: "מיכל כהן", points: 2410, accent: true },
  { name: "דוד לוי", points: 1980, accent: false },
  { name: "רותם שני", points: 1750, accent: false },
  { name: "אתה", points: 890, accent: true },
];

export const goalHistory: Record<string, GoalHistoryPoint[]> = {
  "goal-1": [
    { date: "28 באוגוסט", value: 3.25 },
    { date: "24 באוגוסט", value: 2.8 },
    { date: "18 באוגוסט", value: 1.5 },
  ],
  "goal-2": [
    { date: "יום א'", value: 10 },
    { date: "יום ב'", value: 8 },
    { date: "יום ג'", value: 12 },
  ],
  "goal-3": [
    { date: "1 ספט'", value: 1 },
    { date: "5 ספט'", value: 2 },
    { date: "9 ספט'", value: 3 },
  ],
};

export const dashboardGreetings = [
  "בוקר טוב, {name}. משהו לסמן היום?",
  "עוד יום, עוד הזדמנות. בוקר טוב",
  "היי {name}, הקפה חיכה – עכשיו תור היעדים",
  "בוקר טוב. מה עומד היום על הפרק?",
];
