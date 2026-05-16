-- Migración v6.9: flujo de envío/confirmación/fichaje/incidencias

alter table public.vehiculos add column if not exists vehicle_group text;

alter table public.servicios add column if not exists sent_at timestamptz;
alter table public.servicios add column if not exists seen_at timestamptz;
alter table public.servicios add column if not exists started_at timestamptz;
alter table public.servicios add column if not exists ended_at timestamptz;
alter table public.servicios add column if not exists incident_notes text;
alter table public.servicios add column if not exists incident_photos text[] default '{}';

-- Para envío real de correo con PDF:
-- crear una Edge Function en Supabase o backend Node usando Resend/SendGrid/SMTP.
-- La app ya deja los campos y botones preparados.
