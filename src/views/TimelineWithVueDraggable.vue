<template>
  <div id="editor">
    <div id="videos">
      <div
        v-for="(row, rowIndex) in splitThree(videos)"
        :key="`row${rowIndex}`"
        @dragover.prevent
        @dragenter.prevent
        @drop.prevent="dropFile"
        class="row">
        <div
          class="video"
          v-for="video in row"
          :key="`video${video.id}`"
          :ref="`video${video.id}`"
          draggable="true"
          @dragstart="startDrag($event, video, null, 'fromVideos')"
        >
        {{video.id}}
        {{video.name}}
        </div>
      </div>
    </div>
    <div id="timeline">
      <!--TODO: Implement custom timeline track zoom-->
      <!--TODO: Implement custom drag and drop file upload-->
      <!--TODO: Implememt custom resizing-->
      <!--TODO: Implememt custom time bar-->
      <div id="buttons">
        <vs-button color="primary" type="filled" icon="add" @click="addTrack" style="float: right">트랙 추가</vs-button>
        <vs-button color="primary" type="filled" icon="add" @click="play" style="float: right">재생</vs-button>
      </div>
      <div id="tracks">
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
            id="playBar"
            ref="playBar"
            :style="{height: '300px', width: '1px', backgroundColor: 'red', zIndex: 1, position: 'static', 'marginLeft': `${current}px`}"
          />
          <div
            v-for="clip in track.clips"
            :key="`clip${clip.id}`"
            class="drag-el"
            :style="{ position: 'absolute', left: `${clip.trackOffset}px`, width: `${(clip.end - clip.start)}px` }"
            :ref="`clip${clip.id}`"
            draggable="true"
            @dragstart="startDrag($event, clip, trackIndex, 'fromTrack')">
            {{ clip.id }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'//eslint-disable-line no-unused-vars
export default {
  data: function(){
    return {
      current: 0,
      trackId: null,
      videos: [{
        id: 0,
        name: 123
      },{
        id: 1,
        name: 123
      },{
        id: 2,
        name: 123
      },{
        id: 3,
        name: 123
      },{
        id: 4,
        name: 123
      },{
        id: 5,
        name: 123
      },{
        id: 6,
        name: 123
      },{
        id: 7,
        name: 123
      },{
        id: 8,
        name: 123
      },{
        id: 9,
        name: 123
      },{
        id: 10,
        name: 123
      },],
      tracks: [{
        name: '',
        id: 0,
        clips: [{
          id: 0,
          start: 0,
          end: 40,
          trackOffset: 0,
          videoId: 0,
        },{
          id: 1,
          start: 50,
          end: 60,
          trackOffset: 100,
          videoId: 1,
        }]
      }, {
        name: '',
        id: 1,
        clips: [{
          id: 2,
          start: 30,
          end: 50,
          trackOffset: 30,
          videoId: 2,
        }]
      }, {
        name: '',
        id: 2,
        clips: []
      }]
    }
  },
  methods: {
    play: function(){
      console.log("played")
    },
    startDrag: function (event, item, from, kind) {//eslint-disable-line no-unused-vars
      event.dataTransfer.setData('kind', kind)
      event.dataTransfer.setData('xOffset', event.clientX - this.$refs[`${kind === 'fromTrack' ? 'clip' : 'video'}${item.id}`][0].getClientRects()[0].x)
      switch(kind){
        case 'fromTrack':
        event.dataTransfer.dropEffect = 'move'
        event.dataTransfer.evvectAllowed = 'move'
        event.dataTransfer.setData('clipId', item.id)
        event.dataTransfer.setData('from', from)
        break
        case 'fromVideos':
        event.dataTransfer.dropEffect = 'clone'
        event.dataTransfer.evvectAllowed = 'clone'
        event.dataTransfer.setData('videoId', item.id)
      }
    },
    dropFile: function(event){
      console.log(event.dataTransfer.files)
    },
    splitThree: function(input){
      const arr = []
      for(var i = 0; i < input.length; i += 3){
        arr.push(input.slice(i, Math.min(i + 3, input.length)))
      }
      return arr
    },
    addTrack: function(){
      const id = this.tracks?.reduce((prev, next) => Math.max(prev, next), 0) ?? 0
      if (this.tracks){
        this.tracks = [{
          name: '',
          id,
          clips: []
        }].concat(this.tracks)
      } else {
        this.tracks = [{
          name: '',
          id,
          clips: []
        }]
      }
    },
    onDrop: function (event, toward) {
      const kind = event.dataTransfer.getData('kind')
      if(kind === 'fromTrack'){
        const id = parseInt(event.dataTransfer.getData('clipId'))
        const xOffset = parseInt(event.dataTransfer.getData('xOffset'))
        const from = parseInt(event.dataTransfer.getData('from'))
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
      } else if (kind === 'fromVideos'){
        const videoId = parseInt(event.dataTransfer.getData('videoId'))
        const xOffset = parseInt(event.dataTransfer.getData('xOffset'))
        const allClips = this.tracks.reduce((prev, next) => next.clips ? prev.concat(next.clips) : prev, [])//eslint-disable-line no-unused-vars
        const id = (allClips.reduce((prev, next) => prev ? Math.max(prev, next.id) : next.id) ?? -1) + 1
        const trackPixelInfo = this.$refs[`track${toward}`][0].getClientRects()
        const newClip = {
          id,
          start: 50,
          end: 60,
          videoId,
          trackOffset: event.clientX -  xOffset - trackPixelInfo[0].x
        }
        if (this.tracks[toward].clips){
          this.tracks[toward].clips.push(newClip)
          console.log(this.tracks[toward])
        } else {
          this.tracks[toward].clips = [newClip]
        }
      }
    }
  },
}
</script>

<style>
.drop-zone{
  width: 100%;
  margin: 10px auto;
  background-color: #ecf0f1;
  display: flex;
  height: 32px;
}
.drag-el{
  background-color: #3498db;
  color: white;
  padding: 5px;
  margin-bottom: 10px;
}
#tracks{
  overflow: scroll;
  height: 300px;
  width: calc(100vw - 300px);
}
#buttons{
  width: calc(100vw - 300px);
  height: 30px;
}
#timeline{
  position: absolute;
  bottom: 0px;
  right: 0px;
  width: calc(100vw - 300px);
}
#videos{
  position: absolute;
  bottom: 0px;
  left: 0px;
  width: 300px;
  background-color: #000000;
  height: 300px;
  overflow: scroll;
}
#editor{
  height: 100vh;
  position: relative;
}
.video{
  width: 80px;
  margin: 10px;
  height: 80px;
  color: white;
  background-color: red;
}
.row{
  display: flex;
}
</style>