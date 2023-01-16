class Audio {
  constructor() {
    this.ctx = new window.AudioContext();
    this.gainNode = this.ctx.createGain();
    this.gainNode.connect(this.ctx.destination);
    this.gainNode.gain.value = 0.8;
    this.sink = this.gainNode;
    this.synth = null;
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.volume = 0.5;
  }

  setSynth(synth) {
    if (this.synth) {
      // disconnect and destroy the old synth
      this.synth.disconnect();
      this.synth.destroy();
    }
    // connect the new synth
    this.synth = synth;
    this.synth.connect(this.sink);
    this.synth.connect(this.analyser);
  }

  setVolume(value) {
    this.volume = value;
    this.gainNode.gain.cancelScheduledValues(0);
    this.gainNode.gain.linearRampToValueAtTime(value, this.ctx.currentTime + 0.1);
  }

  async pause() {
    this.gainNode.gain.cancelScheduledValues(0);
    this.gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1);
    await new Promise(resolve => setTimeout(resolve, 150));
    this.ctx.suspend();
  }

  async resume() {
    this.gainNode.gain.cancelScheduledValues(0);
    this.gainNode.gain.value = 0;
    this.ctx.resume();
    this.gainNode.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 0.1);
  }
}

export const audio = new Audio();
