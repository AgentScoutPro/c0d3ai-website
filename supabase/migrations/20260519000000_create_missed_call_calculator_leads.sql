create table if not exists public.missed_call_calculator_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  business_name text,
  phone text,
  email text not null,
  industry text,
  service text,
  page_slug text,
  daily_loss numeric,
  monthly_loss numeric,
  yearly_loss numeric,
  funnel_tier text,
  source text not null default 'missed_call_calculator',
  status text not null default 'new',
  notes text
);

alter table public.missed_call_calculator_leads enable row level security;

create policy "Allow public missed call calculator lead submissions"
  on public.missed_call_calculator_leads
  for insert
  to anon
  with check (
    source = 'missed_call_calculator'
    and status = 'new'
    and name is not null
    and email is not null
  );

create index if not exists missed_call_calculator_leads_created_at_idx
  on public.missed_call_calculator_leads (created_at desc);

create index if not exists missed_call_calculator_leads_funnel_tier_idx
  on public.missed_call_calculator_leads (funnel_tier);

create index if not exists missed_call_calculator_leads_page_slug_idx
  on public.missed_call_calculator_leads (page_slug);
