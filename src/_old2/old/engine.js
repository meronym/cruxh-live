import { buildFaust, buildFaustAudio } from './fdsp.js';
import { audioGraph } from './agraph.js';
import { ParameterController } from './kctrl.js';


class ModulationEngine {
  constructor(synth) {
    this.identifier = 'modulation';
    this.knobs = null;

    this.synth = synth;

    this.pdesc_map = {};  // map of input descriptors by address
    
    // this.mod_names = [];  // list of modulator names
    this.mod_source = {}; // maps param address to the name of its modulation source
    this.mod_amount = {}; // maps param address to the amount of modulation

    this.pre_mod_norm_values = {}; // maps param address to its denormalized (pre-mod) value
    this.post_mod_norm_values = {}; // maps param address to its normalized (post-mod) value

    this.out_names = [];  // list of output names
    this.outputs = {};    // map of output values by name
    
    this.dsp = null;
  }

  load_params(param_descriptors) {
    this.pdesc_map = {};
    for (let pdesc of param_descriptors) {
      this.pdesc_map[pdesc.address] = pdesc;
    }
    this.pre_mod_norm_values = {};
    this.post_mod_norm_values = {};
  }

  load_outputs(outputs) {
    this.out_names = outputs;
    this.synth.load_modulators(outputs);
  }

  set_param(address, value) {
    this.pre_mod_norm_values[address] = value;
    // return denormalized value (to be used by the UI)
    let pdesc = this.pdesc_map[address];
    let denorm = denormalize(pdesc, value);
    return denorm;
  }

  set_mod_config(address, value) {
    this.mod_source[address] = value.source;
    this.mod_amount[address] = value.amount;
  }

  process() {
    // read knobs, map to required values, push values to DSP
    for (let [address, pdesc] of Object.entries(this.pdesc_map)) {
      let value = this.pre_mod_norm_values[address];
      
      // apply modulation
      let mod_source = this.mod_source[address];
      let mod_signal = 0;
      if (mod_source !== undefined && mod_source !== '-') {
        mod_signal = this.outputs[this.mod_source[address]];
        mod_signal *= this.mod_amount[address];
      }
      value = modulate(value, mod_signal);
      this.post_mod_norm_values[address] = value;
      
      // denormalize
      value = denormalize(pdesc, value);

      // push parameter to DSP
      this.dsp.setParamValue(address, value);
    }
    
    // compute modulation DSP
    this.dsp.process();

    // store outputs
    for (let [ix, name] of this.out_names.entries()) {
      this.outputs[name] = this.dsp.outputs[ix];
    }

    // push outputs to synth
    this.synth.process(this.outputs);
  }

  set_knobs(knobs) {
    this.knobs = knobs;
  }

  async load_code(code) {
    let {dsp, params, tabs, outputs} = await buildFaust(code);
    this.load_params(params);
    this.load_outputs(outputs);
    this.dsp = dsp;
    this.knobs.load_tabs(tabs);
    this.knobs.load_modulators(['-'].concat(outputs));
  }
};



class SynthEngine {
  constructor(agraph) {
    this.identifier = 'synth';

    this.agraph = agraph;
    this.node = null;
    
    this.knobs = null;

    this.pdesc_map = {};  // map of input descriptors by address
    
    this.mod_names = [];  // list of modulator names
    this.mod_source = {}; // maps param address to the name of its modulation source
    this.mod_amount = {}; // maps param address to the amount of modulation

    this.pre_mod_norm_values = {}; // maps param address to its denormalized (pre-mod) value
    this.post_mod_norm_values = {}; // maps param address to its normalized (post-mod) value
  }

  load_dsp(node) {
    this.agraph.setSynth(node);
    this.node = node;
  }

  load_params(param_descriptors) {
    this.pdesc_map = {};
    for (let pdesc of param_descriptors) {
      this.pdesc_map[pdesc.address] = pdesc;
    }
    this.pre_mod_norm_values = {};
    this.post_mod_norm_values = {};
  }

  load_modulators(modulators) {
    this.mod_names = modulators;
  }

  set_param(address, value) {
    this.pre_mod_norm_values[address] = value;
    // return denormalized value (to be used by the UI)
    let pdesc = this.pdesc_map[address];
    let denorm = denormalize(pdesc, value);
    return denorm;
  }

  set_mod_config(address, value) {
    this.mod_source[address] = value.source;
    this.mod_amount[address] = value.amount;
  }

  process(mod_values) {
    // read knobs, map to required values, push values to DSP
    for (let [address, pdesc] of Object.entries(this.pdesc_map)) {
      let value = this.pre_mod_norm_values[address];
      
      // apply modulation
      let mod_source = this.mod_source[address];
      let mod_signal = 0;
      if (mod_source !== undefined && mod_source !== '-') {
        mod_signal = mod_values[this.mod_source[address]];
        mod_signal *= this.mod_amount[address];
      }
      value = modulate(value, mod_signal);
      this.post_mod_norm_values[address] = value;

      // denormalize
      value = denormalize(pdesc, value);

      // push parameter to DSP
      this.node.setParamValue(address, value);
    }
  }

  // FIXME: circular reference between knobs and engine
  set_knobs(knobs) {
    this.knobs = knobs;
  }

  async load_code(code) {
    let { node, params, tabs } = await buildFaustAudio(this.agraph.ctx, code);
    this.load_params(params);
    this.load_dsp(node);
    this.knobs.load_tabs(tabs);
  }
};

function modulate(value, sig) {
  let headroom = (sig < 0) ? value : (1 - value);
  return value + sig * headroom;
}

function denormalize(pdesc, value) {
  if (value < 0) {
    value = 0;
  } else if (value > 1) {
    value = 1;
  }
  if (pdesc.scale === 'linear') {
    return pdesc.min + (pdesc.max - pdesc.min) * value;
  } else if (pdesc.scale === 'log') {
    return pdesc.min * Math.pow(pdesc.max / pdesc.min, value);
  }
}

export const synthEngine = new SynthEngine(audioGraph);
export const modEngine = new ModulationEngine(synthEngine);

const mknobs = new ParameterController(modEngine);
modEngine.set_knobs(mknobs); // FIXME circular reference

const sknobs = new ParameterController(synthEngine);
synthEngine.set_knobs(sknobs); // FIXME circular reference
