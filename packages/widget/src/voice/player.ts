/**
 * Plays the mp3 that /api/speak streams back. Uses MediaSource so the first
 * words start before the whole clip has arrived, and falls back to buffering.
 */
export class VoicePlayer {
  private audio: HTMLAudioElement | null = null;
  private abort: AbortController | null = null;
  private objectUrl: string | null = null;

  constructor(private readonly onStateChange: (speaking: boolean) => void) {}

  get speaking(): boolean {
    return Boolean(this.audio && !this.audio.paused && !this.audio.ended);
  }

  async play(fetchAudio: (signal: AbortSignal) => Promise<Response>): Promise<void> {
    this.stop();
    const controller = new AbortController();
    this.abort = controller;
    try {
      const response = await fetchAudio(controller.signal);
      if (!response.body) return;
      const audio = new Audio();
      this.audio = audio;
      audio.addEventListener('ended', () => this.onStateChange(false));
      audio.addEventListener('pause', () => this.onStateChange(this.speaking));

      if (canStream()) await this.playStreaming(audio, response.body, controller.signal);
      else await this.playBuffered(audio, response);
      this.onStateChange(true);
    } catch (error) {
      if ((error as Error)?.name !== 'AbortError') this.onStateChange(false);
    }
  }

  stop(): void {
    this.abort?.abort();
    this.abort = null;
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
    this.onStateChange(false);
  }

  private async playStreaming(audio: HTMLAudioElement, body: ReadableStream<Uint8Array>, signal: AbortSignal): Promise<void> {
    const media = new MediaSource();
    this.objectUrl = URL.createObjectURL(media);
    audio.src = this.objectUrl;
    await new Promise<void>((resolve) => media.addEventListener('sourceopen', () => resolve(), { once: true }));
    const buffer = media.addSourceBuffer('audio/mpeg');
    const reader = body.getReader();
    let started = false;

    for (;;) {
      const { done, value } = await reader.read();
      if (done || signal.aborted) break;
      await appendChunk(buffer, value);
      if (!started) {
        started = true;
        void audio.play().catch(() => undefined);
      }
    }
    if (media.readyState === 'open') media.endOfStream();
    if (!started) void audio.play().catch(() => undefined);
  }

  private async playBuffered(audio: HTMLAudioElement, response: Response): Promise<void> {
    const blob = await response.blob();
    this.objectUrl = URL.createObjectURL(blob);
    audio.src = this.objectUrl;
    await audio.play().catch(() => undefined);
  }
}

function canStream(): boolean {
  return (
    typeof MediaSource !== 'undefined' &&
    typeof MediaSource.isTypeSupported === 'function' &&
    MediaSource.isTypeSupported('audio/mpeg')
  );
}

function appendChunk(buffer: SourceBuffer, chunk: Uint8Array): Promise<void> {
  return new Promise((resolve, reject) => {
    const done = () => {
      buffer.removeEventListener('updateend', done);
      resolve();
    };
    buffer.addEventListener('updateend', done);
    buffer.addEventListener('error', reject, { once: true });
    try {
      buffer.appendBuffer(chunk as unknown as BufferSource);
    } catch (error) {
      reject(error as Error);
    }
  });
}
