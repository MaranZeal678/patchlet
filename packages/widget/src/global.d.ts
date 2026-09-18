/*
 * Patchlet
 * Copyright (c) 2026 Elamaran Elangovan and Aadi Dahake. All rights reserved.
 *
 * Proprietary and confidential. Rights held solely by the copyright holders.
 * No licence is granted to any other party. See LICENSE at the repository root.
 * Ref: PTCH-CYEP-P7KH3E-BLOTE
 */

/** What the widget exposes to the host page. Kept small and stable. */
type PatchletApi = {
  open(): void;
  close(): void;
  ask(question: string): void;
};

interface Window {
  Patchlet?: PatchletApi;
}
