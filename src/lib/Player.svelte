<script>
  import { audio } from "./_audio.js";
  import { cruxh } from "./_cruxh.js";
  
  let volume;
  let playing = false;
  
  function setVolume() {
    audio.setVolume(Math.pow(volume, 1.5));
  }

  async function togglePlay() {
    if (playing) {
      await cruxh.pause();
      playing = false;
    } else {
      await cruxh.resume();
      playing = true;
    }
  }
</script>

<div class="player">
  <button on:click={togglePlay} class:paused={playing}>{ playing ? 'PAUSE' : 'PLAY' }</button>

  <div class="volume">
    <input type="range" min="0" max="1" step="0.01" bind:value={volume} on:input={setVolume} />
  </div>
  
</div>

<style>
  .player {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    place-items: center;
    justify-content: center;
    /* background-color: red; */
  }

  button {
    all: unset;
    height: 50px;
    width: 100px;
    text-align: center;
    font-family: inherit;
    font-size: 16px;
    font-weight: 600;
    margin: 20px;
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
  
  .volume {
    width: 300px;
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

</style>
