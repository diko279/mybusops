-- Migración v5: catálogo de códigos de letrero y código automático

create table if not exists public.sign_codes (
  id uuid primary key default gen_random_uuid(),
  service_type text not null check (service_type in ('instituto','linea','fabrica','discrecional')),
  name text not null,
  code text not null check (code ~ '^[0-9]+$'),
  origin text,
  destination text,
  line_number text,
  itinerary text,
  is_default boolean default false,
  created_at timestamptz default now()
);

alter table public.sign_codes enable row level security;

drop policy if exists "sign_codes_staff_all" on public.sign_codes;
create policy "sign_codes_staff_all"
on public.sign_codes for all
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "sign_codes_authenticated_select" on public.sign_codes;
create policy "sign_codes_authenticated_select"
on public.sign_codes for select
using (auth.role() = 'authenticated');

alter table public.servicios add column if not exists manual_sign_code boolean default false;
alter table public.servicios add column if not exists sign_code text;
alter table public.servicios add column if not exists line_number text;
alter table public.servicios add column if not exists itinerary text;

insert into public.sign_codes (service_type, name, code, origin, destination, line_number, itinerary, is_default)
values
('discrecional','Discrecional','2','','','','',true),
('instituto','Transporte escolar Gobierno de La Rioja','9000','','','','',true),
('linea','Nájera - Valgañón','350','Nájera','Valgañón','350','Nájera - Valgañón',true)
on conflict do nothing;
