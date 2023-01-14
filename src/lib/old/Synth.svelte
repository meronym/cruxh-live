<script>
import SynthControl from "./SynthControl.svelte";
import SynthKnobs from "./SynthKnobs.svelte";
import {writable} from 'svelte/store';
import { onDestroy } from 'svelte';
import SynthEditor from "./SynthEditor.svelte";

let editMode = writable(true);

let unsub = editMode.subscribe((value) => {
    console.log("editMode: " + value);
});

onDestroy(unsub);

</script>

<div id="synth">
    {#if $editMode}
        <SynthEditor />
    {:else}
        <SynthKnobs />
    {/if}
    <SynthControl edit={ editMode }/>
</div>

<style>
  #synth {
    width: 100%;
    height: 40%;
    margin: 10px;
    display: flex;
    flex-direction: row;
    place-items: center;
  }
</style>
