/*
 * Patchlet
 * Copyright (c) 2026 Elamaran Elangovan and Aadi Dahake. All rights reserved.
 *
 * Proprietary and confidential. Rights held solely by the copyright holders.
 * No licence is granted to any other party. See LICENSE at the repository root.
 * Ref: PTCH-CYEP-P7KH3E-BLOTE
 */

import { describe, expect, it } from "vitest";
import { EMBED_DIMENSIONS, MODELS } from "@patchlet/shared";
import { chatJson, chatText, embed, listModels, ocr, speakStream, transcribe } from "@/lib/openai";
import { textPdfDataUrl } from "./fixtures/pdf";

/**
 * Exercises the Mistral client against the real API. Every call here has a cost and a latency, so
 * the suite skips itself when no key is present, which is what keeps `npm test` runnable offline.
 */
const hasKey = Boolean(process.env.MISTRAL_API_KEY);

describe.skipIf(!hasKey)("mistral client", () => {
  it("lists models", async () => {
    await expect(listModels()).resolves.toBe(true);
  });

  it("completes plain text", async () => {
    const text = await chatText(MODELS.understand, [
      { role: "user", content: "Reply with the single word PONG and nothing else." },
    ]);
    expect(text.toUpperCase()).toContain("PONG");
  });

  it("completes against a JSON schema", async () => {
    const schema = {
      type: "object",
      properties: {
        feature: { type: "string" },
        keywords: { type: "array", items: { type: "string" } },
      },
      required: ["feature", "keywords"],
      additionalProperties: false,
    };
    const result = await chatJson<{ feature: string; keywords: string[] }>(
      MODELS.understand,
      [
        { role: "system", content: "Extract the feature the user is asking about." },
        { role: "user", content: "How do I turn on dark mode?" },
      ],
      schema,
      { name: "understanding" },
    );
    expect(typeof result.feature).toBe("string");
    expect(Array.isArray(result.keywords)).toBe(true);
  });

  it("embeds at the width the schema expects", async () => {
    const vectors = await embed(["dark mode", "change your username"]);
    expect(vectors).toHaveLength(2);
    expect(vectors[0]).toHaveLength(EMBED_DIMENSIONS);
  });

  it("reads a document with OCR and reports per-block confidence", async () => {
    const result = await ocr(textPdfDataUrl("Patchlet handbook"));
    expect(result.pages).toHaveLength(1);
    expect(result.pages[0]?.markdown).toContain("Patchlet handbook");
    expect(result.pages[0]?.blocks[0]?.confidence).toBeGreaterThan(0.5);
  });

  it("streams speech and transcribes it back", async () => {
    const chunks: Uint8Array[] = [];
    for await (const chunk of speakStream("Dark mode is not available today.")) {
      chunks.push(chunk);
    }
    expect(chunks.length).toBeGreaterThan(0);

    const mp3 = new Blob(chunks as BlobPart[], { type: "audio/mpeg" });
    expect(mp3.size).toBeGreaterThan(1000);

    const text = await transcribe(mp3, "speech.mp3");
    expect(text.toLowerCase()).toContain("dark mode");
  });
});
