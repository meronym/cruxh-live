import { writable } from 'svelte/store';


export class ParameterController {
  constructor(engine) {
    this.engine = engine;
    
    // map of input descriptors by address
    this.pdesc_map = {};

    this.stores = {
      // list of tabs, each tab has a list of parameter descriptors
      tabs: writable([]),

      // normalized parameter values
      norm_value: {},
      // parameter monitoring string (before modulation)
      monitor_pre: {},

      // list of modulator names
      modulators: writable([]),
      // modulation config (source, amount)
      mod_config: {},
      // normalized post-mod parameter value (UI hint for mod slider)
      mod_sig: {},
    };

    // store denormalized slider values so we can restore current position
    // after a reinitilization of the params
    this.denorm_value = {};
  }

  normalize(desc, value) {
    if (value < desc.min) {
      value = desc.min;
    } else if (value > desc.max) {
      value = desc.max;
    }
    if (desc.scale === 'linear') {
      return (value - desc.min) / (desc.max - desc.min);
    } else if (desc.scale === 'log') {
      return Math.log(value / desc.min) / Math.log(desc.max / desc.min);
    }
  }

  refresh_stores(pdesc) {
    let address = pdesc.address;
    // if we already have seen this input address before, make sure it's up to date
    if (address in this.stores.norm_value) {
      // make sure the norm value is rescaled according to current min/max values
      let value = this.normalize(pdesc, this.denorm_value[address]);
      this.stores.norm_value[address].set(value);
      // force an update cycle to update the monitor string
      this.on_norm_value_change(address, value);
    } else {
      let store_norm_value = writable(this.normalize(pdesc, pdesc.init));
      let store_monitor_pre = writable('');
      let store_mod_config = writable({
        source: '-',
        amount: 0,
      });
      let store_mod_sig = writable(0);

      this.stores.norm_value[address] = store_norm_value;
      this.stores.monitor_pre[address] = store_monitor_pre;
      this.stores.mod_config[address] = store_mod_config;
      this.stores.mod_sig[address] = store_mod_sig;

      store_norm_value.subscribe((value) => {
        this.on_norm_value_change(address, value);
      });
      store_mod_config.subscribe((value) => {
        this.on_mod_config_change(address, value);
      });
    }
  }

  on_norm_value_change(address, value) {
    let pdesc = this.pdesc_map[address];
    
    // push new value to engine and store denormalized value
    let denorm = this.engine.set_param(address, value);
    this.denorm_value[address] = denorm;

    // update the monitor string and push it to the store
    let denorm_str = denorm.toFixed(2);
    if (pdesc.unit) {
      denorm_str += ' ' + pdesc.unit;
    }
    this.stores.monitor_pre[address].set(denorm_str);
  }

  on_mod_config_change(address, value) {
    this.engine.set_mod_config(address, value);
  }

  load_tabs(raw_tabs) {
    let tabs = [];
    for (let tab of raw_tabs) {
      let tab_desc = {
        label: tab.label,
        params: [],
      }
      for (let pdesc of tab.params) {
        this.pdesc_map[pdesc.address] = pdesc;
        tab_desc.params.push({
          address: pdesc.address,
          label: pdesc.label,
        });
        this.refresh_stores(pdesc);
      }
      tabs.push(tab_desc);
    }
    // push new descriptors to the "tabs" store
    this.stores.tabs.set(tabs);
  }

  load_modulators(modulators) {
    // assumes modulators is an array and 
    // the first element is always '-' (no modulation)
    this.stores.modulators.set(modulators);
  }

  poll_param_mods() {
    for (let address of Object.keys(this.pdesc_map)) {
      let value = this.engine.post_mod_norm_values[address] || 0;
      this.stores.mod_sig[address].set(value);
    }
  }
};
