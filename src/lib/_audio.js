import workletUrl from './_proc.js?url';
import { buildFaustAudio } from './_faust.js';

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
    this.paused = true;
  }

  /*
  async link(app) {
    await this.ctx.audioWorklet.addModule(workletUrl);
    this.proc = new AudioWorkletNode(this.ctx, 'cruxh-processor');

    let oscCode = `
      import("stdfaust.lib");
      gain = hslider("gain", 0.1, 0, 1, 0.01) : si.smoo;
      freq = hslider("freq", 220, 20, 20000, 1) : si.smoo;
      process = os.osc(freq) * gain <: _,_;
    `;
    this.osc = await buildFaustAudio(this.ctx, oscCode);
    this.osc.dsp.connect(this.sink);

    // for (let key of this.osc.dsp.parameters.keys()) {
    //   console.log(key);
    // }

    // this.proc.port.postMessage(this.osc.dsp);
    // console.log(this.proc);

    // this.proc.connect(this.osc.dsp.parameters.get('/FaustDSP/gain'));
    // let gain = this.osc.dsp.parameters.get('/FaustDSP/gain');
    // gain.value = 0.0;
    // this.proc.connect(gain);
  }
  */

  async setSynth(synth) {
    if (this.synth) {
      // disconnect and destroy the old synth
      this.synth.disconnect();
      this.synth.destroy();
    }
    // connect the new synth
    this.synth = synth;
    this.synth.connect(this.sink);
    this.synth.connect(this.analyser);
    if (this.paused) {
      await new Promise(resolve => setTimeout(resolve, 100));
      await this.ctx.suspend();
    }
  }

  setVolume(value) {
    this.volume = value;
    this.gainNode.gain.cancelScheduledValues(0);
    this.gainNode.gain.linearRampToValueAtTime(value, this.ctx.currentTime + 0.1);
  }

  async pause() {
    if (this.paused) {
      return;
    }
    this.paused = true;
    this.gainNode.gain.cancelScheduledValues(0);
    this.gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1);
    await new Promise(resolve => setTimeout(resolve, 150));
    await this.ctx.suspend();
  }

  async resume() {
    if (!this.paused) {
      return;
    }
    this.paused = false;
    this.gainNode.gain.cancelScheduledValues(0);
    this.gainNode.gain.value = 0;
    await this.ctx.resume();
    this.gainNode.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 0.1);
  }
}

export const audio = new Audio();
