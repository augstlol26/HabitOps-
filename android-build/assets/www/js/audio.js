// HabitCraft - Tactical Procedural Web Audio Synthesizer Engine
class TacticalAudioEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.hasInteracted = false;
    this.listeners = [];
  }

  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(mute) {
    this.muted = mute;
    this.notify();
  }

  toggle() {
    this.init();
    this.muted = !this.muted;
    if (!this.muted) {
      this.playToggleBeep(true);
    } else {
      this.playToggleBeep(false);
    }
    this.notify();
    return !this.muted;
  }

  subscribe(callback) {
    this.listeners.push(callback);
    callback(!this.muted);
  }

  notify() {
    this.listeners.forEach(cb => cb(!this.muted));
  }

  // Quick tactile toggle feedback beep
  playToggleBeep(isOn) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isOn ? 587.33 : 329.63, now); // D5 or E4
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // Light mechanical UI tap
  playTap() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.04);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {
      console.warn(e);
    }
  }

  // Heavy mechanical thud / locked feedback
  playMechanicalThud() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.18);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {
      console.warn(e);
    }
  }

  // Standard Quest Check chime (Bright ascending twin synth blip)
  playChime() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + (idx * 0.06));
        
        gain.gain.setValueAtTime(0, now + (idx * 0.06));
        gain.gain.linearRampToValueAtTime(0.12, now + (idx * 0.06) + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (idx * 0.06) + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + (idx * 0.06));
        osc.stop(now + (idx * 0.06) + 0.23);
      });
    } catch (err) {
      console.warn(err);
    }
  }

  // Boss Impact / Strike Sound Effect: Low punch boom + crunchy noise burst + laser saw slice
  playBossHit(isFinalBlow = false) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // 1. Resonant sub impact boom
      const boomOsc = this.ctx.createOscillator();
      const boomGain = this.ctx.createGain();
      boomOsc.type = 'sine';
      boomOsc.frequency.setValueAtTime(140, now);
      boomOsc.frequency.exponentialRampToValueAtTime(32, now + 0.35);

      boomGain.gain.setValueAtTime(0.3, now);
      boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      boomOsc.connect(boomGain);
      boomGain.connect(this.ctx.destination);
      boomOsc.start(now);
      boomOsc.stop(now + 0.4);

      // 2. High-speed tactical blade slash sweep
      const slashOsc = this.ctx.createOscillator();
      const slashGain = this.ctx.createGain();
      slashOsc.type = 'sawtooth';
      slashOsc.frequency.setValueAtTime(950, now);
      slashOsc.frequency.exponentialRampToValueAtTime(180, now + 0.2);

      slashGain.gain.setValueAtTime(0.18, now);
      slashGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      slashOsc.connect(slashGain);
      slashGain.connect(this.ctx.destination);
      slashOsc.start(now);
      slashOsc.stop(now + 0.24);

      // 3. Crunch impact noise burst
      const bufferSize = this.ctx.sampleRate * 0.08;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, now);
      filter.Q.setValueAtTime(1.5, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.2, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      whiteNoise.start(now);

      // 4. Reward chime follow-up
      setTimeout(() => {
        this.playChime();
      }, 120);

      // 5. Boss defeated fanfare if 0 HP
      if (isFinalBlow) {
        setTimeout(() => {
          this.playTrophyFanfare();
        }, 320);
      }
    } catch (e) {
      console.warn(e);
    }
  }

  // Glorious celebratory Fanfare with harmonic shimmer
  playTrophyFanfare() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [
        { f: 349.23, delay: 0.00, dur: 0.12 },
        { f: 440.00, delay: 0.09, dur: 0.12 },
        { f: 523.25, delay: 0.18, dur: 0.15 },
        { f: 698.46, delay: 0.28, dur: 0.22 },
        { f: 880.00, delay: 0.42, dur: 0.25 },
        { f: 1046.50, delay: 0.58, dur: 0.65 }
      ];

      notes.forEach(({ f, delay, dur }) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + delay;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, start);

        gain.gain.setValueAtTime(0.01, start);
        gain.gain.linearRampToValueAtTime(0.28, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + dur + 0.02);
      });

      // Shimmer High Resonance Chime
      const shimmerOsc = this.ctx.createOscillator();
      const shimmerGain = this.ctx.createGain();
      shimmerOsc.type = 'sine';
      shimmerOsc.frequency.setValueAtTime(1760, now + 0.6);
      shimmerGain.gain.setValueAtTime(0.12, now + 0.6);
      shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
      shimmerOsc.connect(shimmerGain);
      shimmerGain.connect(this.ctx.destination);
      shimmerOsc.start(now + 0.6);
      shimmerOsc.stop(now + 1.25);
    } catch (e) {
      console.warn(e);
    }
  }

  // Celebratory Fanfare alias
  playFanfare() {
    this.playTrophyFanfare();
  }

  // Deep boss warhorn synthesizer blast + victory resolve
  playBossHorn() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const sub = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      sub.type = 'triangle';

      osc1.frequency.setValueAtTime(110, now);
      osc1.frequency.linearRampToValueAtTime(146.83, now + 0.25);
      osc2.frequency.setValueAtTime(112.5, now);
      osc2.frequency.linearRampToValueAtTime(148.5, now + 0.25);

      sub.frequency.setValueAtTime(55, now);
      sub.frequency.linearRampToValueAtTime(73.4, now + 0.25);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.1);
      gain.gain.setValueAtTime(0.35, now + 0.45);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      osc1.connect(gain);
      osc2.connect(gain);
      sub.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      sub.start(now);
      osc1.stop(now + 0.95);
      osc2.stop(now + 0.95);
      sub.stop(now + 0.95);

      const stabTime = now + 0.75;
      const stabOsc = this.ctx.createOscillator();
      const stabGain = this.ctx.createGain();
      stabOsc.type = 'sawtooth';
      stabOsc.frequency.setValueAtTime(293.66, stabTime);
      stabGain.gain.setValueAtTime(0.3, stabTime);
      stabGain.gain.exponentialRampToValueAtTime(0.001, stabTime + 0.4);
      stabOsc.connect(stabGain);
      stabGain.connect(this.ctx.destination);
      stabOsc.start(stabTime);
      stabOsc.stop(stabTime + 0.45);
    } catch (e) {
      console.warn(e);
    }
  }
}

// Global instance
window.audioEngine = new TacticalAudioEngine();

