-- "Danmark på kortet": purchase codes and the devices that use them.
-- Applied to the Supabase project "danmark-paa-kortet". Only the server
-- (service-role key) reads or writes these tables: RLS is on with no policies,
-- and the functions are executable by service_role only.
create table public.purchases (
  code text primary key,
  product text not null check (product in ('2','3','4','5','6','7','8','bundle')),
  status text not null default 'pending' check (status in ('pending','active','revoked')),
  email text,
  stripe_session text unique,
  payment_intent text,
  max_devices int not null default 3,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create index purchases_payment_intent on public.purchases (payment_intent);

create table public.devices (
  code text not null references public.purchases(code) on delete cascade,
  device text not null,
  created_at timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  primary key (code, device)
);

alter table public.purchases enable row level security;
alter table public.devices enable row level security;

-- Register a device for a code, atomically, within the code's device limit.
create or replace function public.claim_device(p_code text, p_device text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare p purchases; n int;
begin
  select * into p from purchases where code = upper(p_code) for update;
  if not found then return jsonb_build_object('ok', false, 'reason', 'unknown'); end if;
  if p.status <> 'active' then return jsonb_build_object('ok', false, 'reason', p.status); end if;
  if exists (select 1 from devices where code = p.code and device = p_device) then
    update devices set last_seen = now() where code = p.code and device = p_device;
    return jsonb_build_object('ok', true, 'product', p.product, 'code', p.code);
  end if;
  select count(*) into n from devices where code = p.code;
  if n >= p.max_devices then return jsonb_build_object('ok', false, 'reason', 'device_limit'); end if;
  insert into devices (code, device) values (p.code, p_device);
  return jsonb_build_object('ok', true, 'product', p.product, 'code', p.code);
end $$;

-- Which of these codes are active and registered to this device: returns their products.
create or replace function public.device_products(p_codes text[], p_device text)
returns text[] language plpgsql security definer set search_path = public as $$
declare r text[];
begin
  update devices set last_seen = now() where device = p_device and code = any(p_codes);
  select coalesce(array_agg(distinct p.product), '{}') into r
    from purchases p join devices d on d.code = p.code
   where p.code = any(p_codes) and d.device = p_device and p.status = 'active';
  return r;
end $$;

revoke all on function public.claim_device(text, text) from public, anon, authenticated;
revoke all on function public.device_products(text[], text) from public, anon, authenticated;
grant execute on function public.claim_device(text, text) to service_role;
grant execute on function public.device_products(text[], text) to service_role;

-- Admin, in the Supabase SQL editor:
--   Reset a buyer's devices:  delete from devices where code = 'ABCDEFGH';
--   Block a shared code:       update purchases set status = 'revoked' where code = 'ABCDEFGH';
--   Find a code by email:      select code, product, status from purchases where email ilike 'name@example.com';
