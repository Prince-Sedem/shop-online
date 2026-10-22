-- Marketday Phase 1 schema
-- Run this in Supabase Dashboard -> SQL Editor.
-- Create the first admin user in Authentication -> Users before using /admin/login.

create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  slug text not null unique,
  category text not null default 'General',
  price numeric(12,2) not null default 0 check (price >= 0),
  description text not null default '',
  image_url text not null default '',
  in_stock boolean not null default true,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_created_at_idx on public.products (created_at desc);
create index if not exists products_category_idx on public.products (category);
create index if not exists products_featured_idx on public.products (featured) where featured = true;

alter table public.products enable row level security;

-- Public visitors can only read product catalogue fields.
drop policy if exists "Anyone can read products" on public.products;
create policy "Anyone can read products"
on public.products for select
to anon, authenticated
using (true);

-- Only the specifically approved admin account(s) should be able to mutate products.
-- Replace the email below with the admin email you create in Supabase Auth.
-- Do NOT remove this check or use an unrestricted authenticated write policy.
create table if not exists public.store_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.store_admins enable row level security;

drop policy if exists "Admins can read their own admin record" on public.store_admins;
create policy "Admins can read their own admin record"
on public.store_admins for select
to authenticated
using (user_id = auth.uid());

create or replace function public.is_store_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.store_admins a
    where a.user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_store_admin() from public;
grant execute on function public.is_store_admin() to authenticated;

drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products"
on public.products for insert
to authenticated
with check ((select public.is_store_admin()));

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
on public.products for update
to authenticated
using ((select public.is_store_admin()))
with check ((select public.is_store_admin()));

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
on public.products for delete
to authenticated
using ((select public.is_store_admin()));

-- Public product images bucket. Upload/update/delete remain admin-only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = true, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif'];

drop policy if exists "Anyone can view product images" on storage.objects;
create policy "Anyone can view product images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'product-images');

drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'product-images' and (select public.is_store_admin()));

drop policy if exists "Admins can update product images" on storage.objects;
create policy "Admins can update product images"
on storage.objects for update
to authenticated
using (bucket_id = 'product-images' and (select public.is_store_admin()))
with check (bucket_id = 'product-images' and (select public.is_store_admin()));

drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images"
on storage.objects for delete
to authenticated
using (bucket_id = 'product-images' and (select public.is_store_admin()));

-- Optional: updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

-- After creating the admin account in Authentication -> Users, copy its UUID
-- and run the following with your real UUID:
-- insert into public.store_admins (user_id) values ('YOUR-AUTH-USER-UUID');
