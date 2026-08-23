import type { EscalationStatus, EscalationView, FeatureRequest } from '../types';

/**
 * Shown when the three checks found nothing. Offers to report the gap, then
 * follows the report through to a shipped change.
 */
export function AbsenceCard({
  text,
  request,
  escalation,
  reporting,
  elapsedSeconds,
  onReport,
}: {
  text: string;
  request: FeatureRequest;
  escalation?: EscalationView;
  reporting?: boolean;
  elapsedSeconds: number;
  onReport: () => void;
}) {
  return (
    <div class="pl-card">
      <p>{text}</p>
      {!escalation && (
        <div class="pl-card__actions">
          <button type="button" class="pl-btn pl-btn--accent" onClick={onReport} disabled={reporting}>
            {reporting ? 'Reporting' : 'Report to developers'}
          </button>
          <span class="pl-card__label">{request.title}</span>
        </div>
      )}
      {escalation && <Timeline escalation={escalation} elapsedSeconds={elapsedSeconds} />}
    </div>
  );
}

type Stage = { key: string; label: string; statuses: EscalationStatus[] };

const STAGES: Stage[] = [
  { key: 'filed', label: 'Filed as an issue', statuses: ['filing', 'inspecting', 'drafting', 'pr_open', 'awaiting_approval', 'approved', 'merging', 'deploying', 'shipped'] },
  { key: 'drafted', label: 'Change drafted', statuses: ['drafting', 'pr_open', 'awaiting_approval', 'approved', 'merging', 'deploying', 'shipped'] },
  { key: 'pr', label: 'Draft pull request opened', statuses: ['pr_open', 'awaiting_approval', 'approved', 'merging', 'deploying', 'shipped'] },
  { key: 'approval', label: 'Waiting for a developer to approve', statuses: ['awaiting_approval', 'approved', 'merging', 'deploying', 'shipped'] },
  { key: 'shipped', label: 'Shipped', statuses: ['shipped'] },
];

const ORDER: EscalationStatus[] = [
  'queued', 'filing', 'inspecting', 'drafting', 'pr_open', 'awaiting_approval',
  'approved', 'merging', 'deploying', 'shipped',
];

function Timeline({ escalation, elapsedSeconds }: { escalation: EscalationView; elapsedSeconds: number }) {
  const status = escalation.status;
  const position = ORDER.indexOf(status);

  if (status === 'failed' || status === 'rejected') {
    return (
      <p class="pl-timeline__note">
        {status === 'rejected'
          ? 'A developer decided not to build this for now.'
          : 'The report could not be completed. The team has the details.'}
      </p>
    );
  }

  return (
    <>
      <span class="pl-card__label">Report status</span>
      <ul class="pl-timeline">
        {STAGES.map((stage) => {
          const reached = stage.statuses.includes(status);
          const furthest = ORDER.indexOf(stage.statuses[0]);
          const state = reached ? (position > furthest ? 'done' : 'current') : 'pending';
          return (
            <li key={stage.key} data-state={state}>
              <span class="pl-timeline__mark" />
              <span class="pl-timeline__body">
                <span>{label(stage, escalation)}</span>
                {state === 'current' && elapsedSeconds > 10 && (
                  <span class="pl-timeline__note">{elapsedSeconds}s so far</span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function label(stage: Stage, escalation: EscalationView) {
  if (stage.key === 'filed' && escalation.issueUrl) {
    return (
      <a class="pl-link" href={escalation.issueUrl} target="_blank" rel="noreferrer noopener">
        Filed: issue #{escalation.issueNumber ?? ''}
      </a>
    );
  }
  if (stage.key === 'pr' && escalation.prUrl) {
    return (
      <a class="pl-link" href={escalation.prUrl} target="_blank" rel="noreferrer noopener">
        Draft pull request #{escalation.prNumber ?? ''}
      </a>
    );
  }
  if (stage.key === 'shipped' && escalation.deploymentUrl) {
    return (
      <a class="pl-link" href={escalation.deploymentUrl} target="_blank" rel="noreferrer noopener">
        Shipped, reload to see it
      </a>
    );
  }
  return stage.label;
}
