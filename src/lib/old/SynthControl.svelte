<script>
    import { player } from '../player.js';
    export let edit;

    function toggle() {
        $edit = !$edit;
    }
</script>

<div id="controls">
    <button disabled={$edit} on:click={toggle}>Editor</button>
    <button disabled={!$edit} on:click={toggle}>Controls</button>
</div>

<style>
    #controls {
        width: 100px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        place-items: center;
    }
</style>
