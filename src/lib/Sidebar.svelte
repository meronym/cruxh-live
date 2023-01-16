<script>
  import cruxhLogo from '../assets/CRUXH.svg';
  import { cruxh } from './_cruxh.js';

  function savePatch() {
    let data = JSON.stringify(cruxh.savePatch(), null, 2);
    
    const a = document.createElement('a');
    const file = new Blob([data], {type: 'application/json'});
    
    a.href = URL.createObjectURL(file);
    a.download = 'patch.json';
    a.click();

    URL.revokeObjectURL(a.href);
  }

  async function loadPatch(evt) {
    const [file] = evt.target.files
    if (!file) return;
    evt.target.value = null;
    let data = await file.text();
    data = JSON.parse(data);
    cruxh.loadPatch(data);
  }

</script>

<div class="logo">
  <img src={cruxhLogo} alt="CRUXH" />
</div>

<button on:click={savePatch}>Save</button>

<input type="file" on:input={ loadPatch } />

<!-- <button on:click={loadPatch}>Load</button> -->

<style>
  .logo {
    width: 100%;
    display: flex;
    justify-content: center;
    /* align-items: flex-start; */
    align-items: center;
    height: 20%;
    /* margin-top: 20px; */
  }

  .logo img {
    height: 40px;
  }
</style>
