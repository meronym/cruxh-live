<script>
  import Modulation from "./Modulation.svelte";
  import Synth from "./Synth.svelte";

  let active = 'audio';

  function setActive(label) {
    active = label;
  }
</script>


<div class="wrapper">
  <Synth hidden={active == 'mod'} />
  <Modulation hidden={active == 'audio'} />
  
  <div class="tabs">
    <button
      on:click={() => setActive('mod') }
      class:active={active == 'mod'}>
      CTRL
    </button>
    <button
      on:click={() => setActive('audio') }
      class:active={active == 'audio'}>
      AUDIO
    </button>
  </div>
  
</div>

<style>
  .wrapper {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .tabs {
    position: absolute;
    width: 200px;
    height: 40px;
    top: 0;
    left: 0;
    /* background-color: yellow; */
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
  }

  button {
    all: unset;
    flex: 1;
    height: 100%;
    text-align: center;
    font-family: inherit;
    font-size: 16px;
    font-weight: 400;
    background-color: #000;
    margin: 0;
    padding: 0;
    border-bottom: #000 2px solid;
    border-radius: 4px 4px 0 0;
    transition: all 0.2s ease-out;
  }

  button:hover {
    background-color: #111;
    border-color: #111;
  }

  button.active {
    font-weight: 600;
    background-color: #090909;
    border-color: #FFD56F;
    color: #FFD56F;
  }
</style>