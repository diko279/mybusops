-- Migración v7.9: estados separados de envío/lectura por conductor y monitor

alter table public.servicios add column if not exists driver_sent_at timestamptz;
alter table public.servicios add column if not exists monitor_sent_at timestamptz;
alter table public.servicios add column if not exists driver_seen_at timestamptz;
alter table public.servicios add column if not exists monitor_seen_at timestamptz;
