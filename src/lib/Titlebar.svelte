<script>
  import cruxhLogo from '../assets/CRUXH.svg';
  import { cruxh } from './_cruxh.js';

  import { onDestroy } from 'svelte';

  let patchName;

  let unsub = cruxh.patchNameStore.subscribe((value) => {
    patchName = value;
  });
  onDestroy(unsub);

  function update(e) {
    cruxh.patchNameStore.set(e.target.value);
  }

</script>

<div class="title">
  <img src={cruxhLogo} alt="CRUXH" />
  <input type="text" class="name" value={patchName} on:change={update}/>
  <!-- <h2>Patch description here</h2> -->
</div>

<style>
  .title {
    width: 100%;
    display: flex;
    flex-direction: column;
    /* justify-content: center; */
    justify-content: space-evenly;
    /* align-items: flex-start; */
    align-items: center;
    height: 100%;
    /* margin-top: 20px; */
  }

  input.name {
    font-family: inherit;
    font-size: 1.7em;
    font-weight: 600;
    text-align: center;
    color: #ddd;
    border: none;
    background: none;
    width: 100%;
    margin: 0;
    padding: 10px;
    border: 1px solid #000;
    border-radius: 4px;
    transition: all 0.2s ease;
  }
  
  input.name:hover {
    border-color: #444;
  }

  input.name:focus {
    outline: none;
    border-color: #FFD56F;
  }

  h2 {
    font-size: 1.2em;
    font-weight: 400;
    color: #777;
    margin: 0;
    padding: 0;
  }
  
  img {
    height: 40px;
    margin: 20px;
  }
</style>
