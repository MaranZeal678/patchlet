-- Patchlet
-- Copyright (c) 2026 Elamaran Elangovan and Aadi Dahake. All rights reserved.
--
-- Proprietary and confidential. Rights held solely by the copyright holders.
-- No licence is granted to any other party. See LICENSE at the repository root.
-- Ref: PTCH-CYEP-P7KH3E-BLOTE

-- The evidence an answer was built on, kept with the answer.
--
-- Continuing a walkthrough needs the same documentation passages the first answer used. Without
-- them the only way to carry on is to run the whole turn again, which costs the user a second or
-- two of standing still in the middle of being shown something.

alter table message add column if not exists grounding jsonb;
