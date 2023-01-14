<script>
  import { onDestroy } from 'svelte';
  import { s_stores } from '../kctrl.js';

  import Knob from '../Knob.svelte';

  let knobs;

  let unsub = s_stores.params.subscribe((value) => {
    knobs = value;
  });
  onDestroy(unsub);

</script>

<div>
  {#each knobs as knob (knob.address)}
    <Knob 
      desc={knob}
      value={s_stores.norm_value[knob.address]}
      mon={s_stores.monitor_pre[knob.address]}
      mod_cfg={s_stores.mod_config[knob.address]}
      mod_sig={s_stores.mod_sig[knob.address]}
    />
  {/each}
</div>

<style>
  div {
    height: 100%;
    display: flex;
    flex-direction: row;
    place-items: center;
  }
</style>
