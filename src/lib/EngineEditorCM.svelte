<script>
  import { onDestroy, onMount } from 'svelte';
  import { basicSetup } from 'codemirror';
  import { EditorView, keymap } from '@codemirror/view';
  import { EditorState } from '@codemirror/state';
  import { indentWithTab } from '@codemirror/commands';

  import { Faust } from './cm_lang_faust.js';
  import { theme } from './cm_theme_cruxh.js';

  import { cruxh } from './_cruxh.js';
  import { audio } from './_audio.js';

  export let eview;
  export let hidden; // boolean

  let error = null;

  let wrapper;
  let editor;
  let code = '';

  const state_extensions = [
    basicSetup,
    keymap.of([indentWithTab]),
    EditorView.lineWrapping,
    ...theme,
    Faust(),
    // EditorView.theme(styles),
  ];

  function create_editor_state(code) {
    return EditorState.create({
      doc: code ?? undefined,
      extensions: state_extensions,
    });
  }

  onMount(() => {
    editor = new EditorView({
      parent: wrapper,
      doc: code,
      extensions: state_extensions,
      dispatch(transaction) {
        editor.update([transaction]);
        if (transaction.docChanged) {
          // on_change();
          // console.log("doc changed");
        }
      },
    });
    editor.setState(create_editor_state(code));
  });

  onDestroy(() => editor?.destroy());

  if (eview.name == 'synth') {
    let unsub = cruxh.synth.stores.code.subscribe(value => {
      code = value;
      editor?.setState(create_editor_state(code));
    });
    onDestroy(unsub);
  } else {
    let unsub = cruxh.modulation.stores.code.subscribe(value => {
      code = value;
      editor?.setState(create_editor_state(code));
    });
    onDestroy(unsub);
  }

  async function onUpdate() {
    error = null;
    let value = editor.state.doc.toString();
    try {
      if (eview.name == 'synth') {
        let newSynth = await cruxh.buildSynth(value);
        if (cruxh.synth.engine) {
          newSynth.loadFrom(cruxh.synth.engine);
        }
        cruxh.synth.update(newSynth);
        await audio.setSynth(newSynth.dsp);
      } else {
        let newMod = await cruxh.buildModulation(value);
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

  function clearError() {
    error = null;
  }
</script>

<div class="wrapper" class:hidden>
  <div class="controls">
    <button on:click={onUpdate}>Update</button>
    <!-- <button disabled>Revert</button> -->
  </div>

  <div class="content">
    {#if error}
      <div class="error" on:click={clearError} on:keypress={clearError}>
        <p>{error}</p>
      </div>
    {/if}
    <div class="codemirror-wrapper" bind:this={wrapper} />
  </div>
</div>

<style>
  .wrapper {
    width: 100%;
    height: 100%;
    /* background-color: red; */
    display: flex;
    flex-direction: column;
  }

  .controls {
    /* background-color: yellow; */
    height: 40px;
    margin-right: 130px;
    margin-bottom: 4px;
    display: flex;
    flex-direction: row-reverse;
    justify-content: flex-start;
  }

  .content {
    /* background-color: brown; */
    background-color: rgba(19, 24, 27, 1);
    position: relative;
    border-radius: 4px;
    flex: 1;
    overflow: auto;
  }

  .codemirror-wrapper {
    /* background-color: blue; */
    width: 100%;
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
</style>
