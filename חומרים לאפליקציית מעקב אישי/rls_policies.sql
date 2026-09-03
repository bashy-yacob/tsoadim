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
-- משתמש יכול לראות רק את הפרופיל שלו. לוח המובילים ניגש לנתונים
-- דרך פונקציות מאובטחות שמכבדות opt-in וחברות בקבוצה.
drop policy if exists "profiles are viewable by everyone" on profiles;
create policy "profiles are viewable by everyone"
  on profiles for select
  using (auth.uid() = id);

-- משתמש יכול לעדכן רק את הפרופיל שלו
drop policy if exists "users can update own profile" on profiles;
create policy "users can update own profile"
  on profiles for update
  using (auth.uid() = id);

drop policy if exists "users can insert own profile" on profiles;
create policy "users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- TODO: להעביר את צבירת הניקוד ל-RPC/Backend אטומי לפני חסימת
-- עדכון total_points מהקליינט. הקוד הנוכחי עדיין מעדכן XP בזרימת הלקוח.

-- ============ goals ============
-- משתמש רואה/עורך/מוחק רק את היעדים שלו
drop policy if exists "users manage own goals" on goals;
create policy "users manage own goals"
  on goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============ progress_entries ============
-- משתמש רואה/עורך רק רשומות שקשורות ליעדים שלו (בדיקה דרך JOIN ל-goals)
drop policy if exists "users manage own progress entries" on progress_entries;
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
drop policy if exists "users view own subscription" on subscriptions;
create policy "users view own subscription"
  on subscriptions for select
  using (auth.uid() = user_id);

-- אין policy ל-insert/update/delete מהצד של הקליינט בכוונה -
-- רק service role (webhook) יכול לגעת בטבלה הזו.

-- ============ groups ============
-- כל אחד יכול לראות קבוצות (כדי להצטרף דרך invite code), אבל
-- רק היוצר יכול לערוך/למחוק
drop policy if exists "groups are viewable by everyone" on groups;
create policy "groups are viewable by everyone"
  on groups for select
  using (true);

drop policy if exists "users create groups" on groups;
create policy "users create groups"
  on groups for insert
  with check (auth.uid() = created_by);

drop policy if exists "creator manages own group" on groups;
create policy "creator manages own group"
  on groups for update
  using (auth.uid() = created_by);

drop policy if exists "creator deletes own group" on groups;
create policy "creator deletes own group"
  on groups for delete
  using (auth.uid() = created_by);

-- ============ group_members ============
-- חברי קבוצה רואים מי עוד בקבוצה שלהם
drop policy if exists "members view their group memberships" on group_members;
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
drop policy if exists "users join groups themselves" on group_members;
create policy "users join groups themselves"
  on group_members for insert
  with check (auth.uid() = user_id);

-- משתמש יכול לעזוב קבוצה (למחוק רק את עצמו)
drop policy if exists "users leave groups themselves" on group_members;
create policy "users leave groups themselves"
  on group_members for delete
  using (auth.uid() = user_id);

-- ============ leaderboard_opt_in ============
-- כל אחד יכול לראות מי opted-in (נדרש כדי לבנות את הלוח), אבל
-- רק המשתמש עצמו יכול לשנות את הבחירה שלו
drop policy if exists "opt-in status viewable by everyone" on leaderboard_opt_in;
create policy "opt-in status viewable by everyone"
  on leaderboard_opt_in for select
  using (true);

drop policy if exists "users manage own opt-in" on leaderboard_opt_in;
create policy "users manage own opt-in"
  on leaderboard_opt_in for insert
  with check (auth.uid() = user_id);

drop policy if exists "users update own opt-in" on leaderboard_opt_in;
create policy "users update own opt-in"
  on leaderboard_opt_in for update
  using (auth.uid() = user_id);

-- פונקציות מאובטחות ללוח המובילים. הן מחזירות רק שדות תצוגה,
-- ובודקות הרשאת opt-in/חברות לפני החזרת נתונים.
create or replace function public.get_global_leaderboard(p_limit_count integer default 100)
returns table (id uuid, display_name text, total_points integer, avatar_url text)
language sql
security definer
set search_path = public
as $$
  select p.id, p.display_name, p.total_points, p.avatar_url
  from profiles p
  join leaderboard_opt_in opt on opt.user_id = p.id
  where opt.opted_in = true
  order by p.total_points desc, p.created_at asc
  limit greatest(1, least(p_limit_count, 100));
$$;

create or replace function public.get_group_leaderboard(p_group_id uuid, p_limit_count integer default 100)
returns table (id uuid, display_name text, total_points integer, avatar_url text)
language sql
security definer
set search_path = public
as $$
  select p.id, p.display_name, p.total_points, p.avatar_url
  from group_members member
  join profiles p on p.id = member.user_id
  where member.group_id = p_group_id
    and exists (
      select 1
      from group_members viewer_membership
      where viewer_membership.group_id = p_group_id
        and viewer_membership.user_id = auth.uid()
    )
  order by p.total_points desc, p.created_at asc
  limit greatest(1, least(p_limit_count, 100));
$$;

revoke execute on function public.get_global_leaderboard(integer) from public;
grant execute on function public.get_global_leaderboard(integer) to authenticated;
revoke execute on function public.get_group_leaderboard(uuid, integer) from public;
grant execute on function public.get_group_leaderboard(uuid, integer) to authenticated;

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
