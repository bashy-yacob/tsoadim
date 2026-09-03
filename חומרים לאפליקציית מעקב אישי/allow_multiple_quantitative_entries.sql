-- Run once in Supabase SQL Editor for databases created with the original schema.
-- Quantitative goals may have multiple progress entries on the same date.
-- Daily streak uniqueness is enforced by the application before insert.

do $$
declare
  unique_constraint_name text;
begin
  select constraint_name
  into unique_constraint_name
  from information_schema.constraint_column_usage
  where table_schema = 'public'
    and table_name = 'progress_entries'
    and constraint_name = 'progress_entries_goal_id_entry_date_key';

  if unique_constraint_name is not null then
    execute format(
      'alter table public.progress_entries drop constraint %I',
      unique_constraint_name
    );
  end if;
end;
$$;

drop index if exists public.progress_entries_goal_id_entry_date_key;
drop index if exists public.progress_entries_goal_id_entry_date_idx;
