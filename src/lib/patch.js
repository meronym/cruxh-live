import { modEngine, synthEngine } from './engine.js';

class PatchManager {
  constructor() {
  }

  save_patch() {
    // saves the current state of the engine into a json object
    let patch = {
      "name": "Untitled",
      "code": {
        "modulation": synthEngine.node.code,
        "synth": synthEngine.node.code
      },
      "modulation": {
        "params": {
          "path/to/param": denormalized_value,
          "path/to/param": denormalized_value
        },
        "mods": [
          {
            "source": "path/to/source",
            "amount": 0.5,
            "param": "path/to/param"
          },
          {
            "source": "path/to/source",
            "amount": 0.5,
            "param": "path/to/param"
          }
        ]
      },
      "synth": {
        "params": {
          "path/to/param": denormalized_value,
          "path/to/param": denormalized_value
        },
        "mods": [
          {
            "source": "path/to/source",
            "amount": 0.5,
            "param": "path/to/param"
          }
        ]
      }
    };
    return patch;
  }

  load_patch() {
    // receives a json object describing a patch
    // validates that the patch can be loaded by the current engine
    // then loads the patch into the engine
    // and updates the UI
  }

}
