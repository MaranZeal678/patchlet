/*
 * Patchlet
 * Copyright (c) 2026 Elamaran Elangovan and Aadi Dahake. All rights reserved.
 *
 * Proprietary and confidential. Rights held solely by the copyright holders.
 * No licence is granted to any other party. See LICENSE at the repository root.
 * Ref: PTCH-CYEP-P7KH3E-BLOTE
 */

/** The query parameter the widget reads on load to re-ask a question on the customer's site. */
export const ASK_PARAM = "patchlet_ask";

/**
 * The "Replay on site" target: the project's own site, with the question the agent solved.
 * Returns null when there is no site or no question, so the caller simply omits the link.
 */
export function replayUrl(siteUrl: string | null, question: string | null): string | null {
  if (!siteUrl || !question) return null;
  try {
    const url = new URL(siteUrl);
    url.searchParams.set(ASK_PARAM, question);
    return url.toString();
  } catch {
    return null;
  }
}
