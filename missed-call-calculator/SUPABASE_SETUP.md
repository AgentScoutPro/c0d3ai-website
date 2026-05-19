# Missed Call Calculator Supabase Setup

## 1. Create the table

Run the migration in:

```text
supabase/migrations/20260519000000_create_missed_call_calculator_leads.sql
```

The table is `public.missed_call_calculator_leads`. Row level security is enabled, with a public insert-only policy for calculator submissions.

## 2. Add environment variables

Set these in the deploy environment before generating the static pages:

```text
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY
```

For Netlify, add them under:

```text
Site configuration > Environment variables
```

Then run the calculator generator during the deploy build so the generated pages receive the public anon client config:

```bash
node missed-call-calculator/build-all.js
```

## 3. Client files

The generated calculator pages load:

```text
missed-call-calculator/supabase-client.js
missed-call-calculator/lead-submission.js
```

`submitMissedCallLead(leadData)` validates required fields, rejects the hidden honeypot field, inserts the lead into Supabase, and returns `{ success, data }` or `{ success, error }`.

## 4. Future integrations

Keep Go High Level webhooks, email notifications, and tier-based automations outside the browser client. Add those later through a serverless function or edge function so secret keys stay private.
