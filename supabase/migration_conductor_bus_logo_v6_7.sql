-- Migración v6.7: bus por defecto del conductor

alter table public.conductores add column if not exists default_vehicle_id text;
