<script>
  import { createEventDispatcher } from "svelte";
  
  export let title;
  export let position;

  let active = 'ui';

  const dispatch = createEventDispatcher();

  function toggle() {
    active = (active === 'ui') ? 'edit' : 'ui';
    dispatch('change', active);
  }

  function save() {
    console.log('sending update');
    dispatch('update');
  }
</script>

<div class="tab-headers {position === 'top' ? 'ptop' : 'pbottom'}">
  <button on:click={ save }>UPDATE NEW</button>
  <a href="#edit"
     class:active="{ active === 'edit' }"
     on:click={toggle}>
    <span>EDIT MODE</span>
  </a>
  <div class="title">
    <span>{ title }</span>
  </div>
</div>

<style>
  .tab-headers {
    width: 100%;
    height: 40px;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
  }
  
  .ptop {
    border-bottom: #333 solid 1px;
  }

  .pbottom {
    border-top: #333 solid 1px;
  }

  a {
    color: #ddd;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    text-decoration: none;
    font-size: 18px;
    box-sizing: border-box;
    /* border-right: 2px solid; */
    padding: 0 40px;
    border-color: #000;
    transition: background-color 0.2s, border-color 0.2s;
  }

  a.active {
    background-color: #222;
    border-color: #fff;
    font-weight: 600;
  }

  a:hover {
    background: #333;
    color: #fff;
  }

  .title {
    font-size: 20px;
    font-weight: 600;
    margin-left: 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  span {
    text-align: right;
    /* writing-mode: vertical-rl; */
  }
</style>