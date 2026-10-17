/**
 * Áudio opcional gerado por síntese (Web Audio API).
 * Não depende de arquivos externos, funciona offline e pode ser desativado.
 * Se a API não existir (ou o navegador bloquear), o jogo segue silencioso.
 */

export type SoundKind = 'click' | 'choice' | 'success' | 'fail' | 'tick' | 'ending';

interface AudioState {
  volume: number;
  muted: boolean;
}

const state: AudioState = { volume: 0.6, muted: false };
let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) {
    try {
      ctx = new Ctor();
    } catch {
      return null;
    }
  }
  return ctx;
}

export function configureAudio(volume: number, muted: boolean): void {
  state.volume = Math.min(1, Math.max(0, volume));
  state.muted = muted;
}

function tone(freq: number, duration: number, type: OscillatorType, gainFactor = 1): void {
  if (state.muted || state.volume <= 0) return;
  const audio = getContext();
  if (!audio) return;
  if (audio.state === 'suspended') {
    void audio.resume().catch(() => undefined);
  }
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const now = audio.currentTime;
  const peak = 0.16 * state.volume * gainFactor;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain).connect(audio.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

export function playSound(kind: SoundKind): void {
  switch (kind) {
    case 'click':
      tone(520, 0.07, 'triangle', 0.6);
      break;
    case 'choice':
      tone(360, 0.09, 'sine', 0.8);
      window.setTimeout(() => tone(540, 0.1, 'sine', 0.7), 70);
      break;
    case 'success':
      tone(480, 0.1, 'sine', 0.9);
      window.setTimeout(() => tone(660, 0.12, 'sine', 0.8), 90);
      window.setTimeout(() => tone(880, 0.16, 'sine', 0.7), 190);
      break;
    case 'fail':
      tone(220, 0.18, 'sawtooth', 0.5);
      window.setTimeout(() => tone(150, 0.24, 'sawtooth', 0.4), 120);
      break;
    case 'tick':
      tone(1000, 0.03, 'square', 0.25);
      break;
    case 'ending':
      tone(392, 0.22, 'sine', 0.9);
      window.setTimeout(() => tone(523, 0.24, 'sine', 0.85), 180);
      window.setTimeout(() => tone(659, 0.34, 'sine', 0.8), 380);
      break;
  }
}
