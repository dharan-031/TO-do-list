// Web Audio API Synthesizer and Browser / In-App Notification Manager

let audioCtx: AudioContext | null = null;
let isAudioUnlocked = false;

/**
 * Initialize / unlock AudioContext on user interaction
 */
export function unlockAudio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    isAudioUnlocked = true;
  } catch (e) {
    console.debug('Audio unlock error:', e);
  }
  return audioCtx;
}

// Automatically try unlocking on first user interaction on the window
if (typeof window !== 'undefined') {
  const handleFirstInteraction = () => {
    unlockAudio();
    window.removeEventListener('click', handleFirstInteraction);
    window.removeEventListener('keydown', handleFirstInteraction);
    window.removeEventListener('touchstart', handleFirstInteraction);
  };
  window.addEventListener('click', handleFirstInteraction, { passive: true });
  window.addEventListener('keydown', handleFirstInteraction, { passive: true });
  window.addEventListener('touchstart', handleFirstInteraction, { passive: true });
}

function getAudioContext(): AudioContext | null {
  return unlockAudio();
}

/**
 * Play a soothing, prominent completion chime
 */
export function playChimeSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);

      gain.gain.setValueAtTime(0, now + idx * 0.09);
      gain.gain.linearRampToValueAtTime(0.22, now + idx * 0.09 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.09 + 0.85);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.9);
    });
  } catch (err) {
    console.debug('Audio play failed or disabled', err);
  }
}

/**
 * Play an epic milestone fanfare
 */
export function playFanfareSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const chords = [
      { freqs: [261.63, 329.63, 392.0], start: 0, duration: 0.25 },
      { freqs: [329.63, 392.0, 523.25], start: 0.22, duration: 0.25 },
      { freqs: [392.0, 523.25, 659.25], start: 0.44, duration: 0.3 },
      { freqs: [523.25, 659.25, 783.99, 1046.5], start: 0.72, duration: 1.0 },
    ];

    chords.forEach((chord) => {
      chord.freqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + chord.start);

        gain.gain.setValueAtTime(0, now + chord.start);
        gain.gain.linearRampToValueAtTime(0.15, now + chord.start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + chord.start + chord.duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + chord.start);
        osc.stop(now + chord.start + chord.duration + 0.05);
      });
    });
  } catch (err) {
    console.debug('Fanfare failed', err);
  }
}

/**
 * Play a gentle tap / tick sound
 */
export function playTickSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.04);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  } catch {}
}

// Focus ambient noise generator (warm brown noise)
let ambientSource: AudioNode | null = null;
let ambientGain: GainNode | null = null;

export function toggleAmbientNoise(enable: boolean, volume = 0.05): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (!enable) {
      if (ambientGain) {
        ambientGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
        setTimeout(() => {
          if (ambientSource) {
            try {
              (ambientSource as AudioBufferSourceNode).stop();
            } catch {}
            ambientSource = null;
            ambientGain = null;
          }
        }, 500);
      }
      return;
    }

    if (ambientSource) return;

    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 550;

    ambientGain = ctx.createGain();
    ambientGain.gain.setValueAtTime(0.001, ctx.currentTime);
    ambientGain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.8);

    noise.connect(filter);
    filter.connect(ambientGain);
    ambientGain.connect(ctx.destination);

    noise.start();
    ambientSource = noise;
  } catch (e) {
    console.debug('Ambient audio failed', e);
  }
}

/**
 * Check if app is embedded in an iframe (e.g. AI Studio preview)
 */
export function isInIframe(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

/**
 * Flash browser tab title to alert user even if tab is in background
 */
let titleFlashInterval: NodeJS.Timeout | null = null;
let originalTitle = typeof document !== 'undefined' ? document.title : 'Chronos';

export function flashTabNotification(alertText: string, times = 6): void {
  if (typeof document === 'undefined') return;
  if (titleFlashInterval) clearInterval(titleFlashInterval);

  let count = 0;
  originalTitle = 'Chronos - Dark Lifestyle & Streak Tracker';

  titleFlashInterval = setInterval(() => {
    document.title = count % 2 === 0 ? `🔔 ${alertText}` : originalTitle;
    count++;
    if (count >= times * 2) {
      if (titleFlashInterval) clearInterval(titleFlashInterval);
      document.title = originalTitle;
    }
  }, 900);
}

/**
 * Request browser notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('requestPermission rejected:', err);
    return 'denied';
  }
}

/**
 * Dispatch system notification if granted
 */
export function sendBrowserNotification(title: string, options?: NotificationOptions): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  try {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        badge: '/favicon.ico',
        icon: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=128&auto=format&fit=crop&q=80',
        ...options,
      });
      return true;
    }
  } catch (e) {
    console.warn('Native notification failed', e);
  }
  return false;
}
