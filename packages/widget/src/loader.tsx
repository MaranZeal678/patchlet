import { render } from 'preact';
import { App, type PatchletApi } from './ui/App';
import { ApiClient } from './api/client';
import { attachStyles, detectScheme } from './styles';

declare global {
  interface Window {
    Patchlet?: PatchletApi;
  }
}

type Config = { key: string; apiBase: string; position: 'left' | 'right' };

const HOST_TAG = 'patchlet-widget';

function readConfig(): Config | null {
  const script = document.currentScript as HTMLScriptElement | null;
  const element = script ?? document.querySelector<HTMLScriptElement>('script[data-key]');
  const key = element?.dataset.key?.trim();
  if (!key) {
    console.warn('[patchlet] no data-key on the script tag, the widget will not load');
    return null;
  }
  const origin = element?.src ? new URL(element.src, location.href).origin : location.origin;
  const apiBase = element?.dataset.api?.trim() || origin;
  const position = element?.dataset.position === 'left' ? 'left' : 'right';
  return { key, apiBase, position };
}

function mount(config: Config): void {
  if (document.querySelector(HOST_TAG)) return;

  const host = document.createElement(HOST_TAG);
  host.setAttribute('data-pl-scheme', detectScheme());
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });
  attachStyles(shadow);

  const container = document.createElement('div');
  shadow.appendChild(container);

  // The host page can change its own theme at any time; follow it.
  const observer = new MutationObserver(() => host.setAttribute('data-pl-scheme', detectScheme()));
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style', 'data-theme'] });
  observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'style', 'data-theme'] });

  const client = new ApiClient({ apiBase: config.apiBase, key: config.key });

  render(
    <App
      client={client}
      shadow={shadow}
      host={host}
      position={config.position}
      register={(api) => {
        window.Patchlet = api;
      }}
    />,
    container,
  );
}

function boot(): void {
  const config = readConfig();
  if (!config) return;
  if (document.body) mount(config);
  else document.addEventListener('DOMContentLoaded', () => mount(config), { once: true });
}

boot();
