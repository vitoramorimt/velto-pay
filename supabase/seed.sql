insert into public.outbox_events (
  id,
  event_type,
  aggregate_type,
  payload,
  status
)
values (
  '00000000-0000-4000-8000-000000000001',
  'system.seeded',
  'system',
  '{"source":"supabase/seed.sql","purpose":"local schema smoke test"}'::jsonb,
  'discarded'
)
on conflict (id) do nothing;
