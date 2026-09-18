-- Patchlet
-- Copyright (c) 2026 Elamaran Elangovan and Aadi Dahake. All rights reserved.
--
-- Proprietary and confidential. Rights held solely by the copyright holders.
-- No licence is granted to any other party. See LICENSE at the repository root.
-- Ref: PTCH-CYEP-P7KH3E-BLOTE

-- Where the original upload is kept, so the console can show the file itself next to what was
-- read out of it. The value is the object key inside the private `sources` storage bucket:
-- <project id>/<document id>/<filename>. Null for written notes and crawled pages, which have
-- no file of their own (their `source_text` is the original).
alter table document add column if not exists storage_path text;
