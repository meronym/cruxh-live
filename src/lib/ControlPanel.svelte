<script>
  import EnginePanel from './EnginePanel.svelte';
  import { cruxh } from './_cruxh.js';

  let active = 'audio';

  function setActive(label) {
    active = label;
  }
</script>

<div class="wrapper">
  <EnginePanel eview={cruxh.synth} hidden={active == 'mod'} position="bottom" />
  <EnginePanel eview={cruxh.modulation} hidden={active == 'audio'} position="bottom" />

  <div class="tabs">
    <button on:click={() => setActive('mod')} class:active={active == 'mod'}> CTRL </button>
    <button on:click={() => setActive('audio')} class:active={active == 'audio'}> AUDIO </button>
  </div>
</div>

<style>
  .wrapper {
    width: 100%;
    height: 100%;
    /* overflow: hidden; */
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
    border-color: #ffd56f;
    color: #ffd56f;
  }
</style>
