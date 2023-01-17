<script>
  import { cruxh } from "./_cruxh.js";
  import { onDestroy } from "svelte";
  import { audio } from "./_audio.js";

  export let eview;
  export let position;  // "top" or "bottom"
  export let hidden;    // boolean

  let editor;
  let code = '';
  let error = null;

  if (eview.name == "synth") {
    let unsub = cruxh.synth.stores.code.subscribe((value) => {
      code = value;
    });
    onDestroy(unsub);
  } else {
    let unsub = cruxh.modulation.stores.code.subscribe((value) => {
      code = value;
    });
    onDestroy(unsub);
  }

  async function onUpdate() {
    error = null;
    try {
      if (eview.name == "synth") {
        let newSynth = await cruxh.buildSynth(editor.value);
        if (cruxh.synth.engine) {
          newSynth.loadFrom(cruxh.synth.engine);
        }
        cruxh.synth.update(newSynth);
        audio.setSynth(newSynth.dsp);
      } else {
        let newMod = await cruxh.buildModulation(editor.value);
        if (cruxh.modulation.engine) {
          newMod.loadFrom(cruxh.modulation.engine);
        }
        cruxh.modulation.update(newMod);
        cruxh.modulation.updateModSources(newMod.output_names);
        cruxh.synth.updateModSources(newMod.output_names);
      }
    } catch (e) {
      console.error(e);
      error = e;
    }
  }

  function keyDown(e) {
    if (e.key == 'Tab') {
      e.preventDefault();
      var start = editor.selectionStart;
      var end = editor.selectionEnd;

      // set textarea value to: text before caret + tab + text after caret
      this.value = editor.value.substring(0, start) +
        "\t" + editor.value.substring(end);

      // put caret at right position again
      editor.selectionStart =
        editor.selectionEnd = start + 1;
    }
  }

  function clearError() {
    error = null;
  }

</script>



<div class="wrapper {position}" class:hidden={hidden}>
  
  <div class="content">
    {#if error}
      <div class="error" on:click={clearError} on:keypress={clearError}>
        <p>{error}</p>
      </div>
    {/if}
    <textarea 
    bind:this={editor} 
    on:input={clearError}
    on:keydown={keyDown}>{code}</textarea>
  </div>
  
  <div class="controls">
    <button on:click={onUpdate} class={position}>Update</button>
    <button class={position} disabled>Revert</button>
  </div>

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
      "controls";
  }

  .bottom {
    grid-template-rows: 40px 1fr;
    grid-template-areas:
      "controls"
      "content";
  }

  .content {
    grid-area: content;
    background-color: #000;
    overflow-x: hidden;
    overflow-y: hidden;
    position: relative;
    border-radius: 4px;
    /* border: 1px solid #222; */
  }

  .controls {
    grid-area: controls;
    /* background-color: blue; */
    margin-right: 130px;
    display: flex;
    flex-direction: row-reverse;
    justify-content: flex-start;
  }

  .error {
    color: red;
    font-size: 14px;
    flex: 1;
    padding-left: 10px;
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    z-index: 1;
    position: absolute;
    background: #000;
  }

  textarea {
    height: 100%;
    width: 100%;
    border: 0;
    margin: 0;
    padding: 10px;
    resize: none;
    font-size: 15px;
    line-height: 24px;
    tab-size: 2;
    background-color: #090909;
    color: #aaa;
    box-shadow: none;
    box-sizing: border-box;
    transition: color 0.2s ease;
  }

  textarea:focus {
    color: #eee;
    outline: none;
  }

  .hidden {
    display: none;
  }

  button {
    all: unset;
    font-family: inherit;
    font-size: 16px;
    font-weight: 400;
    color: #aaa;
    background-color: #000;
    margin: 0 10px;
    padding: 0 20px;
    transition: all 0.2s ease-out;
    /* border-radius: 2px 2px 0 0; */
    /* border: 1px solid #333; */
  }

  button:hover {
    /* background-color: #111; */
    color: #fff;
  }

  button:focus {
    font-weight: 600;
  }

  button.top {
    border-top: none;
  }

  button.bottom {
    border-bottom: none;
  }

</style>
