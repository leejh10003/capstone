<template>
  <div class="grid-container">
    <div class="grid-item">
      <span style="display: inline">Original video</span><br/>
      <video src="../assets/jellyfish.mp4" controls width="337" height="599" loop autoplay style="display: inline"/>
    </div>
    <div id="canvas-parent" class="grid-item" style="display: inline">
      <span style="display: inline">GPU.js Graphical Output <span id="fps-number">0</span><span> fps</span></span><br/>
    </div>
    <div>
      <label><input type="checkbox" id="parsegpu" v-model="pauseGPU">Pause rendering</label>
      <label><input type="checkbox" id="flipxy" v-model="flipXY">Flip X/Y</label>
      <label><input type="checkbox" id="altercolors" v-model="alterColors">Change hue angle</label>
    </div>
  </div>
</template>
<style>
.grid-container {
  display: grid;
  grid-template-columns: auto auto;
}
.grid-item {
  padding: 20px;
  text-align: center;
}
</style>
<script>
import { GPU } from 'gpu.js'
export default {
  data: function (){
    return {
      gpu: new GPU({mode: 'gpu'}),
      kernel: null,
      videoElement: null,
      disposed: false,
      pauseGPU: false,
      lastCalledTime: Date.now(),
      flipXY: false,
      alterColors: false,
    }
  },
  mounted: function (){
    this.kernel = this.gpu.createKernel(function(frame, flipXY, alterColors) {
      const pixel = flipXY
        ? frame[this.output.y - 1 - this.thread.y][this.output.x - 1 - this.thread.x]
        : frame[this.thread.y][this.thread.x]
    
      if (alterColors) {
        this.color(pixel.b, pixel.g, pixel.r, pixel.a)
      } else {
        this.color(pixel.r, pixel.g, pixel.b, pixel.a)
      }
    }, {
      output: [337, 599],
      graphical: true,
      tactic: 'precision'
    })
    const canvasParent = document.getElementById('canvas-parent')
    canvasParent.appendChild(this.kernel.canvas)
    this.videoElement = document.querySelector('video')
    this.render()
  },
  methods: {
    calcFPS: function () {
      var delta = (Date.now() - this.lastCalledTime) / 1000;
      this.lastCalledTime = Date.now();
      var fps = 1 / delta;
      document.getElementById('fps-number').innerHTML = fps.toFixed(0)
    },
    render: function () {
      if (this.disposed){
        return
      }
      if (this.pauseGPU){
        return setTimeout(this.render, 100)
      }
      this.kernel(this.videoElement, this.flipXY, this.alterColors)
      window.requestAnimationFrame(this.render)
      this.calcFPS()
    },
  }
}
</script>