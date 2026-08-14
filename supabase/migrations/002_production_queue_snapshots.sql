create table if not exists public.production_queue_snapshots (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  workstation_heartbeat_at timestamptz
);

alter table public.production_queue_snapshots enable row level security;
revoke all on table public.production_queue_snapshots from anon, authenticated;

create index if not exists idx_production_queue_snapshots_updated_at
  on public.production_queue_snapshots(updated_at desc);
