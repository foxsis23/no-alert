-- Run this in Supabase SQL Editor (Database → SQL Editor → New query)

create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  order_id text unique not null,
  email text not null,
  product_id text not null,
  amount numeric not null default 0,
  status text not null default 'pending', -- pending | success | failed
  liqpay_status text,
  access_token text unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists events (
  id uuid default gen_random_uuid() primary key,
  event_type text not null,
  metadata jsonb,
  session_id text,
  created_at timestamptz default now()
);

-- Index for faster admin queries
create index if not exists orders_status_idx on orders(status);
create index if not exists orders_created_at_idx on orders(created_at desc);
create index if not exists events_type_idx on events(event_type);
create index if not exists events_created_at_idx on events(created_at desc);
