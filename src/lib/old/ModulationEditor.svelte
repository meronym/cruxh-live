<script>
  import { buildFaust } from '../fdsp.js';
  import { modEngine } from '../engine.js';
  import { mknobs } from '../kctrl.js';
  import { onMount } from 'svelte';

  let editor;
  let code = localStorage.getItem('modulation_code');
  
  async function run() {
    let {dsp, params, outputs} = await buildFaust(editor.value);
    modEngine.load_params(params);
    modEngine.load_outputs(outputs);
    modEngine.dsp = dsp;
    mknobs.load_params(params);
    mknobs.load_modulators(['-'].concat(outputs));
  }

  function save() {
    localStorage.setItem('modulation_code', editor.value);
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

  onMount(async () => {
    // FIXME: this is a hack to wait for the faust compiler module to load
    await new Promise(r => setTimeout(r, 1000));
    // compile the code on mount to laod the DSP object and UI
    await run();
  });

</script>

<div class="editor-wrapper">
  <textarea 
    bind:this={ editor } 
    on:input={ save }
    on:keydown={ keyDown }>{ code }</textarea>

    <div class="editor-controls">
      <button disabled>Revert</button>
      <button on:click={ run }>Update</button>
    </div>
</div>

<style>
  .editor-wrapper {
    height: 100%;
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: row;
    position: relative;
    margin-right: 4px;
  }

  .editor-controls {
    position: absolute;
    right: 10px;
    width: 200px;
    padding: 20px;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
  }

  button {
    height: 40px;
    width: 80px;
    margin: 5px;
    font-family: inherit;
    font-size: 16px;
  }

  textarea {
    height: 100%;
    width: 100%;
    resize: none;
    font-size: 16px;
    line-height: 22px;
    tab-size: 2;
    background-color: #000;
    color: #aaa;
    box-shadow: none;
    border: none;
    margin: 0px;
    padding: 10px;
    margin-left: 20px;
    box-sizing: border-box;
  }

  textarea:focus {
    color: #fff;
    outline: none;
  }
</style>
