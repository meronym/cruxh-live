<script>
  import { audioGraph } from "./agraph.js";

  let playing = false;
  
  async function togglePlay() {
    if (playing) {
      await audioGraph.pause();
      playing = false;
    } else {
      await audioGraph.resume();
      playing = true;
    }
  }
</script>

<button on:click={togglePlay} class:paused={playing}>{ playing ? 'PAUSE' : 'PLAY' }</button>

<style>
  button {
    all: unset;
    height: 80%;
    width: 100px;
    text-align: center;
    font-family: inherit;
    font-size: 16px;
    font-weight: 600;
    margin: 0 20px;
    padding: 0 20px;
    border-radius: 2px;
    border: 1px solid;

    color: #090909;
    background-color: #FFD56F;
    border-color: #090909;
    transition: all 0.2s ease-out;
  }

  button:hover {
    background-color: #fff;
  }

  button.paused {
    color: #ddd;
    background-color: #090909;
    border-color: #333;
  }
  
  button:hover.paused {
    background-color: #111;
  }
</style>
