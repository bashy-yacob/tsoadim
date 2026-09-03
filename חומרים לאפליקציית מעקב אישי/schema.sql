-- =========================================================
-- Personal Achievement Tracker - DB Schema (Supabase/Postgres)
-- =========================================================

-- משתמשים מגיעים מ-Supabase Auth (auth.users) - לא צריך טבלה נפרדת לפרופיל בסיסי,
-- אבל כדאי טבלת profiles לנתונים נוספים (שם תצוגה, אווטאר וכו')
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  -- ניקוד XP מאוחד לצורך לוח מנצחים - מצטבר מכל סוגי היעדים (סטריק/כמותי/אבן דרך)
  -- מתעדכן ב-trigger בכל progress_entry חדשה + השלמת יעד, לא מחושב real-time
  total_points int not null default 0,
  created_at timestamptz not null default now()
);

-- ============ יעדים (גנרי - JSON לפרטים ספציפיים לפי type) ============
create type goal_type as enum ('quantitative', 'streak', 'milestone');

create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type goal_type not null,
  title text not null,
  category text, -- 'fitness' | 'habit' | 'other' וכו', חופשי כרגע
  -- פרטים ספציפיים לסוג היעד, למשל:
  -- quantitative: { "start_value": 40, "target_value": 60, "unit": "kg" }
  -- streak: { "frequency": "daily" | "weekly", "target_per_week": 3, "duration_minutes": 10 }
  --   duration_minutes אופציונלי - אם קיים, המסך מציג טיימר בפועל (עצור/הפעל/השהה)
  --   ולא רק כפתור "סימון בוצע"; כשהטיימר מגיע ליעד נרשמת progress_entry אוטומטית
  -- milestone: { "due_date": "2026-06-01" }
  details jsonb not null default '{}',
  -- שדה שמור לחישוב סטריק - מתעדכן ע"י job יומי, לא real-time
  current_streak int not null default 0,
  longest_streak int not null default 0,
  status text not null default 'active', -- active | completed | archived
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index idx_goals_user on goals(user_id);
create index idx_goals_type on goals(type);

-- ============ רישום התקדמות (הכרחי לגרפים ולחישוב סטריקים) ============
create table progress_entries (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references goals(id) on delete cascade,
  value numeric, -- לערכים כמותיים; יכול להיות NULL עבור סימון "בוצע היום" בסטריק
  entry_date date not null default current_date,
  note text,
  created_at timestamptz not null default now(),
  -- יעד כמותי יכול לקבל כמה עדכונים ביום.
  -- יעד סטריק יומי נאכף באפליקציה: עדכון אחד לכל יום.
);

create index idx_progress_goal_date on progress_entries(goal_id, entry_date desc);

-- ============ מנויים (סטטוס מסונכרן מ-Stripe) ============
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references profiles(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'free', -- free | active | past_due | canceled
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ קבוצות תחרות (ללוח מנצחים קבוצתי - פיצ'ר פרימיום) ============
-- משתמש יכול להיות חבר בכמה קבוצות בו-זמנית (many-to-many) -
-- מסך לוח המנצחים צריך selector לבחירת קבוצה, לא תצוגת קבוצה יחידה
create table groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique,
  created_by uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table group_members (
  group_id uuid not null references groups(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

-- ============ opt-in ללוח מנצחים גלובלי (privacy) ============
create table leaderboard_opt_in (
  user_id uuid primary key references profiles(id) on delete cascade,
  opted_in boolean not null default false,
  updated_at timestamptz not null default now()
);

-- =========================================================
-- הערות מימוש:
-- 1. Row Level Security (RLS) חייב להיות מופעל על כל הטבלאות -
--    משתמש יכול לראות/לערוך רק את היעדים/ההתקדמות של עצמו,
--    חוץ מנתוני לוח מנצחים שהם public רק עבור מי ש-opted_in = true.
-- 2. עדכון current_streak/longest_streak: cron job יומי (Supabase Edge Function
--    + pg_cron) שעובר על progress_entries ומעדכן את goals.
-- 3. לוח מנצחים: מדורג לפי profiles.total_points (ניקוד XP מאוחד מכל סוגי
--    היעדים), לא רק לפי סטריק - כי אי אפשר להשוות ישירות סטריק מול יעד כמותי.
--    query מסנן לפי leaderboard_opt_in (גלובלי) או group_members (קבוצתי,
--    עם selector כי משתמש יכול להיות בכמה קבוצות), וממיין לפי total_points desc.
--    נוסחת ניקוד מוצעת: סטריק = נק' ליום + בונוס בציוני דרך (7/30/100 ימים);
--    כמותי = נק' לכל עדכון + בונוס השלמה; אבן דרך = מנת נקודות גדולה בהשלמה.
-- =========================================================
