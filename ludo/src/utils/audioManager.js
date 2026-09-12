/**
 * LudoVerse 3D — Web Audio API Sound Manager
 * Procedurally generated sounds — no external audio files required
 */

class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.musicEnabled = true;
    this.sfxEnabled = true;
    this.musicVolume = 0.5;
    this.sfxVolume = 0.7;
    this._musicInterval = null;
    this._initialized = false;
  }

  /** Lazily initialize AudioContext on first user interaction */
  init() {
    if (this._initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 1.0;
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicVolume;
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxVolume;
      this.sfxGain.connect(this.masterGain);

      this._initialized = true;
      this.startBackgroundMusic();
    } catch (e) {
      console.warn('Web Audio API not available', e);
    }
  }

  /** Helper: create oscillator burst */
  _playTone(freq, type = 'sine', duration = 0.2, gain = 0.3, dest = null) {
    if (!this.ctx || !this.sfxEnabled) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(gain, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(g);
    g.connect(dest || this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  /** Helper: frequency sweep */
  _playFreqSweep(startFreq, endFreq, type, duration, gain = 0.3) {
    if (!this.ctx || !this.sfxEnabled) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + duration);
    g.gain.setValueAtTime(gain, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  /** Dice roll sound */
  playDiceRoll() {
    if (!this.ctx || !this.sfxEnabled) return;
    // Rattling noise bursts
    for (let i = 0; i < 8; i++) {
      const t = i * 0.12;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      const noise = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 80 + Math.random() * 120;
      g.gain.setValueAtTime(0, this.ctx.currentTime + t);
      g.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + t + 0.09);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(this.ctx.currentTime + t);
      osc.stop(this.ctx.currentTime + t + 0.09);
    }
  }

  /** Token move sound */
  playTokenMove() {
    if (!this.ctx || !this.sfxEnabled) return;
    this._playFreqSweep(400, 600, 'sine', 0.15, 0.2);
    setTimeout(() => this._playTone(800, 'sine', 0.1, 0.15), 80);
  }

  /** Token enter board (six rolled) */
  playTokenEnter() {
    if (!this.ctx || !this.sfxEnabled) return;
    const freqs = [523, 659, 784, 1047];
    freqs.forEach((f, i) => {
      setTimeout(() => this._playTone(f, 'sine', 0.25, 0.25), i * 80);
    });
  }

  /** Capture sound */
  playCapture() {
    if (!this.ctx || !this.sfxEnabled) return;
    this._playFreqSweep(600, 200, 'sawtooth', 0.3, 0.4);
    setTimeout(() => this._playFreqSweep(800, 300, 'square', 0.2, 0.3), 150);
  }

  /** Victory fanfare */
  playVictory() {
    if (!this.ctx || !this.sfxEnabled) return;
    const melody = [
      [523, 0], [659, 100], [784, 200], [1047, 300],
      [784, 450], [1047, 550], [1319, 650], [1047, 850],
    ];
    melody.forEach(([freq, delay]) => {
      setTimeout(() => this._playTone(freq, 'sine', 0.35, 0.4), delay);
    });
  }

  /** Button click */
  playClick() {
    if (!this.ctx || !this.sfxEnabled) return;
    this._playTone(600, 'sine', 0.08, 0.2);
  }

  /** Hover sound */
  playHover() {
    if (!this.ctx || !this.sfxEnabled) return;
    this._playTone(400, 'sine', 0.05, 0.1);
  }

  /** Token select glow */
  playSelect() {
    if (!this.ctx || !this.sfxEnabled) return;
    this._playTone(880, 'sine', 0.12, 0.2);
    setTimeout(() => this._playTone(1100, 'sine', 0.1, 0.15), 70);
  }

  /** Ambient background music loop */
  startBackgroundMusic() {
    if (!this.ctx || !this.musicEnabled) return;
    this._playAmbientLoop();
  }

  _playAmbientLoop() {
    if (!this.ctx || !this.musicEnabled) return;

    const scale = [261, 293, 329, 392, 440, 523]; // C major pentatonic
    const duration = 0.6;
    const notes = Array.from({ length: 8 }, () => scale[Math.floor(Math.random() * scale.length)]);

    notes.forEach((freq, i) => {
      const t = i * duration;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0, this.ctx.currentTime + t);
      g.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + t + 0.1);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + t + duration - 0.05);
      osc.connect(g);
      g.connect(this.musicGain);
      osc.start(this.ctx.currentTime + t);
      osc.stop(this.ctx.currentTime + t + duration);
    });

    this._musicTimeout = setTimeout(() => this._playAmbientLoop(), notes.length * duration * 1000 + 1000);
  }

  stopBackgroundMusic() {
    if (this._musicTimeout) {
      clearTimeout(this._musicTimeout);
    }
  }

  setMusicEnabled(enabled) {
    this.musicEnabled = enabled;
    if (!enabled) {
      this.stopBackgroundMusic();
      if (this.musicGain) this.musicGain.gain.value = 0;
    } else {
      if (this.musicGain) this.musicGain.gain.value = this.musicVolume;
      if (this.ctx) this.startBackgroundMusic();
    }
  }

  setSfxEnabled(enabled) {
    this.sfxEnabled = enabled;
    if (this.sfxGain) this.sfxGain.gain.value = enabled ? this.sfxVolume : 0;
  }

  setMusicVolume(v) {
    this.musicVolume = v;
    if (this.musicGain) this.musicGain.gain.value = this.musicEnabled ? v : 0;
  }

  setSfxVolume(v) {
    this.sfxVolume = v;
    if (this.sfxGain) this.sfxGain.gain.value = this.sfxEnabled ? v : 0;
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }
}

// Singleton instance
const audioManager = new AudioManager();
export default audioManager;
