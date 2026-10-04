-- Road to 1000: members version
-- Tables, security rules, approved-email sign-up, game history and stats.
-- Run once in the Supabase SQL editor, after changing owner@example.com (near the end) to your own email.
-- WARNING: re-running drops and recreates these tables, erasing the approved list and all game history.

begin;

drop view if exists public.player_stats;
drop view if exists public.player_names;
drop table if exists public.hands, public.moves, public.games, public.profiles, public.allowed_emails cascade;

-- Who may sign up. Only admins can change it.
create table public.allowed_emails (
  email     text primary key check (email = lower(email)),
  is_admin  boolean not null default false,
  note      text,
  added_at  timestamptz not null default now()
);

-- One row per signed-in player.
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  display_name  text not null default '' check (char_length(display_name) <= 20),
  is_admin      boolean not null default false,
  created_at    timestamptz not null default now(),
  last_seen_at  timestamptz not null default now()
);

-- One row per game (a game is several hands, first to 5000 points).
create table public.games (
  id           uuid primary key default gen_random_uuid(),
  code         text not null check (code ~ '^[A-Z0-9]{4}$'),
  host_id      uuid not null references public.profiles(id),
  guest_id     uuid references public.profiles(id),
  status       text not null default 'lobby' check (status in ('lobby','play','over','finished','abandoned')),
  state        jsonb not null,
  rev          integer not null default 0,
  winner_id    uuid references public.profiles(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  finished_at  timestamptz
);
create unique index games_active_code on public.games(code) where status in ('lobby','play','over');
create index games_players on public.games(host_id, guest_id);

-- Every move either player makes (full play-by-play history).
create table public.moves (
  id          bigint generated always as identity primary key,
  game_id     uuid not null references public.games(id) on delete cascade,
  player_id   uuid not null default auth.uid() references public.profiles(id),
  hand_no     integer not null,
  action      jsonb not null,
  created_at  timestamptz not null default now()
);
create index moves_game on public.moves(game_id, id);

-- One row per completed hand, with the score breakdown and play log.
create table public.hands (
  id            bigint generated always as identity primary key,
  game_id       uuid not null references public.games(id) on delete cascade,
  hand_no       integer not null,
  host_id       uuid not null references public.profiles(id),
  guest_id      uuid not null references public.profiles(id),
  host_points   integer not null,
  guest_points  integer not null,
  host_km       integer not null,
  guest_km      integer not null,
  finished_by   uuid references public.profiles(id),
  details       jsonb not null,
  completed_at  timestamptz not null default now(),
  unique (game_id, hand_no)
);

-- Keep updated_at current.
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;
create trigger games_touch before update on public.games for each row execute function public.touch_updated_at();

-- Helpers used by the security rules.
create or replace function public.my_email() returns text language sql stable as $$
  select lower(coalesce(auth.jwt()->>'email',''))
$$;
create or replace function public.is_approved() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from allowed_emails where email = public.my_email())
$$;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and is_admin)
$$;

-- Row Level Security: nothing is visible unless a rule below allows it.
alter table public.allowed_emails enable row level security;
alter table public.profiles       enable row level security;
alter table public.games          enable row level security;
alter table public.moves          enable row level security;
alter table public.hands          enable row level security;

create policy "admins manage the approved list" on public.allowed_emails
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "see own profile, admins see all" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "edit own profile" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "players see their games, admins see all" on public.games
  for select to authenticated using (auth.uid() in (host_id, guest_id) or public.is_admin());
create policy "host updates the game" on public.games
  for update to authenticated using (auth.uid() = host_id and public.is_approved())
  with check (auth.uid() = host_id);

create policy "players see moves in their games" on public.moves
  for select to authenticated using (
    public.is_admin() or exists (select 1 from public.games g where g.id = game_id and auth.uid() in (g.host_id, g.guest_id)));
create policy "players record their own moves" on public.moves
  for insert to authenticated with check (
    player_id = auth.uid() and public.is_approved()
    and exists (select 1 from public.games g where g.id = game_id and auth.uid() in (g.host_id, g.guest_id)));

create policy "players see their hands" on public.hands
  for select to authenticated using (auth.uid() in (host_id, guest_id) or public.is_admin());
create policy "host records finished hands" on public.hands
  for insert to authenticated with check (
    public.is_approved()
    and exists (select 1 from public.games g where g.id = game_id and g.host_id = auth.uid()
                and g.host_id = hands.host_id and g.guest_id = hands.guest_id));

-- Privileges. Anonymous visitors get nothing; signed-in users only what the rules above allow.
revoke all on public.allowed_emails, public.profiles, public.games, public.moves, public.hands from anon, authenticated;
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.allowed_emails to authenticated;
grant select on public.profiles to authenticated;
grant update (display_name, last_seen_at) on public.profiles to authenticated;
grant select on public.games to authenticated;
grant update (state, rev, status, winner_id, finished_at) on public.games to authenticated;
grant select, insert (game_id, hand_no, action) on public.moves to authenticated;
grant select, insert (game_id, hand_no, host_id, guest_id, host_points, guest_points, host_km, guest_km, finished_by, details) on public.hands to authenticated;

-- Opponent names (no emails) for approved players.
create view public.player_names as
  select id, display_name from public.profiles where public.is_approved();
revoke all on public.player_names from anon;
grant select on public.player_names to authenticated;

-- Stats per player. Players see their own; admins see everyone.
create view public.player_stats with (security_invoker = true) as
with h as (
  select host_id as player_id, host_points as pts, guest_points as opp, host_km as km, (finished_by = host_id) as finished, completed_at from public.hands
  union all
  select guest_id, guest_points, host_points, guest_km, (finished_by = guest_id), completed_at from public.hands
)
select p.id, p.display_name, p.email, p.created_at, p.last_seen_at,
       count(h.player_id)                                     as hands_played,
       count(h.player_id) filter (where h.pts > h.opp)        as hands_won,
       count(h.player_id) filter (where h.finished)           as trips_completed,
       coalesce(sum(h.pts), 0)                                as total_points,
       coalesce(sum(h.km), 0)                                 as total_km,
       (select count(*) from public.games g where p.id in (g.host_id, g.guest_id) and g.status = 'finished') as games_finished,
       (select count(*) from public.games g where g.winner_id = p.id)                                        as games_won,
       max(h.completed_at)                                    as last_played
from public.profiles p left join h on h.player_id = p.id
group by p.id;
revoke all on public.player_stats from anon;
grant select on public.player_stats to authenticated;

-- Called after sign-in: creates or refreshes the player's profile.
create or replace function public.ensure_profile(p_name text default '') returns public.profiles
language plpgsql security definer set search_path = public as $$
declare r public.profiles; nm text := left(trim(coalesce(p_name,'')), 20);
begin
  if auth.uid() is null or not public.is_approved() then raise exception 'not_approved'; end if;
  insert into profiles (id, email, display_name, is_admin)
  values (auth.uid(), public.my_email(), nm, (select is_admin from allowed_emails where email = public.my_email()))
  on conflict (id) do update
    set last_seen_at = now(),
        is_admin = (select is_admin from allowed_emails where email = public.my_email()),
        display_name = case when nm <> '' then nm else profiles.display_name end
  returning * into r;
  return r;
end $$;

-- Start a new game as host.
create or replace function public.create_game(p_code text, p_state jsonb) returns public.games
language plpgsql security definer set search_path = public as $$
declare r public.games;
begin
  if not public.is_approved() then raise exception 'not_approved'; end if;
  insert into games (code, host_id, state) values (upper(p_code), auth.uid(), p_state) returning * into r;
  return r;
end $$;

-- Join a game by its 4-letter code.
create or replace function public.join_game(p_code text) returns public.games
language plpgsql security definer set search_path = public as $$
declare r public.games;
begin
  if not public.is_approved() then raise exception 'not_approved'; end if;
  select * into r from games where code = upper(p_code) and status in ('lobby','play','over')
    order by created_at desc limit 1 for update;
  if not found then raise exception 'no_game'; end if;
  if r.host_id = auth.uid() or r.guest_id = auth.uid() then return r; end if;
  if r.guest_id is not null then raise exception 'game_full'; end if;
  update games set guest_id = auth.uid() where id = r.id returning * into r;
  return r;
end $$;

revoke all on function public.ensure_profile(text), public.create_game(text, jsonb), public.join_game(text) from public, anon;
grant execute on function public.ensure_profile(text), public.create_game(text, jsonb), public.join_game(text),
  public.is_approved(), public.is_admin(), public.my_email() to authenticated;

-- Blocks sign-up for anyone not on the approved list (turn on under Authentication > Hooks).
create or replace function public.hook_before_user_created(event jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from allowed_emails where email = lower(event->'user'->>'email')) then
    return '{}'::jsonb;
  end if;
  return jsonb_build_object('error', jsonb_build_object(
    'http_code', 403, 'message', 'This email is not on the approved list. Ask the game owner to add you.'));
end $$;
revoke all on function public.hook_before_user_created(jsonb) from public, anon, authenticated;
grant execute on function public.hook_before_user_created(jsonb) to supabase_auth_admin;

-- Live updates for games and moves (Realtime respects the rules above).
do $$ begin
  begin alter publication supabase_realtime add table public.games; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.moves; exception when duplicate_object then null; end;
end $$;

-- The owner: approved and admin. CHANGE owner@example.com to the email you'll sign in with before running.
insert into public.allowed_emails (email, is_admin, note) values ('owner@example.com', true, 'owner')
  on conflict (email) do update set is_admin = true;

commit;
