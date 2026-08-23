/**
 * Host pages are single page apps: the URL changes without a document load and
 * the DOM is replaced under the guide. This module turns both into one callback.
 */

type Unsubscribe = () => void;

let patched = false;
const urlListeners = new Set<() => void>();

/** Patches history once per page, however many guides run. */
function ensureHistoryPatch(): void {
  if (patched || typeof history === 'undefined') return;
  patched = true;
  for (const method of ['pushState', 'replaceState'] as const) {
    const original = history[method];
    history[method] = function patchedHistoryMethod(this: History, ...args: Parameters<History['pushState']>) {
      const result = original.apply(this, args);
      for (const listener of urlListeners) listener();
      return result;
    };
  }
}

/** Fires whenever the host navigates without a document load. */
export function onNavigate(callback: () => void): Unsubscribe {
  ensureHistoryPatch();
  let lastUrl = location.href;
  const handler = () => {
    if (location.href === lastUrl) return;
    lastUrl = location.href;
    callback();
  };
  urlListeners.add(handler);
  addEventListener('popstate', handler);
  addEventListener('hashchange', handler);
  return () => {
    urlListeners.delete(handler);
    removeEventListener('popstate', handler);
    removeEventListener('hashchange', handler);
  };
}

/**
 * Fires once the DOM has stopped changing for `settleMs`. Re-scanning mid-render
 * is what makes guidance point at controls that are about to be replaced.
 */
export function onDomSettle(callback: () => void, settleMs = 300, target: Node = document.body): Unsubscribe {
  if (typeof MutationObserver === 'undefined') return () => {};
  let timer: ReturnType<typeof setTimeout> | undefined;
  const observer = new MutationObserver(() => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(callback, settleMs);
  });
  observer.observe(target, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'hidden', 'aria-hidden'] });
  return () => {
    if (timer) clearTimeout(timer);
    observer.disconnect();
  };
}

/** Both signals, one callback, already debounced. */
export function watchPage(callback: () => void, settleMs = 300): Unsubscribe {
  const stopNav = onNavigate(() => setTimeout(callback, settleMs));
  const stopDom = onDomSettle(callback, settleMs);
  return () => {
    stopNav();
    stopDom();
  };
}
