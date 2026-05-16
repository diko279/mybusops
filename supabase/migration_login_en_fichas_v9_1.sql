-- MyBusOps v9.1
-- Datos de acceso dentro de fichas de conductores y monitores

alter table public.conductores add column if not exists login_password text;
alter table public.monitores add column if not exists login_password text;

-- Nota importante:
-- En producción definitiva, las contraseñas deben gestionarse con Supabase Auth.
-- Este campo se usa como contraseña inicial/operativa visible durante la fase de pruebas.
