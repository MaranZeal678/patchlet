import type { Affordance, Step } from '../types';
import type { ScanResult } from '../scan/affordances';

export type GuideState = 'SPOTLIGHTING' | 'VERIFYING' | 'SNAPSHOTTING' | 'DONE' | 'FAILED';

export type GuideSnapshot = {
  state: GuideState;
  stepIndex: number;
  total: number;
  step: Step | null;
  target: Element | null;
  message: string | null;
};

export type GuideDeps = {
  /** A fresh scan of the host page. */
  rescan: () => ScanResult;
  /**
   * Asks the agent for the steps that are still outstanding, given the page as
   * it looks now. Returns the scan those step ids belong to.
   */
  replan: (continueFrom: number) => Promise<(ScanResult & { steps: Step[] }) | null>;
  onChange: (snapshot: GuideSnapshot) => void;
  /** Navigation plus debounced mutations; the machine only needs "something moved". */
  watch?: (onPageChanged: () => void) => () => void;
  doc?: Document;
  settleMs?: number;
};

/**
 * Drives one guidance run. It never focuses anything: the user keeps control of
 * the host page and the machine only observes what they do.
 */
export class GuideMachine {
  private state: GuideState = 'DONE';
  private steps: Step[] = [];
  private index = 0;
  private lookup = new Map<string, Element>();
  private affordances = new Map<string, Affordance>();
  private target: Element | null = null;
  private message: string | null = null;
  private unwatch: (() => void) | null = null;
  private settleTimer: ReturnType<typeof setTimeout> | undefined;
  private replanning = false;

  private readonly doc: Document;
  private readonly settleMs: number;

  constructor(private readonly deps: GuideDeps) {
    this.doc = deps.doc ?? document;
    this.settleMs = deps.settleMs ?? 300;
  }

  get snapshot(): GuideSnapshot {
    return {
      state: this.state,
      stepIndex: this.index,
      total: this.steps.length,
      step: this.steps[this.index] ?? null,
      target: this.target,
      message: this.message,
    };
  }

  start(scan: ScanResult, steps: Step[]): void {
    this.stopListening();
    this.steps = steps;
    this.index = 0;
    this.message = null;
    this.adoptScan(scan);
    this.doc.addEventListener('click', this.onUserEvent, true);
    this.doc.addEventListener('keydown', this.onUserEvent, true);
    this.doc.addEventListener('input', this.onUserEvent, true);
    this.doc.addEventListener('change', this.onUserEvent, true);
    if (this.deps.watch) this.unwatch = this.deps.watch(this.onPageChanged);
    this.enterSpotlight();
  }

  /** The Next button: advance whatever the step said it was waiting for. */
  next(): void {
    if (this.state !== 'SPOTLIGHTING' && this.state !== 'VERIFYING') return;
    this.enterSnapshot();
  }

  stop(): void {
    this.stopListening();
    this.target = null;
    this.transition('DONE');
  }

  dispose(): void {
    this.stopListening();
  }

  private stopListening(): void {
    if (this.settleTimer) clearTimeout(this.settleTimer);
    this.settleTimer = undefined;
    this.doc.removeEventListener('click', this.onUserEvent, true);
    this.doc.removeEventListener('keydown', this.onUserEvent, true);
    this.doc.removeEventListener('input', this.onUserEvent, true);
    this.doc.removeEventListener('change', this.onUserEvent, true);
    this.unwatch?.();
    this.unwatch = null;
  }

  private adoptScan(scan: ScanResult): void {
    this.lookup = scan.lookup;
    this.affordances = new Map(scan.page.affordances.map((affordance) => [affordance.id, affordance]));
  }

  private transition(state: GuideState): void {
    this.state = state;
    this.deps.onChange(this.snapshot);
  }

  private enterSpotlight(): void {
    const step = this.steps[this.index];
    if (!step) {
      this.stopListening();
      this.target = null;
      this.transition('DONE');
      return;
    }
    const element = this.lookup.get(step.target) ?? null;
    if (!element || !element.isConnected) {
      void this.recover();
      return;
    }
    this.target = element;
    this.message = null;
    this.transition('SPOTLIGHTING');
  }

  private readonly onUserEvent = (event: Event): void => {
    if (this.state !== 'SPOTLIGHTING' || !this.target) return;
    const step = this.steps[this.index];
    if (!step || !acceptsEvent(step.advanceOn, event.type)) return;
    const path = typeof (event as Event & { composedPath?: () => EventTarget[] }).composedPath === 'function'
      ? event.composedPath()
      : [];
    const hit = path.includes(this.target) || (event.target instanceof Node && this.target.contains(event.target));
    if (!hit) return;
    if (event.type === 'keydown') {
      const key = (event as KeyboardEvent).key;
      if (key !== 'Enter' && key !== ' ' && key !== 'Spacebar') return;
    }
    this.enterVerifying();
  };

  private enterVerifying(): void {
    this.transition('VERIFYING');
    if (this.settleTimer) clearTimeout(this.settleTimer);
    this.settleTimer = setTimeout(() => this.enterSnapshot(), this.settleMs);
  }

  /** Re-reads the page after an action and binds the next step to it. */
  private enterSnapshot(): void {
    if (this.settleTimer) clearTimeout(this.settleTimer);
    this.transition('SNAPSHOTTING');
    this.index += 1;
    if (this.index >= this.steps.length) {
      this.stopListening();
      this.target = null;
      this.transition('DONE');
      return;
    }
    // Ids are positional, so a re-render can point the same id at a different
    // control. Rebind the next step by identity instead of trusting its id.
    const step = this.steps[this.index];
    const wanted = this.affordances.get(step.target);
    const scan = this.deps.rescan();
    const rebound = wanted ? findEquivalent(scan, wanted) : null;
    this.adoptScan(scan);
    if (wanted && !rebound) {
      void this.recover();
      return;
    }
    if (rebound && rebound !== step.target) {
      this.steps = this.steps.map((current, position) =>
        position === this.index ? { ...current, target: rebound } : current,
      );
    }
    this.enterSpotlight();
  }

  /**
   * The host re-rendered. If the step's control simply came back as a new node,
   * rebind to it. If it is really gone, ask the agent for a fresh plan.
   */
  private readonly onPageChanged = (): void => {
    if (this.state === 'DONE' || this.state === 'FAILED' || this.replanning) return;
    const step = this.steps[this.index];
    if (!step) return;
    if (step.advanceOn === 'navigation' && this.state === 'SPOTLIGHTING') {
      this.enterVerifying();
      return;
    }
    if (this.target && this.target.isConnected) return;
    void this.recover();
  };

  private async recover(): Promise<void> {
    if (this.replanning) return;
    this.replanning = true;
    this.transition('SNAPSHOTTING');
    try {
      const step = this.steps[this.index];
      const wanted = step ? this.affordances.get(step.target) : undefined;
      const scan = this.deps.rescan();
      const rebound = wanted ? findEquivalent(scan, wanted) : null;
      if (rebound) {
        this.adoptScan(scan);
        // The fresh scan renumbers ids, so point the step at the new one.
        this.steps = this.steps.map((current, position) =>
          position === this.index ? { ...current, target: rebound } : current,
        );
        this.replanning = false;
        this.enterSpotlight();
        return;
      }

      const replanned = await this.deps.replan(this.index);
      if (!replanned || replanned.steps.length === 0) {
        this.message = 'That control is no longer on the page.';
        this.stopListening();
        this.transition('FAILED');
        return;
      }
      this.steps = [...this.steps.slice(0, this.index), ...replanned.steps];
      this.adoptScan(replanned);
      this.replanning = false;
      this.enterSpotlight();
    } catch {
      this.message = 'Guidance stopped because the page changed.';
      this.stopListening();
      this.transition('FAILED');
    } finally {
      this.replanning = false;
    }
  }
}

function acceptsEvent(advanceOn: Step['advanceOn'], eventType: string): boolean {
  switch (advanceOn) {
    case 'click':
      return eventType === 'click' || eventType === 'keydown';
    case 'input':
      return eventType === 'input' || eventType === 'change';
    case 'navigation':
      return eventType === 'click' || eventType === 'keydown';
    case 'manual':
      return false;
  }
}

/** Same role and accessible name is a good enough identity for a remount. */
function findEquivalent(scan: ScanResult, wanted: Affordance): string | null {
  const name = wanted.name.trim().toLowerCase();
  if (!name) return null;
  for (const affordance of scan.page.affordances) {
    if (affordance.role !== wanted.role) continue;
    if (affordance.name.trim().toLowerCase() !== name) continue;
    const element = scan.lookup.get(affordance.id);
    if (element?.isConnected) return affordance.id;
  }
  return null;
}
