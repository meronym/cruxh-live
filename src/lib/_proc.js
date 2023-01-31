class Ramp {
  constructor() {
    this.increment = 128.0 / 44100.0;
    this.phase = 0.0;
  }

  process() {
    this.phase += this.increment / 2;
    if (this.phase > 1.0) {
      this.phase = 0.0;
    }
    return this.phase;
  }
}

class CruxhProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.ramp = new Ramp();
    this.app = null;
    this.port.onmessage = e => {
      console.log('RECV', e.data);
    };
  }

  process(inputList, outputList, parameters) {
    // first output > first channel
    let output = outputList[0][0];

    // first sample only (to be connected to a K-rate parameter)
    output[0] = Math.pow(this.ramp.process(), 5);

    // for (let channel = 0; channel < output.length; channel++) {
    //   const outputChannel = output[channel];

    //   for (let i = 0; i < outputChannel.length; i++) {
    //     outputChannel[i] = this.ramp.phase * (Math.random() * 2 - 1);
    //   }
    // }

    return true;
  }
}

registerProcessor('cruxh-processor', CruxhProcessor);
