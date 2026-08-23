/**
 * The widget's only stylesheet. It is constructed once and adopted by the shadow
 * root, so nothing leaks in either direction. The five tokens on `:host` are the
 * public surface customers may override.
 */

export const TOKEN_DEFAULTS = {
  '--pl-accent': '#1f9d6b',
  '--pl-ink': '#1c1c1e',
  '--pl-muted': '#6b6b72',
  '--pl-glass': 'rgba(255, 255, 255, 0.58)',
  '--pl-radius': '18px',
} as const;

const SHEET = `
:host {
  --pl-accent: ${TOKEN_DEFAULTS['--pl-accent']};
  --pl-ink: ${TOKEN_DEFAULTS['--pl-ink']};
  --pl-muted: ${TOKEN_DEFAULTS['--pl-muted']};
  --pl-glass: ${TOKEN_DEFAULTS['--pl-glass']};
  --pl-radius: ${TOKEN_DEFAULTS['--pl-radius']};

  --pl-glass-strong: rgba(255, 255, 255, 0.78);
  --pl-border: rgba(255, 255, 255, 0.7);
  --pl-hairline: rgba(0, 0, 0, 0.08);
  --pl-field: rgba(255, 255, 255, 0.5);
  --pl-bubble: rgba(255, 255, 255, 0.66);
  --pl-shadow: 0 24px 70px rgba(16, 16, 24, 0.22), 0 2px 10px rgba(16, 16, 24, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.85);
  --pl-scrim: rgba(14, 14, 20, 0.42);
  --pl-blur: blur(28px) saturate(190%);

  all: initial;
  position: fixed;
  inset: auto 0 0 auto;
  z-index: 2147483000;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--pl-ink);
  -webkit-font-smoothing: antialiased;
}

:host([data-pl-scheme="dark"]) {
  --pl-ink: #f2f2f5;
  --pl-muted: #a0a0aa;
  --pl-glass: rgba(28, 28, 34, 0.72);
  --pl-glass-strong: rgba(30, 30, 36, 0.92);
  --pl-border: rgba(255, 255, 255, 0.14);
  --pl-hairline: rgba(255, 255, 255, 0.1);
  --pl-field: rgba(255, 255, 255, 0.07);
  --pl-bubble: rgba(255, 255, 255, 0.08);
  --pl-shadow: 0 20px 56px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.35);
  --pl-scrim: rgba(4, 4, 8, 0.55);
}

*, *::before, *::after { box-sizing: border-box; }

.pl-root {
  position: fixed;
  bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}
.pl-root[data-position="right"] { right: 20px; align-items: flex-end; }
.pl-root[data-position="left"] { left: 20px; align-items: flex-start; }

/* Launcher */
.pl-launcher {
  appearance: none;
  width: 52px;
  height: 52px;
  border-radius: 999px;
  border: 1px solid var(--pl-border);
  background: var(--pl-glass);
  -webkit-backdrop-filter: var(--pl-blur);
  backdrop-filter: var(--pl-blur);
  box-shadow: var(--pl-shadow), inset 0 1px 0 rgba(255, 255, 255, 0.65);
  color: var(--pl-ink);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: transform 140ms ease, box-shadow 140ms ease;
}
:host([data-pl-scheme="dark"]) .pl-launcher { box-shadow: var(--pl-shadow), inset 0 1px 0 rgba(255, 255, 255, 0.12); }
.pl-launcher:hover { transform: translateY(-1px); }
.pl-launcher:active { transform: translateY(0); }
.pl-launcher:focus-visible { outline: 2px solid var(--pl-accent); outline-offset: 3px; }
.pl-launcher svg { width: 22px; height: 22px; display: block; }

/* Panel */
.pl-panel {
  width: min(380px, calc(100vw - 32px));
  height: min(560px, calc(100vh - 120px));
  display: flex;
  flex-direction: column;
  border-radius: var(--pl-radius);
  border: 1px solid var(--pl-border);
  background: var(--pl-glass);
  -webkit-backdrop-filter: var(--pl-blur);
  backdrop-filter: var(--pl-blur);
  box-shadow: var(--pl-shadow);
  overflow: hidden;
  animation: pl-in 140ms ease both;
}
.pl-panel::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
}
:host([data-pl-scheme="dark"]) .pl-panel::before { box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1); }

@keyframes pl-in { from { opacity: 0; transform: translateY(8px) scale(0.99); } to { opacity: 1; transform: none; } }

.pl-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 14px 12px;
  border-bottom: 1px solid var(--pl-hairline);
}
.pl-header__title { font-size: 14px; font-weight: 600; letter-spacing: -0.01em; margin: 0; }
.pl-header__sub { font-size: 12px; color: var(--pl-muted); margin: 0; }
.pl-header__spacer { flex: 1; }

.pl-icon-btn {
  appearance: none;
  border: 0;
  background: transparent;
  color: var(--pl-muted);
  width: 30px;
  height: 30px;
  border-radius: 9px;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: background 120ms ease, color 120ms ease;
}
.pl-icon-btn:hover { background: var(--pl-field); color: var(--pl-ink); }
.pl-icon-btn:focus-visible { outline: 2px solid var(--pl-accent); outline-offset: 2px; }
.pl-icon-btn[aria-pressed="true"] { color: var(--pl-accent); background: color-mix(in srgb, var(--pl-accent) 12%, transparent); }
.pl-icon-btn svg { width: 17px; height: 17px; }

/* Messages */
.pl-messages {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  scrollbar-width: thin;
}
.pl-empty { margin: auto 0; text-align: center; color: var(--pl-muted); padding: 8px 12px; }
.pl-empty h3 { margin: 0 0 6px; font-size: 15px; font-weight: 600; color: var(--pl-ink); }
.pl-empty p { margin: 0; font-size: 13px; }
.pl-suggest { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin-top: 14px; }

.pl-msg { max-width: 88%; padding: 9px 12px; border-radius: 14px; font-size: 13.5px; }
.pl-msg--user {
  align-self: flex-end;
  background: color-mix(in srgb, var(--pl-accent) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--pl-accent) 24%, transparent);
}
.pl-msg--agent { align-self: flex-start; background: var(--pl-bubble); border: 1px solid var(--pl-hairline); }
.pl-msg p { margin: 0; white-space: pre-wrap; }

/* Probe strip */
.pl-probes { display: flex; gap: 6px; align-self: stretch; }
.pl-pill {
  flex: 1;
  min-width: 0;
  border: 1px solid var(--pl-hairline);
  background: var(--pl-bubble);
  border-radius: 11px;
  padding: 7px 9px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.pl-pill__name { font-size: 11px; font-weight: 600; letter-spacing: 0.01em; }
.pl-pill__state { font-size: 11px; color: var(--pl-muted); display: flex; align-items: center; gap: 5px; }
.pl-pill--running { border-color: color-mix(in srgb, var(--pl-accent) 35%, transparent); }
.pl-pill--running .pl-pill__state { color: var(--pl-accent); }
.pl-dot { width: 5px; height: 5px; border-radius: 999px; background: currentColor; }
.pl-pill--running .pl-dot { animation: pl-pulse 1.1s ease-in-out infinite; }
@keyframes pl-pulse { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }

/* Cards */
.pl-card {
  align-self: stretch;
  border: 1px solid var(--pl-hairline);
  background: var(--pl-glass-strong);
  border-radius: 14px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.pl-card p { margin: 0; font-size: 13.5px; white-space: pre-wrap; }
.pl-card__label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--pl-muted); }
.pl-card__actions { display: flex; gap: 8px; flex-wrap: wrap; }

.pl-btn {
  appearance: none;
  font: inherit;
  font-size: 12.5px;
  font-weight: 550;
  border-radius: 10px;
  padding: 7px 12px;
  border: 1px solid var(--pl-hairline);
  background: var(--pl-field);
  color: var(--pl-ink);
  cursor: pointer;
  transition: background 120ms ease, transform 120ms ease;
}
.pl-btn:hover { transform: translateY(-1px); }
.pl-btn:focus-visible { outline: 2px solid var(--pl-accent); outline-offset: 2px; }
.pl-btn:disabled { opacity: 0.55; cursor: default; transform: none; }
.pl-btn--accent { background: var(--pl-accent); border-color: transparent; color: #fff; }
.pl-btn--quiet { background: transparent; color: var(--pl-muted); }

/* Escalation timeline */
.pl-timeline { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.pl-timeline li { display: flex; gap: 9px; align-items: flex-start; font-size: 12.5px; }
.pl-timeline__mark {
  width: 8px; height: 8px; margin-top: 6px; border-radius: 999px; flex: none;
  border: 1px solid var(--pl-muted); background: transparent;
}
.pl-timeline li[data-state="done"] .pl-timeline__mark { background: var(--pl-muted); }
.pl-timeline li[data-state="current"] .pl-timeline__mark { background: var(--pl-accent); border-color: var(--pl-accent); }
.pl-timeline li[data-state="pending"] { color: var(--pl-muted); }
.pl-timeline__body { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.pl-timeline__note { color: var(--pl-muted); font-size: 11.5px; }
.pl-link { color: var(--pl-accent); text-decoration: none; font-weight: 550; }
.pl-link:hover { text-decoration: underline; }

/* Composer */
.pl-composer {
  border-top: 1px solid var(--pl-hairline);
  padding: 10px;
  display: flex;
  align-items: flex-end;
  gap: 8px;
}
.pl-composer__field {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--pl-field);
  border: 1px solid var(--pl-hairline);
  border-radius: 13px;
  padding: 6px 8px 6px 12px;
}
.pl-composer__field:focus-within { border-color: color-mix(in srgb, var(--pl-accent) 45%, transparent); }
.pl-composer textarea {
  flex: 1;
  min-width: 0;
  resize: none;
  border: 0;
  outline: 0;
  background: transparent;
  font: inherit;
  font-size: 13.5px;
  color: var(--pl-ink);
  max-height: 96px;
  padding: 3px 0;
}
.pl-composer textarea::placeholder { color: var(--pl-muted); }
.pl-send {
  appearance: none;
  border: 0;
  width: 32px;
  height: 32px;
  flex: none;
  border-radius: 11px;
  background: var(--pl-accent);
  color: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;
}
.pl-send:disabled { opacity: 0.35; cursor: default; }
.pl-send:focus-visible { outline: 2px solid var(--pl-accent); outline-offset: 2px; }
.pl-send svg { width: 16px; height: 16px; }
.pl-hint { font-size: 11px; color: var(--pl-muted); padding: 0 12px 8px; }

.pl-sr {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}

/* Spotlight */
.pl-spot {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  overflow: visible;
  pointer-events: none;
}
.pl-spot::backdrop { background: transparent; }
.pl-spot--fallback { z-index: 2147483001; }
.pl-spot__svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.pl-spot__scrim { fill: var(--pl-scrim); transition: opacity 160ms ease; }
.pl-spot__ring {
  fill: none;
  stroke: var(--pl-accent);
  stroke-width: 2;
  filter: drop-shadow(0 0 10px color-mix(in srgb, var(--pl-accent) 55%, transparent));
  transition: x 160ms ease, y 160ms ease, width 160ms ease, height 160ms ease;
}
.pl-spot__bubble {
  position: absolute;
  top: 0;
  left: 0;
  width: 260px;
  pointer-events: auto;
  border-radius: 14px;
  border: 1px solid var(--pl-border);
  background: var(--pl-glass-strong);
  -webkit-backdrop-filter: var(--pl-blur);
  backdrop-filter: var(--pl-blur);
  box-shadow: var(--pl-shadow);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--pl-ink);
  transition: transform 160ms ease;
}
.pl-spot__counter { font-size: 11px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--pl-muted); }
.pl-spot__caption { margin: 0; font-size: 13.5px; }
.pl-spot__actions { display: flex; justify-content: flex-end; gap: 8px; }
.pl-spot--busy .pl-spot__caption { opacity: 0.6; }

@media (prefers-reduced-motion: reduce) {
  .pl-panel { animation: none; }
  .pl-launcher, .pl-btn, .pl-spot__bubble, .pl-spot__ring, .pl-spot__scrim { transition: none; }
  .pl-pill--running .pl-dot { animation: none; opacity: 1; }
}
`;

/** Adopts the stylesheet, falling back to a <style> tag on older browsers. */
export function attachStyles(root: ShadowRoot): void {
  if (typeof CSSStyleSheet !== 'undefined' && 'adoptedStyleSheets' in Document.prototype) {
    try {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(SHEET);
      root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
      return;
    } catch {
      // Constructed stylesheets unavailable; fall through.
    }
  }
  const style = document.createElement('style');
  style.textContent = SHEET;
  root.appendChild(style);
}

/**
 * Reads the host page's own background and mirrors its brightness, so the widget
 * looks native on a dark console and on a white one without any configuration.
 */
export function detectScheme(): 'light' | 'dark' {
  const candidates: Element[] = [document.body, document.documentElement].filter(Boolean);
  for (const element of candidates) {
    const colour = getComputedStyle(element).backgroundColor;
    const luminance = relativeLuminance(colour);
    if (luminance !== null) return luminance < 0.4 ? 'dark' : 'light';
  }
  return typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function relativeLuminance(colour: string): number | null {
  const match = colour.match(/rgba?\(([^)]+)\)/);
  if (!match) return null;
  const parts = match[1].split(',').map((part) => Number.parseFloat(part.trim()));
  if (parts.length < 3 || parts.some(Number.isNaN)) return null;
  if (parts.length > 3 && parts[3] === 0) return null;
  const [r, g, b] = parts;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}
