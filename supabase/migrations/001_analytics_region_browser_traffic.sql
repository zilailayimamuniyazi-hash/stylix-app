-- Migration 001: Add region, browser, traffic_source columns to analytics_events
-- Run this in the Supabase SQL Editor (or via supabase db push).

alter table public.analytics_events
  add column if not exists region         text,
  add column if not exists browser        text,
  add column if not exists traffic_source text;

-- Backfill traffic_source from referrer for rows that have a referrer but no traffic_source.
-- Covers the most common social + search sources; everything else falls back to 'referral'.
update public.analytics_events
set traffic_source = case
  when referrer ilike '%instagram.com%'            then 'instagram'
  when referrer ilike '%tiktok.com%'               then 'tiktok'
  when referrer ilike '%pinterest.com%'            then 'pinterest'
  when referrer ilike '%google.com%'
    or referrer ilike '%google.co%'                then 'google'
  when referrer ilike '%facebook.com%'
    or referrer ilike '%fb.com%'                   then 'facebook'
  when referrer ilike '%t.co%'
    or referrer ilike '%twitter.com%'
    or referrer ilike '%x.com%'                    then 'twitter'
  when referrer ilike '%weixin%'
    or referrer ilike '%wechat%'                   then 'wechat'
  else 'referral'
end
where traffic_source is null
  and referrer is not null
  and referrer <> '';

-- Mark remaining null traffic_source rows (no referrer) as 'direct'.
update public.analytics_events
set traffic_source = 'direct'
where traffic_source is null;

-- Index for traffic source breakdown queries.
create index if not exists idx_analytics_events_traffic_source
  on public.analytics_events(traffic_source);

create index if not exists idx_analytics_events_country_region
  on public.analytics_events(country, region);
