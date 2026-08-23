import { useEffect, useRef } from 'preact/hooks';
import { AbsenceCard } from './AbsenceCard';
import { AnswerCard } from './AnswerCard';
import { ProbeStrip } from './ProbeStrip';
import type { Turn } from './model';

export function MessageList({
  turns,
  guidingTurnId,
  elapsedSeconds,
  onShowMe,
  onReport,
  onSuggestion,
}: {
  turns: Turn[];
  guidingTurnId: string | null;
  elapsedSeconds: number;
  onShowMe: (turn: Turn) => void;
  onReport: (turn: Turn) => void;
  onSuggestion: (question: string) => void;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [turns]);

  return (
    <div class="pl-messages">
      {turns.length === 0 && (
        <div class="pl-empty">
          <h3>How can we help?</h3>
          <p>Ask a question and we will point at the right control on this page.</p>
        </div>
      )}

      {turns.map((turn) => (
        <TurnView
          key={turn.id}
          turn={turn}
          guiding={guidingTurnId === turn.id}
          elapsedSeconds={elapsedSeconds}
          onShowMe={onShowMe}
          onReport={onReport}
        />
      ))}
      <div ref={endRef} />
    </div>
  );
}

function TurnView({
  turn,
  guiding,
  elapsedSeconds,
  onShowMe,
  onReport,
}: {
  turn: Turn;
  guiding: boolean;
  elapsedSeconds: number;
  onShowMe: (turn: Turn) => void;
  onReport: (turn: Turn) => void;
}) {
  const answered = Boolean(turn.answer);
  const offer = turn.answer?.escalation;
  return (
    <>
      <div class="pl-msg pl-msg--user">
        <p>{turn.question}</p>
      </div>

      {!answered && !turn.error && <ProbeStrip probes={turn.probes} />}

      {turn.error && (
        <div class="pl-msg pl-msg--agent">
          <p>{turn.error}</p>
        </div>
      )}

      {turn.answer && offer?.offered === true && (
        <AbsenceCard
          text={turn.answer.text}
          request={offer.request}
          escalation={turn.escalation}
          reporting={turn.reporting}
          elapsedSeconds={elapsedSeconds}
          onReport={() => onReport(turn)}
        />
      )}

      {turn.answer && offer?.offered !== true && (
        <AnswerCard
          text={turn.answer.text}
          steps={turn.answer.steps}
          guiding={guiding}
          onShowMe={() => onShowMe(turn)}
        />
      )}
    </>
  );
}
