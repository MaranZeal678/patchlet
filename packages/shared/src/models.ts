/**
 * Model ids, verified against the live API. Every call site imports from here so a model
 * change is one edit rather than a search across the repository.
 */
export const MODELS = {
  /** Fast understanding and small JSON tasks. */
  understand: "mistral-small-latest",
  /** Answers, step plans, issue drafting, code planning. */
  answer: "mistral-large-latest",
  /** Absence verdict, a reasoning model. */
  verdict: "magistral-medium-latest",
  /** Code generation. */
  code: "codestral-2508",
  /** Embeddings, 1024 dimensions. */
  embed: "mistral-embed",
  /** Document OCR. */
  ocr: "mistral-ocr-latest",
  /** Speech to text. */
  transcribe: "voxtral-mini-latest",
  /** Text to speech. */
  speak: "voxtral-mini-tts-2603",
} as const;

export type ModelId = (typeof MODELS)[keyof typeof MODELS];

/** Embedding width the schema and `match_chunks` are built around. */
export const EMBED_DIMENSIONS = 1024;

/** Default text to speech voice. */
export const DEFAULT_VOICE = "en_paul_neutral";

/** Routing thresholds, overridable per project through `project.settings`. */
export const DEFAULT_THRESHOLDS = {
  docsThreshold: 0.7,
  interfaceThreshold: 0.5,
} as const;
