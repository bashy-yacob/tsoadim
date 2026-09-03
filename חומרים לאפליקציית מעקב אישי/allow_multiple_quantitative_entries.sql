-- Run once in Supabase SQL Editor for databases created with the original schema.
-- Quantitative goals may have multiple progress entries on the same date.
-- Daily streak uniqueness is enforced by the application before insert.
alter table progress_entries
  drop constraint if exists progress_entries_goal_id_entry_date_key;
