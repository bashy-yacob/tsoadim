-- =========================================================
-- Row Level Security (RLS) Policies
-- =========================================================

-- הפעלת RLS על כל הטבלאות (חובה - בלי זה השורה למעלה לא עושה כלום)
alter table profiles enable row level security;
alter table goals enable row level security;
alter table progress_entries enable row level security;
alter table subscriptions enable row level security;
alter table groups enable row level security;
alter table group_members enable row level security;
alter table leaderboard_opt_in enable row level security;

-- ============ profiles ============
-- כל אחד יכול לראות פרופילים בסיסיים (נדרש ללוח מנצחים/קבוצות)
create policy "profiles are viewable by everyone"
  on profiles for select
  using (true);

-- משתמש יכול לעדכן רק את הפרופיל שלו
create policy "users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- ============ goals ============
-- משתמש רואה/עורך/מוחק רק את היעדים שלו
create policy "users manage own goals"
  on goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============ progress_entries ============
-- משתמש רואה/עורך רק רשומות שקשורות ליעדים שלו (בדיקה דרך JOIN ל-goals)
create policy "users manage own progress entries"
  on progress_entries for all
  using (
    exists (
      select 1 from goals
      where goals.id = progress_entries.goal_id
      and goals.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from goals
      where goals.id = progress_entries.goal_id
      and goals.user_id = auth.uid()
    )
  );

-- ============ subscriptions ============
-- משתמש רואה רק את המנוי של עצמו. עדכון סטטוס המנוי נעשה רק
-- דרך ה-backend (service role, למשל Stripe webhook) ולא ישירות מהקליינט.
create policy "users view own subscription"
  on subscriptions for select
  using (auth.uid() = user_id);

-- אין policy ל-insert/update/delete מהצד של הקליינט בכוונה -
-- רק service role (webhook) יכול לגעת בטבלה הזו.

-- ============ groups ============
-- כל אחד יכול לראות קבוצות (כדי להצטרף דרך invite code), אבל
-- רק היוצר יכול לערוך/למחוק
create policy "groups are viewable by everyone"
  on groups for select
  using (true);

create policy "users create groups"
  on groups for insert
  with check (auth.uid() = created_by);

create policy "creator manages own group"
  on groups for update
  using (auth.uid() = created_by);

create policy "creator deletes own group"
  on groups for delete
  using (auth.uid() = created_by);

-- ============ group_members ============
-- חברי קבוצה רואים מי עוד בקבוצה שלהם
create policy "members view their group memberships"
  on group_members for select
  using (
    exists (
      select 1 from group_members gm
      where gm.group_id = group_members.group_id
      and gm.user_id = auth.uid()
    )
  );

-- משתמש יכול להצטרף לקבוצה (להוסיף את עצמו בלבד)
create policy "users join groups themselves"
  on group_members for insert
  with check (auth.uid() = user_id);

-- משתמש יכול לעזוב קבוצה (למחוק רק את עצמו)
create policy "users leave groups themselves"
  on group_members for delete
  using (auth.uid() = user_id);

-- ============ leaderboard_opt_in ============
-- כל אחד יכול לראות מי opted-in (נדרש כדי לבנות את הלוח), אבל
-- רק המשתמש עצמו יכול לשנות את הבחירה שלו
create policy "opt-in status viewable by everyone"
  on leaderboard_opt_in for select
  using (true);

create policy "users manage own opt-in"
  on leaderboard_opt_in for insert
  with check (auth.uid() = user_id);

create policy "users update own opt-in"
  on leaderboard_opt_in for update
  using (auth.uid() = user_id);

-- ============ trigger to auto-create the profile after auth.users insert ============
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, total_points)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    0
  )
on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- =========================================================
-- הערה: טבלת progress_entries עם current_streak/longest_streak -
-- אלו שדות ב-goals שמתעדכנים ע"י ה-cron job (service role),
-- לא ע"י המשתמש ישירות. אם רוצים למנוע מהקליינט לשנות אותם ידנית,
-- כדאי column-level security או trigger שמתעלם משינויים לשדות האלו
-- אם ההרשאה היא לא service role.
-- =========================================================
