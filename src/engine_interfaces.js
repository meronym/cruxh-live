

class BaseEngine {
  // interface with ParamController
  // common to Synth and Mod Engines
  set_premod_norm(address, value) {};
  set_mod_source(address, value) {};
  set_mod_amount(address, value) {};
  
  get_premod_label(address) {};
  get_postmod_norm(address) {};
}



// interface with PatchLoader
class SynthEngine {
  static load(patch) {
    return new SynthEngine(...);
  }
  
  get_patch_data() {
    return {
      code: this.code,
      params: {
        address: premod_denorm_value,
      }
    }
  }
}

class ModEngine {
  static load(patch) {
    return new ModEngine(...);
  }
  
  get_patch_data() {
    return {
      code: this.code,
      params: {
        address: premod_denorm_value,
      }
    }
  }

  get_mods_data() {
    return [
      {
        "source": "path/to/source",
        "amount": 0.5,
        "param": "path/to/param"
      },
      {
        "source": "path/to/source",
        "amount": 0.5,
        "param": "path/to/param"
      },
    ];
  }

  get_quant_data() {
    return {
      "scale": {
        "root": "C",
        "type": "major"
      },
      "interval": {
        "list": [0, 2, 4, 5, 7, 9, 11],
      }
    };
  }
}
