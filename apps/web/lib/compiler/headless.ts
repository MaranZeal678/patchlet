/*
 * Patchlet
 * Copyright (c) 2026 Elamaran Elangovan and Aadi Dahake. All rights reserved.
 *
 * Proprietary and confidential. Rights held solely by the copyright holders.
 * No licence is granted to any other party. See LICENSE at the repository root.
 * Ref: PTCH-CYEP-P7KH3E-BLOTE
 */

/**
 * A headless browser on the target app — jsdom running the real SPA with the
 * real recorder, used by the race's blind lane. The agent inside it can only
 * scan affordances and act on affordance ids, exactly the interface a
 * screenshot-and-click agent gets, minus the pixels.
 */
import { JSDOM, VirtualConsole } from "jsdom";
import type { PageContext } from "@patchlet/shared";
import { targetOrigin } from "./target";

export type HeadlessBrowser = {
  scan: () => PageContext;
  act: (targetId: string, value?: string | boolean) => boolean;
  rendered: () => Promise<void>;
  close: () => void;
};

export async function openHeadless(instance: string): Promise<HeadlessBrowser> {
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("jsdomError", () => undefined);

  const target = targetOrigin();
  const dom = await JSDOM.fromURL(`${target}/?instance=${instance}`, {
    runScripts: "dangerously",
    resources: "usable",
    pretendToBeVisual: true,
    virtualConsole,
    beforeParse(window) {
      // The racing agent is a consumer of compiled tools, not a demonstrator —
      // its recorder posts go nowhere so sandbox runs never pollute the corpus.
      (window as unknown as { AC_ENDPOINT: string }).AC_ENDPOINT = "http://127.0.0.1:1";
      (window as unknown as { fetch: typeof fetch }).fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === "string" ? new URL(input, target).toString() : input;
        const options = { ...(init ?? {}) };
        delete (options as { keepalive?: boolean }).keepalive;
        return fetch(url as string, options);
      }) as typeof fetch;
    },
  });

  const window = dom.window;
  for (let i = 0; i < 100; i++) {
    if (window.document.querySelector("#root .layout")) break;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  await new Promise((resolve) => setTimeout(resolve, 350));

  type Recorder = {
    scan: () => PageContext;
    act: (targetId: string, value?: string | boolean) => boolean;
  };
  const recorder = (window as unknown as { __acRecorder?: Recorder }).__acRecorder;
  if (!recorder) throw new Error("Recorder did not load in the headless browser");

  return {
    scan: () => recorder.scan(),
    act: (targetId, value) => recorder.act(targetId, value),
    rendered: () =>
      new Promise((resolve) => {
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          window.removeEventListener("app:rendered", finish);
          setTimeout(resolve, 30);
        };
        window.addEventListener("app:rendered", finish);
        setTimeout(finish, 450);
      }),
    close: () => window.close(),
  };
}
