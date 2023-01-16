import { writable } from 'svelte/store';


export class EngineView {
  constructor(name) {
    this.name = name; // "synth" or "modulation"

    this.engine = null;

    this.stores = {
      // list of tabs, each tab has a list of parameter descriptors
      tabs: writable([]),

      // list of modulator names (mod select dropdowns)
      modulators: writable([]),

      // dsp code
      code: writable(""),
      
      // normalized parameter values (slider updates)
      norm_value: {},
      
      // parameter monitoring string (slider labels)
      monitor_pre: {},

      // modulation config - source, amount (mod select dropdowns)
      mod_config: {},

      // normalized post-mod parameter value (mod signal slider monitor)
      mod_sig: {},
    };
  }

  update(engine) {
    // loads a new engine object
    this.engine = engine;
    
    // push dsp code to the UI
    this.stores.code.set(this.engine.code);

    // update stores for each parameter
    for (let address of Object.keys(this.engine.descriptors)) {
      this._updateStores(address);
    }

    // push new tabs definition to the UI
    this.stores.tabs.set(engine.tabs);
  }

  updateModSources(modSources) {
    // to be executed after `update(engine)`
    // first, make sure the first element of modSources is always '-' (no modulation)
    if (modSources[0] !== '-') {
      modSources.unshift('-');
    }
    // then make sure the mod_config.source of each parameter is in the modSources list
    for (let address of Object.keys(this.engine.descriptors)) {
      let mod_config = this.engine.get_mod_config(address);
      if (!modSources.includes(mod_config.source)) {
        mod_config.source = '-';
        this.engine.set_mod_config(address, mod_config);
        // notify the UI
        this.stores.mod_config[address].set(mod_config);
      }
    }
    this.stores.modulators.set(modSources);
  }

  _updateStores(address) {
    // monitor_pre: parameter monitoring string (slider labels)
    let label = this.engine.get_premod_label(address);
    this._createOrUpdateStore('monitor_pre', address, label, null);

    // mod_sig: normalized post-mod parameter value (mod signal slider monitor)
    let mod_sig = this.engine.get_postmod_norm(address);
    this._createOrUpdateStore('mod_sig', address, mod_sig, null);

    // norm_value: normalized parameter values (slider position)
    let value = this.engine.get_premod_norm(address);
    this._createOrUpdateStore('norm_value', address, value, (value) => {
      this.engine.set_premod_norm(address, value);
      let label = this.engine.get_premod_label(address);
      this.stores.monitor_pre[address].set(label);
    });

    // mod_config: modulation config - source, amount (mod select dropdowns)
    let mod_config = this.engine.get_mod_config(address);
    this._createOrUpdateStore('mod_config', address, mod_config, (value) => {
      this.engine.set_mod_config(address, value);
    });
  }

  _createOrUpdateStore(storeName, address, value, cb) {
    if (address in this.stores[storeName]) {
      this.stores[storeName][address].set(value);
    } else {
      this.stores[storeName][address] = writable(value);
    }
    if (cb) {
      this.stores[storeName][address].subscribe(cb);
    }
  }

  exportPatchData() {
    if (this.engine) {
      return this.engine.exportPatchData();
    }
  }

  poll_param_mods() {
    if (this.engine) {
      for (let address of Object.keys(this.engine.descriptors)) {
        let value = this.engine.get_postmod_norm(address) || 0;
        this.stores.mod_sig[address].set(value);
      }
    }
  }
};
