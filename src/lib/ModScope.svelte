<script>
  import { onMount, onDestroy } from 'svelte';
  import { cruxh } from "./_cruxh.js";

  export let index;
  let frameId;
  let canvas;
  let ctx;
  let points = [];

  let modulators;
  let source = '-';

  let unsub = cruxh.modParams.stores.modulators.subscribe((value) => {
    if (value.find(x => x == source) === undefined) {
      if (value.length > 0) {
        source = value[index % value.length];
      } else {
        source = '-';
      }
    }
    modulators = value;
  });
  onDestroy(unsub);

  onMount(() => {
    // get canvas context
    ctx = canvas.getContext("2d");
    ctx.imageSmoothingQuality = "medium";
    frameId = requestAnimationFrame(() => draw(ctx));
  });

  onDestroy(() => {
    if (frameId) {
      cancelAnimationFrame(frameId);
    }
  })

  function draw(ctx) {
    // sample new value and map it from (-1, 1) to (0, 1)
    let value = (cruxh.modEngine.outputs[source] + 1.0) / 2.0;
    // add sampled value to points array
    points.push(value);
    // remove oldest points if array is too long
    while (points.length > canvas.width) {
      points.shift();
    }
    // clear canvas
    // ctx.fillStyle = "#111";
    // ctx.fillRect(0, 0, canvas.width, canvas.width);
    ctx.clearRect(0, 0, canvas.width, canvas.width);
    // draw points
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1;
    ctx.beginPath(); // Start a new path
    ctx.moveTo(0, canvas.height * (1.0 - points[0]));
    points.forEach((point, i) => {
      ctx.lineTo(i, canvas.height * (1.0 - point));
      // ctx.fillRect(i, canvas.height * (1.0 - point), 1, 1);
    });
    ctx.stroke();
    frameId = requestAnimationFrame(() => draw(ctx));
  }

</script>

<div class="wrapper">
  <select bind:value={source}>
    {#each modulators as mod}
      <option value={ mod }>{ mod.replace('_', ' ').replace('-', '(no mod)') }</option>
    {/each}
  </select>
  <canvas bind:this={canvas}></canvas>
</div>

<style>
  .wrapper {
    position: relative;
    /* background: darkblue; */
    width: 100%;
    /* border-left: 2px #fff solid; */
    /* box-sizing: border-box; */
  }
  select {
    position:absolute;
    top: 0;
    left: 0;
  }
  canvas {
    height: 80px;
    width: 100%;
  }
  select {  
    background-color: rgba(0, 0, 0, 0.7);
    background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20256%20448%22%20enable-background%3D%22new%200%200%20256%20448%22%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E.arrow%7Bfill%3A%23fff%3B%7D%3C%2Fstyle%3E%3Cpath%20class%3D%22arrow%22%20d%3D%22M255.9%20168c0-4.2-1.6-7.9-4.8-11.2-3.2-3.2-6.9-4.8-11.2-4.8H16c-4.2%200-7.9%201.6-11.2%204.8S0%20163.8%200%20168c0%204.4%201.6%208.2%204.8%2011.4l112%20112c3.1%203.1%206.8%204.6%2011.2%204.6%204.4%200%208.2-1.5%2011.4-4.6l112-112c3-3.2%204.5-7%204.5-11.4z%22%2F%3E%3C%2Fsvg%3E%0A");
    background-position: right 10px center;
    background-repeat: no-repeat;
    background-size: auto 50%;
    border:none;
    color: #fff;
    padding: 10px 30px 10px 10px;

    font-size: 16px;
    font-family: inherit;
    
    /* // disable default appearance */
    user-select: none;
    outline: none;
    appearance: none;
    -moz-appearance: none;
    -webkit-appearance: none;
  }
</style>