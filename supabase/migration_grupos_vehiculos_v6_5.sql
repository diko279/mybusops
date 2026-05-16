-- Migración v6.5: grupos de vehículos

alter table public.vehiculos add column if not exists vehicle_group text;

-- Valores esperados:
-- autobus
-- microbus
-- autobus_3_ejes
