<script>
  import ModScope from './ModScope.svelte';
</script>

<div class="monitor">
  <div class="mod-scopes">
    <ModScope index=1/>
    <ModScope index=2/>
    <ModScope index=3/>
  </div>
  <div class="controls">
    <!-- <h2>Modulation</h2> -->
    <!-- <button>Pause</button> -->
  </div>
</div>

<style>
  .monitor {
    /* background-color: yellow; */
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .controls {
    width: 90%;
    height: 40px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    /* background-color: blueviolet; */
  }
  .controls h2 {
    /* background: red; */
    font-size: 20px;
    font-weight: 400;
  }
  .controls button {
    all: unset;
    height: 40px;
    font-family: inherit;
    font-size: 16px;
    font-weight: 400;
    background-color: #090909;
    margin: 0 20px;
    padding: 0 20px;
    transition: all 0.2s ease-out;
    border-radius: 2px 2px 0 0;
    border: 1px solid #333;
  }
  .controls button:hover {
    background-color: #111;
  }
  .mod-scopes {
    /* background-color: blue; */
    width: 90%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;;
    align-items: center;
  }
</style>
