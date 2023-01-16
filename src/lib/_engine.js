class BaseEngine {
  constructor() {
    this.dsp = null;
    this.code = '';       // the code that was used to build the dsp
                          // (used when saving the patch)

    this.pdesc_map = {};  // map of input descriptors by address
    
    this.mod_names = [];  // list of modulator names
    this.mod_source = {}; // maps param address to the name of its modulation source
    this.mod_amount = {}; // maps param address to the amount of modulation

    this.pre_mod_norm_values = {}; // maps param address to its denormalized (pre-mod) value
    this.post_mod_norm_values = {}; // maps param address to its normalized (post-mod) value
  }

  load_params(param_descriptors) {
    this.pdesc_map = {};
    for (let pdesc of param_descriptors) {
      this.pdesc_map[pdesc.address] = pdesc;
    }
    this.pre_mod_norm_values = {};
    this.post_mod_norm_values = {};
  }

  load_dsp(dsp, code) {
    this.dsp = dsp;
    this.code = code;
  }

  get_patch_data() {
    let params = {};
    for (let [address, norm] of Object.entries(this.pre_mod_norm_values)) {
      let pdesc = this.pdesc_map[address];
      params[address] = this.denormalize(pdesc, norm);
    }
    let mods = [];
    for (let [address, source] of Object.entries(this.mod_source)) {
      if (source !== '-') {
        mods.push({
          "source": source,
          "amount": this.mod_amount[address],
          "param": address,
        });  
      }
    }
    return {
      code: this.code,
      params: params,
      mods: mods,
    }
  }

  // interface with ParamController
  // common to Synth and Mod engines
  set_premod_norm(address, value) {
    this.pre_mod_norm_values[address] = value;
  };

  // set_premod_denorm(address, value) {
  //   let pdesc = this.pdesc_map[address];
  //   let norm_val = this.normalize(pdesc, value);
  //   this.pre_mod_norm_values[address] = norm_val;
  // }

  set_mod_config(address, value) {
    this.mod_source[address] = value.source;
    this.mod_amount[address] = value.amount;
  }

  // get_premod_norm(address) {
  //   return this.pre_mod_norm_values[address];
  // }

  get_premod_denorm(address) {
    // return premod denormalized value (to be used by the UI sliders)
    let pdesc = this.pdesc_map[address];
    let norm_val = this.pre_mod_norm_values[address];
    return this.denormalize(pdesc, norm_val);
  }
  
  get_postmod_norm(address) {
    return this.post_mod_norm_values[address];
  }

  modulate(mod_values) {
    // read params, map to required values, push values to DSP
    for (let [address, pdesc] of Object.entries(this.pdesc_map)) {
      let value = this.pre_mod_norm_values[address];
      
      // compute modulation signal
      let mod_source = this.mod_source[address];
      let mod_signal = 0;
      if (mod_source !== undefined && mod_source !== '-') {
        mod_signal = mod_values[this.mod_source[address]];
        mod_signal *= this.mod_amount[address];
      }

      // apply modulation
      let headroom = (mod_signal < 0) ? value : (1 - value);
      value = value + mod_signal * headroom;
      this.post_mod_norm_values[address] = value;

      // denormalize
      value = this.denormalize(pdesc, value);

      // push parameter to DSP
      if (this.dsp) {
        this.dsp.setParamValue(address, value);
      }
    }
  }

  denormalize(pdesc, value) {
    // clip value to [0, 1]
    value = Math.min(1, Math.max(0, value));
    // denormalize based on descriptor settings
    if (pdesc.scale === 'linear') {
      return pdesc.min + (pdesc.max - pdesc.min) * value;
    } else if (pdesc.scale === 'log') {
      return pdesc.min * Math.pow(pdesc.max / pdesc.min, value);
    }
  }

  normalize(pdesc, value) {
    // clip value to [min, max]
    value = Math.min(pdesc.max, Math.max(pdesc.min, value));
    // normalize based on descriptor settings
    if (pdesc.scale === 'linear') {
      return (value - pdesc.min) / (pdesc.max - pdesc.min);
    } else if (pdesc.scale === 'log') {
      return Math.log(value / pdesc.min) / Math.log(pdesc.max / pdesc.min);
    }
  }
};


export class SynthEngine extends BaseEngine {
  constructor() {
    super();
  }
};


export class ModEngine extends BaseEngine {
  constructor() {
    super();
    this.out_names = [];
    this.outputs = {};
  }

  load_outputs(outputs) {
    this.out_names = outputs;
    for (let name of this.out_names) {
      this.outputs[name] = 0;
    }
  }

  process() {
    // modulate parameters
    this.modulate(this.outputs);
    
    // compute modulation DSP
    if (this.dsp) {
      this.dsp.process();

      // store outputs
      for (let [ix, name] of this.out_names.entries()) {
        this.outputs[name] = this.dsp.outputs[ix];
      }        
    }
  }

  get_patch_data() {
    let data = super.get_patch_data();
    data.scopes = ["-", "-", "-"];
    data.quant = {
      "interval": {
        "list": [0, 2, 4, 5, 7, 9, 11],
      }
    }
    return data;
  }
};
