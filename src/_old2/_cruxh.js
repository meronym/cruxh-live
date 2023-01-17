import { buildFaustModulation, buildFaustAudio } from './_faust.js';
import { ParamController } from './_controller.js';
import { SynthEngine, ModEngine } from './_engine.js';
import { audio } from './_audio.js';


class CruxhApp {
  constructor() {
    this.synthEngine = new SynthEngine();
    this.modEngine = new ModEngine();
    
    this.synthParams = new ParamController(this.synthEngine);
    this.modParams = new ParamController(this.modEngine);

    this.patchName = "";
  }

  async loadPatch(patch) {
    // compile modulation code
    let mod = await this.buildMod(patch.modulation.code);
    // make sure all params defined in the patch have been
    // parsed/extracted by the compiler
    // compile synth code
    let synth = await this.buildSynth(patch.synth.code);
    // if both succeeded, update engines and UI
    this.patchName = patch.name;
    
    this.updateMod(mod);
    this.modParams.load_param_denorm_values(patch.modulation.params);
    this.modParams.load_mod_config(patch.modulation.mods);

    this.updateSynth(synth);
    this.synthParams.load_param_denorm_values(patch.synth.params);
    this.synthParams.load_modulators(['-'].concat(mod.outputs));
    this.synthParams.load_mod_config(patch.synth.mods);
  }

  updateMod(mod) {
    // mod is the output of this.buildModulation
    this.modEngine.load_params(mod.params);
    this.modEngine.load_outputs(mod.outputs);
    this.modEngine.load_dsp(mod.dsp, mod.code);
    this.modParams.load_tabs(mod.tabs);
    this.modParams.load_modulators(['-'].concat(mod.outputs));
    // TODO load modulation scope cfg
  }

  updateSynth(synth) {
    // synth is the output of this.buildSynth
    this.synthEngine.load_params(synth.params);
    this.synthEngine.load_dsp(synth.node, synth.code);
    this.synthParams.load_tabs(synth.tabs);
    audio.setSynth(synth.node);
  }

  async buildMod(code) {
    // compiles the code and returns the modulation details
    // (code, dsp, params, outputs, tabs) or throws an error
    let mod = await buildFaustModulation(code);
    return mod;
  }

  async buildSynth(code) {
    // compiles the code and returns the synth details
    // (code, node, params, tabs) or throws an error
    let synth = await buildFaustAudio(audio.ctx, code);
    return synth;
  }

  savePatch() {
    // saves the current state of the engines into a json object
    return {
      "name": this.patchName,
      "modulation": this.modEngine.get_patch_data(),
      "synth": this.synthEngine.get_patch_data()
    }
  }

  loop() {
    this.modEngine.process();
    this.synthEngine.modulate(this.modEngine.outputs);
  }
};

export const cruxh = new CruxhApp();
