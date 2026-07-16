-- StyliQ — Supabase-ready schema (PostgreSQL)
-- Run in Supabase SQL editor or via migrations.
-- RLS policies should be added per your auth model.

create extension if not exists "uuid-ossp";

-- 1. users
create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  name text,
  created_at timestamptz default now()
);

-- 2. products
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text not null,
  description text,
  material text,
  price numeric(12,2),
  cover_image text,
  is_featured boolean default false,
  slug text unique,
  subtitle text,
  narrative text,
  budget_tier smallint check (budget_tier between 1 and 4)
);

-- 3. product_tags (one row per tag dimension; or normalize to junction tables — this matches the spec)
create table if not exists public.product_tags (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  style_tag text,
  occasion_tag text,
  mood_tag text,
  metal_tone text,
  collection_name text
);

-- 4. product_assets
create table if not exists public.product_assets (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text,
  model_3d_url text,
  tryon_asset_url text
);

-- 5. advisor_sessions
create table if not exists public.advisor_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete set null,
  outfit_image text,
  occasion text not null,
  style text not null,
  mood text not null,
  budget text,
  jewelry_category text,
  created_at timestamptz default now()
);

-- 6. advisor_results
create table if not exists public.advisor_results (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.advisor_sessions(id) on delete cascade,
  recommended_product_ids uuid[] not null,
  explanation text,
  styling_tip text
);

-- 7. tryon_sessions
create table if not exists public.tryon_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete set null,
  uploaded_photo_url text not null,
  selected_product_id uuid not null references public.products(id),
  result_url text,
  created_at timestamptz default now()
);

-- 8. customization_requests
create table if not exists public.customization_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete set null,
  inspiration_text text,
  reference_image text,
  budget_range text,
  deadline text,
  status text default 'pending',
  desired_style text,
  contact_email text,
  contact_name text
);

-- 9. vip_requests
create table if not exists public.vip_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete set null,
  service_type text not null,
  message text,
  created_at timestamptz default now()
);

-- 10. newsletter_subscribers
create table if not exists public.newsletter_subscribers (
  email text primary key,
  created_at timestamptz default now()
);

-- 11. early_access_waitlist
create table if not exists public.early_access_waitlist (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  name text,
  country text not null,
  gender text not null check (gender in ('female', 'male', 'non-binary', 'prefer-not-to-say')),
  source text,
  created_at timestamptz default now()
);

alter table public.early_access_waitlist
  add column if not exists name text;

alter table public.early_access_waitlist
  add column if not exists source text;

create index if not exists idx_product_tags_product on public.product_tags(product_id);
create index if not exists idx_product_assets_product on public.product_assets(product_id);
create index if not exists idx_advisor_results_session on public.advisor_results(session_id);
create index if not exists idx_early_access_waitlist_created_at on public.early_access_waitlist(created_at desc);

-- 12. analytics_events
create table if not exists public.analytics_events (
  id uuid primary key default uuid_generate_v4(),
  event_name text not null,
  page_url text,
  product_id text,
  tool_name text,
  timestamp timestamptz not null default now(),
  anonymous_user_id text,
  session_id text,
  device_type text,
  referrer text,
  country text,
  created_at timestamptz default now()
);

create index if not exists idx_analytics_events_event_name on public.analytics_events(event_name);
create index if not exists idx_analytics_events_timestamp on public.analytics_events(timestamp desc);
create index if not exists idx_analytics_events_session on public.analytics_events(session_id);
create index if not exists idx_analytics_events_anonymous_user on public.analytics_events(anonymous_user_id);
create index if not exists idx_analytics_events_product on public.analytics_events(product_id);

-- 13. orders
create table if not exists public.orders (
  id                    uuid primary key default gen_random_uuid(),
  order_id              text not null,
  stripe_session_id     text not null unique,
  stripe_payment_intent text,
  status                text not null default 'paid',
  email                 text not null,
  first_name            text not null,
  last_name             text not null,
  phone                 text,
  shipping_address1     text not null,
  shipping_address2     text,
  shipping_city         text not null,
  shipping_state        text not null,
  shipping_zip          text not null,
  shipping_country      text not null default 'US',
  subtotal_cents        integer not null,
  tax_cents             integer not null,
  total_cents           integer not null,
  shipping_free         boolean not null default false,
  currency              text not null default 'usd',
  items_json            jsonb not null,
  placed_at             timestamptz not null default now(),
  created_at            timestamptz not null default now()
);

create index if not exists idx_orders_stripe_session_id on public.orders(stripe_session_id);
create index if not exists idx_orders_email on public.orders(email);

alter table public.orders enable row level security;

-- 14. atelier_leads
create table if not exists public.atelier_leads (
  id             uuid primary key default gen_random_uuid(),
  email          text not null,
  identity       text not null,
  occasion       text not null,
  aesthetic      text not null,
  investment     text not null,
  story          text,
  archetype      text not null,
  style_dna      text not null,
  occasion_match text not null,
  collection     text not null,
  why_piece      text not null,
  source         text default 'atelier-wizard',
  created_at     timestamptz not null default now()
);

create index if not exists idx_atelier_leads_email on public.atelier_leads(email);
create index if not exists idx_atelier_leads_created_at on public.atelier_leads(created_at desc);

alter table public.atelier_leads enable row level security;

-- Public user image assets used by the styling advisor. Uploads are performed
-- only by the server service role after MIME, signature, size and rate checks.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('user-uploads', 'user-uploads', true, 5242880, array['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read user uploads" on storage.objects;
create policy "Public read user uploads"
on storage.objects for select
using (bucket_id = 'user-uploads');

-- 15. Account-synced wishlist. The item snapshot keeps the page usable even
-- when the merchandising catalog is served from the application bundle.
create table if not exists public.user_wishlist (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null,
  item_json jsonb not null,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

alter table public.user_wishlist enable row level security;
drop policy if exists "Users manage own wishlist" on public.user_wishlist;
create policy "Users manage own wishlist"
on public.user_wishlist for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- 16. Cross-device JMTI identity profile.
create table if not exists public.identity_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  answers_json jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.identity_profiles enable row level security;
drop policy if exists "Users manage own identity profile" on public.identity_profiles;
create policy "Users manage own identity profile"
on public.identity_profiles for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
