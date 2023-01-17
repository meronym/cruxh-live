<script>
  import { audio } from './_audio.js';
  import SynthOscilloscope from './SynthOscilloscope.svelte';

</script>

<div class="monitor">
  <!-- <div class="controls">
    <h2>Audio Engine</h2>
  </div> -->

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
  .synth-scopes {
    /* background-color: #111; */
    width: 90%;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
  }
</style>
