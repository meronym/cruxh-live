<script>
import ControlPanel from "./lib/ControlPanel.svelte";
import ModMonitor from "./lib/ModMonitor.svelte";
import SynthMonitor from "./lib/SynthMonitor.svelte";
import PatchManager from "./lib/PatchManager.svelte";
import Titlebar from "./lib/Titlebar.svelte";
import Player from "./lib/Player.svelte";

import { onMount } from 'svelte';

import { cruxh } from "./lib/_cruxh.js";
import { faustReady } from "./lib/_faust.js";
import { defaultPatch } from './lib/_patch.js';

onMount(async () => {
  await faustReady;
  cruxh.loadPatch(defaultPatch);
  setInterval(() => {
    cruxh.loop.bind(cruxh)();
  }, 10);
  setInterval(() => {
    cruxh.modulation.poll_param_mods.bind(cruxh.modulation)();
    cruxh.synth.poll_param_mods.bind(cruxh.synth)();
  }, 50);
});

</script>

<div class="app">
  <div class="leftbar">
    <PatchManager />
  </div>
  
  <div class="cpanel">
    <ControlPanel />
  </div>

  <div class="title">
    <Titlebar />
  </div>
  
  <div class="player">
    <Player />
  </div>

  <div class="synth-mon">
    <SynthMonitor />
  </div>

  <div class="mod-mon">
    <ModMonitor />
  </div>

  <div class="rightbar">
  </div>
</div>

<style>
  .app {
    width: 100%;
    height: 100vh;
    display: grid;
    grid-template-columns: 1fr 3fr 1fr;
    grid-template-rows: 1fr 2fr 5fr;
    grid-template-areas:
      "leftbar title rightbar"
      "leftbar player rightbar"
      "mod-mon cpanel synth-mon";
  }

  .leftbar {
    grid-area: leftbar;
    /* background-color: blueviolet; */
  }

  .rightbar {
    grid-area: rightbar;
    /* background-color: darkslategray; */
  }

  .title {
    grid-area: title;
    display: flex;
    justify-content: flex-start;
    /* background-color: brown; */
  }

  .player {
    grid-area: player;
    display: flex;
    justify-content: center;
    align-items: center;
    /* background-color: blue; */
  }

  .cpanel {
    grid-area: cpanel;
    /* background-color: #000; */
  }


  .synth-mon {
    grid-area: synth-mon;
    /* background-color: #333; */
  }

  .mod-mon {
    grid-area: mod-mon;
    /* background-color: dimgrey; */
  }

</style>
