<script>
	import { createEventDispatcher } from 'svelte';

  export let value = 0;

  let angle = valueToAngle(value);
  let center = {x: 0, y: 0};
  let svg;

  const dispatch = createEventDispatcher();

  function map(value, in_min, in_max, out_min, out_max) {
    return (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
  }

  function valueToAngle(value) {
    // map (-1, 1) to (-1, 1) using a quadratic curve
    value = Math.sign(value) * Math.pow(Math.abs(value), 0.5);
    // map value from (-1, 1) to (0.1, 0.9)
    value = map(value, -1, 1, 0.1, 0.9);
    // map (0, 1) to (0.75, 1.25)
    value = value + 0.75;
    // map (0, 1) to (0, 2)
    value = value % 1;
    // map (0, 2) to (-1, 1)
    value = value * 2 - 1;
    // map (-1, 1) to (-pi, pi)
    return value * Math.PI;
  }
  
  function angleToValue(angle) {
    // map to 0..1
    let val = ((angle / Math.PI) + 1) / 2;
    // rotate 270 deg cw (90 deg ccw)
    val = 1 - (val + 0.75) % 1;
    // map (0.1, 0.9) to (-1, 1)
    val = map(val, 0.1, 0.9, -1, 1);
    // map (-1, 1) to (-1, 1) using an inverse quadratic curve
    val = Math.sign(val) * Math.pow(Math.abs(val), 2);
    return val;
  }

  function onPointerUp(e){
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
  }

  function onPointerMove(ev) {
    const offsetX = ev.clientX - center.x;
    const offsetY = center.y - ev.clientY;  //y-coords flipped
    // compute rotation angle (radians)
    let rad = Math.atan2(offsetY, offsetX);
    // compute normalized value
    let norm = angleToValue(rad);
    // clamp
    if (norm >= -1 && norm <= 1) {
      angle = -rad;
      value = norm;
      dispatch('change', { value: value });
    }
  }

  function onPointerDown(ev) {
    const rect = svg.getBoundingClientRect();
    center = {
        x: rect.x + (rect.width / 2),
        y: rect.y + (rect.height / 2)
    };
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
  }

</script>

<svg bind:this={svg} style="--angle: {angle}rad" on:pointerdown={onPointerDown}>
    <circle cx="50%" cy="50%" />
    <line x1="50%" y1="50%" x2="90%" y2="50%" id="pointer" />
</svg>
<!-- <p>{ value.toFixed(2) }</p> -->

<style>
    svg {
        width: 32px;
        height: 32px;
    }

    circle {
        r: calc(50% - 2px);
        fill: #000;
        stroke-width: 2px;
        stroke: #fff;
    }

    #pointer {
        stroke-width: 2px;
        stroke: #fff;
        transform-origin: center center;
        transform: rotateZ(var(--angle));
    }

    p {
        user-select: none;
    }
</style>
