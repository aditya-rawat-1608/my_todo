
-- Tasks table: one row per task, owned by a user
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  category text not null,
  color text,
  done boolean not null default false,
  date date not null,
  start_time text,
  end_time text,
  notes text not null default '',
  carried_from date,
  position double precision not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_user_date_idx on public.tasks (user_id, date);
create index tasks_user_position_idx on public.tasks (user_id, position);

alter table public.tasks enable row level security;

create policy "Users can view their own tasks"
  on public.tasks for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own tasks"
  on public.tasks for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own tasks"
  on public.tasks for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own tasks"
  on public.tasks for delete
  to authenticated
  using (auth.uid() = user_id);

-- Reusable updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tasks_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- Habits table
create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  emoji text not null default '✨',
  color text not null default '#34d399',
  position double precision not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index habits_user_idx on public.habits (user_id);
alter table public.habits enable row level security;

create policy "Users can view their own habits"
  on public.habits for select to authenticated
  using (auth.uid() = user_id);
create policy "Users can insert their own habits"
  on public.habits for insert to authenticated
  with check (auth.uid() = user_id);
create policy "Users can update their own habits"
  on public.habits for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own habits"
  on public.habits for delete to authenticated
  using (auth.uid() = user_id);

create trigger habits_updated_at
  before update on public.habits
  for each row execute function public.set_updated_at();

-- Habit completions: one row per habit per day
create table public.habit_completions (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  created_at timestamptz not null default now(),
  unique (habit_id, date)
);

create index habit_completions_user_idx on public.habit_completions (user_id);
create index habit_completions_habit_idx on public.habit_completions (habit_id);

alter table public.habit_completions enable row level security;

create policy "Users can view their own habit completions"
  on public.habit_completions for select to authenticated
  using (auth.uid() = user_id);
create policy "Users can insert their own habit completions"
  on public.habit_completions for insert to authenticated
  with check (auth.uid() = user_id);
create policy "Users can delete their own habit completions"
  on public.habit_completions for delete to authenticated
  using (auth.uid() = user_id);
