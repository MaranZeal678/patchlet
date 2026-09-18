/*
 * Patchlet
 * Copyright (c) 2026 Elamaran Elangovan and Aadi Dahake. All rights reserved.
 *
 * Proprietary and confidential. Rights held solely by the copyright holders.
 * No licence is granted to any other party. See LICENSE at the repository root.
 * Ref: PTCH-CYEP-P7KH3E-BLOTE
 */

import { ChatIcon, CloseIcon } from './icons';

export function Launcher({
  open,
  unread,
  onClick,
}: {
  open: boolean;
  /** An answer arrived while the panel was closed. */
  unread: boolean;
  onClick: () => void;
}) {
  const label = open ? 'Close support' : unread ? 'Open support, one new answer' : 'Open support';
  return (
    <button
      type="button"
      class="pl-launcher"
      aria-label={label}
      aria-expanded={open}
      onClick={onClick}
    >
      {open ? <CloseIcon /> : <ChatIcon />}
      {!open && unread && <span class="pl-launcher__dot" aria-hidden="true" />}
    </button>
  );
}
