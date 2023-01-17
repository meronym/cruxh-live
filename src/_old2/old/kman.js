import { writable } from 'svelte/store';

export class KnobDefinitionStore {
  constructor() {
    this.stores = {};
    this.label_stores = {};
    this.all_knobs = writable([]);
  }

  // [
  //   {
  //       "type": "vslider",
  //       "label": "f1",
  //       "address": "/FaustDSP/f1",
  //       "index": 262152,
  //       "meta": [
  //           {
  //               "1": ""
  //           },
  //           {
  //               "scale": "log"
  //           }
  //       ],
  //       "init": 1,
  //       "min": 0.1,
  //       "max": 10,
  //       "step": 0.01
  //   }
  // ]

  load(input_items) {
    let items = [];
    
    for (let item of input_items) {
      // parse meta into a saner format
      let meta = {};
      for (let m of (item.meta || [])) {
        let key = Object.keys(m)[0];
        if (!isNaN(key)) {
          key = parseInt(key);
          meta["position"] = key;
        } else {
          meta[key] = m[key];
        }
      }
      items.push({
        label: item.label,
        address: item.address,
        value: item.init,
        min: item.min,
        max: item.max,
        scale: meta.scale || "linear",
        position: meta.position || 0,
      });
    }
    items.sort((a, b) => a.position - b.position);

    this.stores = {};
    this.label_stores = {};
    for (let item of items) {
      this.stores[item.address] = writable(item);
      this.label_stores[item.label] = writable("-");
    }

    this.all_knobs.update(() => items.map((item) => item.address));
  }
  
  get(path) {
    return this.stores[path];
  }
}

export class SignalDefinitionStore {
  constructor() {
    this.stores = {};
    this.all_signals = writable([]);
  }

  load(output_items) {
    this.stores = {};
    for (let item of output_items) {
      this.stores[item] = writable(0);
    }
    this.all_signals.update(() => output_items);
  }

  get(name) {
    return this.stores[name];
  }
};

// export const knob_store = new KnobDefinitionStore();

// class KnobStore {
//   constructor() {
//     this.stores = {
//       f1: writable(0),
//       f2: writable(0),
//       pwm: writable(0),
//       omix: writable(0),
//       vcf: writable(0),
//       q: writable(0),
//       drive: writable(0),
//     };    
//   }

//   get(name) {
//     return this.stores[name];
//   }
// };