
-- Supabase initialization SQL
-- Run this in your Supabase SQL editor. It will create required tables and seed the users you provided.

drop table if exists giftcards cascade;
drop table if exists transactions cascade;
drop table if exists payout_requests cascade;
drop table if exists support_messages cascade;
drop table if exists contents cascade;
drop table if exists users cascade;

create table users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password text not null,
  role text not null,
  balance numeric default 0,
  created_at timestamptz default now()
);

create table contents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  url text not null,
  status text default 'pending',
  created_at timestamptz default now()
);

create table support_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  subject text,
  message text,
  reply text,
  created_at timestamptz default now()
);

create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  amount numeric,
  note text,
  created_at timestamptz default now()
);

create table giftcards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  code text,
  created_by text,
  created_at timestamptz default now()
);

create table payout_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  amount numeric,
  status text default 'pending',
  created_at timestamptz default now()
);

-- Seed users (as requested). Note: passwords stored plaintext for prototype.
insert into users (email,password,role,balance) values
('admin@voncatfishers.xyz','T7!pZr#2LqW9@vDx','admin',0),
('admin2@vgoncatfishers.xyz','gM4$Yt!Qx9V@h2Rp','admin',0),
('kaylie@voncatfishers.xyz','K8^rFs!1nLz@3QwX','model',0);

-- optional sample content
insert into contents (user_id, url, status)
select id, 'https://mega.nz/example-file', 'pending' from users where email='kaylie@voncatfishers.xyz';
