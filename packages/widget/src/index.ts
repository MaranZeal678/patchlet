/*
 * Patchlet
 * Copyright (c) 2026 Elamaran Elangovan and Aadi Dahake. All rights reserved.
 *
 * Proprietary and confidential. Rights held solely by the copyright holders.
 * No licence is granted to any other party. See LICENSE at the repository root.
 * Ref: PTCH-CYEP-P7KH3E-BLOTE
 */

// Public surface of the package, for anyone importing it rather than embedding
// the built bundle.
export { ApiClient } from './api/client';
export { SseDecoder, toChatEvent } from './api/sse';
export { scanAffordances } from './scan/affordances';
export type { ScanResult, ScanOptions } from './scan/affordances';
export { rank, scoreCandidate, tokenize } from './scan/rank';
export { GuideMachine } from './guide/machine';
export type { GuideDeps, GuideSnapshot, GuideState } from './guide/machine';
export { Spotlight } from './guide/spotlight';
export { onNavigate, onDomSettle, watchPage } from './guide/navigation';
export { VoiceRecorder } from './voice/recorder';
export { VoicePlayer } from './voice/player';
export { attachStyles, detectScheme, TOKEN_DEFAULTS } from './styles';
export type { PatchletApi } from './ui/App';
export * from './types';
