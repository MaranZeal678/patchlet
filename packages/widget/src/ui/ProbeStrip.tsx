import { PROBE_LABELS, PROBE_ORDER, type ProbeState } from './model';
import type { ProbeName } from '../types';

/** The three checks the agent runs, shown while the answer is in flight. */
export function ProbeStrip({ probes }: { probes: Record<ProbeName, ProbeState> }) {
  return (
    <div class="pl-probes" role="group" aria-label="Checks in progress">
      {PROBE_ORDER.map((probe) => {
        const state = probes[probe];
        return (
          <div key={probe} class={`pl-pill pl-pill--${state.status}`}>
            <span class="pl-pill__name">{PROBE_LABELS[probe]}</span>
            <span class="pl-pill__state">
              <span class="pl-dot" />
              {describe(state)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function describe(state: ProbeState): string {
  if (state.status === 'pending') return 'Waiting';
  if (state.status === 'running') return 'Checking';
  const result = state.result;
  if (!result) return 'Done';
  const score = typeof result.score === 'number' ? ` ${result.score.toFixed(2)}` : '';
  return result.hit ? `Found${score}` : `Nothing${score}`;
}
