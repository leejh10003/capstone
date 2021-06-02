<template>
  <div v-if="projects === null">
  </div>
  <div v-else id="editor">
    <vs-alert :title="uploadStatus === 'uploading' ? '업로드 중...' : '완료'" :active="uploadStatus !== null" :color.sync='colorUpload' style="position: absolute; bottom: 30px; right: 30px; width: 300px;z-index: 4;">
      {{ uploadStatus === 'uploading' ? '파일을 업로드하는 중입니다...' : '업로드가 완료되었습니다!' }}
    </vs-alert>
    <div style="position: absolute; bottom: 300px;">
      <vs-button color="primary" type="filled" :icon="playing ? 'pause' : 'play_circle_outline'" @click="play" />
      <vs-button color="primary" type="filled" icon="add" @click="addTrack" style="z-index: 1; float:right">트랙 추가</vs-button>
      <vs-button color="primary" type="filled" icon="add" @click="split" style="z-index: 1;"/>
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
      <div
        @click="setCurrent"
        @mouseenter="enter"
        @mouseOut="out"
        :ref="'timeline'"
        style="min-height: 300px"
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
          v-for="track in projects[0].tracks"
          :key="`track${track.id}`"
          :ref="`track${track.id}`"
          :style="{ position: 'relative' }"
          @dragenter.prevent
          @dragover.prevent
          @drop="onDrop($event, track.id)"
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
            :style="{ position: 'absolute', left: `${clip.track_offset_time * 24}px`, width: `${(clip.played_time * 24)}px`, textAlign: 'start', padding: '0px', height: '32px' }"
            :ref="`clip${clip.id}`"
            draggable="true"
            @dragstart="startDrag($event, clip, track.id, 'fromTrack')">
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
import _ from 'lodash'
import gql from 'graphql-tag'
import { Storage, Auth } from 'aws-amplify' //eslint-disable-line no-unused-vars
export default {
  components: {
    simplebar
  },
  mounted: function (){
    setInterval(this.nextFrame, 1000/24)
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    outer.style.msOverflowStyle = 'scrollbar';
    document.body.appendChild(outer);
    const inner = document.createElement('div');
    outer.appendChild(inner);
    const scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);
    outer.parentNode.removeChild(outer);
    this.scrollbarWidth = scrollbarWidth
  },
  computed: {
    trackWidths: function () { return `calc(100% - 300px)` },
    colorUpload: function () { return this.uploadStatus === 'uploading' ? 'warning' : 'success' }
  },
  apollo: {
    $subscribe: {
      projects: {
        variables: function (){
          return {
            id: this.$route.params.id
          }
        },
        query: gql`subscription ($id: bigint!){
          projects(where: {id: {_eq: $id}}) {
            id
            videos(order_by: [{id: desc}]) {
              id
              exif
              filename
              size
            }
            tracks(order_by: [{id: desc}]) {
              id
              clips {
                effect
                id
                track_offset_time
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
        result: function ({ data }) {
          this.projects = data.projects
        },
      }
    }
  },
  data: function(){
    return {
      uploadStatus: null,
      current: 0,
      scrollbarWidth: 0,
      preview: 0,
      playing: false,
      mouseIsIn: null,
      trackId: null,
      projects: null
    }
  },
  methods: {
    split: function(){
      const tracks = this.projects[0].tracks.map((track) => track.clips.map((clip) => ({
        track_id: track.id,
        id: clip.id,
        start_time: clip.track_offset_time,
        end_time: clip.track_offset_time + clip.played_time
      })).sort((former, latter) => former.start_time - latter.start_time))
      console.log(tracks)
    },
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
    startDrag: function (event, item, from, kind) {
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
      try {
        const files = Array.from(event.dataTransfer.files)
        if (files.length > 0){
          const { username } = await Auth.currentUserInfo()
          this.uploadStatus = 'uploading'
          const tasks = files.map(async function (file) {
            if (file.type.startsWith('video')){
              const duration = await new Promise((resolve, reject) => {//eslint-disable-line no-unused-vars
                var video = document.createElement('video');
                video.preload = 'metadata';
                video.onloadedmetadata = function() {
                  window.URL.revokeObjectURL(video.src);
                  var duration = video.duration;
                  video.remove()
                  resolve(duration)
                }
                video.src = URL.createObjectURL(file);
              })
              const { data: { insert_videos_one: { id } } } = await this.$apollo.mutate({//eslint-disable-line no-unused-vars
                variables: {
                  projectId: this.$route.params.id,
                  name: file.name,
                  exif: {
                    duration
                  }
                },
                mutation: gql`mutation ($projectId: bigint!, $name: String!, $exif: jsonb!){
                  insert_videos_one(object: {project_id: $projectId, size: 0, filename: $name, exif: $exif}) {
                    id
                  }
                }`
              })
              const { key } = await Storage.put(`${username}/${this.$route.params.id}/${id}/${file.name}`, file, {
                level: 'public',
                visibility: 'public',
                acl: 'public-read'
              })
              await this.$apollo.mutate({
                variables: {
                  key,
                  id
                },
                mutation: gql`mutation ($id: bigint!, $key: String!){
                  update_videos_by_pk(pk_columns: {id: $id}, _set: {key: $key}){
                    id
                  }
                }`
              })
            }
          }.bind(this))
          await Promise.all(tasks)
          this.uploadStatus = 'success'
          setTimeout((() => {this.uploadStatus = null}).bind(this), 3000)
        }
      } catch (e){
        console.error(e)
      }
      //TODO: upload real file
    },
    splitThree: function(input){
      const arr = []
      for(var i = 0; i < input.length; i += 3){
        arr.push(input.slice(i, Math.min(i + 3, input.length)))
      }
      return arr
    },
    setCurrent(event){
      const xOffset = this.$refs['timeline'].getClientRects()[0].x
      this.current = event.clientX - xOffset
    },
    addTrack: async function(){
      const id = (this.projects[0].tracks?.reduce((prev, next) => Math.max(prev, next.id), 0) ?? 0) + 1
      this.projects[0].tracks = [{id, clips: []}].concat(this.projects[0].tracks)
      await this.$apollo.mutate({
        variables: {
          project_id: this.$route.params.id
        },
        mutation: gql`mutation($project_id: bigint!){
          insert_tracks_one(object: {project_id: $project_id}){
            id
          }
        }`
      })
    },
    onDrop: async function (event, toward) {
      const kind = event.dataTransfer.getData('kind')
      if(kind === 'fromTrack'){
        const clipId = parseInt(event.dataTransfer.getData('clipId'))
        const xOffset = parseInt(event.dataTransfer.getData('xOffset'))
        const from = parseInt(event.dataTransfer.getData('from'))
        const trackPixelInfo = this.$refs[`track${toward}`][0].getClientRects()
        const clip = _.cloneDeep(this.projects[0].tracks.filter((track) => track.id === from)[0].clips.filter((clip) => clip.id === clipId)[0])
        const fromTrack = this.projects[0].tracks.filter((track) => track.id === from)[0]
        fromTrack.clips = fromTrack.clips.filter((clip) => clip.id !== clipId)
        const toTrack = this.projects[0].tracks.filter((track) => track.id === toward)[0]
        toTrack.clips.push({
          ...clip,
          track_offset_time: (event.clientX -  xOffset - trackPixelInfo[0].x) / 24
        })
        await this.$apollo.mutate({
          variables: {
            trackId: toward,
            clipId,
            trackOffset: (event.clientX -  xOffset - trackPixelInfo[0].x) / 24
          },
          mutation: gql`mutation ($clipId: bigint!, $trackId: bigint!, $trackOffset: float8!){
            update_clips_by_pk(pk_columns: {id: $clipId}, _set: {track_id: $trackId, track_offset_time: $trackOffset}){
              id
            }
          }`
        })
      } else if (kind === 'fromVideos'){
        const videoId = parseInt(event.dataTransfer.getData('videoId'))
        const xOffset = parseInt(event.dataTransfer.getData('xOffset'))
        const allClips = this.projects[0].tracks.reduce((prev, next) => next.clips ? prev.concat(next.clips) : prev, [])
        const id = (allClips.reduce((prev, next) => prev ? Math.max(prev, next.id) : next.id, 0) ?? -1) + 1
        const trackPixelInfo = this.$refs[`track${toward}`][0].getClientRects()
        const toTrack = this.projects[0].tracks.filter((track) => track.id === toward)[0]
        toTrack.clips.push({
          played_time: 30,
          track_id: toward,
          video_id: videoId,
          id,
          track_offset_time: event.clientX -  xOffset - trackPixelInfo[0].x
        })
        await this.$apollo.mutate({
          variables: {
            object: {
              played_time: 30,
              track_id: toward,
              track_offset_time: event.clientX -  xOffset - trackPixelInfo[0].x,
              video_id: videoId,
              video_offset_time: 0
            }
          },
          mutation: gql`mutation ($object:clips_insert_input!) {
            insert_clips_one(object: $object) {
              id
            }
          }`
        })
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