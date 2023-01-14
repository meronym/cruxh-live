<script>
  import { createEventDispatcher } from "svelte";

  let checkbox;
  let dispatch = createEventDispatcher();

  function emit() {
    dispatch('change', checkbox.checked);
  }
</script>


<input bind:this={checkbox} type="checkbox" class="toggle" on:change={ emit }>


<style>
  * {
    box-sizing: border-box;
  }

  input[type="checkbox"] {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    -webkit-tap-highlight-color: transparent;
    cursor: pointer; 
  }
  
  input[type="checkbox"]:focus {
    outline: 0;
  }

  .toggle {
    /* unchecked background state */
    height: 32px;
    width: 52px;
    border-radius: 16px;
    display: inline-block;
    position: relative;
    margin: 0;
    border: 1px solid #444;
    background: #000;
    transition: all .2s ease; 
  }

  .toggle:after {
    /* unchecked knob state */
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #222;
    border: 1px solid #444;
    transition: all 0.2s cubic-bezier(0.5, 0.1, 0.75, 1.35);
  }

  .toggle:checked {
    /* checked background color */
    background: #ddd;
    border-color: #000;
  }

  .toggle:checked:after {
    /* checked knob state */
    background: #000;
    border-color: #000;
    transform: translatex(20px); 
  }
</style>
