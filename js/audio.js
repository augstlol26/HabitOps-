// HabitOps - Tactical Procedural Web Audio Synthesizer Engine
class TacticalAudioEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.hasInteracted = false;
    this.listeners = [];
    this.chargeOsc = null;
    this.chargeGain = null;
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

  // 2-Second Hold-to-Clear Charging Hum (Rising Synthesizer Pitch)
  startChargeHum() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      this.stopChargeHum();
      const now = this.ctx.currentTime;
      this.chargeOsc = this.ctx.createOscillator();
      this.chargeGain = this.ctx.createGain();
      this.chargeOsc.type = 'sawtooth';
      this.chargeOsc.frequency.setValueAtTime(110, now);
      this.chargeOsc.frequency.exponentialRampToValueAtTime(540, now + 2.0);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, now);
      filter.frequency.exponentialRampToValueAtTime(1200, now + 2.0);

      this.chargeGain.gain.setValueAtTime(0.01, now);
      this.chargeGain.gain.linearRampToValueAtTime(0.12, now + 1.9);

      this.chargeOsc.connect(filter);
      filter.connect(this.chargeGain);
      this.chargeGain.connect(this.ctx.destination);
      this.chargeOsc.start(now);
    } catch (e) {
      console.warn(e);
    }
  }

  stopChargeHum() {
    if (!this.chargeOsc || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      if (this.chargeGain) {
        this.chargeGain.gain.setValueAtTime(this.chargeGain.gain.value, now);
        this.chargeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
      }
      this.chargeOsc.stop(now + 0.06);
    } catch (e) {}
    this.chargeOsc = null;
    this.chargeGain = null;
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

  // Satisfying Acoustic Water Droplet Sound for Protocol Touch
  playWaterDrop() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      // Fast upward pitch sweep mimicking water droplet surface tension plink
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(1580, now + 0.042);
      osc.frequency.exponentialRampToValueAtTime(940, now + 0.085);

      // Acoustic droplet formant filter
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1280, now);
      filter.Q.setValueAtTime(3.8, now);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {
      console.warn('Water drop audio error:', e);
    }
  }

  // Satisfying Tactile Pop on 2-Second Hold Completion
  playPop() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;

      // 1. Initial acoustic pop transient click
      const clickOsc = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      clickOsc.type = 'sine';
      clickOsc.frequency.setValueAtTime(1450, now);
      clickOsc.frequency.exponentialRampToValueAtTime(320, now + 0.016);
      clickGain.gain.setValueAtTime(0.42, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);
      clickOsc.connect(clickGain);
      clickGain.connect(this.ctx.destination);
      clickOsc.start(now);
      clickOsc.stop(now + 0.02);

      // 2. Resonant warm pop body (descending pressure release)
      const bodyOsc = this.ctx.createOscillator();
      const bodyGain = this.ctx.createGain();
      bodyOsc.type = 'sine';
      bodyOsc.frequency.setValueAtTime(640, now);
      bodyOsc.frequency.exponentialRampToValueAtTime(118, now + 0.065);

      bodyGain.gain.setValueAtTime(0.5, now);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      bodyOsc.connect(bodyGain);
      bodyGain.connect(this.ctx.destination);

      bodyOsc.start(now);
      bodyOsc.stop(now + 0.085);
    } catch (e) {
      console.warn('Pop audio error:', e);
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

  // Critical Boss Strike SFX: Heavy sub impact + dual laser sweep + harmonic power chord
  playCriticalHit(isFinalBlow = false) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // 1. Sub-bass shockwave
      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(180, now);
      sub.frequency.exponentialRampToValueAtTime(28, now + 0.45);
      subGain.gain.setValueAtTime(0.4, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
      sub.connect(subGain);
      subGain.connect(this.ctx.destination);
      sub.start(now);
      sub.stop(now + 0.5);

      // 2. Electric Crit Chord (C5 - G5 - C6 - E6)
      const chord = [523.25, 783.99, 1046.50, 1318.51];
      chord.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = i % 2 === 0 ? 'sawtooth' : 'triangle';
        const start = now + 0.04 + (i * 0.035);
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.14, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.32);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.35);
      });

      if (isFinalBlow) {
        setTimeout(() => this.playTrophyFanfare(), 350);
      }
    } catch (e) {
      console.warn(e);
    }
  }

  // Level Up Promotion Arpeggio: Heroic 7-note ascending synth fanfare
  playLevelUp() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [
        { f: 392.00, d: 0.00, l: 0.11 }, // G4
        { f: 493.88, d: 0.08, l: 0.11 }, // B4
        { f: 587.33, d: 0.16, l: 0.11 }, // D5
        { f: 783.99, d: 0.24, l: 0.16 }, // G5
        { f: 987.77, d: 0.36, l: 0.18 }, // B5
        { f: 1174.66, d: 0.48, l: 0.22 }, // D6
        { f: 1567.98, d: 0.62, l: 0.70 }  // G6
      ];
      notes.forEach(({ f, d, l }) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = now + d;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t);
        gain.gain.setValueAtTime(0.01, t);
        gain.gain.linearRampToValueAtTime(0.26, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + l);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + l + 0.02);
      });
    } catch (e) {
      console.warn(e);
    }
  }

  // Pitch-escalating Combo Blip for consecutive daily completions
  playComboBlip(comboCount = 1) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const baseFreq = 440 * Math.pow(1.08, Math.min(comboCount, 10));
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.25, now + 0.12);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {
      console.warn(e);
    }
  }

  // Smooth sci-fi vanish sweep when completed protocol clears
  playQuestVanish() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(1180, now + 0.16);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch (e) {
      console.warn(e);
    }
  }

  // Tactical Radar Two-Tone Notification Ping
  playNotificationPing() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [880, 1318.51].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + idx * 0.11;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.15, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.24);
      });
    } catch (e) {
      console.warn(e);
    }
  }

  // Low-HP Adversary Heartbeat Sub-Bass Thump (< 25% Boss HP)
  playHeartbeatPulse() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [0, 0.22].forEach((offset, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + offset;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(idx === 0 ? 68 : 54, start);
        osc.frequency.exponentialRampToValueAtTime(28, start + 0.16);
        gain.gain.setValueAtTime(idx === 0 ? 0.26 : 0.18, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.2);
      });
    } catch (e) {
      console.warn(e);
    }
  }

  // Tactical EMP Streak Shield Discharge Sound
  playEmpShield() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [440, 659.25, 987.77, 1318.51].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + idx * 0.05;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.14, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.3);
      });
    } catch (e) {
      console.warn(e);
    }
  }
}

// Global instance
window.audioEngine = new TacticalAudioEngine();

