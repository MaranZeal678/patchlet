-- Patchlet
-- Copyright (c) 2026 Elamaran Elangovan and Aadi Dahake. All rights reserved.
--
-- Proprietary and confidential. Rights held solely by the copyright holders.
-- No licence is granted to any other party. See LICENSE at the repository root.
-- Ref: PTCH-CYEP-P7KH3E-BLOTE

-- How each conversation ended, written once the assistant's turn is stored.
-- outcome: 'solved' | 'missing_feature' | 'unresolved'; summary is one sentence in plain English.
alter table conversation add column if not exists outcome text;
alter table conversation add column if not exists summary text;

-- The Conversations page filters by outcome inside one project.
create index if not exists conversation_project_outcome_idx on conversation (project_id, outcome);
