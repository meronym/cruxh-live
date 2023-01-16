<script>
  import cruxhLogo from '../assets/CRUXH.svg';
  import { cruxh } from './_cruxh.js';

  import { onDestroy } from 'svelte';

  let patchName;

  let unsub = cruxh.patchNameStore.subscribe((value) => {
    patchName = value;
  });
  onDestroy(unsub);

</script>

<div class="title">
  <!-- <img src={cruxhLogo} alt="CRUXH" /> -->
  <h1>{patchName}</h1>
</div>

<style>
  .title {
    width: 100%;
    display: flex;
    /* justify-content: center; */
    justify-content: flex-start;
    /* justify-content: flex-end; */
    /* align-items: flex-start; */
    align-items: center;
    height: 100%;
    /* margin-top: 20px; */
  }

  h1 {
    font-size: 1.7em;
    font-weight: 600;
    color: #ddd;
    margin: 0;
    padding: 0;
  }
  
  img {
    height: 40px;
  }
</style>
