<template>
  <div v-if="$apollo.queries.projects.loading">
  </div>
  <div v-else id="editor">
    <div id="buttons">
      <vs-button color="primary" type="filled" icon="add" @click="addTrack" style="float: right">트랙 추가</vs-button>
      <vs-button color="primary" type="filled" :icon="playing ? 'pause' : 'play_circle_outline'" @click="play" style="float: right"></vs-button>
    </div>
    <simplebar data-simplebar-auto-hide="true" id="videos">
        <div
          v-for="(row, rowIndex) in splitThree(projects[0].videos)"
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
          {{video.filename}}
          </div>
        </div>
    </simplebar>
    <simplebar data-simplebar-auto-hide="true" id="timeline" :style="{height: '300px', width: trackWidths}">
      <!--OPTIONAL TODO: Implement custom timeline track zoom-->
      <!--TODO: Implement custom drag and drop file upload-->
      <!--OPTIONAL TODO: Implememt custom resizing-->
      <!--OPTIONAL TODO: Implememt custom time bar-->
      <div
        @mouseenter="enter"
        @mouseOut="out"
        @mousemove="hovering">
          <div
            class="playBar"
            ref="playBar"
            :style="{height: '300px', width: '1px', backgroundColor: 'red', zIndex: 2, position: 'absolute', 'marginLeft': `${current}px`}"
          />
          <div
            class="previewMouseBar"
            ref="previewMouseBar"
            :style="{height: '300px', width: '1px', backgroundColor: 'black', zIndex: 1, position: 'absolute', 'marginLeft': `${preview}px`}"
          />
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
            class="playBar"
            ref="playBar"
            :style="{height: '300px', width: '1px', backgroundColor: 'red', zIndex: 2, position: 'absolute', 'marginLeft': `${current}px`}"
          />
          <div
            class="previewMouseBar"
            ref="previewMouseBar"
            :style="{height: '300px', width: '1px', backgroundColor: 'black', zIndex: 1, position: 'absolute', 'marginLeft': `${preview}px`}"
          />
          <div
            v-for="clip in track.clips"
            :key="`clip${clip.id}`"
            class="drag-el"
            :style="{ position: 'absolute', left: `${clip.trackOffset}px`, width: `${(clip.end - clip.start)}px`, textAlign: 'start', padding: '0px', height: '32px' }"
            :ref="`clip${clip.id}`"
            draggable="true"
            @dragstart="startDrag($event, clip, trackIndex, 'fromTrack')">
            <span style="sgyle: 2px; margin: 0px; padding: 0px; font-size: 10px;">{{ clip.id }}</span>
          </div>
        </div>
      </div>
    </simplebar>
  </div>
</template>

<script>
import simplebar from 'simplebar-vue';
import 'simplebar/dist/simplebar.min.css';
import _ from 'lodash'//eslint-disable-line no-unused-vars
import gql from 'graphql-tag'
export default {
  components: {
    simplebar
  },
  mounted: function (){
    setInterval(this.nextFrame, 1000/24)
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll'; // forcing scrollbar to appear
    outer.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps
    document.body.appendChild(outer);

    // Creating inner element and placing it in the container
    const inner = document.createElement('div');
    outer.appendChild(inner);

    // Calculating difference between container's full width and the child width
    const scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);

    // Removing temporary elements from the DOM
    outer.parentNode.removeChild(outer);
    this.scrollbarWidth = scrollbarWidth
    console.log(this.scrollbarWidth)
  },
  computed: {
    trackWidths: function () { return `calc(100% - 300px)` }
  },
  apollo: {
    projects: {
      variables: function() {
        return {
          id: this.$route.params.id
        }
      },
      update: (data) => {
        return data.projects
      },
      query: gql`query ($id: bigint!){
        projects(where: {id: {_eq: $id}}) {
          id
          videos(order_by: [{id: asc}]) {
            id
            exif
            filename
            size
          }
          tracks {
            id
            clips {
              effect
              id
              played_time
              video {
                id
                exif
                filename
                size
              }
            }
          }
        }
      }`,
      subscribeToMore: {
        variables: function (){
          return {
            id: this.$route.params.id
          }
        },
        document: gql`subscription ($id: bigint!){
          projects(where: {id: {_eq: $id}}) {
            id
            videos(order_by: [{id: desc}]) {
              id
              exif
              filename
              size
            }
            tracks {
              id
              clips {
                effect
                id
                played_time
                video {
                  id
                  exif
                  filename
                  size
                }
              }
            }
          }
        }
        `,
        updateQuery: (previousResult, { subscriptionData }) => {
          return subscriptionData.data
        },
      }
    }
  },
  data: function(){
    return {
      current: 0,
      scrollbarWidth: 0,
      preview: 0,
      playing: false,
      mouseIsIn: null,
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
          end: 150,
          trackOffset: 100,
          videoId: 1,
        }]
      }, {
        name: '',
        id: 1,
        clips: [{
          id: 2,
          start: 30,
          end: 130,
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
      this.playing = !this.playing
    },
    nextFrame: function(){
      if (this.playing){
        this.current += 1
      }
    },
    enter: function() {
      this.mouseIsIn = true
    },
    out: function() {
      this.mouseIsIn = false
    },
    hovering: function(event){
      //console.log(event.layerX, event.layerY, event.offsetX, event.offsetY)
      if (this.mouseIsIn === false || this.mouseIsIn === null){
        this.preview = event.offsetX
      } else {
        if (event.offsetX > 10){
          this.preview = event.offsetX
        } else {
          if (Math.abs(this.preview - event.offsetX) < 10){
            this.preview = event.offsetX
          } else {
            this.preview = Math.max(event.offsetX, this.preview)
          }
        }
      }
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
    dropFile: async function(event) {
      //TODO: commit to server first and get id
      if (event.dataTransfer.files.length > 0){
        const { name } = event?.dataTransfer?.files?.[0]
        const { data: { insert_videos_one: { id } } } = await this.$apollo.mutate({//eslint-disable-line no-unused-vars
          variables: {
            projectId: this.$route.params.id,
            name
          },
          mutation: gql`mutation ($projectId: bigint!, $name: String!){
            insert_videos_one(object: {project_id: $projectId, size: 0, filename: $name, exif: ""}) {
              id
            }
          }`
        })
      }
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
  width: calc(100% + 150px);
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
#buttons{
  width: 100%;
  position: absolute;
  bottom: 300px;
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
  /*overflow: scroll;*/
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