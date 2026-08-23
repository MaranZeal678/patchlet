/**
 * Widget entry point.
 *
 * Everything renders inside a shadow root so the host page can neither style the widget nor be
 * styled by it. This file currently mounts the launcher only; the chat panel, the page scan and
 * the spotlight overlay attach to the same root.
 */

type ScriptConfig = {
  /** Public project key from the script tag's `data-key`. */
  key: string;
  /** API origin, from `data-api`, defaulting to the origin the script was served from. */
  apiOrigin: string;
  /** Which corner the launcher sits in. */
  position: "left" | "right";
};

const HOST_ID = "patchlet-root";

function readConfig(): ScriptConfig | null {
  const script = document.currentScript as HTMLScriptElement | null;
  const element = script ?? document.querySelector<HTMLScriptElement>("script[data-key]");
  const key = element?.dataset.key;
  if (!key) return null;

  const fallbackOrigin = element?.src ? new URL(element.src).origin : window.location.origin;
  return {
    key,
    apiOrigin: element?.dataset.api ?? fallbackOrigin,
    position: element?.dataset.position === "left" ? "left" : "right",
  };
}

const STYLES = `
  :host { all: initial; }
  .launcher {
    position: fixed;
    bottom: 20px;
    inline-size: 52px;
    block-size: 52px;
    display: grid;
    place-items: center;
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.72);
    backdrop-filter: blur(18px) saturate(160%);
    -webkit-backdrop-filter: blur(18px) saturate(160%);
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.7) inset, 0 10px 28px -12px rgba(0, 0, 0, 0.35);
    color: var(--pl-accent, #fa500f);
    font: 500 15px/1 ui-sans-serif, system-ui, sans-serif;
    cursor: pointer;
    z-index: 2147483000;
    transition: transform 140ms ease;
  }
  .launcher:hover { transform: translateY(-1px); }
  .launcher:focus-visible { outline: 2px solid var(--pl-accent, #fa500f); outline-offset: 3px; }
  .launcher[data-position="right"] { right: 20px; }
  .launcher[data-position="left"] { left: 20px; }
  @media (prefers-reduced-motion: reduce) { .launcher { transition: none; } }
`;

function mount(config: ScriptConfig): PatchletApi {
  const host = document.createElement("div");
  host.id = HOST_ID;
  const root = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = STYLES;

  const launcher = document.createElement("button");
  launcher.type = "button";
  launcher.className = "launcher";
  launcher.dataset.position = config.position;
  launcher.setAttribute("aria-label", "Open support");
  launcher.textContent = "P";

  root.append(style, launcher);
  document.body.append(host);

  const open = () => console.log("Patchlet open", config.apiOrigin);
  launcher.addEventListener("click", open);

  return {
    open,
    close: () => console.log("Patchlet close"),
    ask: (question: string) => console.log("Patchlet ask", question),
  };
}

const config = readConfig();
if (!config) {
  console.warn("Patchlet: no data-key on the script tag, nothing was mounted.");
} else if (!document.getElementById(HOST_ID)) {
  window.Patchlet = mount(config);
  console.log("Patchlet loaded");
}
