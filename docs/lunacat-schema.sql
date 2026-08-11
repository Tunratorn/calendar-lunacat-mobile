-- Lunacat database schema
-- Target: PostgreSQL / Supabase

create extension if not exists pgcrypto;

create table if not exists lunacat_users (
  id uuid primary key default gen_random_uuid(),
  display_name text,
  email text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lunacat_calendars (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references lunacat_users(id) on delete cascade,
  key text not null,
  name text not null,
  color text not null default '#146c64',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, key)
);

create table if not exists lunacat_calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references lunacat_users(id) on delete cascade,
  calendar_id uuid not null references lunacat_calendars(id) on delete restrict,
  event_date date not null,
  start_time time not null,
  end_time time not null,
  title text not null,
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time > start_time)
);

create index if not exists lunacat_calendar_events_user_date_idx
  on lunacat_calendar_events (user_id, event_date);

create unique index if not exists lunacat_calendar_events_user_date_start_idx
  on lunacat_calendar_events (user_id, event_date, start_time);

create table if not exists lunacat_holidays (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references lunacat_users(id) on delete cascade,
  holiday_date date not null,
  title text not null default 'Holiday',
  created_at timestamptz not null default now(),
  unique (user_id, holiday_date)
);

create table if not exists lunacat_money_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references lunacat_users(id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  name text not null,
  sort_order integer not null default 0,
  unique (user_id, type, name)
);

create table if not exists lunacat_money_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references lunacat_users(id) on delete cascade,
  entry_date date not null,
  type text not null check (type in ('income', 'expense')),
  amount numeric(12,2) not null check (amount > 0),
  category_id uuid references lunacat_money_categories(id) on delete set null,
  category_name text not null,
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lunacat_money_entries_user_date_idx
  on lunacat_money_entries (user_id, entry_date);

create index if not exists lunacat_money_entries_user_month_idx
  on lunacat_money_entries (user_id, date_trunc('month', entry_date));

create table if not exists lunacat_products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references lunacat_users(id) on delete cascade,
  name text not null,
  cost_price numeric(12,2) not null default 0 check (cost_price >= 0),
  sale_price numeric(12,2) not null check (sale_price > 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lunacat_products_user_active_idx
  on lunacat_products (user_id, is_active);

create index if not exists lunacat_products_user_name_idx
  on lunacat_products (user_id, name);

create table if not exists lunacat_product_stock_movements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references lunacat_users(id) on delete cascade,
  product_id uuid not null references lunacat_products(id) on delete cascade,
  movement_type text not null check (movement_type in ('initial', 'restock', 'sale', 'adjust', 'return')),
  quantity_delta integer not null check (quantity_delta <> 0),
  unit_cost numeric(12,2) check (unit_cost is null or unit_cost >= 0),
  unit_sale_price numeric(12,2) check (unit_sale_price is null or unit_sale_price >= 0),
  note text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists lunacat_product_stock_movements_product_idx
  on lunacat_product_stock_movements (product_id, created_at desc);

create index if not exists lunacat_product_stock_movements_user_idx
  on lunacat_product_stock_movements (user_id, created_at desc);

create or replace view lunacat_product_overview as
select
  id,
  user_id,
  name,
  cost_price,
  sale_price,
  stock_quantity,
  sale_price - cost_price as unit_profit,
  cost_price * stock_quantity as stock_cost_value,
  sale_price * stock_quantity as stock_revenue_value,
  (sale_price - cost_price) * stock_quantity as stock_profit_value,
  case
    when sale_price > 0 then round(((sale_price - cost_price) / sale_price) * 100, 2)
    else 0
  end as gross_margin_percent,
  case
    when cost_price > 0 then round(((sale_price - cost_price) / cost_price) * 100, 2)
    else null
  end as markup_percent,
  stock_quantity = 0 as is_out_of_stock
from lunacat_products
where is_active = true;

create or replace view lunacat_monthly_money_summary as
select
  user_id,
  date_trunc('month', entry_date)::date as month,
  sum(case when type = 'income' then amount else 0 end) as income,
  sum(case when type = 'expense' then amount else 0 end) as expense,
  sum(case when type = 'income' then amount else -amount end) as balance
from lunacat_money_entries
group by user_id, date_trunc('month', entry_date)::date;

-- Seed template.
-- Replace :user_id with an existing lunacat_users.id before running.
/*
insert into lunacat_calendars (user_id, key, name, color, sort_order)
values
  (:user_id, 'work', 'Work', '#146c64', 1),
  (:user_id, 'personal', 'Personal', '#f06a4d', 2),
  (:user_id, 'focus', 'Focus', '#3aaf82', 3)
on conflict (user_id, key) do nothing;

insert into lunacat_money_categories (user_id, type, name, sort_order)
values
  (:user_id, 'income', 'Salary', 1),
  (:user_id, 'income', 'Freelance', 2),
  (:user_id, 'income', 'Gift', 3),
  (:user_id, 'income', 'Other', 4),
  (:user_id, 'expense', 'Food', 1),
  (:user_id, 'expense', 'Travel', 2),
  (:user_id, 'expense', 'Shopping', 3),
  (:user_id, 'expense', 'Bills', 4),
  (:user_id, 'expense', 'Health', 5),
  (:user_id, 'expense', 'Other', 6)
on conflict (user_id, type, name) do nothing;
*/
