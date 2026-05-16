-- Migración v4: servicios condicionales + MD5 + línea/itinerario

alter table public.servicios add column if not exists has_return text default 'no';
alter table public.servicios add column if not exists service_type text;
alter table public.servicios add column if not exists seats_required integer;
alter table public.servicios add column if not exists sign_code text;
alter table public.servicios add column if not exists line_number text;
alter table public.servicios add column if not exists itinerary text;
alter table public.servicios add column if not exists md5 text unique;

-- Valores esperados:
-- service_type: instituto, linea, fabrica, discrecional
-- has_return: si, no
