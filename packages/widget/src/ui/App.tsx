import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { ApiClient } from '../api/client';
import { GuideMachine, type GuideSnapshot } from '../guide/machine';
import { Spotlight } from '../guide/spotlight';
import { watchPage } from '../guide/navigation';
import { scanAffordances, type ScanResult } from '../scan/affordances';
import type { ChatEvent, EscalationStatus, EscalationView, Step } from '../types';
import { VoicePlayer } from '../voice/player';
import { VoiceRecorder } from '../voice/recorder';
import { Composer } from './Composer';
import { Launcher } from './Launcher';
import { MessageList } from './MessageList';
import { Panel } from './Panel';
import { newTurn, type Turn } from './model';

export type PatchletApi = {
  open: () => void;
  close: () => void;
  ask: (question: string) => void;
};

export type AppProps = {
  client: ApiClient;
  shadow: ShadowRoot;
  host: HTMLElement;
  position: 'left' | 'right';
  register: (api: PatchletApi) => void;
};

const TERMINAL = new Set<EscalationStatus>(['shipped', 'failed', 'rejected']);

const STATUSES: readonly string[] = [
  'queued', 'filing', 'inspecting', 'drafting', 'pr_open', 'awaiting_approval',
  'approved', 'rejected', 'merging', 'deploying', 'shipped', 'failed',
];

function toEscalationStatus(value: string): EscalationStatus {
  return STATUSES.includes(value) ? (value as EscalationStatus) : 'queued';
}

export function App({ client, shadow, host, position, register }: AppProps) {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [guidingTurnId, setGuidingTurnId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [voiceOn, setVoiceOn] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const scanRef = useRef<ScanResult | null>(null);
  const conversationRef = useRef<string | undefined>(undefined);
  const machineRef = useRef<GuideMachine | null>(null);
  const spotlightRef = useRef<Spotlight | null>(null);
  const guidedRef = useRef<{ turnId: string; question: string } | null>(null);
  const counterRef = useRef(0);
  const recorder = useMemo(() => new VoiceRecorder(), []);
  const player = useMemo(() => new VoicePlayer(setSpeaking), []);

  const scan = useCallback(
    (question: string): ScanResult => scanAffordances({ question, exclude: host }),
    [host],
  );

  const patch = useCallback((id: string, update: (turn: Turn) => Turn) => {
    setTurns((current) => current.map((turn) => (turn.id === id ? update(turn) : turn)));
  }, []);

  const stopGuidance = useCallback(() => {
    machineRef.current?.stop();
    spotlightRef.current?.hide();
    guidedRef.current = null;
    setGuidingTurnId(null);
  }, []);

  const onGuideChange = useCallback(
    (snapshot: GuideSnapshot) => {
      const spotlight = spotlightRef.current;
      if (!spotlight) return;
      if (snapshot.state === 'DONE' || snapshot.state === 'FAILED') {
        spotlight.hide();
        guidedRef.current = null;
        setGuidingTurnId(null);
        setOpen(true);
        setAnnouncement(snapshot.state === 'DONE' ? 'Guidance finished.' : snapshot.message ?? 'Guidance stopped.');
        return;
      }
      // Between steps there is nothing to point at, and a caption left hanging
      // over a control that has gone is worse than no caption.
      if (!snapshot.step || !snapshot.target) {
        spotlight.hide();
        return;
      }
      spotlight.show({
        target: snapshot.target,
        caption: snapshot.step.caption,
        index: snapshot.stepIndex,
        total: snapshot.total,
        isLast: snapshot.stepIndex === snapshot.total - 1,
        busy: snapshot.state !== 'SPOTLIGHTING',
      });
      if (snapshot.state === 'SPOTLIGHTING') {
        setAnnouncement(`Step ${snapshot.stepIndex + 1} of ${snapshot.total}. ${snapshot.step.caption}`);
      }
    },
    [],
  );

  /** Re-asks the agent for the steps that are left, against the page as it is now. */
  const replan = useCallback(
    async (continueFrom: number) => {
      const guided = guidedRef.current;
      if (!guided) return null;
      const fresh = scan(guided.question);
      scanRef.current = fresh;
      let steps: Step[] | null = null;
      try {
        await client.ask({
          question: guided.question,
          page: fresh.page,
          conversationId: conversationRef.current,
          continueFrom,
          onEvent: (event) => {
            if (event.type === 'answer') steps = event.steps;
          },
        });
      } catch {
        return null;
      }
      return steps ? { ...fresh, steps } : null;
    },
    [client, scan],
  );

  const ensureGuide = useCallback(() => {
    if (!spotlightRef.current) {
      spotlightRef.current = new Spotlight(shadow, {
        onNext: () => machineRef.current?.next(),
        onDone: () => machineRef.current?.next(),
        onStop: () => stopGuidance(),
        onLost: () => machineRef.current?.lost(),
      });
    }
    if (!machineRef.current) {
      machineRef.current = new GuideMachine({
        rescan: () => {
          const guided = guidedRef.current;
          const fresh = scan(guided?.question ?? '');
          scanRef.current = fresh;
          return fresh;
        },
        replan,
        onChange: onGuideChange,
        watch: (onPageChanged) => watchPage(onPageChanged, 300),
      });
    }
  }, [onGuideChange, replan, scan, shadow, stopGuidance]);

  const startGuidance = useCallback(
    (turn: Turn) => {
      const steps = turn.answer?.steps;
      const current = scanRef.current;
      if (!steps || steps.length === 0 || !current) return;
      ensureGuide();
      guidedRef.current = { turnId: turn.id, question: turn.question };
      setGuidingTurnId(turn.id);
      // The caption carries the instruction from here, and a panel covering the
      // control the user must click is worse than no panel at all.
      setOpen(false);
      machineRef.current?.start(current, steps);
    },
    [ensureGuide],
  );

  const ask = useCallback(
    async (question: string) => {
      const text = question.trim();
      if (!text || busy) return;
      setOpen(true);
      setDraft('');
      setBusy(true);

      const id = `t${(counterRef.current += 1)}`;
      let turn = newTurn(id, text);
      setTurns((current) => [...current, turn]);

      const commit = (next: Turn) => {
        turn = next;
        patch(id, () => next);
      };

      const fresh = scan(text);
      scanRef.current = fresh;
      // Build the spotlight while the request is in flight, so the first step
      // appears the moment the answer lands rather than after it is set up.
      ensureGuide();

      try {
        await client.ask({
          question: text,
          page: fresh.page,
          conversationId: conversationRef.current,
          onEvent: (event) => {
            commit(applyEvent(turn, event, conversationRef));
            // The stream stays open past the answer while the agent files its
            // own bookkeeping. Guidance starts on the answer, not on the close.
            if (event.type !== 'answer') return;
            if (event.steps?.length) startGuidance(turn);
            if (voiceOn) void player.play((signal) => client.speak(event.text, signal));
          },
        });
      } catch {
        commit({ ...turn, error: 'The support service is not reachable right now.' });
      } finally {
        setBusy(false);
      }
    },
    [busy, client, ensureGuide, patch, player, scan, startGuidance, voiceOn],
  );

  const report = useCallback(
    async (turn: Turn) => {
      const conversationId = conversationRef.current;
      if (!conversationId || !turn.messageId || turn.reporting || turn.escalationId) return;
      patch(turn.id, (current) => ({ ...current, reporting: true, reportBlocked: undefined }));
      try {
        const result = await client.escalate(conversationId, turn.messageId);
        if (!result.ok) {
          patch(turn.id, (current) => ({ ...current, reporting: false, reportBlocked: result.reason }));
          return;
        }
        const { escalationId, status } = result;
        patch(turn.id, (current) => ({
          ...current,
          reporting: false,
          escalationId,
          escalation: { id: escalationId, status: toEscalationStatus(status) },
        }));
        pollEscalation(client, escalationId, (view) => {
          patch(turn.id, (current) => {
            if (current.escalation?.status !== view.status) setElapsedSeconds(0);
            return { ...current, escalation: view };
          });
        });
      } catch {
        patch(turn.id, (current) => ({ ...current, reporting: false, reportBlocked: 'failed' }));
      }
    },
    [client, patch],
  );

  // A quiet elapsed counter, only while a report is still moving.
  useEffect(() => {
    const active = turns.some((turn) => turn.escalation && !TERMINAL.has(turn.escalation.status));
    if (!active) return;
    const timer = setInterval(() => setElapsedSeconds((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [turns]);

  // Escape stops guidance first, then closes the panel, even when focus is on the host page.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (guidedRef.current) stopGuidance();
      else if (open) setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, stopGuidance]);

  useEffect(() => {
    register({
      open: () => setOpen(true),
      close: () => setOpen(false),
      ask: (question: string) => void ask(question),
    });
  }, [ask, register]);

  useEffect(() => () => {
    machineRef.current?.dispose();
    spotlightRef.current?.destroy();
    player.stop();
  }, [player]);

  /** Ends the turn: transcribe what was captured and ask it. */
  const finishRecording = useCallback(async () => {
    setRecording(false);
    setTranscribing(true);
    try {
      const audio = await recorder.stop();
      if (audio) {
        const text = await client.transcribe(audio);
        if (text) {
          // Show the words back before sending, so a mishearing is visible.
          setDraft(text);
          void ask(text);
        } else {
          setAnnouncement('I did not catch that. Try again.');
        }
      }
    } catch {
      setAnnouncement('The microphone is not available.');
    } finally {
      setTranscribing(false);
    }
  }, [ask, client, recorder]);

  const finishRef = useRef(finishRecording);
  finishRef.current = finishRecording;

  // One press starts listening. It ends on a pause in speech, or on a second
  // press, which is what people already expect from a phone keyboard.
  const toggleRecording = useCallback(async () => {
    if (recording) {
      await finishRecording();
      return;
    }
    try {
      setVoiceOn(true);
      await recorder.start(() => void finishRef.current());
      setRecording(true);
    } catch {
      setAnnouncement('Microphone access was declined.');
    }
  }, [finishRecording, recorder, recording]);

  return (
    <div class="pl-root" data-position={position}>
      <div class="pl-sr" role="status" aria-live="polite">
        {announcement}
      </div>

      {open && (
        <Panel
          title="Support"
          subtitle={busy ? 'Checking' : 'We can show you on this page'}
          speaking={speaking}
          onStopSpeaking={() => player.stop()}
          onClose={() => setOpen(false)}
          onEscape={() => (guidedRef.current ? stopGuidance() : setOpen(false))}
        >
          <MessageList
            turns={turns}
            guidingTurnId={guidingTurnId}
            elapsedSeconds={elapsedSeconds}
            onShowMe={startGuidance}
            onReport={(turn) => void report(turn)}
          />
          <Composer
            value={draft}
            busy={busy}
            voiceOn={voiceOn}
            voiceSupported={VoiceRecorder.supported}
            recording={recording}
            transcribing={transcribing}
            autoFocus={guidingTurnId === null}
            onInput={setDraft}
            onSubmit={() => void ask(draft)}
            onToggleVoice={() => {
              setVoiceOn(true);
              setAnnouncement('Voice is on. Click the microphone to record.');
            }}
            onToggleRecording={() => void toggleRecording()}
          />
        </Panel>
      )}

      <Launcher open={open} onClick={() => setOpen((value) => !value)} />
    </div>
  );
}

function applyEvent(turn: Turn, event: ChatEvent, conversationRef: { current: string | undefined }): Turn {
  switch (event.type) {
    case 'conversation':
      conversationRef.current = event.conversationId;
      return { ...turn, messageId: event.messageId };
    case 'understanding':
      return { ...turn, feature: event.feature, memory: event.memory };
    case 'probe':
      return {
        ...turn,
        probes: {
          ...turn.probes,
          [event.probe]:
            event.status === 'running' ? { status: 'running' } : { status: 'done', result: event.result },
        },
      };
    case 'verdict':
      return { ...turn, verdict: event.verdict };
    case 'answer':
      return {
        ...turn,
        answer: {
          text: event.text,
          steps: event.steps,
          escalation: event.escalation,
          noted: event.noted,
        },
      };
    case 'error':
      return { ...turn, error: event.message };
  }
}

/** Polls the report until it stops moving. Calm on purpose: every three seconds. */
function pollEscalation(
  client: ApiClient,
  escalationId: string,
  onUpdate: (view: EscalationView) => void,
): void {
  let stopped = false;
  const tick = async () => {
    if (stopped) return;
    try {
      const view = await client.escalation(escalationId);
      onUpdate(view);
      if (TERMINAL.has(view.status)) {
        stopped = true;
        return;
      }
    } catch {
      // Transient failure; try again on the next tick.
    }
    setTimeout(tick, 3000);
  };
  void tick();
}
