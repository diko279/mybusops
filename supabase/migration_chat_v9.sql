-- MyBusOps v9 - Chat y comunicación

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  from_profile_id uuid,
  from_name text,
  to_profile_id uuid,
  to_role text,
  scope text,
  message text not null,
  channel text default 'interno',
  status text default 'enviado',
  recipients_count integer default 0,
  created_at timestamptz default now()
);

alter table public.profiles add column if not exists disabled boolean default false;
