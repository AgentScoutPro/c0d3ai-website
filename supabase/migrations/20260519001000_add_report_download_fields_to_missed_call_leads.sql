alter table public.missed_call_calculator_leads
  add column if not exists downloaded_report text,
  add column if not exists report_type text,
  add column if not exists download_requested boolean not null default false,
  add column if not exists downloaded_at timestamptz,
  add column if not exists marketing_tags text[],
  add column if not exists lead_source text not null default 'missed_call_calculator_pdf_download';

drop policy if exists "Allow public missed call calculator lead submissions"
  on public.missed_call_calculator_leads;

create policy "Allow public missed call calculator lead submissions"
  on public.missed_call_calculator_leads
  for insert
  to anon
  with check (
    source = 'missed_call_calculator'
    and status = 'new'
    and name is not null
    and email is not null
    and (
      download_requested = false
      or (
        downloaded_report = 'missed_call_revenue_report'
        and report_type = 'missed_call_calculator_report'
        and lead_source = 'missed_call_calculator_pdf_download'
      )
    )
  );

create index if not exists missed_call_calculator_leads_report_type_idx
  on public.missed_call_calculator_leads (report_type);

create index if not exists missed_call_calculator_leads_lead_source_idx
  on public.missed_call_calculator_leads (lead_source);
