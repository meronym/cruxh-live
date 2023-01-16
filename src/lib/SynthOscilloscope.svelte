<script>
  import { onMount, onDestroy } from 'svelte';
  import { audio } from './_audio.js';

  let frameId;
  let frameCount = -1;
  
  let canvasOsc;
  let ctxOsc;
  
  let canvasSpectro;
  let ctxSpectro;

  let t = new Float32Array(audio.analyser.fftSize);
  let f = new Float32Array(audio.analyser.frequencyBinCount);
  
  let zoom = 1;
  let zoomOffset = 0;

  onMount(() => {
    // get canvas context
    ctxOsc = canvasOsc.getContext("2d");
    ctxOsc.imageSmoothingQuality = "medium";
    ctxSpectro = canvasSpectro.getContext("2d");
    ctxSpectro.imageSmoothingQuality = "medium";
    frameId = requestAnimationFrame(() => draw());
  });

  onDestroy(() => {
    if (frameId) {
      cancelAnimationFrame(frameId);
    }
  });

  function drawOscilloscope(ctx, w, h, d, freq, sr, zoom, zoomOffset) {
    // ctx: CanvasRenderingContext2D, w: number, h: number, d: Float32Array, freq: number, sr: number, zoom: number, zoomOffset: number
    drawBackground(ctx, w, h);
    // drawGrid(ctx, w, h);
    const l = d.length;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Fastest way to get min and max to have: 1. max abs value for y scaling, 2. mean value for zero-crossing
    let min = d[0];
    let max = d[0];
    let i = d.length;
    while (i--) {
        const s = d[i];
        if (s < min) min = s;
        else if (s > max) max = s;
    }
    let zerox = 0;
    const thresh = (min + max) * 0.5 + 0.001; // the zero-crossing with "offset"
    const period = sr / freq;
    const times = Math.floor(l / period) - 1;
    while (d[zerox++] > thresh && zerox < l);
    if (zerox >= l - 1) {
        zerox = 0;
    } else {
        while (d[zerox++] < thresh && zerox < l);
        if (zerox >= l - 1) {
            zerox = 0;
        }
    }
    const drawL = times > 0 && isFinite(period) ? Math.min(period * times, l - zerox) : l - zerox;
    const _zero = Math.round(zerox + drawL * zoomOffset);
    const _one = Math.round(zerox + drawL / zoom + drawL * zoomOffset);
    for (let i = _zero; i < _one; i++) {
        const x = w * (i - _zero) / (_one - _zero - 1);
        const y = h - (d[i] * 0.5 + 0.5) * h;
        if (i === _zero) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  function drawSpectroscope(ctx, w, h, d, zoom, zoomOffset) {
    drawBackground(ctx, w, h);
    // drawGrid(ctx, w, h);
    const l = d.length;
    const _zero = Math.round(l * zoomOffset);
    const _one = Math.round(l / zoom + l * zoomOffset);
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    for (let i = _zero; i < _one; i++) {
        const x = w * (i - _zero) / (_one - _zero);
        const y = ((d[i] + 10) / 100 + 1) * h;
        if (i === _zero) ctx.moveTo(x, h - y);
        else ctx.lineTo(x, h - y);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
  }

  function drawBackground(ctx, w, h) {
    ctx.save();
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  function drawGrid(ctx, w, h) {
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#222";
    for (let i = 0.25; i < 1; i += 0.25) {
        ctx.moveTo(w * i, 0);
        ctx.lineTo(w * i, h);
        ctx.moveTo(0, h * i);
        ctx.lineTo(w, h * i);
    }
    ctx.stroke();
    ctx.restore();
  }

  function estimateFreq(fft, sampleRate) {
    let index = 0;
    let max = -Infinity;
    let i = fft.length;
    while (i-- > 1) {
        const cur = fft[i];
        if (cur <= max) continue;
        max = cur;
        index = i;
    }
    return sampleRate / 2 * index / fft.length;
  };

  function draw() {
    frameCount++; // Reduce frame rate
    if (frameCount % 3 === 0) {
      frameCount = 0;
      const sr = audio.ctx.sampleRate;
      // const w = this.container.clientWidth;
      // const h = Math.floor(Math.min(w * 0.75, this.container.clientHeight));
      // this.canvas.width = w;
      // this.canvas.height = h;
      audio.analyser.getFloatTimeDomainData(t);
      audio.analyser.getFloatFrequencyData(f);
      const freq = estimateFreq(f, sr);
      // const samp = this.t[this.t.length - 1];
      // const rms = getRms(this.t);
      drawOscilloscope(ctxOsc, canvasOsc.width, canvasOsc.height, t, freq, sr, zoom, zoomOffset);
      drawSpectroscope(ctxSpectro, canvasSpectro.width, canvasSpectro.height, f, zoom, zoomOffset);
    }
    frameId = requestAnimationFrame(() => draw());
  }
</script>

<div class="oscilloscope">
  <canvas bind:this={canvasOsc}></canvas>
</div>
<div class="spectroscope">
  <canvas bind:this={canvasSpectro}></canvas>
</div>

<style>
  .oscilloscope {
    width: 100%;
    height: 40%;
    /* background: #444; */
  }
  .spectroscope {
    width: 100%;
    height: 40%;
    /* background: #421; */
  }
  canvas {
    width: 100%;
    height: 100%;
  }
</style>
