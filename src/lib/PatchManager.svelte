<script>
  import { cruxh } from './_cruxh.js';

  function savePatch() {
    let data = JSON.stringify(cruxh.savePatch(), null, 2);
    
    const a = document.createElement('a');
    const file = new Blob([data], {type: 'application/json'});
    
    a.href = URL.createObjectURL(file);
    let slug = slugify(cruxh.patchName);
    a.download = `${slug}.json`;
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

  function slugify(str) {
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();
  
    // remove accents, swap ñ for n, etc
    var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
    var to   = "aaaaeeeeiiiioooouuuunc------";
    for (var i=0, l=from.length ; i<l ; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // collapse whitespace and replace by -
        .replace(/-+/g, '-'); // collapse dashes

    return str;
  }

</script>

<div>
  <button on:click={savePatch}>Save Patch</button>
  
  <label class="file-upload">
    <input type="file" on:input={ loadPatch } />  
    <span>Load Patch</span>
  </label>
  
</div>

<style>
  div {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  input[type="file"] {
    display: none;
  }

  .file-upload {
    height: 50px;
    width: 100px;
    display: flex;
    justify-content: center;
    align-items: center;

    font-family: inherit;
    font-size: 16px;
    font-weight: 600;
    margin: 20px;
    padding: 0 20px;
    border-radius: 4px;
    border: 1px solid #444;

    color: #ddd;
    transition: all 0.2s ease-out;
  }

  .file-upload:hover {
    background: #111;
  }

  button {
    all: unset;
    height: 50px;
    width: 100px;
    text-align: center;
    font-family: inherit;
    font-size: 16px;
    font-weight: 600;
    margin: 20px;
    padding: 0 20px;
    border-radius: 4px;
    border: 1px solid #444;

    color: #ddd;
    transition: all 0.2s ease-out;
  }

  button:hover {
    /* color: #FFD56F; */
    /* background-color: #FFD56F; */
    background-color: #111;
  }

</style>
