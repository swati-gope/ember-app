-- Extends handle_new_user() (from 0001_init.sql) so a fresh homemaker
-- sign-up gets a starter chore list instead of an empty chores page.
-- Safe to run more than once — create or replace just redefines the
-- function; it does not touch existing users' chores.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, flavour)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'flavour', 'homemaker')
  );

  if coalesce(new.raw_user_meta_data->>'flavour', 'homemaker') = 'homemaker' then
    insert into public.chores (user_id, name, freq) values
      (new.id, 'Make the beds', 'daily'),
      (new.id, 'Wash the dishes', 'daily'),
      (new.id, 'Wipe kitchen counters', 'daily'),
      (new.id, 'Quick tidy — living room', 'daily'),
      (new.id, 'Vacuum or mop floors', 'weekly'),
      (new.id, 'Change bedsheets', 'weekly'),
      (new.id, 'Deep clean bathroom', 'weekly'),
      (new.id, 'Water the plants', 'weekly');
  end if;

  return new;
end;
$$;
