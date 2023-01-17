<script>
import Knob from "../Knob.svelte";

// export let synth;

// load knobs from synth definition

</script>

<div>
  <Knob name="f1" value={0} />
  <Knob name="f2" value={0} />
  <Knob name="pwm" value={0} />
  <Knob name="omix" value={0} />
  <Knob name="vcf" value={0} />
  <Knob name="q" value={0} />
  <Knob name="drive"value={0} />
</div>

<style>
  div {
    width: 100%;
    height: 40%;
    display: flex;
    flex-direction: row;
    place-items: center;
  }
</style>
