<script>
  import Knob from './Knob.svelte';
  import { onDestroy } from 'svelte';
  
  export let stores;
  export let position;
  export let hidden;
  
  let tabs;
  let active = null;

  let unsub = stores.tabs.subscribe((value) => {
    // if the active tab is gone, switch to the first tab from the new list
    if (value.find(x => x == active) === undefined) {
      if (value.length > 0)
        active = value[0].label;
    }
    tabs = value;
  });
  onDestroy(unsub);

  function setActive(label) {
    active = label;
  }

</script>

<div class="wrapper { position }" class:hidden={hidden}>
  
  <div class="tabs">
    {#each tabs as tab (tab.label)}
      <button
        on:click={() => setActive(tab.label) }
        class:active={active == tab.label}
        class={position}>
        {tab.label}
      </button>
    {/each}
  </div>
  
  {#each tabs as tab (tab.label)}
    <div class="content" class:hidden={tab.label !== active}>
      {#each tab.params as knob (knob.address)}
      <Knob 
        desc={knob}
        value={stores.norm_value[knob.address]}
        mon={stores.monitor_pre[knob.address]}
        mod_cfg={stores.mod_config[knob.address]}
        mod_sig={stores.mod_sig[knob.address]}
        position={position}
      />
      {/each}
    </div>
  {/each}
</div>

<style>
  .wrapper {
    width: 100%;
    height: 100%;
    display: grid;
  }

  .top {
    grid-template-rows: 1fr 40px;
    grid-template-areas:
      "content"
      "tabs";
  }

  .bottom {
    grid-template-rows: 40px 1fr;
    grid-template-areas:
      "tabs"
      "content";
  }

  .content {
    grid-area: content;
    background-color: #090909;
    overflow-x: auto;
    overflow-y: hidden;
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    border-radius: 4px;
    /* border: 1px solid #222; */
  }

  .tabs {
    grid-area: tabs;
    background-color: #000;
    margin-right: 130px;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
  }

  .hidden {
    display: none;
  }

  button {
    all: unset;
    font-family: inherit;
    font-size: 16px;
    font-weight: 400;
    background-color: #000;
    margin: 0 2px;
    padding: 0 16px;
    transition: all 0.2s ease-out;
  }

  button.top {
    border-bottom: #000 1px solid;
    border-radius: 0 0 4px 4px;
  }

  button.bottom {
    border-top: #000 1px solid;
    border-radius: 4px 4px 0 0;
  }

  button:hover {
    background-color: #111;
    border-color: #111;
  }

  button.active {
    font-weight: 600;
    background-color: #090909;
    border-color: #777;
  }

</style>
