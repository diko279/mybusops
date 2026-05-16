-- Migración v7: mi perfil y email del jefe

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists base text;
alter table public.profiles add column if not exists photo_url text;

-- Ejemplo para jefe demo:
-- update public.profiles
-- set email = 'elpaseosanvicente@gmail.com'
-- where role = 'jefe';
