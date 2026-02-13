
export class SoundManager {
  private ctx: AudioContext | null = null;
  private musicInterval: any = null;
  private isMuted: boolean = false;

  constructor() {
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  private createOscillator(freq: number, type: OscillatorType, duration: number, volume: number = 0.1) {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  public playJump() {
    this.createOscillator(400, 'square', 0.1, 0.05);
    setTimeout(() => this.createOscillator(600, 'square', 0.1, 0.05), 50);
  }

  public playDeath() {
    this.createOscillator(300, 'sawtooth', 0.3, 0.1);
    this.createOscillator(150, 'sawtooth', 0.5, 0.1);
  }

  public playLevelUp() {
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((n, i) => {
      setTimeout(() => this.createOscillator(n, 'triangle', 0.2, 0.1), i * 100);
    });
  }

  public startMusic() {
    if (this.musicInterval) return;
    if (this.ctx?.state === 'suspended') this.ctx.resume();

    let step = 0;
    const melody = [261.63, 0, 329.63, 0, 392.00, 0, 523.25, 392.00];
    const bass = [130.81, 130.81, 164.81, 164.81, 196.00, 196.00, 130.81, 130.81];

    this.musicInterval = setInterval(() => {
      if (this.isMuted) return;
      
      // Play Bass
      this.createOscillator(bass[step % bass.length], 'triangle', 0.2, 0.05);
      
      // Play Melody
      if (melody[step % melody.length] > 0) {
        this.createOscillator(melody[step % melody.length], 'square', 0.1, 0.03);
      }

      step++;
    }, 200);
  }

  public stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }
}

export const sounds = new SoundManager();
