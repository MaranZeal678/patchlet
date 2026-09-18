/*
 * Patchlet
 * Copyright (c) 2026 Elamaran Elangovan and Aadi Dahake. All rights reserved.
 *
 * Proprietary and confidential. Rights held solely by the copyright holders.
 * No licence is granted to any other party. See LICENSE at the repository root.
 * Ref: PTCH-CYEP-P7KH3E-BLOTE
 */

import { afterEach, describe, expect, it } from "vitest";
import { appUrl, escalationEngine, mistralApiKey } from "@/lib/env";

const original = { ...process.env };

afterEach(() => {
  process.env = { ...original };
});

describe("env", () => {
  it("names the variable when a required one is missing", () => {
    delete process.env.MISTRAL_API_KEY;
    expect(() => mistralApiKey()).toThrow(/MISTRAL_API_KEY/);
  });

  it("treats an empty value as missing", () => {
    process.env.MISTRAL_API_KEY = "";
    expect(() => mistralApiKey()).toThrow(/MISTRAL_API_KEY/);
  });

  it("falls back to the documented default for optional variables", () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    expect(appUrl()).toBe("http://localhost:3000");
  });

  it("only accepts the two known escalation engines", () => {
    process.env.ESCALATION_ENGINE = "local";
    expect(escalationEngine()).toBe("local");
    process.env.ESCALATION_ENGINE = "nonsense";
    expect(escalationEngine()).toBe("mistral");
  });
});
