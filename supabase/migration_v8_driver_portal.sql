-- MyBusOps v8: portal conductor/monitor, vacaciones, comunicaciones y nóminas

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
