<script>
  export let sig;
  export let active;

  let pos;

  $: pos = (1 - ($sig)) * 98 + 1;
</script>

<div class:active={$active}>
  <svg>
    <line x1="50%" y1="0" x2="50%" y2="100%" />
    <circle cx="50%" cy="{ pos }%" />
  </svg>
</div>

<style>
  div {
    display: none;
    width: 20px;
    height: 100%;
    padding: 2px 0px;
    box-sizing: border-box;
  }

  div.active {
    display: block;
  }

  svg {
    height: 100%;
    width: 100%;
  }

  svg line {
    stroke: #fff;
    stroke-width: 1px;
    stroke-opacity: 10%;
  }

  svg circle {
    r: 2px;
    fill: #fff;
  }
</style>