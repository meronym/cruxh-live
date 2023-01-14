<script>
import Modulation from "./lib/Modulation.svelte";
import Monitor from "./lib/ModMonitor.svelte";
import Synth from "./lib/Synth.svelte";
import SynthMonitor from "./lib/SynthMonitor.svelte";
import Sidebar from "./lib/Sidebar.svelte";
import Titlebar from "./lib/Titlebar.svelte";

import { modEngine, synthEngine } from "./lib/engine.js";

import { onMount } from 'svelte';

onMount(async () => {
  await new Promise(r => setTimeout(r, 1000));
  setInterval(() => {
    modEngine.process.bind(modEngine)();
  }, 10);
  setInterval(() => {
    modEngine.knobs.poll_param_mods.bind(modEngine.knobs)();
    synthEngine.knobs.poll_param_mods.bind(synthEngine.knobs)();
  }, 50);
});

</script>

<div class="app">
  <div class="sidebar">
    <Sidebar />
  </div>
  
  <div class="synth">
    <Synth />
  </div>

  <div class="title">
    <Titlebar />
  </div>
  
  <div class="mod">
    <Modulation />
  </div>

  <div class="synth-mon">
    <SynthMonitor />
  </div>

  <div class="mod-mon">
    <Monitor />
  </div>

</div>

<style>
  .app {
    width: 100%;
    height: 100vh;
    display: grid;
    grid-template-columns: 1fr 3fr 1fr;
    grid-template-rows: 1fr 60px 1fr;
    grid-template-areas:
      "sidebar mod mod-mon"
      "sidebar title title"
      "sidebar synth synth-mon";
  }

  .sidebar {
    grid-area: sidebar;
  }

  .title {
    grid-area: title;
    display: flex;
    justify-content: flex-start;
  }

  .synth {
    grid-area: synth;
    background-color: #000;
  }

  .mod {
    grid-area: mod;
    background-color: #000;
  }

  .synth-mon {
    grid-area: synth-mon;
  }

  .mod-mon {
    grid-area: mod-mon;
  }

</style>
