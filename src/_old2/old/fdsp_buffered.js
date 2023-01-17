import { internalFaustWrapper } from 'mosfez-faust';

// Monophonic Faust DSP
class FaustProcessor {

    // JSON parsing functions
    static parse_ui(ui, obj, callback)
    {
        for (var i = 0; i < ui.length; i++) {
          FaustProcessor.parse_group(ui[i], obj, callback);
        }
    }

    static parse_group(group, obj, callback)
    {
        if (group.items) {
          FaustProcessor.parse_items(group.items, obj, callback);
        }
    }

    static parse_items(items, obj, callback)
    {
        for (var i = 0; i < items.length; i++) {
            callback(items[i], obj, callback);
        }
    }

    static parse_item2(item, obj, callback)
    {
        if (item.type === "vgroup"
            || item.type === "hgroup"
            || item.type === "tgroup") {
              FaustProcessor.parse_items(item.items, obj, callback);
        } else if (item.type === "hbargraph"
                   || item.type === "vbargraph") {
            // Keep bargraph adresses
            obj.outputs_items.push(item.address);
            obj.pathTable[item.address] = parseInt(item.index);
        } else if (item.type === "vslider"
                   || item.type === "hslider"
                   || item.type === "button"
                   || item.type === "checkbox"
                   || item.type === "nentry") {
            // Keep inputs adresses
            obj.inputs_items.push(item.address);
            obj.pathTable[item.address] = parseInt(item.index);
        }
    }

    constructor(wasm_module, json_descriptor) {
        this.json_object = json_descriptor;

        this.ins = null;
        this.outs = null;

        this.dspInChannnels = [];
        this.dspOutChannnels = [];

        this.numIn = parseInt(this.json_object.inputs);
        this.numOut = parseInt(this.json_object.outputs);

        // Memory allocator
        this.ptr_size = 4;
        this.sample_size = 4;

        // Create the WASM instance
        this.wasm_instance = new WebAssembly.Instance(wasm_module, importObject);
        this.factory = this.wasm_instance.exports;

        //console.log(this.HEAP);
        //console.log(this.HEAP32);
        //console.log(this.HEAPF32);

        // Parse UI
        this.pathTable = [];
        this.outputs_timer = 5;         // bargraph
        this.outputs_items = [];        // bargraph
        this.inputs_items = [];        
        FaustProcessor.parse_ui(this.json_object.ui, this, FaustProcessor.parse_item2);
    }

    init_memory(buffer_size) {
      // `buffer_size` is the number of samples to be computed per block
      this.buffer_size = buffer_size;
      
      this.HEAP = this.factory.memory.buffer;
      this.HEAP32 = new Int32Array(this.HEAP);
      this.HEAPF32 = new Float32Array(this.HEAP);
      
      // Start of HEAP index
      // DSP is placed first with index 0.
      this.dsp = 0;
      // Audio buffer start at the end of DSP.
      this.audio_heap_ptr = parseInt(this.json_object.size);

      // Setup pointers offset
      this.audio_heap_ptr_inputs = this.audio_heap_ptr;
      this.audio_heap_ptr_outputs = this.audio_heap_ptr_inputs + (this.numIn * this.ptr_size);

      // Setup buffer offset
      this.audio_heap_inputs = this.audio_heap_ptr_outputs + (this.numOut * this.ptr_size);
      this.audio_heap_outputs = this.audio_heap_inputs + (this.numIn * this.buffer_size * this.sample_size);

      if (this.numIn > 0) {
          this.ins = this.audio_heap_ptr_inputs;
          for (let i = 0; i < this.numIn; i++) {
              this.HEAP32[(this.ins >> 2) + i] = this.audio_heap_inputs + ((this.buffer_size * this.sample_size) * i);
          }

          // Prepare Ins buffer tables
          var dspInChans = this.HEAP32.subarray(this.ins >> 2, (this.ins + this.numIn * this.ptr_size) >> 2);
          for (let i = 0; i < this.numIn; i++) {
              this.dspInChannnels[i] = this.HEAPF32.subarray(dspInChans[i] >> 2, (dspInChans[i] + this.buffer_size * this.sample_size) >> 2);
          }
      }

      if (this.numOut > 0) {
          this.outs = this.audio_heap_ptr_outputs;
          for (let i = 0; i < this.numOut; i++) {
              this.HEAP32[(this.outs >> 2) + i] = this.audio_heap_outputs + ((this.buffer_size * this.sample_size) * i);
          }

          // Prepare Out buffer tables
          var dspOutChans = this.HEAP32.subarray(this.outs >> 2, (this.outs + this.numOut * this.ptr_size) >> 2);
          for (let i = 0; i < this.numOut; i++) {
              this.dspOutChannnels[i] = this.HEAPF32.subarray(dspOutChans[i] >> 2, (dspOutChans[i] + this.buffer_size * this.sample_size) >> 2);
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

    compute() {
      // Compute
      try {
        this.factory.compute(this.dsp, this.buffer_size, this.ins, this.outs);
      } catch(e) {
        console.log("ERROR in compute (" + e + ")");
      }
    }

    process(inputs, outputs, parameters) {
        var input = inputs[0];
        var output = outputs[0];

        // Check inputs
        if (this.numIn > 0 && (!input || !input[0] || input[0].length === 0)) {
            //console.log("Process input error");
            return true;
        }
        // Check outputs
        if (this.numOut > 0 && (!output || !output[0] || output[0].length === 0)) {
            //console.log("Process output error");
            return true;
        }

        // Copy inputs
        if (input !== undefined) {
            for (var chan = 0; chan < Math.min(this.numIn, input.length) ; ++chan) {
                var dspInput = this.dspInChannnels[chan];
                dspInput.set(input[chan]);
            }
        }
        
        /*
        TODO: sample accurate control change is not yet handled
        When no automation occurs, params[i][1] has a length of 1,
        otherwise params[i][1] has a length of NUM_FRAMES with possible control change each sample
        */

        // Update controls (possibly needed for sample accurate control)
        for (const path in parameters) {
            const paramArray = parameters[path];
            this.setParamValue(path, paramArray[0]);
        }

        // Compute
        try {
            this.factory.compute(this.dsp, this.buffer_size, this.ins, this.outs);
        } catch(e) {
            console.log("ERROR in compute (" + e + ")");
        }
        
        // Update bargraph
        // this.update_outputs();

        // Copy outputs
        if (output !== undefined) {
            for (var chan = 0; chan < Math.min(this.numOut, output.length); ++chan) {
                var dspOutput = this.dspOutChannnels[chan];
                output[chan].set(dspOutput);
            }
        }
    }

    // update_outputs() {
    //   // Send output values to the AudioNode
    //   if (this.outputs_items.length > 0 && this.output_handler && this.outputs_timer-- === 0) {
    //         this.outputs_timer = 5;
    //         for (var i = 0; i < this.outputs_items.length; i++) {
    //             this.output_handler(this.outputs_items[i], this.HEAPF32[this.pathTable[this.outputs_items[i]] >> 2]);
    //         }
    //     }
    // }
    
    // output_handler(path, value) {
    //   this.port.postMessage({ path: path, value: value }); 
    // };
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


export async function buildFaust(code, name='modengine', block_size=1, sample_rate=100) {
  console.log('Compiling...');
  let argv = ["-ftz", "2", "-I", "http://127.0.0.1:8000/../../libraries/"];
  let dsp = await internalFaustWrapper.compileCode(name, code, argv, true);
  if (!dsp) {
    throw new Error(internalFaustWrapper.error_msg);
  }
  let module = await WebAssembly.compile(dsp.code);
  let helperCode = dsp.helpers + `\nreturn getJSON${name}();`;
  let jsonDescriptor = JSON.parse(new Function(helperCode)());
  // store wasm size for future reference
  jsonDescriptor.wasm_size = dsp.code.length;
  let fproc = new FaustProcessor(module, jsonDescriptor);
  fproc.init_memory(block_size);
  fproc.init(sample_rate);
  return fproc;
};
