<script>
  import EnginePanel from "./EnginePanel.svelte";
  import { cruxh } from "./_cruxh.js";

  export let hidden;
</script>

<EnginePanel eview={cruxh.synth} hidden={hidden} position="bottom" />

<style>
</style>
