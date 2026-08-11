# Database Design

This schema is designed for the current Lunacat mobile app features:

- Calendar events
- Holidays
- Daily money entries
- Stock products
- Product stock movement history
- Optional user/account support

The design targets PostgreSQL/Supabase, but the table shape also works for SQLite with minor type changes.

## Entity Overview

```text
users
  ├─ calendars
  │   └─ calendar_events
  ├─ holidays
  ├─ money_entries
  └─ products
      └─ product_stock_movements
```

## Tables

### users

Stores app owners. If the app is single-device only, this can be deferred. If using Supabase Auth, map `id` to `auth.users.id`.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| display_name | text | Optional profile name |
| email | text | Unique, nullable if auth provider owns it |
| created_at | timestamptz | Default now |
| updated_at | timestamptz | Default now |

```sql
create table users (
  id uuid primary key,
  display_name text,
  email text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### calendars

Keeps calendar categories configurable instead of hardcoding `work`, `personal`, `focus`.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| user_id | uuid | FK users.id |
| key | text | Stable key, e.g. work |
| name | text | Display name |
| color | text | Hex color |
| sort_order | integer | Display ordering |
| created_at | timestamptz | Default now |

```sql
create table calendars (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  key text not null,
  name text not null,
  color text not null default '#146c64',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, key)
);
```

### calendar_events

Stores schedule items.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| user_id | uuid | FK users.id |
| calendar_id | uuid | FK calendars.id |
| event_date | date | Selected calendar day |
| start_time | time | Start |
| end_time | time | End |
| title | text | Required |
| note | text | Optional |
| created_at | timestamptz | Default now |
| updated_at | timestamptz | Default now |

```sql
create table calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  calendar_id uuid not null references calendars(id) on delete restrict,
  event_date date not null,
  start_time time not null,
  end_time time not null,
  title text not null,
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time > start_time)
);

create index calendar_events_user_date_idx on calendar_events (user_id, event_date);
create unique index calendar_events_user_date_start_idx on calendar_events (user_id, event_date, start_time);
```

### holidays

Stores user-managed holiday dates.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| user_id | uuid | FK users.id |
| holiday_date | date | Holiday date |
| title | text | Default Holiday |
| created_at | timestamptz | Default now |

```sql
create table holidays (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  holiday_date date not null,
  title text not null default 'Holiday',
  created_at timestamptz not null default now(),
  unique (user_id, holiday_date)
);
```

### money_categories

Optional lookup table for configurable income/expense categories.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| user_id | uuid | FK users.id |
| type | text | income or expense |
| name | text | Category name |
| sort_order | integer | Display ordering |

```sql
create table money_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  name text not null,
  sort_order integer not null default 0,
  unique (user_id, type, name)
);
```

### money_entries

Stores daily income/expense records.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| user_id | uuid | FK users.id |
| entry_date | date | Selected day |
| type | text | income or expense |
| amount | numeric(12,2) | Positive amount |
| category_id | uuid | Optional FK money_categories.id |
| category_name | text | Snapshot/fallback category |
| note | text | Optional |
| created_at | timestamptz | Default now |
| updated_at | timestamptz | Default now |

```sql
create table money_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  entry_date date not null,
  type text not null check (type in ('income', 'expense')),
  amount numeric(12,2) not null check (amount > 0),
  category_id uuid references money_categories(id) on delete set null,
  category_name text not null,
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index money_entries_user_date_idx on money_entries (user_id, entry_date);
create index money_entries_user_month_idx on money_entries (user_id, date_trunc('month', entry_date));
```

### products

Stores stock products and pricing. Gross margin is calculated, not stored.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| user_id | uuid | FK users.id |
| name | text | Product name |
| cost_price | numeric(12,2) | Cost per unit, can be 0 |
| sale_price | numeric(12,2) | Sale price per unit |
| stock_quantity | integer | Current stock |
| is_active | boolean | Soft archive |
| created_at | timestamptz | Default now |
| updated_at | timestamptz | Default now |

```sql
create table products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  cost_price numeric(12,2) not null default 0 check (cost_price >= 0),
  sale_price numeric(12,2) not null check (sale_price > 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_user_active_idx on products (user_id, is_active);
create index products_user_name_idx on products (user_id, name);
```

Calculated fields:

```sql
-- Unit profit
sale_price - cost_price

-- Stock cost value
cost_price * stock_quantity

-- Stock revenue value
sale_price * stock_quantity

-- Gross profit value
(sale_price - cost_price) * stock_quantity

-- Gross margin percent
case
  when sale_price > 0 then ((sale_price - cost_price) / sale_price) * 100
  else 0
end

-- Markup percent, if needed
case
  when cost_price > 0 then ((sale_price - cost_price) / cost_price) * 100
  else null
end
```

### product_stock_movements

Stores stock history for audit and future reports. The current `products.stock_quantity` is still kept for fast UI reads.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| user_id | uuid | FK users.id |
| product_id | uuid | FK products.id |
| movement_type | text | initial, restock, sale, adjust, return |
| quantity_delta | integer | Positive or negative |
| unit_cost | numeric(12,2) | Optional cost at movement time |
| unit_sale_price | numeric(12,2) | Optional sale price at movement time |
| note | text | Optional |
| created_at | timestamptz | Default now |

```sql
create table product_stock_movements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  movement_type text not null check (movement_type in ('initial', 'restock', 'sale', 'adjust', 'return')),
  quantity_delta integer not null check (quantity_delta <> 0),
  unit_cost numeric(12,2) check (unit_cost is null or unit_cost >= 0),
  unit_sale_price numeric(12,2) check (unit_sale_price is null or unit_sale_price >= 0),
  note text not null default '',
  created_at timestamptz not null default now()
);

create index product_stock_movements_product_idx on product_stock_movements (product_id, created_at desc);
create index product_stock_movements_user_idx on product_stock_movements (user_id, created_at desc);
```

## Recommended Views

### product_overview

```sql
create view product_overview as
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
from products
where is_active = true;
```

### monthly_money_summary

```sql
create view monthly_money_summary as
select
  user_id,
  date_trunc('month', entry_date)::date as month,
  sum(case when type = 'income' then amount else 0 end) as income,
  sum(case when type = 'expense' then amount else 0 end) as expense,
  sum(case when type = 'income' then amount else -amount end) as balance
from money_entries
group by user_id, date_trunc('month', entry_date)::date;
```

## Current App Field Mapping

| App Type | App Field | DB Table | DB Column |
| --- | --- | --- | --- |
| CalendarEvent | id | calendar_events | id |
| CalendarEvent | date | calendar_events | event_date |
| CalendarEvent | start | calendar_events | start_time |
| CalendarEvent | end | calendar_events | end_time |
| CalendarEvent | title | calendar_events | title |
| CalendarEvent | note | calendar_events | note |
| CalendarEvent | category | calendars | key |
| Holiday | date | holidays | holiday_date |
| Holiday | title | holidays | title |
| MoneyEntry | date | money_entries | entry_date |
| MoneyEntry | type | money_entries | type |
| MoneyEntry | amount | money_entries | amount |
| MoneyEntry | category | money_entries | category_name |
| MoneyEntry | note | money_entries | note |
| Product | name | products | name |
| Product | costPrice | products | cost_price |
| Product | salePrice | products | sale_price |
| Product | stock | products | stock_quantity |

## Seed Data

```sql
insert into calendars (user_id, key, name, color, sort_order)
values
  (:user_id, 'work', 'Work', '#146c64', 1),
  (:user_id, 'personal', 'Personal', '#f06a4d', 2),
  (:user_id, 'focus', 'Focus', '#3aaf82', 3);

insert into money_categories (user_id, type, name, sort_order)
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
  (:user_id, 'expense', 'Other', 6);
```

## Notes

- Use `numeric(12,2)` for money in the database. Avoid float for prices and amounts.
- Keep calculated values out of tables unless reports become too slow.
- Use soft archive (`is_active = false`) for products if historical stock movements must remain visible.
- If there is no login system yet, create one local/default user row and attach all records to it.
