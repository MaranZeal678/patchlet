/*
 * Patchlet
 * Copyright (c) 2026 Elamaran Elangovan and Aadi Dahake. All rights reserved.
 *
 * Proprietary and confidential. Rights held solely by the copyright holders.
 * No licence is granted to any other party. See LICENSE at the repository root.
 * Ref: PTCH-CYEP-P7KH3E-BLOTE
 */

import { AnswerActions } from './AnswerActions';
import { useReveal } from './reveal';
import type { FeedbackRating, Step } from '../types';

/** An answer that resolved to real controls, with the button that starts guidance. */
export function AnswerCard({
  text,
  steps,
  guiding,
  rating,
  canRate,
  onShowMe,
  onRate,
}: {
  text: string;
  steps: Step[] | null;
  guiding: boolean;
  rating?: FeedbackRating;
  canRate: boolean;
  onShowMe: () => void;
  onRate: (rating: FeedbackRating) => void;
}) {
  const shown = useReveal(text);
  const settled = shown === text;

  return (
    <div class="pl-card">
      <p>{shown}</p>
      {settled && steps && steps.length > 0 && (
        <div class="pl-card__actions">
          <button type="button" class="pl-btn pl-btn--accent" onClick={onShowMe} disabled={guiding}>
            {guiding ? 'Showing you' : 'Show me'}
          </button>
          <span class="pl-card__label">
            {steps.length} step{steps.length === 1 ? '' : 's'}
          </span>
        </div>
      )}
      {settled && <AnswerActions text={text} rating={rating} canRate={canRate} onRate={onRate} />}
    </div>
  );
}
