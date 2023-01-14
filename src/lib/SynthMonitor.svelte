<script>
  import { audioGraph } from './agraph.js';
  import SynthOscilloscope from './SynthOscilloscope.svelte';
  
  let volume;
  let playing = true;

  function setVolume() {
    audioGraph.setVolume(volume);
  }

  function togglePlay() {
    if (playing) {
      audioGraph.pause();
      playing = false;
    } else {
      audioGraph.resume();
      playing = true;
    }
  }
</script>

<div class="monitor">
  <div class="controls">
    <h2>Audio Engine</h2>
    <button on:click={togglePlay}>{ playing ? 'Pause' : 'Play' }</button>
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
  .controls h2 {
    /* background: red; */
    font-size: 20px;
    font-weight: 400;
  }
  .controls button {
    all: unset;
    height: 36px;
    font-family: inherit;
    font-size: 16px;
    font-weight: 400;
    background-color: #090909;
    margin: 0 20px;
    padding: 0 20px;
    transition: all 0.2s ease-out;
    border-radius: 2px 2px 0 0;
    border: 1px solid #333;
  }
  .controls button:hover {
    background-color: #111;
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
