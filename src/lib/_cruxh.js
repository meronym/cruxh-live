import { writable } from 'svelte/store';

import { buildFaustModulation, buildFaustAudio } from './_faust.js';
import { EngineView } from './_view.js';
import { SynthEngine, ModulationEngine } from './_engine.js';
import { audio } from './_audio.js';


class CruxhApp {
  constructor() {
    this.patchName = "...";
    this.patchNameStore = writable(this.patchName);

    this.synth = new EngineView("synth");
    // this.synthEngine = null;
    
    this.modulation = new EngineView("modulation");
    // this.modEngine = null;
  }

  async loadPatch(patch) {
    // compile modulation code, returns a new ModEngine
    let newMod = await this.buildModulation(patch.modulation.code);
    // update state according to the patch
    newMod.load(patch.modulation.params, patch.modulation.mods);
    
    // compile synth code, returns a new SynthEngine
    let newSynth = await this.buildSynth(patch.synth.code);
    // update state according to the patch
    newSynth.load(patch.synth.params, patch.synth.mods);

    // TODO make sure all params defined in the patch have been
    // parsed/extracted by the compiler
    this.patchName = patch.name;
    this.patchNameStore.set(this.patchName);
    
    this.modulation.update(newMod);
    this.modulation.updateModSources(newMod.output_names);
    // this.modEngine = newMod;

    this.synth.update(newSynth);
    this.synth.updateModSources(newMod.output_names);
    // this.synthEngine = newSynth;
  }

  savePatch() {
    // saves the current state of the engines into a json object
    return {
      "name": this.patchName,
      "modulation": this.modulation.exportPatchData(),
      "synth": this.synth.exportPatchData()
    }
  }

  // loop() {
  //   this.modEngine.process();
  //   this.synthEngine.modulate(this.modEngine.outputs);
  // }

  async buildModulation(code) {
    // compiles the code and returns the modulation details
    // (code, dsp, params, outputs, tabs) or throws an error
    let mod = await buildFaustModulation(code);
    return new ModulationEngine(mod);
  }
  
  async buildSynth(code) {
    // compiles the code and returns the synth details
    // (code, dsp, params, tabs) or throws an error
    let synth = await buildFaustAudio(audio.ctx, code);
    return new SynthEngine(synth);
  }
};


export const cruxh = new CruxhApp();
