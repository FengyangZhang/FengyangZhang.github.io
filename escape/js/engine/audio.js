/** Tiny synthesized effects. Muted until the player turns sound on. */

const SOUND_KEY = 'xingzhu-escape-sound';

export function createAudio() {
  let enabled = false;
  try {
    enabled = localStorage.getItem(SOUND_KEY) === '1';
  } catch {
    enabled = false;
  }
  let ctx = null;
  let pad = null;
  let lastStep = 0;

  function context() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type, gain) {
    const ac = context();
    if (!ac || !enabled) return;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(gain, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
    o.connect(g);
    g.connect(ac.destination);
    o.start();
    o.stop(ac.currentTime + dur);
  }

  function startPad() {
    const ac = context();
    if (!ac || pad) return;
    const g = ac.createGain();
    g.gain.value = 0.015;
    const a = ac.createOscillator();
    const b = ac.createOscillator();
    a.type = 'sine';
    b.type = 'sine';
    a.frequency.value = 98;
    b.frequency.value = 146.8;
    a.connect(g);
    b.connect(g);
    g.connect(ac.destination);
    a.start();
    b.start();
    pad = { a, b, g };
  }

  function stopPad() {
    if (!pad) return;
    try {
      pad.a.stop();
      pad.b.stop();
    } catch {
      /* already stopped */
    }
    pad = null;
  }

  return {
    get enabled() {
      return enabled;
    },
    toggle() {
      enabled = !enabled;
      try {
        localStorage.setItem(SOUND_KEY, enabled ? '1' : '0');
      } catch {
        /* ignore */
      }
      if (enabled) {
        context();
        startPad();
      } else {
        stopPad();
      }
      return enabled;
    },
    unlock() {
      if (enabled) {
        context();
        startPad();
      }
    },
    step() {
      if (!enabled) return;
      const now = performance.now();
      if (now - lastStep < 180) return;
      lastStep = now;
      const ac = context();
      if (!ac) return;
      const frames = Math.floor(ac.sampleRate * 0.045);
      const buffer = ac.createBuffer(1, frames, ac.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
      const src = ac.createBufferSource();
      const g = ac.createGain();
      const filter = ac.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 420;
      src.buffer = buffer;
      g.gain.value = 0.08;
      src.connect(filter);
      filter.connect(g);
      g.connect(ac.destination);
      src.start();
    },
    tick() {
      tone(660, 0.06, 'sine', 0.03);
    },
    success() {
      tone(523, 0.12, 'sine', 0.04);
      setTimeout(() => tone(659, 0.12, 'sine', 0.04), 110);
      setTimeout(() => tone(784, 0.2, 'sine', 0.045), 220);
    },
    fail() {
      tone(196, 0.18, 'triangle', 0.04);
    },
  };
}
