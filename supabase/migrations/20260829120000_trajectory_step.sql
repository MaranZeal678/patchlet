-- Action Compiler: raw demonstrations.
-- One row per observed user action: the affordance map before, the action
-- taken, and the affordance map after. This is the table everything else
-- (discovery, compilation, equivalence proofs) is derived from.
create table if not exists trajectory_step (
  id bigint generated always as identity primary key,
  app text not null,
  instance text not null default 'live',
  session_id text not null,
  seq integer not null,
  at timestamptz not null default now(),
  url text not null,
  action jsonb not null,        -- { kind, target: { id, role, name }, value? }
  before_page jsonb not null,   -- PageContext: url, title, affordances[]
  after_page jsonb not null,
  unique (session_id, seq)
);

create index if not exists trajectory_step_session on trajectory_step (session_id, seq);
create index if not exists trajectory_step_app_at on trajectory_step (app, at desc);
