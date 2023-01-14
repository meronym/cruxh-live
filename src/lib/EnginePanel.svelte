<script>
  import EngineEditor from "./EngineEditor.svelte";
  import EngineToggleSwitch from "./EngineToggleSwitch.svelte";
  import EngineUI from "./EngineUI.svelte";

  export let engine;
  export let position;

  let editMode = false;

  function changeEditMode(e) {
    editMode = e.detail;
  }
</script>


<div class="wrapper">
  <div class="mode-switch {position}">
    <EngineToggleSwitch on:change={ changeEditMode } />
  </div>

  <EngineEditor engine={engine} position={position} hidden={!editMode}/>
  <EngineUI engine={engine} position={position} hidden={editMode}/>

</div>


<style>
  .wrapper {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .mode-switch {
    position: absolute;
    width: 100px;
    height: 40px;
    background-color: #000;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .top {
    bottom: 0;
    right: 0;
  }

  .bottom {
    top: 0;
    right: 0;
  }

  .container {
    width: 100%;
    height: 100%;
  }

  .hidden {
    display: none;
  }
</style>
