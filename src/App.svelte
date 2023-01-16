<script>
import Modulation from "./lib/Modulation.svelte";
import Monitor from "./lib/ModMonitor.svelte";
import Synth from "./lib/Synth.svelte";
import SynthMonitor from "./lib/SynthMonitor.svelte";
import Sidebar from "./lib/Sidebar.svelte";
import Titlebar from "./lib/Titlebar.svelte";
import Player from "./lib/Player.svelte";

import { onMount } from 'svelte';

import { cruxh } from "./lib/_cruxh.js";
import { faustReady } from "./lib/_faust.js";

onMount(async () => {
  await faustReady;
  // setInterval(() => {
  //   cruxh.loop.bind(cruxh)();
  // }, 10);
  // setInterval(() => {
  //   cruxh.modParams.poll_param_mods.bind(cruxh.modParams)();
  //   cruxh.synthParams.poll_param_mods.bind(cruxh.synthParams)();
  // }, 50);
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
  
  <div class="player">
    <Player />
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
      "sidebar title player"
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

  .player {
    grid-area: player;
    display: flex;
    justify-content: center;
    align-items: center;
    /* background-color: antiquewhite; */
  }

  .synth {
    grid-area: synth;
    /* background-color: #000; */
  }

  .mod {
    grid-area: mod;
    /* background-color: #000; */
  }

  .synth-mon {
    grid-area: synth-mon;
  }

  .mod-mon {
    grid-area: mod-mon;
  }

</style>
