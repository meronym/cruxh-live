class AudioGraph {
  constructor() {
    this.ctx = new window.AudioContext();
    this.gainNode = this.ctx.createGain();
    this.gainNode.connect(this.ctx.destination);
    this.gainNode.gain.value = 0.8;
    this.sink = this.gainNode;
    this.synth = null;
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048;
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
    this.gainNode.gain.value = value;
  }

  pause() {
    this.ctx.suspend();
  }

  resume() {
    this.ctx.resume();
  }
}

export const audioGraph = new AudioGraph();
