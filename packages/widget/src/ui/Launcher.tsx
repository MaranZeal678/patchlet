import { ChatIcon, CloseIcon } from './icons';

export function Launcher({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      class="pl-launcher"
      aria-label={open ? 'Close support' : 'Open support'}
      aria-expanded={open}
      onClick={onClick}
    >
      {open ? <CloseIcon /> : <ChatIcon />}
    </button>
  );
}
