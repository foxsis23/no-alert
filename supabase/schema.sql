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

create table if not exists site_config (
  key text primary key,
  value text not null,
  updated_at timestamptz default now()
);

create table if not exists products_config (
  product_id text primary key,
  price numeric,
  is_enabled boolean not null default true,
  audio_url text,
  video_url text,
  text_content text,
  updated_at timestamptz default now()
);

-- Migration: add text_content if table already exists
alter table products_config add column if not exists text_content text;

create table if not exists result_types_config (
  type_id text primary key,
  title text,
  preview_phrase_1 text,
  preview_phrase_2 text,
  full_description text,
  recommendation text,
  updated_at timestamptz default now()
);

-- Index for faster admin queries
create index if not exists orders_status_idx on orders(status);
create index if not exists orders_created_at_idx on orders(created_at desc);
create index if not exists events_type_idx on events(event_type);
create index if not exists events_created_at_idx on events(created_at desc);
