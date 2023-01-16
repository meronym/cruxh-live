<script>
  import { audio } from './_audio.js';
  import SynthOscilloscope from './SynthOscilloscope.svelte';
  
  let volume;

  function setVolume() {
    audio.setVolume(Math.pow(volume, 1.5));
  }
</script>

<div class="monitor">
  <div class="controls">
    <!-- <h2>Audio Engine</h2> -->
  </div>
  <div class="volume">
    <input type="range" min="0" max="1" step="0.01" bind:value={volume} on:input={setVolume} />
  </div>
  <div class="synth-scopes">
    <SynthOscilloscope />
  </div>
</div>

<style>
  .monitor {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .controls {
    width: 90%;
    height: 40px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    /* justify-content: center; */
    align-items: center;
    /* background-color: blueviolet; */
  }
  
  .volume {
    width: 100%;
    height: 40px;
    display: flex;
    place-items: center;
    justify-content: center;
    /* background-color: green; */
  }
  .volume input {
    width: 90%;
    /* background: #d3d3d3; */
    /* background: goldenrod; */
    outline: none;
    opacity: 0.7;
    transition: opacity .2s;
  }
  .volume input:hover {
    opacity: 1;
  }

  .synth-scopes {
    /* background-color: #111; */
    width: 90%;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
  }
</style>
