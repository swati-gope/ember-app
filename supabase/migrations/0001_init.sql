-- Ember — initial schema
-- Run this in the Supabase SQL editor, or via `supabase db push` if
-- you're using the Supabase CLI locally.

-- ---------- profiles ----------
-- One row per user. Extends auth.users, which Supabase manages for you.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  flavour text not null default 'homemaker',
  -- Unused until the Reminders phase — kept here now so no migration
  -- is needed later. See lib/notifications/service.ts.
  phone_number text,
  reminder_preference jsonb not null default '{"whatsapp_opt_in": false, "sms_opt_in": false}',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create a profile row whenever someone signs up. Reads the name
-- and flavour passed in from app/auth/actions.ts's signUp() call.
create function public.handle_new_user()
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
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- chores ----------
create table public.chores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  freq text not null check (freq in ('daily', 'weekly')),
  created_at timestamptz not null default now()
);

create table public.chore_completions (
  id uuid primary key default gen_random_uuid(),
  chore_id uuid not null references public.chores(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  done_date date not null,
  unique (chore_id, done_date)
);

-- ---------- todos ----------
create table public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  text text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- meal plan ----------
create table public.meal_plan (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_date date not null,
  slot text not null check (slot in ('breakfast', 'lunch', 'dinner')),
  content text default '',
  unique (user_id, plan_date, slot)
);

-- ---------- groceries ----------
create table public.groceries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- events ----------
-- Reminder columns are unused until the Reminders phase, but exist now
-- so the calendar UI has somewhere real to save its (currently inert)
-- reminder toggle.
create table public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_date date not null,
  title text not null,
  event_time time,
  reminder_enabled boolean not null default false,
  reminder_channel text check (reminder_channel in ('whatsapp', 'sms')),
  reminder_sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- affirmation entries ----------
create table public.affirmation_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  text text not null,
  created_at timestamptz not null default now()
);

-- ---------- row level security ----------
-- Every table below: a user can only ever see or touch their own rows.
alter table public.chores enable row level security;
alter table public.chore_completions enable row level security;
alter table public.todos enable row level security;
alter table public.meal_plan enable row level security;
alter table public.groceries enable row level security;
alter table public.events enable row level security;
alter table public.affirmation_entries enable row level security;

create policy "Own rows only" on public.chores
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Own rows only" on public.chore_completions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Own rows only" on public.todos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Own rows only" on public.meal_plan
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Own rows only" on public.groceries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Own rows only" on public.events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Own rows only" on public.affirmation_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
