
import { GPU } from 'gpu.js'
export default function (){
  const gpu = new GPU({mode: 'gpu'})
  return {
    gpu,
    kernel: gpu.createKernel(function(frame, flipXY, alterColors) {
      // NOTE: better to do alterColors and flipXY out of the kernel, but showing here for brevity
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
  }
}