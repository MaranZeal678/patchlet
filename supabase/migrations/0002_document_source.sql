-- Patchlet
-- Copyright (c) 2026 Elamaran Elangovan and Aadi Dahake. All rights reserved.
--
-- Proprietary and confidential. Rights held solely by the copyright holders.
-- No licence is granted to any other party. See LICENSE at the repository root.
-- Ref: PTCH-CYEP-P7KH3E-BLOTE

-- Re-indexing needs whatever produced a document, and the console previews what the reader
-- actually extracted, so both live on the row next to the chunks they produced.
alter table document add column if not exists source_text text;
alter table document add column if not exists pages jsonb;

-- A crawled site is one document made of many pages. The chunk remembers which page it came
-- from so a retrieved passage can be traced back to a real address.
alter table chunk add column if not exists source_ref text;
