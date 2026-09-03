-- Run once in Supabase SQL Editor for an existing database.
-- Progress values are deltas; goals.current_value is their accumulated value.

alter table public.goals
  add column if not exists current_value numeric not null default 0;

update public.goals g
set current_value = coalesce((g.details ->> 'start_value')::numeric, 0)
  + coalesce((
      select sum(pe.value)
      from public.progress_entries pe
      where pe.goal_id = g.id
    ), 0);

create or replace function public.refresh_goal_current_value()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_goal_id uuid;
begin
  affected_goal_id := case
    when tg_op = 'DELETE' then old.goal_id
    else new.goal_id
  end;

  update public.goals g
  set current_value = coalesce((g.details ->> 'start_value')::numeric, 0)
    + coalesce((
        select sum(pe.value)
        from public.progress_entries pe
        where pe.goal_id = affected_goal_id
      ), 0)
  where g.id = affected_goal_id;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

drop trigger if exists refresh_goal_current_value_after_progress
  on public.progress_entries;
create trigger refresh_goal_current_value_after_progress
after insert or update or delete on public.progress_entries
for each row execute procedure public.refresh_goal_current_value();