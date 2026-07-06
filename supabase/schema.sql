create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  title text,
  alt text,
  image_path text not null,
  public_url text not null,
  category_id uuid references public.categories(id) on delete set null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;
alter table public.photos enable row level security;

create policy "Public can read categories"
  on public.categories for select
  using (true);

create policy "Public can read photos"
  on public.photos for select
  using (true);

create policy "Authenticated users can manage categories"
  on public.categories for all
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can manage photos"
  on public.photos for all
  to authenticated
  using (true)
  with check (true);

insert into public.categories (name, slug, sort_order)
values
  ('Naturaleza', 'naturaleza', 10),
  ('Arquitectura', 'arquitectura', 20),
  ('Retratos', 'retratos', 30),
  ('Paisajes', 'paisajes', 40)
on conflict (slug) do nothing;

-- Storage policies para el bucket publico "photos".
-- Crear primero el bucket desde Supabase Storage y luego ejecutar estas policies.

create policy "Public can read stored photos"
  on storage.objects for select
  using (bucket_id = 'photos');

create policy "Authenticated users can upload photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'photos');

create policy "Authenticated users can update photos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'photos')
  with check (bucket_id = 'photos');

create policy "Authenticated users can delete photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'photos');

