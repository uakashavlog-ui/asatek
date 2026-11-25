-- ASATEK order flow schema. Non-destructive: creates only missing objects and does not delete data.
create table if not exists public.orders (
  id text primary key,
  order_number text not null unique,
  customer_name text not null,
  phone text not null,
  whatsapp_number text not null,
  address text not null,
  city text not null,
  province text not null,
  country text not null default 'Pakistan',
  zip_code text,
  location text,
  status text not null default 'Pending' check (status in ('Pending','Confirmed','Shipped','Cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  payment_method text not null default 'COD',
  shipping_fee numeric not null default 0,
  total_amount numeric not null default 0,
  courier_name text,
  tracking_number text,
  serial_number text,
  expected_delivery text,
  history jsonb not null default '[]'::jsonb,
  landmark text,
  instructions text
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders(id) on delete cascade,
  product_id text not null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric not null check (unit_price >= 0),
  product_sku text,
  line_total numeric not null default 0
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_phone_idx on public.orders (phone);
create index if not exists order_items_order_id_idx on public.order_items (order_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
revoke all on public.orders from public, anon, authenticated;
revoke all on public.order_items from public, anon, authenticated;
grant insert on public.orders to anon;
grant insert on public.order_items to anon;
grant select, insert, update, delete on public.orders to authenticated;
grant select, insert, update, delete on public.order_items to authenticated;

grant usage on schema public to anon, authenticated;

create table if not exists public.order_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.order_admins enable row level security;
revoke all on public.order_admins from public, anon, authenticated;
insert into public.order_admins (user_id) select id from auth.users on conflict (user_id) do nothing;

create or replace function public.is_order_admin()
returns boolean language sql security definer set search_path = pg_catalog, public stable as $
  select exists (select 1 from public.order_admins where user_id = (select auth.uid()));
$;
revoke all on function public.is_order_admin() from public, anon;
grant execute on function public.is_order_admin() to authenticated;

drop policy if exists "Guests can submit orders" on public.orders;
create policy "Guests can submit orders" on public.orders for insert to anon with check (true);
drop policy if exists "Admins can manage orders" on public.orders;
create policy "Admins can manage orders" on public.orders for all to authenticated using (public.is_order_admin()) with check (public.is_order_admin());
drop policy if exists "Guests can submit order items" on public.order_items;
create policy "Guests can submit order items" on public.order_items for insert to anon with check (true);
drop policy if exists "Admins can manage order items" on public.order_items;
create policy "Admins can manage order items" on public.order_items for all to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);

create or replace function public.submit_customer_order(p_order jsonb, p_item jsonb)
returns text language plpgsql security invoker set search_path = public, pg_temp as $$
declare v_id text;
begin
  v_id := coalesce(p_order->>'id', p_order->>'order_number');
  if v_id is null or v_id = '' then raise exception 'Order number is required'; end if;
  insert into public.orders (
    id, order_number, customer_name, phone, whatsapp_number, address, city, province,
    country, zip_code, location, status, notes, created_at, updated_at,
    payment_method, shipping_fee, total_amount, courier_name, tracking_number,
    serial_number, expected_delivery, history, landmark, instructions
  ) values (
    v_id, v_id, p_order->>'customer_name', p_order->>'phone',
    coalesce(p_order->>'whatsapp_number', p_order->>'phone'),
    p_order->>'address', p_order->>'city', p_order->>'province',
    coalesce(p_order->>'country','Pakistan'), nullif(p_order->>'zip_code',''),
    nullif(p_order->>'location',''), coalesce(p_order->>'status','Pending'),
    nullif(p_order->>'notes',''), coalesce((p_order->>'created_at')::timestamptz, now()),
    coalesce((p_order->>'updated_at')::timestamptz, now()),
    coalesce(p_order->>'payment_method','COD'), coalesce((p_order->>'shipping_fee')::numeric,0),
    coalesce((p_order->>'total_amount')::numeric,0), nullif(p_order->>'courier_name',''),
    nullif(p_order->>'tracking_number',''), nullif(p_order->>'serial_number',''),
    nullif(p_order->>'expected_delivery',''), coalesce(p_order->'history','[]'::jsonb),
    nullif(p_order->>'landmark',''), nullif(p_order->>'instructions','')
  );
  insert into public.order_items (order_id, product_id, product_name, quantity, unit_price, product_sku, line_total)
  values (v_id, p_item->>'product_id', p_item->>'product_name', (p_item->>'quantity')::integer,
    (p_item->>'unit_price')::numeric, nullif(p_item->>'product_sku',''),
    coalesce((p_item->>'line_total')::numeric,0));
  return v_id;
end; $$;
revoke all on function public.submit_customer_order(jsonb,jsonb) from public;
grant execute on function public.submit_customer_order(jsonb,jsonb) to anon, authenticated;

create or replace function public.track_orders_by_phone(p_phone text)
returns table (order_number text, status text, created_at timestamptz, updated_at timestamptz,
  tracking_number text, courier_name text, expected_delivery text)
language sql security definer set search_path = pg_catalog, public stable as $$
  with input_phone as (
    select case
      when regexp_replace(coalesce(p_phone,''), '[^0-9]', '', 'g') like '92%'
        then '0' || substr(regexp_replace(coalesce(p_phone,''), '[^0-9]', '', 'g'), 3)
      when length(regexp_replace(coalesce(p_phone,''), '[^0-9]', '', 'g')) = 10
        and regexp_replace(coalesce(p_phone,''), '[^0-9]', '', 'g') like '3%'
        then '0' || regexp_replace(coalesce(p_phone,''), '[^0-9]', '', 'g')
      else regexp_replace(coalesce(p_phone,''), '[^0-9]', '', 'g')
    end as normalized
  )
  select o.order_number, o.status, o.created_at, o.updated_at, o.tracking_number, o.courier_name, o.expected_delivery
  from public.orders o, input_phone i
  where i.normalized <> ''
    and (
      case
        when regexp_replace(o.phone, '[^0-9]', '', 'g') like '92%' then '0' || substr(regexp_replace(o.phone, '[^0-9]', '', 'g'), 3)
        when length(regexp_replace(o.phone, '[^0-9]', '', 'g')) = 10 and regexp_replace(o.phone, '[^0-9]', '', 'g') like '3%' then '0' || regexp_replace(o.phone, '[^0-9]', '', 'g')
        else regexp_replace(o.phone, '[^0-9]', '', 'g')
      end = i.normalized
      or
      case
        when regexp_replace(o.whatsapp_number, '[^0-9]', '', 'g') like '92%' then '0' || substr(regexp_replace(o.whatsapp_number, '[^0-9]', '', 'g'), 3)
        when length(regexp_replace(o.whatsapp_number, '[^0-9]', '', 'g')) = 10 and regexp_replace(o.whatsapp_number, '[^0-9]', '', 'g') like '3%' then '0' || regexp_replace(o.whatsapp_number, '[^0-9]', '', 'g')
        else regexp_replace(o.whatsapp_number, '[^0-9]', '', 'g')
      end = i.normalized
    )
  order by o.created_at desc limit 20;
$$;
revoke all on function public.track_orders_by_phone(text) from public;
grant execute on function public.track_orders_by_phone(text) to anon, authenticated;

do $$ begin
  alter publication supabase_realtime add table public.orders;
  alter publication supabase_realtime add table public.order_items;
exception when duplicate_object then null; when undefined_object then null; end $$;
