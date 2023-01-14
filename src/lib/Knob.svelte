<script>
  import KnobMod from './KnobMod.svelte';
  import ModPreview from './KnobModPreview.svelte';

  export let position;
  export let desc;
  export let value;
  export let mon;
  export let mod_cfg;
  export let mod_sig;

</script>


<div class="knob {position}">

  <div class="label {position}">
    <p class="name">{ desc.label }</p>
    <p>{ $mon }</p>  
  </div>

  <div class="slider">
    <input type="range" bind:value={ $value } min="0" max="1" step="0.01"/> 
    <ModPreview sig={mod_sig} />
  </div>

  <div class="mod {position}">
    <KnobMod cfg={mod_cfg} />
  </div>

</div>


<style>
  .knob {
    height: 100%;
    /* background: #333; */
    display: grid;
    grid-template-rows: 1fr 2fr 1fr;
  }

  .top {
    grid-template-areas:
      "label"
      "slider"
      "mod";
  }

  .bottom {
    grid-template-areas:
      "mod"
      "slider"
      "label";
  }

  .label {
    grid-area: label;
    display: flex;
    flex-direction: column;
    align-items: center;
    /* background-color: #000; */
  }

  .label.top {
    justify-content: flex-end;
  }

  .label.bottom {
    justify-content: flex-start;
  }

  .label p {
    margin: 2px;
  }

  .slider {
    grid-area: slider;
    padding: 10px 0;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    /* background-color: #000; */
  }

  .mod {
    grid-area: mod;
    display: flex;
    flex-direction: column;
    align-items: center;
    /* background-color: #000; */
  }

  .mod.top {
    justify-content: flex-start;
  }

  .mod.bottom {
    justify-content: flex-end;
  }

  input[type="range"] {
    -webkit-appearance: slider-vertical;
    padding: 0 10px;
    width: 20px;
    height: 100%;
    background: #d3d3d3;
    outline: none;
    opacity: 0.7;
    transition: opacity .2s;
    -webkit-transition: .2s;
  }
  
  input[type="range"]:hover {
    opacity: 1;
  }

  .name {
    font-weight: 600;
  }

</style>
