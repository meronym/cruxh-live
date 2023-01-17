<script>
  import { onDestroy } from 'svelte';
  import { m_stores } from '../kctrl.js';

  import Knob from '../Knob.svelte';

  let knobs;

  let unsub = m_stores.params.subscribe((value) => {
    knobs = value;
  });
  
  onDestroy(unsub);
</script>

<div>
  {#each knobs as knob (knob.address)}
    <Knob 
      desc={knob}
      value={m_stores.norm_value[knob.address]}
      mon={m_stores.monitor_pre[knob.address]}
      mod_cfg={m_stores.mod_config[knob.address]}
      mod_sig={m_stores.mod_sig[knob.address]}
    />
  {/each}
</div>

<style>
  div {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    place-items: center;
  }
</style>
