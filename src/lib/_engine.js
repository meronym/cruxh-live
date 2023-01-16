class BaseEngine {
  constructor({ dsp, code, params, inputs, outputs, tabs }) {
    this.dsp = dsp;
    this.code = code;
    this.descriptors = this._params_to_descriptors(params);
    this.input_names = inputs;
    this.output_names = outputs;
    this.tabs = tabs;
    
    // denormalized parameter values so we can restore them 
    // based on an existing state or a patch
    // corresponds to `patch.<modulation|synth>.params`
    this.premod_denorm = {};
    this.premod_norm = {};
    this.postmod_norm = {};
    this.postmod_denorm = {};

    // parameter modulation config
    // corresponds to `patch.<modulation|synth>.mods`
    this.mod_config = {};

    // initialize with default values
    this.init();
  }

  // FIXME kinda ugly
  _params_to_descriptors(params) {
    let descriptors = {};
    for (let param of params) {
      descriptors[param.address] = param;
    }
    return descriptors;
  }

  init() {
    for (let [address, pdesc] of Object.entries(this.descriptors)) {
      // initialize premod_denorm with default descriptor values (loaded from dsp code)
      this.set_premod_denorm(address, pdesc.init);
      // initialize mod_config with default values
      this.set_mod_config(address, {
        source: '-',
        amount: 0,
      });
    }
  }

  // updates this state object to match a patch definition
  load(patchParams, patchMods) {
    for (let [address, pdesc] of Object.entries(this.descriptors)) {
      if (address in patchParams) {
        // update params values from patch data
        this.set_premod_denorm(address, patchParams[address]);
        this.postmod_norm[address] = this.premod_norm[address];
        this.postmod_denorm[address] = this.premod_denorm[address];
      }
      if (address in patchMods) {
        // update modulation config from patch data
        this.set_mod_config(address, patchMods[address]);
      }
    }
  }

  // updates this state object to match another state object
  // (useful when recompiling code and producing a new state object)
  loadFrom(otherState) {
    // another use case: update state from current dsp values
    this.load(otherState.premod_denorm, otherState.mod_config);
  }

  exportPatchData() {
    // enough information to recreate this engine (ignoring runtime state)
    return {
      code: this.code,
      params: this.premod_denorm,
      mods: this.mod_config,
    }
  }

  _denormalize(address, value) {
    let pdesc = this.descriptors[address];
    // denormalize based on descriptor settings
    if (pdesc.scale === 'linear') {
      return pdesc.min + (pdesc.max - pdesc.min) * value;
    } else if (pdesc.scale === 'log') {
      return pdesc.min * Math.pow(pdesc.max / pdesc.min, value);
    }
  }

  _normalize(address, value) {
    let pdesc = this.descriptors[address];
    // normalize based on descriptor settings
    if (pdesc.scale === 'linear') {
      return (value - pdesc.min) / (pdesc.max - pdesc.min);
    } else if (pdesc.scale === 'log') {
      return Math.log(value / pdesc.min) / Math.log(pdesc.max / pdesc.min);
    }
  }

  // Setter/Getter interface for pre/post mod values and mod config
  set_premod_norm(address, value) {
    // clip value to [0, 1]
    value = Math.min(1, Math.max(0, value));
    this.premod_norm[address] = value;
    this.premod_denorm[address] = this._denormalize(address, value);
  }

  get_premod_norm(address) {
    return this.premod_norm[address];
  }
  
  set_premod_denorm(address, value) {
    let pdesc = this.descriptors[address];
    value = Math.min(pdesc.max, Math.max(pdesc.min, value));
    this.premod_denorm[address] = value;
    this.premod_norm[address] = this._normalize(address, value);
  }

  get_premod_denorm(address) {
    return this.premod_denorm[address];
  }

  get_premod_label(address) {
    let label = this.get_premod_denorm(address).toFixed(2);
    if (this.descriptors[address].unit) {
      label += ' ' + this.descriptors[address].unit;
    }
    return label;
  }

  set_mod_config(address, value) {
    this.mod_config[address] = value;
  }
  
  get_mod_config(address) {
    return this.mod_config[address];
  }

  get_postmod_norm(address) {
    return this.postmod_norm[address];
  }

  get_postmod_denorm(address) {
    return this.postmod_denorm[address];
  }
  
  modulate(mod_values) {
    // read params, map to required values, push values to DSP
    for (let [address, pdesc] of Object.entries(this.descriptors)) {
      let value = this.premod_norm[address];
      
      // compute modulation signal
      let mod_source = this.mod_config[address].source;
      let mod_signal = 0;
      if (mod_source !== undefined && mod_source !== '-') {
        mod_signal = mod_values[mod_source];
        mod_signal *= this.mod_config[address].amount;
      }

      // apply modulation
      let headroom = (mod_signal < 0) ? value : (1 - value);
      value = value + mod_signal * headroom;
      this.postmod_norm[address] = value;

      // denormalize
      value = this._denormalize(address, value);
      this.postmod_denorm[address] = value;

      // push parameter to DSP
      this.dsp.setParamValue(address, value);
    }
  }
};


export class SynthEngine extends BaseEngine {
  constructor(args) {
    super(args);
  }
};


export class ModulationEngine extends BaseEngine {
  constructor(args) {
    super(args);
    this.outputs = {};
    for (let name of this.output_names) {
      this.outputs[name] = 0;
    }
  }

  process() {
    // modulate parameters
    this.modulate(this.outputs);
    
    // compute modulation DSP
    this.dsp.process();

    // store outputs
    for (let [ix, name] of this.output_names.entries()) {
      this.outputs[name] = this.dsp.outputs[ix];
    }
  }
};
