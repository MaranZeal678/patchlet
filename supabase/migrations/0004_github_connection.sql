-- Patchlet
-- Copyright (c) 2026 Elamaran Elangovan and Aadi Dahake. All rights reserved.
--
-- Proprietary and confidential. Rights held solely by the copyright holders.
-- No licence is granted to any other party. See LICENSE at the repository root.
-- Ref: PTCH-CYEP-P7KH3E-BLOTE

-- The GitHub account a console user linked to the project.
--
-- github_token holds the OAuth access token encrypted at rest (AES-256-GCM, see
-- apps/web/lib/github/secret.ts). It never leaves the server: the console only ever reads
-- github_login and github_avatar.

alter table project add column if not exists github_login text;
alter table project add column if not exists github_avatar text;
alter table project add column if not exists github_token text;
