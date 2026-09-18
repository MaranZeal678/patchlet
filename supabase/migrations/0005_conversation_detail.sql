-- Patchlet
-- Copyright (c) 2026 Elamaran Elangovan and Aadi Dahake. All rights reserved.
--
-- Proprietary and confidential. Rights held solely by the copyright holders.
-- No licence is granted to any other party. See LICENSE at the repository root.
-- Ref: PTCH-CYEP-P7KH3E-BLOTE

-- What the console shows about a finished conversation beyond its one-line summary.
--
-- evidence: verbatim quotes from the user that support the outcome.
-- next_steps: what the team should do about it.
-- resolution: the agent's closing answer.
-- close_reason: why the conversation ended where it did.
alter table conversation add column if not exists evidence jsonb;
alter table conversation add column if not exists next_steps jsonb;
alter table conversation add column if not exists resolution text;
alter table conversation add column if not exists close_reason text;
