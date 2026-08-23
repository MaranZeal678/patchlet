import type { Step } from '../types';

/** An answer that resolved to real controls, with the button that starts guidance. */
export function AnswerCard({
  text,
  steps,
  guiding,
  onShowMe,
}: {
  text: string;
  steps: Step[] | null;
  guiding: boolean;
  onShowMe: () => void;
}) {
  return (
    <div class="pl-card">
      <p>{text}</p>
      {steps && steps.length > 0 && (
        <div class="pl-card__actions">
          <button type="button" class="pl-btn pl-btn--accent" onClick={onShowMe} disabled={guiding}>
            {guiding ? 'Showing you' : 'Show me'}
          </button>
          <span class="pl-card__label">
            {steps.length} step{steps.length === 1 ? '' : 's'}
          </span>
        </div>
      )}
    </div>
  );
}
