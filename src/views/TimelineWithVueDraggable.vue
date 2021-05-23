<template>
  <div>
    <div class="drop-zone"
      v-for="(track, trackIndex) in tracks"
      :key="`track${trackIndex}`"
      :ref="`track${trackIndex}`"
      :style="{ position: 'relative' }"
      @dragenter.prevent
      @dragover.prevent
      @drop="onDrop($event, trackIndex)"
    >
      <div
        v-for="clip in track.clips"
        :key="`clip${clip.id}`"
        class="drag-el"
        :style="{ position: 'absolute', left: `${clip.trackOffset}px`, width: `${(clip.end - clip.start)}px` }"
        :ref="`clip${clip.id}`"
        draggable="true"
        @dragstart="startDrag($event, clip, trackIndex)">
        {{ clip.id }}
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'//eslint-disable-line no-unused-vars
export default {
  data: function(){
    return {
      tracks: [{
        name: '',
        id: 0,
        clips: [{
          id: 0,
          start: 0,
          end: 40,
          trackOffset: 0,
        },{
          id: 1,
          start: 50,
          end: 60,
          trackOffset: 100,
        }]
      }, {
        name: '',
        id: 1,
        clips: [{
          id: 2,
          start: 30,
          end: 50,
          trackOffset: 30,
        }]
      }, {
        name: '',
        id: 2,
      }]
    }
  },
  methods: {
    startDrag: function (event, item, from) {//eslint-disable-line no-unused-vars
      event.dataTransfer.dropEffect = 'move'
      event.dataTransfer.evvectAllowed = 'move'
      event.dataTransfer.setData('clipId', item.id)
      event.dataTransfer.setData('xOffset', event.clientX - this.$refs[`clip${item.id}`][0].getClientRects()[0].x)
      event.dataTransfer.setData('from', from)
    },
    onDrop: function (event, toward) {
      const id = parseInt(event.dataTransfer.getData('clipId'))
      const xOffset = parseInt(event.dataTransfer.getData('xOffset'))
      const from = parseInt(event.dataTransfer.getData('from'))
      const allClips = this.tracks.reduce((prev, next) => next.clips ? prev.concat(next.clips) : prev, [])//eslint-disable-line no-unused-vars
      const clip = _.cloneDeep(this.tracks.reduce((prev, next) => next.clips ?  prev.concat(next.clips.filter((clip) => clip.id === parseInt(event.dataTransfer.getData('clipId')))) : prev, [])[0]) //eslint-disable-line no-unused-vars
      const trackPixelInfo = this.$refs[`track${toward}`][0].getClientRects()
      this.tracks[from].clips = this.tracks[from].clips.filter((clip) => clip.id !== id)
      if (this.tracks[toward].clips){
        this.tracks[toward].clips.push({
          ...clip,
          trackOffset: event.clientX -  xOffset - trackPixelInfo[0].x
        })
        this.tracks[toward].clips.sort((former, latter) => former.trackOffset - latter.trackOffset)
        console.log(this.tracks[toward])
      } else {
        this.tracks[toward].clips = [{
          ...clip,
          trackOffset: event.clientX -  xOffset - trackPixelInfo[0].x
        }]
      }
      //TODO: align clips if former track pushes
    }
  },
}
</script>

<style>
.drop-zone{
  width: 100%;
  margin: 50px auto;
  background-color: #ecf0f1;
  padding: 10px;
  display: flex;
}
.drag-el{
  background-color: #3498db;
  color: white;
  padding: 5px;
  margin-bottom: 10px;
}
</style>