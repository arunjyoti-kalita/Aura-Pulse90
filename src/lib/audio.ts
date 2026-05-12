// Mechanical Sound System for Transform 90
// Uses Web Audio API to synthesize "click" and "beep" sounds without external assets

let audioCtx: AudioContext | null = null;

const getCtx = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

/**
 * High-frequency mechanical click
 */
export const playClick = () => {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(1500, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);

  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.1);
};

/**
 * Technical "Beep" for system alerts or state changes
 */
export const playBeep = (freq = 880, duration = 0.1) => {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(freq, ctx.currentTime);

  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + duration);
};

/**
 * Haptic pulse utility
 */
export const hapticPulse = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if (!window.navigator.vibrate) return;
  
  const patterns = {
    light: [10],
    medium: [30],
    heavy: [60]
  };
  
  window.navigator.vibrate(patterns[type]);
};
