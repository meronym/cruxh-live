<script>
  import { cruxh } from "./_cruxh.js";
  import { onDestroy } from 'svelte';

  import RotKnob from './KnobRot.svelte';

  export let cfg;
  export let active;

  let modulators;
  let source = '-';
  let amount;

  let unsub = cruxh.modulation.stores.modulators.subscribe((value) => {
    if (value.find(x => x == source) === undefined) {
      cfg.update((value) => {
        value.source = '-';
        return value;
      });
    }
    modulators = value;
  });
  onDestroy(unsub);

  unsub = cfg.subscribe((value) => {
    source = value.source;
    active.set(source !== '-');
    amount = value.amount;
  });
  onDestroy(unsub);

  function updateSource() {
    cfg.update((value) => {
      value.source = source;
      active.set(source !== '-');
      return value;
    });
  }

  function updateAmount(event) {
    cfg.update((value) => {
      value.amount = event.detail.value;
      return value;
    });
  };
</script>

<RotKnob value={amount} active={active} on:change={updateAmount} />

<select bind:value={source} on:change={updateSource} class:faded={source === '-'}>
  {#each modulators as mod}
    <option value={ mod }>{ mod.replace('_', ' ').replace('-', '〜') }</option>
  {/each}
</select>

<style>
  select {  
    background-color: #090909;
    /* background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20256%20448%22%20enable-background%3D%22new%200%200%20256%20448%22%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E.arrow%7Bfill%3A%23fff%3B%7D%3C%2Fstyle%3E%3Cpath%20class%3D%22arrow%22%20d%3D%22M255.9%20168c0-4.2-1.6-7.9-4.8-11.2-3.2-3.2-6.9-4.8-11.2-4.8H16c-4.2%200-7.9%201.6-11.2%204.8S0%20163.8%200%20168c0%204.4%201.6%208.2%204.8%2011.4l112%20112c3.1%203.1%206.8%204.6%2011.2%204.6%204.4%200%208.2-1.5%2011.4-4.6l112-112c3-3.2%204.5-7%204.5-11.4z%22%2F%3E%3C%2Fsvg%3E%0A");
    background-position: right 10px center;
    background-repeat: no-repeat;
    background-size: auto 50%; */
    border: none;
    
    color: #fff;
    transition: color 0.2s ease;

    text-align: center;
    /* padding: 10px 30px 10px 10px; */
    margin-top: 10px;
    font-size: 16px;
    font-family: inherit;

    
    /* // disable default appearance */
    user-select: none;
    outline: none;
    appearance: none;
    -moz-appearance: none;
    -webkit-appearance: none;
  }

  .faded {
    color: #777;
  }

  select:hover {
    color: #fff;
  }
</style>
