-- MyBusOps v8.4
alter table public.profiles add column if not exists disabled boolean default false;
