/**
 * Utilities for Real-Time Live Audio Streaming with Gemini 3.8 Live API
 * Handles 16kHz PCM audio capture and 24kHz PCM playback queue with interruption support.
 */

// Convert Float32Array from Web Audio API to 16-bit linear PCM ArrayBuffer
export function floatTo16BitPCM(input: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(input.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buffer;
}

// Convert ArrayBuffer to Base64
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert 24kHz 16-bit linear PCM base64 string from Gemini to Web Audio AudioBuffer
export function base64ToPcmAudioBuffer(
  audioCtx: AudioContext,
  base64: string,
  sampleRate: number = 24000
): AudioBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const dataView = new DataView(bytes.buffer);
  const numSamples = Math.floor(len / 2);
  const audioBuffer = audioCtx.createBuffer(1, Math.max(1, numSamples), sampleRate);
  const channelData = audioBuffer.getChannelData(0);
  for (let i = 0; i < numSamples; i++) {
    const int16 = dataView.getInt16(i * 2, true);
    channelData[i] = int16 < 0 ? int16 / 0x8000 : int16 / 0x7fff;
  }
  return audioBuffer;
}

/**
 * AudioQueuePlayer plays streamed audio chunks smoothly in sequence.
 * Supports instantaneous interruption when the user speaks.
 */
export class AudioQueuePlayer {
  private audioCtx: AudioContext | null = null;
  private nextStartTime: number = 0;
  private currentSources: AudioBufferSourceNode[] = [];
  private isPlaying: boolean = false;
  private onStateChange?: (isPlaying: boolean) => void;

  constructor(onStateChange?: (isPlaying: boolean) => void) {
    this.onStateChange = onStateChange;
  }

  private initContext(): AudioContext {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass({ sampleRate: 24000 });
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public enqueueChunk(base64Pcm: string) {
    try {
      const ctx = this.initContext();
      const buffer = base64ToPcmAudioBuffer(ctx, base64Pcm, 24000);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);

      const currentTime = ctx.currentTime;
      // If nextStartTime is in the past, reset to currentTime + 10ms jitter buffer
      if (this.nextStartTime < currentTime) {
        this.nextStartTime = currentTime + 0.01;
      }

      source.start(this.nextStartTime);
      this.nextStartTime += buffer.duration;
      this.currentSources.push(source);

      if (!this.isPlaying) {
        this.isPlaying = true;
        this.onStateChange?.(true);
      }

      source.onended = () => {
        const index = this.currentSources.indexOf(source);
        if (index > -1) {
          this.currentSources.splice(index, 1);
        }
        if (this.currentSources.length === 0) {
          this.isPlaying = false;
          this.onStateChange?.(false);
        }
      };
    } catch (err) {
      console.warn('Error enqueuing audio chunk:', err);
    }
  }

  public interrupt() {
    for (const src of this.currentSources) {
      try {
        src.stop();
        src.disconnect();
      } catch {}
    }
    this.currentSources = [];
    if (this.audioCtx) {
      this.nextStartTime = this.audioCtx.currentTime;
    } else {
      this.nextStartTime = 0;
    }
    this.isPlaying = false;
    this.onStateChange?.(false);
  }

  public close() {
    this.interrupt();
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
  }
}

/**
 * MicrophoneRecorder captures mic audio, resamples to 16kHz PCM,
 * and calls onAudioData with base64 PCM frames.
 */
export class MicrophoneRecorder {
  private audioCtx: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private onAudioData: (base64: string) => void;
  private onVolumeChange?: (volume: number) => void;
  private isRecording: boolean = false;

  constructor(
    onAudioData: (base64: string) => void,
    onVolumeChange?: (volume: number) => void
  ) {
    this.onAudioData = onAudioData;
    this.onVolumeChange = onVolumeChange;
  }

  public async start(): Promise<boolean> {
    if (this.isRecording) return true;
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass({ sampleRate: 16000 });
      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      this.source = this.audioCtx.createMediaStreamSource(this.mediaStream);
      // Use 2048 or 4096 buffer size for ~128ms - 256ms audio packet intervals
      this.processor = this.audioCtx.createScriptProcessor(2048, 1, 1);

      this.processor.onaudioprocess = (e) => {
        if (!this.isRecording) return;
        const channelData = e.inputBuffer.getChannelData(0);

        // Calculate simple volume level for visualizer
        let sum = 0;
        for (let i = 0; i < channelData.length; i++) {
          sum += channelData[i] * channelData[i];
        }
        const rms = Math.sqrt(sum / channelData.length);
        const volume = Math.min(1, rms * 5); // Boost volume metric
        this.onVolumeChange?.(volume);

        // Convert to 16-bit PCM and encode base64
        const pcmBuffer = floatTo16BitPCM(channelData);
        const base64 = arrayBufferToBase64(pcmBuffer);
        this.onAudioData(base64);
      };

      this.source.connect(this.processor);
      this.processor.connect(this.audioCtx.destination);
      this.isRecording = true;
      return true;
    } catch (err) {
      console.error('Failed to access microphone:', err);
      this.stop();
      return false;
    }
  }

  public stop() {
    this.isRecording = false;
    if (this.processor) {
      try {
        this.processor.disconnect();
      } catch {}
      this.processor = null;
    }
    if (this.source) {
      try {
        this.source.disconnect();
      } catch {}
      this.source = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
    this.onVolumeChange?.(0);
  }

  public isActive(): boolean {
    return this.isRecording;
  }
}
