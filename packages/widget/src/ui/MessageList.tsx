import { useEffect, useRef } from 'preact/hooks';
import { AbsenceCard } from './AbsenceCard';
import { AnswerCard } from './AnswerCard';
import type { Turn } from './model';

export function MessageList({
  turns,
  guidingTurnId,
  elapsedSeconds,
  onShowMe,
  onReport,
}: {
  turns: Turn[];
  guidingTurnId: string | null;
  elapsedSeconds: number;
  onShowMe: (turn: Turn) => void;
  onReport: (turn: Turn) => void;
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
  const offer = turn.answer?.escalation;
  return (
    <>
      <div class="pl-msg pl-msg--user">
        <p>{turn.question}</p>
      </div>

      {/* Say that the agent remembered, never what it remembered: reading a stored fact back at
          the visitor on someone else's site is unsettling, and it can be wrong. */}
      {turn.memory && turn.memory.length > 0 && (
        <p class="pl-recall">Welcome back. Answering with what you told us before.</p>
      )}


      {turn.error && (
        <div class="pl-msg pl-msg--agent">
          <p>{turn.error}</p>
        </div>
      )}

      {turn.answer && offer && (offer.offered === true || offer.reason) && (
        <AbsenceCard
          text={turn.answer.text}
          request={offer.offered === true ? offer.request : undefined}
          escalation={turn.escalation}
          reporting={turn.reporting}
          blocked={turn.reportBlocked ?? (offer.offered === true ? undefined : offer.reason)}
          elapsedSeconds={elapsedSeconds}
          onReport={() => onReport(turn)}
        />
      )}

      {turn.answer && offer?.offered !== true && !offer?.reason && (
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
