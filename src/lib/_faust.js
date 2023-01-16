import { internalFaustWrapper, compile } from 'mosfez-faust';

class FaustSampleProcessor {
  constructor(wasm_instance, descriptor) {
    this.descriptor = descriptor;

    this.numIn = parseInt(this.descriptor.inputs);
    this.numOut = parseInt(this.descriptor.outputs);

    // pointers to input and output buffers
    this.ins = null;
    this.outs = null;

    // input and output data channels
    this.dspInChannnels = [];
    this.dspOutChannnels = [];

    // `outputs` stores the result of process(), one sample per channel
    this.outputs = new Float32Array(this.numOut);

    // Create the WASM instance
    this.wasm_instance = wasm_instance;
    this.factory = this.wasm_instance.exports;

    // Init memory
    this.init_memory();

    // Parse UI
    let parser = new UiParser(this.descriptor.ui);
    this.pathTable = parser.path_table;
  }

  init_memory() {
    // Memory allocator
    let ptr_size = 4;
    let sample_size = 4;
    
    this.HEAP = this.factory.memory.buffer;
    this.HEAP32 = new Int32Array(this.HEAP);
    this.HEAPF32 = new Float32Array(this.HEAP);
    
    // Start of HEAP index
    // DSP is placed first with index 0.
    this.dsp = 0;
    
    // Audio buffer start at the end of DSP.
    let audio_heap_ptr = parseInt(this.descriptor.size);

    // Setup pointers offset
    let audio_heap_ptr_inputs = audio_heap_ptr;
    let audio_heap_ptr_outputs = audio_heap_ptr_inputs + (this.numIn * ptr_size);

    // Setup buffer offset
    let audio_heap_inputs = audio_heap_ptr_outputs + (this.numOut * ptr_size);
    let audio_heap_outputs = audio_heap_inputs + (this.numIn * sample_size);

    if (this.numIn > 0) {
      this.ins = audio_heap_ptr_inputs;
      for (let i = 0; i < this.numIn; i++) {
        this.HEAP32[(this.ins >> 2) + i] = audio_heap_inputs + (sample_size * i);
      }

      // Prepare Ins buffer tables
      let dspInChans = this.HEAP32.subarray(this.ins >> 2, (this.ins + this.numIn * ptr_size) >> 2);
      for (let i = 0; i < this.numIn; i++) {
        this.dspInChannnels[i] = this.HEAPF32.subarray(dspInChans[i] >> 2, (dspInChans[i] + sample_size) >> 2);
      }
    }

    if (this.numOut > 0) {
      this.outs = audio_heap_ptr_outputs;
      for (let i = 0; i < this.numOut; i++) {
        this.HEAP32[(this.outs >> 2) + i] = audio_heap_outputs + (sample_size * i);
      }

      // Prepare Out buffer tables
      let dspOutChans = this.HEAP32.subarray(this.outs >> 2, (this.outs + this.numOut * ptr_size) >> 2);
      for (let i = 0; i < this.numOut; i++) {
        this.dspOutChannnels[i] = this.HEAPF32.subarray(dspOutChans[i] >> 2, (dspOutChans[i] + sample_size) >> 2);
      }
    }
  }

  init(sample_rate) {
    // Init DSP
    this.factory.init(this.dsp, sample_rate);
  }

  setParamValue(path, val) {
    this.HEAPF32[this.pathTable[path] >> 2] = val;
  }

  getParamValue(path) {
    return this.HEAPF32[this.pathTable[path] >> 2];
  }

  process(inputs) {
    inputs = inputs || [];
    
    // Check inputs
    if (inputs.length != this.numIn) {
      throw new Error(`process() requires ${this.numIn} input values`);
    }

    // Copy inputs
    for (let chan = 0; chan < this.numIn; ++chan) {
      this.dspInChannnels[chan].set([inputs[chan]]);
    }

    // Compute one sample
    try {
      this.factory.compute(this.dsp, 1, this.ins, this.outs);
    } catch(e) {
      console.log("ERROR in compute (" + e + ")");
    }

    // Copy outputs
    for (var chan = 0; chan < this.numOut; ++chan) {
      this.outputs[chan] = this.dspOutChannnels[chan][0];
    }
    return this.outputs;
  }
}

// Globals

const importObject = {
  env: {
    memoryBase: 0,
    tableBase: 0,

    // Integer version
    _abs: Math.abs,

    // Float version
    _acosf: Math.acos,
    _asinf: Math.asin,
    _atanf: Math.atan,
    _atan2f: Math.atan2,
    _ceilf: Math.ceil,
    _cosf: Math.cos,
    _expf: Math.exp,
    _floorf: Math.floor,
    _fmodf: function(x, y) { return x % y; },
    _logf: Math.log,
    _log10f: Math.log10,
    _max_f: Math.max,
    _min_f: Math.min,
    _remainderf: function(x, y) { return x - Math.round(x/y) * y; },
    _powf: Math.pow,
    _roundf: Math.fround,
    _sinf: Math.sin,
    _sqrtf: Math.sqrt,
    _tanf: Math.tan,
    _acoshf: Math.acosh,
    _asinhf: Math.asinh,
    _atanhf: Math.atanh,
    _coshf: Math.cosh,
    _sinhf: Math.sinh,
    _tanhf: Math.tanh,
    _isnanf: Number.isNaN,
    _isinff: function (x) { return !isFinite(x); },
    _copysignf: function (x, y) { return Math.sign(x) === Math.sign(y) ? x : -x; },    

    // Double version
    _acos: Math.acos,
    _asin: Math.asin,
    _atan: Math.atan,
    _atan2: Math.atan2,
    _ceil: Math.ceil,
    _cos: Math.cos,
    _exp: Math.exp,
    _floor: Math.floor,
    _fmod: function(x, y) { return x % y; },
    _log: Math.log,
    _log10: Math.log10,
    _max_: Math.max,
    _min_: Math.min,
    _remainder:function(x, y) { return x - Math.round(x/y) * y; },
    _pow: Math.pow,
    _round: Math.fround,
    _sin: Math.sin,
    _sqrt: Math.sqrt,
    _tan: Math.tan,
    _acosh: Math.acosh,
    _asinh: Math.asinh,
    _atanh: Math.atanh,
    _cosh: Math.cosh,
    _sinh: Math.sinh,
    _tanh: Math.tanh,
    _isnan: Number.isNaN,
    _isinf: function (x) { return !isFinite(x); },
    _copysign: function (x, y) { return Math.sign(x) === Math.sign(y) ? x : -x; },    

    table: new WebAssembly.Table({ initial: 0, element: 'anyfunc' })
  }
};


export class UiParser {
  constructor(ui_descriptor) {
    // takes in a json ui descriptor, as returned by the faust compiler
    this.ui_descriptor = ui_descriptor;
    
    // path table stores a dictionary of address: index pairs
    // for every input (slider, etc.) and output (bargraph) in the ui
    this.path_table = {};
    UiParser.parse_ui(this.ui_descriptor, this.path_table, UiParser.path_table);

    // params stores a flat list of all inputs (sliders, etc.) in the ui
    this.params = [];
    let tabs = UiParser.parse_ui(this.ui_descriptor, this.params, UiParser.collect_params);
    this.params = this.sanitize_params(this.params);
    // tabs stores a tree of depth 1, with the first level being the tabs and 
    // the second level being the param descriptors (in the same format as this.params[])
    this.tabs = this.sanitize_tabs(tabs);
  }

  // JSON parsing functions
  static parse_ui(ui, obj, callback) {
    let tabs = {
      active: "/",
      omap: { "/": [] },
      list: [{ label: "/", meta: [{ "-1": "" }]}],
    };
    for (var i = 0; i < ui.length; i++) {
      let group = ui[i];
      if (group.type === "tgroup") {
        tabs.active = group.label;
        if (!Object.hasOwn(tabs.omap, tabs.active)) {
          tabs.omap[tabs.active] = [];
          tabs.list.push(group);
        }
      }
      if (group.items) {
        UiParser.parse_items(group.items, obj, tabs, callback);
      }
      if (group.type === "tgroup") {
        tabs.active = "/";
      }
    }
    let keys = Object.keys(tabs.omap);
    for (let tab of keys) {
      if (tabs.omap[tab].length === 0) {
        delete tabs.omap[tab];
        tabs.list = tabs.list.filter((item) => item.label !== tab);
      }
    }
    return tabs;
  }

  static parse_items(items, obj, tabs, callback) {
    for (var i = 0; i < items.length; i++) {
      callback(items[i], obj, tabs, callback);
    }
  }

  static path_table(item, obj, tabs, callback) {
    if (item.type === "vgroup"
        || item.type === "hgroup"
        || item.type === "tgroup") {
      UiParser.parse_items(item.items, obj, tabs, callback);
    } else if (item.type === "hbargraph"
                || item.type === "vbargraph") {
      // Keep monitors (bargraph) adresses
      obj[item.address] = parseInt(item.index);
    } else if (item.type === "vslider"
                || item.type === "hslider"
                || item.type === "button"
                || item.type === "checkbox"
                || item.type === "nentry") {
      // Keep params adresses
      obj[item.address] = parseInt(item.index);
    }
  }

  static collect_params(item, obj, tabs, callback) {
    if (item.type === "vgroup" || item.type === "hgroup") {
      UiParser.parse_items(item.items, obj, tabs, callback);
    } else if (item.type === "tgroup") {
      let parent_tab = tabs.active;
      tabs.active = item.label;
      if (!Object.hasOwn(tabs.omap, tabs.active)) {
        tabs.omap[tabs.active] = [];
        tabs.list.push(item);
      }
      UiParser.parse_items(item.items, obj, tabs, callback);
      tabs.active = parent_tab;
    } else if (item.type === "vslider"
              || item.type === "hslider"
              || item.type === "button"
              || item.type === "checkbox"
              || item.type === "nentry") {
      obj.push(item);
      tabs.omap[tabs.active].push(item);
    }
  }

  sanitize_meta(meta) {
    // load position from meta into a dedicated field
    let sane_meta = {};
    for (let m of (meta || [])) {
      let key = Object.keys(m)[0];
      if (!isNaN(key)) {
        sane_meta["position"] = parseInt(key);
      } else {
        sane_meta[key] = m[key];
      }
    }
    return sane_meta;
  }

  sanitize_params(raw_items) {
    let items = [];
    for (let item of raw_items) {
      // parse meta into a saner format
      let meta = this.sanitize_meta(item.meta);
      items.push({
        label: item.label,
        address: item.address,
        init: item.init,
        min: item.min,
        max: item.max,
        scale: meta.scale || "linear",
        unit: meta.unit || "",
        position: meta.position || 0,
      });
    }
    items.sort((a, b) => a.position - b.position);
    return items;
  }

  sanitize_tabs(tabs) {
    let {omap, list} = tabs;

    // sanitize tab contents
    let sanitized_tabs = {};
    for (let [tab, params] of Object.entries(omap)) {
      sanitized_tabs[tab] = this.sanitize_params(params);
    }

    // sort tabs by position
    let ordered_tabs = [];
    for (let tab of list) {
      let meta = this.sanitize_meta(tab.meta);
      ordered_tabs.push({label: tab.label, position: meta.position || 0});
    }
    ordered_tabs.sort((a, b) => a.position - b.position);

    // build final tab list
    let final_tabs = [];
    for (let tab of ordered_tabs) {
      final_tabs.push({label: tab.label, params: sanitized_tabs[tab.label]});
    }
    return final_tabs;
  }
};

export class CodeParser {
  constructor(code) {
    // takes in a string of faust code
    this.code = code;
    this.input_names = [];
    this.output_names = [];
    this.parse_code();
  }

  parse_code() {
    let rx = /\s+process\s*(?:\(([\w\s,]*)\))?\s*=\s*\(?([\w\s,]+)\)?\s*with/m;
    let match = rx.exec(this.code);
    if (match) {
      let inputs = match[1];
      let outputs = match[2];
      if (inputs) {
        this.input_names = inputs.split(',').map(s => s.trim());
      }
      if (outputs) {
        this.output_names = outputs.split(',').map(s => s.trim());
      }
    }
  }
};


export async function buildFaustModulation(code, sample_rate=100, name='modengine') {
  let argv = ["-ftz", "2", "-I", "http://127.0.0.1:8000/../../libraries/"];
  let dsp = await internalFaustWrapper.compileCode(name, code, argv, true);
  if (!dsp) {
    throw new Error(internalFaustWrapper.error_msg);
  }
  let { instance, module } = await WebAssembly.instantiate(dsp.code, importObject);
  
  let helperCode = dsp.helpers + `\nreturn getJSON${name}();`;
  let desc = JSON.parse(new Function(helperCode)());
  // store wasm size for future reference
  desc.wasm_size = dsp.code.length;

  let fproc = new FaustSampleProcessor(instance, desc);
  fproc.init(sample_rate);
  
  let ui_parser = new UiParser(desc.ui);
  let code_parser = new CodeParser(code);
  
  return {
    code: code,
    dsp: fproc,
    params: ui_parser.params,
    tabs: ui_parser.tabs,
    outputs: code_parser.output_names,
  };
};


export async function buildFaustAudio(audioContext, code) {
  let node = await compile(audioContext, code);
  let ui_parser = new UiParser(node.ui);
  return {
    code: code,
    node: node,
    params: ui_parser.params,
    tabs: ui_parser.tabs,
  }
};


export const faustReady = internalFaustWrapper.ready;
