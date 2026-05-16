-- Migración v6: bases, edición ampliada y sugerencia por proximidad

alter table public.conductores add column if not exists base text;
alter table public.conductores add column if not exists photo_url text;
alter table public.conductores add column if not exists authorized_vehicle_ids text[] default '{}';

alter table public.vehiculos add column if not exists bus_number text;
alter table public.vehiculos add column if not exists bodywork text;
alter table public.vehiculos add column if not exists pmr text default 'no';
alter table public.vehiculos add column if not exists pmr_count integer default 0;
alter table public.vehiculos add column if not exists base text;
alter table public.vehiculos add column if not exists photo_url text;

alter table public.monitores add column if not exists base text;

alter table public.servicios add column if not exists nearest_base text;
alter table public.servicios add column if not exists nearest_base_km numeric;
