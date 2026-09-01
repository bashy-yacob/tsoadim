// supabase/functions/update-streaks/index.ts
// Supabase Edge Function - רץ יומית (מתוזמן ע"י pg_cron, ראה SQL בתחתית)
// עובר על כל יעדי הסטריק, בודק אם המשתמש עדכן היום/אתמול, ומעדכן
// current_streak + longest_streak בהתאם. אם פספס יום - הרצף מתאפס.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! // service role - עוקף RLS
);

Deno.serve(async () => {
  const { data: streakGoals, error } = await supabase
    .from("goals")
    .select("id, current_streak, longest_streak")
    .eq("type", "streak")
    .eq("status", "active");

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  let updated = 0;

  for (const goal of streakGoals ?? []) {
    // בדיקה האם יש רשומת התקדמות היום או אתמול
    const { data: recentEntry } = await supabase
      .from("progress_entries")
      .select("entry_date")
      .eq("goal_id", goal.id)
      .in("entry_date", [today, yesterday])
      .order("entry_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    let newStreak = goal.current_streak;

    if (!recentEntry) {
      // לא עודכן היום ולא אתמול - הרצף נשבר
      newStreak = 0;
    } else if (recentEntry.entry_date === today) {
      // עודכן היום - אם זה עדכון חדש להיום, הרצף כבר עלה בזמן
      // הוספת ה-progress_entry (ראה הערה בסוף); כאן רק מוודאים סנכרון
      newStreak = goal.current_streak;
    }
    // אם עודכן רק אתמול (ולא היום עדיין) - הרצף נשמר כרגע, לא נשבר
    // עד סוף היום הנוכחי (ניתן עוד יום להשלים)

    const newLongest = Math.max(newStreak, goal.longest_streak);

    if (newStreak !== goal.current_streak || newLongest !== goal.longest_streak) {
      await supabase
        .from("goals")
        .update({ current_streak: newStreak, longest_streak: newLongest })
        .eq("id", goal.id);
      updated++;
    }
  }

  return new Response(JSON.stringify({ updated }), { status: 200 });
});

/* ============================================================
   הגדרת התזמון היומי (להריץ פעם אחת ב-SQL editor של Supabase):

   select cron.schedule(
     'update-streaks-daily',
     '0 0 * * *',  -- כל יום בחצות UTC
     $$
     select net.http_post(
       url := 'https://<project-ref>.supabase.co/functions/v1/update-streaks',
       headers := jsonb_build_object(
         'Authorization', 'Bearer ' || '<SERVICE_ROLE_KEY>'
       )
     );
     $$
   );

   דורש הפעלת ההרחבות pg_cron ו-pg_net בפרויקט (Database > Extensions).

   הערה חשובה: current_streak+1 בפועל כדאי לעדכן ב-trigger שרץ מיד
   כשנוספת progress_entry חדשה (עדכון מיידי, חוויה טובה יותר למשתמש),
   וה-cron היומי הזה משמש בעיקר "לאפס" רצפים שנשברו - כלומר מקרה שבו
   המשתמש פשוט לא עדכן ולא היה שום trigger שיריץ את זה עבורו.
   ============================================================ */
