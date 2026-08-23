import { useEffect, useRef, useState } from 'preact/hooks';
import { MicIcon, SendIcon } from './icons';

export type ComposerProps = {
  value: string;
  busy: boolean;
  voiceOn: boolean;
  voiceSupported: boolean;
  recording: boolean;
  transcribing: boolean;
  autoFocus: boolean;
  onInput: (value: string) => void;
  onSubmit: () => void;
  onToggleVoice: () => void;
  onToggleRecording: () => void;
};

export function Composer(props: ComposerProps) {
  const field = useRef<HTMLTextAreaElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (props.autoFocus) field.current?.focus();
  }, [props.autoFocus]);

  useEffect(() => {
    const node = field.current;
    if (!node) return;
    node.style.height = 'auto';
    node.style.height = `${Math.min(node.scrollHeight, 96)}px`;
    setHeight(node.scrollHeight);
  }, [props.value]);

  const micLabel = props.voiceOn
    ? props.recording
      ? 'Stop recording'
      : 'Record a question'
    : 'Voice is available. Click to turn it on.';

  return (
    <form
      class="pl-composer"
      onSubmit={(event) => {
        event.preventDefault();
        props.onSubmit();
      }}
    >
      <div class="pl-composer__field">
        <textarea
          ref={field}
          rows={1}
          data-height={height}
          value={props.value}
          placeholder={props.transcribing ? 'Transcribing...' : 'Ask a question'}
          aria-label="Ask a question"
          disabled={props.transcribing}
          onInput={(event) => props.onInput((event.currentTarget as HTMLTextAreaElement).value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              props.onSubmit();
            }
          }}
        />
        {props.voiceSupported && (
          <button
            type="button"
            class="pl-icon-btn"
            aria-pressed={props.voiceOn}
            aria-label={micLabel}
            title={micLabel}
            onClick={() => (props.voiceOn ? props.onToggleRecording() : props.onToggleVoice())}
          >
            <MicIcon />
          </button>
        )}
      </div>
      <button type="submit" class="pl-send" aria-label="Send" disabled={props.busy || props.value.trim().length === 0}>
        <SendIcon />
      </button>
    </form>
  );
}
