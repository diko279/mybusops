-- Riojacar FleetOps · Supabase schema
-- Ejecutar en Supabase SQL Editor.
-- Después crear usuarios en Authentication y completar profiles.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text,
  role text not null check (role in ('admin','jefe','conductor','monitor')),
  phone text,
  base text,
  photo_url text,
  created_at timestamptz default now()
);

create table if not exists public.conductores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  phone text,
  email text,
  license_expiry date,
  cap_expiry date,
  tachograph_card_expiry date,
  base text,
  photo_url text,
  authorized_vehicle_ids text[] default '{}',
  default_vehicle_id text,
  status text default 'activo',
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.monitores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  phone text,
  email text,
  base text,
  status text default 'activo',
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.vehiculos (
  id uuid primary key default gen_random_uuid(),
  bus_number text,
  plate text unique,
  brand text,
  model text,
  bodywork text,
  vehicle_group text,
  seats integer,
  pmr text default 'no',
  pmr_count integer default 0,
  itv_expiry date,
  insurance_expiry date,
  tachograph_expiry date,
  base text,
  photo_url text,
  status text default 'activo',
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.sign_codes (
  id uuid primary key default gen_random_uuid(),
  service_type text not null check (service_type in ('instituto','linea','fabrica','discrecional')),
  name text not null,
  code text not null check (code ~ '^[0-9]+$'),
  origin text,
  destination text,
  line_number text,
  itinerary text,
  is_default boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.servicios (
  id uuid primary key default gen_random_uuid(),
  service_date date not null,
  start_time time not null,
  end_time time,
  origin text not null,
  destination text not null,
  nearest_base text,
  nearest_base_km numeric,
  has_return text default 'no' check (has_return in ('si','no')),
  service_type text not null check (service_type in ('instituto','linea','fabrica','discrecional')),
  seats_required integer,
  driver_id uuid references public.conductores(id) on delete set null,
  vehicle_id uuid references public.vehiculos(id) on delete set null,
  monitor_id uuid references public.monitores(id) on delete set null,
  manual_sign_code boolean default false,
  sign_code text not null,
  line_number text,
  itinerary text,
  md5 text unique,
  status text default 'pendiente',
  sent_at timestamptz,
  seen_at timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  incident_notes text,
  incident_photos text[] default '{}',
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.login_backgrounds (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.conductores enable row level security;
alter table public.monitores enable row level security;
alter table public.vehiculos enable row level security;
alter table public.sign_codes enable row level security;
alter table public.servicios enable row level security;
alter table public.login_backgrounds enable row level security;

create or replace function public.is_staff()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('admin','jefe')
  );
$$;

drop policy if exists "profiles_self_or_staff_select" on public.profiles;
create policy "profiles_self_or_staff_select"
on public.profiles for select
using (id = auth.uid() or public.is_staff());

drop policy if exists "profiles_staff_all" on public.profiles;
create policy "profiles_staff_all"
on public.profiles for all
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "conductores_staff_all" on public.conductores;
create policy "conductores_staff_all"
on public.conductores for all
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "conductores_self_select" on public.conductores;
create policy "conductores_self_select"
on public.conductores for select
using (user_id = auth.uid() or public.is_staff());

drop policy if exists "monitores_staff_all" on public.monitores;
create policy "monitores_staff_all"
on public.monitores for all
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "monitores_self_select" on public.monitores;
create policy "monitores_self_select"
on public.monitores for select
using (user_id = auth.uid() or public.is_staff());

drop policy if exists "vehiculos_staff_all" on public.vehiculos;
create policy "vehiculos_staff_all"
on public.vehiculos for all
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "vehiculos_authenticated_select" on public.vehiculos;
create policy "vehiculos_authenticated_select"
on public.vehiculos for select
using (auth.role() = 'authenticated');

drop policy if exists "sign_codes_staff_all" on public.sign_codes;
create policy "sign_codes_staff_all"
on public.sign_codes for all
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "sign_codes_authenticated_select" on public.sign_codes;
create policy "sign_codes_authenticated_select"
on public.sign_codes for select
using (auth.role() = 'authenticated');

drop policy if exists "servicios_staff_all" on public.servicios;
create policy "servicios_staff_all"
on public.servicios for all
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "servicios_driver_monitor_select" on public.servicios;
create policy "servicios_driver_monitor_select"
on public.servicios for select
using (
  public.is_staff()
  or driver_id in (select id from public.conductores where user_id = auth.uid())
  or monitor_id in (select id from public.monitores where user_id = auth.uid())
);


drop policy if exists "login_backgrounds_authenticated_select" on public.login_backgrounds;
create policy "login_backgrounds_authenticated_select"
on public.login_backgrounds for select
using (true);

drop policy if exists "login_backgrounds_staff_all" on public.login_backgrounds;
create policy "login_backgrounds_staff_all"
on public.login_backgrounds for all
using (public.is_staff())
with check (public.is_staff());


create table if not exists public.vacation_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid,
  person_name text,
  role text,
  start_date date,
  end_date date,
  type text,
  notes text,
  status text default 'pendiente',
  created_at timestamptz default now()
);

create table if not exists public.communications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid,
  from_name text,
  to_role text,
  message text,
  status text default 'nuevo',
  created_at timestamptz default now()
);

create table if not exists public.payslips (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid,
  person_name text,
  month text,
  file_name text,
  file_data text,
  uploaded_at timestamptz default now()
);

alter table public.vacation_requests enable row level security;
alter table public.communications enable row level security;
alter table public.payslips enable row level security;

drop policy if exists "vacation_staff_all" on public.vacation_requests;
create policy "vacation_staff_all" on public.vacation_requests for all using (public.is_staff()) with check (public.is_staff());
drop policy if exists "vacation_self_select_insert" on public.vacation_requests;
create policy "vacation_self_select_insert" on public.vacation_requests for all using (profile_id = auth.uid() or public.is_staff()) with check (profile_id = auth.uid() or public.is_staff());

drop policy if exists "communications_staff_all" on public.communications;
create policy "communications_staff_all" on public.communications for all using (public.is_staff()) with check (public.is_staff());
drop policy if exists "communications_self" on public.communications;
create policy "communications_self" on public.communications for all using (profile_id = auth.uid() or to_role in ('todos','empresa') or public.is_staff()) with check (profile_id = auth.uid() or public.is_staff());

drop policy if exists "payslips_staff_all" on public.payslips;
create policy "payslips_staff_all" on public.payslips for all using (public.is_staff()) with check (public.is_staff());
drop policy if exists "payslips_self_select" on public.payslips;
create policy "payslips_self_select" on public.payslips for select using (profile_id = auth.uid() or public.is_staff());
