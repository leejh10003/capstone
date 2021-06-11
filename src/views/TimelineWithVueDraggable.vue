<template>
  <div style="background-color: #efefef;">
    <vs-navbar type="gradient" id="navbar" color="white" class="nabarx">
      <template #title>
        <vs-navbar-title>
          Fluvid
        </vs-navbar-title>
      </template>
      <vs-navbar-item index="0">
        <a href="#">로그아웃</a>
      </vs-navbar-item>
    </vs-navbar>
    <vs-alert :title="uploadStatus === 'uploading' ? '업로드 중...' : '완료'" :active="uploadStatus !== null" :color.sync='colorUpload' style="position: absolute; bottom: 30px; right: 30px; width: 300px;z-index: 4;">
      {{ uploadStatus === 'uploading' ? '파일을 업로드하는 중입니다...' : '업로드가 완료되었습니다!' }}
    </vs-alert>
    <div id="canvas-parent" ref="canvas-parent" class="grid-item" style="display: flex"/>
    <div id="effect">
      <h3 v-line-clamp="1" id="effect-file-name" v-if="selectedClip">{{selectedClip.video.filename}}</h3>
      <hr color="#efefef" v-if="selectedClip"/>
      <h4 v-line-clamp="1" id="opacity" v-if="selectedClip">불투명도</h4>
      <el-slider id="opacity-slider" v-if="selectedClip" v-model="slider" @change="opacityChange($event, selectedClip)"/>
    </div>
    <div v-if="projects != null" id="editor">
      <div style="position: absolute; bottom: 300px;">
        <vs-button color="primary" type="filled" :icon="playing ? 'pause' : 'play_circle_outline'" @click="play" />
        <vs-button color="primary" type="filled" icon="add" @click="addTrack" style="z-index: 1; float:right">트랙 추가</vs-button>
        <vs-button color="primary" type="filled" icon="vertical_split" @click="split" style="z-index: 1;"/>
      </div>
      <simplebar data-simplebar-auto-hide="true" id="videos">
        <div style="min-height: 300px; min-width: 300px"
        @dragover.prevent
        @dragenter.prevent
        @drop.prevent="dropFile">
          <div
            @dragover.prevent
            @dragenter.prevent
            v-for="(row, rowIndex) in splitThree(projects[0].videos)"
            class="row"
            :key="`row${rowIndex}`">
            <div
              v-for="(video, videoIndex) in row"
              :key="`row${videoIndex}`"
              @dragover.prevent
              @dragenter.prevent
              @dragstart="startDrag($event, video, null, 'fromVideos')"
              :ref="`video${video.id}`"
              draggable="true"
              class="video">
            {{video.filename}}
            </div>
          </div>
        </div>
      </simplebar>
      <simplebar data-simplebar-auto-hide="true" id="timeline" :style="{height: '300px', width: `calc(100% - 300px)`}">
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
          <div class="drop-zone"
            v-for="track in projects[0].tracks"
            :key="`track${track.id}`"
            :ref="`track${track.id}`"
            :style="{ position: 'relative', width: `${projects[0].length * 24}px` }"
            @dragenter.prevent
            @dragover.prevent
            @drop="onDrop($event, track.id)"
          >
            <div
              class="playBar"
              ref="playBar"
              :style="{height: '300px', width: '1px', backgroundColor: 'red', zIndex: 2, position: 'absolute', 'marginLeft': `${current}px`}"
            />
            <video :ref="`trackVideoPlayer${track.id}`" controls width="800" height="450" style="display: none"/>
            <div
              v-for="clip in track.clips"
              :key="`clip${clip.id}`"
              class="clip"
              :style="{ left: `${clip.track_offset_time * 24}px`, width: `${(clip.played_time * 24)}px`, backgroundColor: selectedClip !== null && clip.id === selectedClip.id ? '#d7d7d7' : 'white' }"
              :ref="`clip${clip.id}`"
              draggable="true"
              @click="selectClip(clip)"
              @dragstart="startDrag($event, clip, track.id, 'fromTrack')">
              <span v-line-clamp="1" style="sgyle: 2px; margin: 0px; padding: 0px; font-size: 10px;">{{ clip.video.filename }}</span>
            </div>
          </div>
        </div>
      </simplebar>
    </div>
  </div>
</template>

<script>
import simplebar from 'simplebar-vue';
import 'simplebar/dist/simplebar.min.css';
import { GPU } from 'gpu.js'
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
            length
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
                video_offset_time
                track_offset_time
                played_time
                video {
                  id
                  exif
                  filename
                  key
                  size
                }
              }
            }
          }
        }
        `,
        result: function ({ data }) {
          this.projects = data.projects
          const mapped = this.projects[0].tracks.map((track, index) => {//eslint-disable-line no-unused-vars
            return {
              arguments: [`video${index}`, `opacity${index}`, `playing${index}`],
              code: `if (playing${index} === 1){\n` +
              `const pixel${index} = video${index}[this.thread.y][this.thread.x];\n` +
              `r = r * (1 - opacity${index}) + pixel${index}.r * opacity${index};\n` +
              `g = g * (1 - opacity${index}) + pixel${index}.g * opacity${index};\n` +
              `b = b * (1 - opacity${index}) + pixel${index}.b * opacity${index};\n` +
              `}\n`
            }
          })
          const args = mapped.reduce((prev, current) => prev.concat(current.arguments), [])
          const code = 'var r = 0.0; var g = 0; var b = 0;\n' + mapped.reduce((prev, current) => prev + '\n' + current.code, '') + 'this.color(r, g, b,1)'
          const kernel = new Function(...args, code)
          this.kernel = this.gpu.createKernel(kernel, {
            output: [800, 450],
            graphical: true,
            precision: 'unsigned',
            tactic: 'precision'
          })
          const canvasParent = this.$refs['canvas-parent']
          while ( this.$refs['canvas-parent'].hasChildNodes() ) { this.$refs['canvas-parent'].removeChild( this.$refs['canvas-parent'].firstChild ); }
          canvasParent.appendChild(this.kernel.canvas)
          this.render()
        },
      }
    }
  },
  data: function(){
    return {
      slider: 0,
      selectedClip: null,
      uploadStatus: null,
      gpu: new GPU({mode: 'gpu'}),
      kernels: [],
      kernel: Function('a', 'return a'),
      disposed: false,
      pauseGPU: false,
      lastCalledTime: Date.now(),
      flipXY: false,
      alterColors: false,
      destroy: false,
      current: 0,
      scrollbarWidth: 0,
      preview: 0,
      playing: false,
      mouseIsIn: null,
      trackId: null,
      projects: null,
      drawer: null,
      effects: {},
    }
  },
  methods: {
    async opacityChange(event, clip){
      console.log(event, clip)
      const tracks = this.projects[0].tracks.map((track) => track.clips.map((clip) => ({
        video_offset: clip.video_offset_time,
        track_id: track.id,
        id: clip.id,
        start: clip.track_offset_time,
        end: clip.track_offset_time + clip.played_time,
        effect: clip.effect,
        src: clip.video.key})))
      const playing = tracks.map((track) => track.filter((clip) => clip.start * 24 <= this.current && clip.end * 24 >= this.current)).reduce((current, next) => current.concat(next), []).filter((candidate) => candidate.id === clip.id)
      if (playing.length > 0){
        this.effects[`effect${playing[0].track_id}`].opacity = event / 100
      }
      this.$apollo.mutate({
        mutation: gql`mutation($clipId: bigint!, $effect: jsonb!){
          update_clips_by_pk(pk_columns: {id: $clipId}, _set: {effect: $effect}){
            id
          }
        }`,
        variables: {
          clipId: clip.id,
          effect: {
            opacity: event / 100
          }
        }
      })
    },
    selectClip(clip) {
      this.selectedClip = _.cloneDeep(clip)
      this.slider = clip.effect.opacity * 100
    },
    split: async function(){
      const toSplit = this.projects[0].tracks.map((track, track_index) => ({
        clips: track.clips.map((clip, clip_index) => ({
          id: clip.id,
          video_id: clip.video.id,
          track_id: track.id,
          video_offset_time: clip.video_offset_time,
          start_time: clip.track_offset_time,
          end_time: clip.track_offset_time + clip.played_time,
          played_time: clip.played_time,
          effect: clip.effect,
          clip_index,
          track_index
        }))
      })).reduce((prev, current) => prev.concat(current.clips), []).filter((clip) => clip.start_time < this.current / 24 && clip.end_time > this.current / 24)
      var clipsMaxId = this.projects[0].tracks.map((track) => track.clips).reduce((prev, next) => prev.concat(next), []).reduce((prev, next) => Math.max(prev, next.id), 0) + 1
      const both = toSplit.map((clip) => {
        const current = {...clip}
        current.played_time = this.current / 24 - clip.start_time
        current.track_id = clip.track_id
        current.video_id = clip.video_id
        current.effect = clip.effect
        const newClip = {...clip}
        newClip.start_time = this.current / 24
        newClip.played_time = clip.start_time + clip.played_time - this.current / 24
        newClip.video_offset_time = clip.video_offset_time + (this.current / 24 - clip.start_time)
        newClip.track_id = clip.track_id
        newClip.video_id = clip.video_id
        newClip.effect = clip.effect
        newClip.id = clipsMaxId++
        return {
          current,
          new: newClip,
        }
      })
      const serverVariables = both.map((entity, index) => {
        const variables = {}
        variables[`id${index}`] = entity.current.id
        variables[`playedTime${index}`] = entity.current.played_time
        return {
          new: {
            video_offset_time: entity.new.video_offset_time,
            track_offset_time: entity.new.start_time,
            played_time: entity.new.played_time,
            track_id: entity.new.track_id,
            video_id: entity.new.video_id,
            effect: entity.new.effect
          },
          old: {
            arguments: `$id${index}: bigint!, $playedTime${index}: float8!`,
            variables,
            query: `update_clip_${index}: update_clips(where: {id:{_eq: $id${index}}}, _set: {played_time: $playedTime${index}}){
              returning{
                id
              }
            }`
          }
        }
      })
      const mutation = gql`mutation($objects:[clips_insert_input!]!, ${serverVariables.map((entity) => entity.old.arguments).join(', ')}){
        insert_clips(objects: $objects){
          returning{
            id
          }
        }
        ${serverVariables.map((entity) => entity.old.query).join('\n')}
      }`
      const variables = {
        objects: serverVariables.map((entity) => entity.new),
        ...(serverVariables.map((entity) => entity.old.variables).reduce((prev, current) => Object.assign(current, prev)))
      }
      both.forEach((clip) => {
        this.projects[0].tracks[clip.current.track_index].clips[clip.clip_index] = {
          ...this.projects[0].tracks[clip.current.track_index].clips[clip.current.clip_index],
          palyed_time: clip.current.played_time
        }

        const newClip = {
          ...this.projects[0].tracks[clip.new.track_index].clips[clip.new.clip_index],
        }
        newClip.track_offset_time = clip.new.start_time
        newClip.video_offset_time = clip.new.video_offset_time
        newClip.played_time = clip.new.played_time
        newClip.id = clip.new.id
        this.projects[0].tracks[clip.new.track_index].clips.push(newClip)
      })
      await this.$apollo.mutate({
        mutation,
        variables
      })
    },
    play: function(){
      this.playing = !this.playing
      if (this.playing === false){
        this.projects[0].tracks.map((track) => track.id).forEach((id) => this.$refs[`trackVideoPlayer${id}`][0].pause())
      } else {
        this.projects[0].tracks.map((track) => track.id).forEach((id) => this.$refs[`trackVideoPlayer${id}`][0].play())
      }
    },
    nextFrame: function(){
      if (this.playing){
        const tracks = this.projects[0].tracks.map((track) => track.clips.map((clip) => ({
          video_offset: clip.video_offset_time,
          track_id: track.id,
          start: clip.track_offset_time,
          end: clip.track_offset_time + clip.played_time,
          effect: clip.effect,
          src: clip.video.key})))
        const toBePlayed = tracks.map((track) => track.filter((clip) => {
          return clip.start * 24 >= this.current && clip.start * 24 < this.current + 1
        } )).reduce((prev, next) => prev.concat(next), [])
        const toBeStoped = tracks.map((track) => track.filter((clip) => {
          return clip.end * 24 >= this.current && clip.end * 24 < this.current + 1
        } )).reduce((prev, next) => prev.concat(next), [])
        var allInverting = {}
        toBePlayed.forEach((clip) => {
          allInverting[clip.track_id] = {}
          allInverting[clip.track_id].start = clip
        })
        toBeStoped.forEach((clip) => {
          if (allInverting[clip.track_id]){
            allInverting[clip.track_id].stop = clip
          } else {
            allInverting[clip.track_id] = {}
            allInverting[clip.track_id].stop = clip
          }
        })
        allInverting = Object.entries(allInverting).map((value) => value[1])
        allInverting.forEach((timing) => {
          if (timing.start && this.$refs[`trackVideoPlayer${timing.start.track_id}`]?.[0]){
            this.$refs[`trackVideoPlayer${timing.start.track_id}`][0].src = `https://editassets185420-dev.s3.ap-northeast-2.amazonaws.com/public/${timing.start.src.replaceAll(' ', '+')}`
            this.$refs[`trackVideoPlayer${timing.start.track_id}`][0].currentTime = timing.start.video_offset
            this.$refs[`trackVideoPlayer${timing.start.track_id}`][0].play()
            this.effects[`effect${timing.start.track_id}`] = timing.start.effect
          } else if (timing.stop && this.$refs[`trackVideoPlayer${timing.stop.track_id}`]?.[0]) {
            this.$refs[`trackVideoPlayer${timing.stop.track_id}`][0].pause()
            this.$refs[`trackVideoPlayer${timing.stop.track_id}`][0].src = null
            this.$refs[`trackVideoPlayer${timing.stop.track_id}`][0].currentTime = 0
            delete this.effects[`effect${timing.stop.track_id}`]
          }
        })
        this.current += 1
        if (this.current / 24 >= this.projects[0].length){
          this.playing = false
        }
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
        event.dataTransfer.setData('duration', item?.exif?.duration)
        event.dataTransfer.dropEffect = 'clone'
        event.dataTransfer.evvectAllowed = 'clone'
        event.dataTransfer.setData('videoId', item.id)
        event.dataTransfer.setData('filename', item.name)
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
      const tracks = this.projects[0].tracks.map((track) => track.clips.map((clip) => ({
        video_offset: clip.video_offset_time,
        track_id: track.id,
        start: clip.track_offset_time,
        end: clip.track_offset_time + clip.played_time,
        effect: clip.effect,
        src: clip.video.key})))
      const playing = tracks.map((track) => track.filter((clip) => clip.start * 24 <= this.current && clip.end * 24 >= this.current)).reduce((current, next) => current.concat(next), [])
      playing.forEach((clip) => {
        this.$refs[`trackVideoPlayer${clip.track_id}`][0].src = `https://editassets185420-dev.s3.ap-northeast-2.amazonaws.com/public/${clip.src.replaceAll(' ', '+')}`
        this.$refs[`trackVideoPlayer${clip.track_id}`][0].currentTime = this.current / 24 - clip.video_offset
        this.effects[`effect${clip.track_id}`] = clip.effect
      })
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
    render: function(){
      const tracks = _.cloneDeep(this.projects[0].tracks).sort((former, latter) => former.id - latter.id).map((track) => {
        return {
          id: track.id,
          isPlaying: track.clips.filter((clip) => clip.track_offset_time <= this.current / 24 && clip.track_offset_time + clip.played_time >= this.current / 24).length > 0 ? 1 : 0
        }
      })
      const allLoaded = tracks.map(((track) => !!(this.$refs[`trackVideoPlayer${track.id}`])).bind(this)).reduce((previous, current) => previous && current, true)
      if (this.kernel !== null && allLoaded){
        tracks.forEach((track) => {
          if (this.$refs[`trackVideoPlayer${track.id}`][0]){
            this.$refs[`trackVideoPlayer${track.id}`][0].crossOrigin = "anonymous"
          }
        })
        const args = tracks.map((track) => ([this.$refs[`trackVideoPlayer${track.id}`][0], this.effects[`effect${track.id}`]?.opacity ?? 1, track.isPlaying])).reduce((prev, next) => prev.concat(next), []) //eslint-disable-line no-unused-vars
        this.kernel(...args)
      }
      window.requestAnimationFrame(this.render)
    },
    onDrop: async function (event, toward) {
      const kind = event.dataTransfer.getData('kind')
      const xOffset = parseInt(event.dataTransfer.getData('xOffset'))
      if(kind === 'fromTrack'){
        const clipId = parseInt(event.dataTransfer.getData('clipId'))
        const from = parseInt(event.dataTransfer.getData('from'))
        const trackPixelInfo = this.$refs[`track${toward}`][0].getClientRects()
        const clip = _.cloneDeep(this.projects[0].tracks.filter((track) => track.id === from)[0].clips.filter((clip) => clip.id === clipId)[0])
        const fromTrack = this.projects[0].tracks.filter((track) => track.id === from)[0]
        fromTrack.clips = fromTrack.clips.filter((clip) => clip.id !== clipId)
        const toTrack = this.projects[0].tracks.filter((track) => track.id === toward)[0]
        const mappedTrackClip = toTrack.clips.map((clip) => ({
          id: clip.id,
          start_time: clip.track_offset_time,
          end_time: clip.track_offset_time + clip.played_time,
          played_time: clip.played_time
        }))
        const overlappedWithMoved = mappedTrackClip.filter((candidate) => {
          return candidate.start_time * 24>= (event.clientX -  xOffset - trackPixelInfo[0].x) &&
            candidate.start_time * 24 <= (event.clientX -  xOffset - trackPixelInfo[0].x) + clip.played_time * 24 ||
            candidate.end_time * 24 >= (event.clientX -  xOffset - trackPixelInfo[0].x) &&
            candidate.end_time * 24 <= (event.clientX -  xOffset - trackPixelInfo[0].x) + clip.played_time * 24
        })
        if (overlappedWithMoved.length > 0){
          const initial = overlappedWithMoved.reduce((prev, current) => prev.start_time < current.start_time ? prev : current)
          const timingPadding = ((event.clientX -  xOffset - trackPixelInfo[0].x) + clip.played_time * 24 - initial.start_time * 24) / 24
          toTrack.clips.forEach((clip) => {
            if (clip.track_offset_time >= initial.start_time){
              clip.track_offset_time += timingPadding
            }
          })
          const ids = toTrack.clips.filter((clip) => clip.track_offset_time >= initial.start_time).map((clip) => clip.id)
          toTrack.clips.push({
            ...clip,
            track_offset_time: (event.clientX -  xOffset - trackPixelInfo[0].x) / 24
          })
          await this.$apollo.mutate({
            variables: {
              ids,
              timingPadding,
              toward,
              clipId,
              trackOffset: (event.clientX -  xOffset - trackPixelInfo[0].x) / 24
            },
            mutation: gql`mutation ($ids: [bigint!]!, $timingPadding: float8!, $clipId: bigint!, $toward: bigint!, $trackOffset: float8!){
              update_clips_by_pk(pk_columns: {id: $clipId}, _set: {track_id: $toward, track_offset_time: $trackOffset}){
                id
              }
              update_clips(where: {id: {_in: $ids}}, _inc: {track_offset_time: $timingPadding}){
                returning{
                  id
                }
              }
            }`
          })
        } else {
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
        }
      } else if (kind === 'fromVideos'){
        const videoId = parseInt(event.dataTransfer.getData('videoId'))
        const fileName = event.dataTransfer.getData('filename')
        const duration = event.dataTransfer.getData('duration')
        const allClips = this.projects[0].tracks.reduce((prev, next) => next.clips ? prev.concat(next.clips) : prev, [])
        const id = (allClips.reduce((prev, next) => prev ? Math.max(prev, next.id) : next.id, 0) ?? -1) + 1
        const trackPixelInfo = this.$refs[`track${toward}`][0].getClientRects()
        const toTrack = this.projects[0].tracks.filter((track) => track.id === toward)[0]
        const mappedTrackClip = toTrack.clips.map((clip) => ({
          id: clip.id,
          start_time: clip.track_offset_time,
          end_time: clip.track_offset_time + clip.played_time,
          played_time: clip.played_time
        }))
        const overlappedWithMoved = mappedTrackClip.filter((candidate) => {
          return candidate.start_time * 24>= (event.clientX -  xOffset - trackPixelInfo[0].x) &&
            candidate.start_time * 24 <= (event.clientX -  xOffset - trackPixelInfo[0].x) + duration * 24 ||
            candidate.end_time * 24 >= (event.clientX -  xOffset - trackPixelInfo[0].x) &&
            candidate.end_time * 24 <= (event.clientX -  xOffset - trackPixelInfo[0].x) + duration * 24
        })
        if (overlappedWithMoved.length > 0){
          const initial = overlappedWithMoved.reduce((prev, current) => prev.start_time < current.start_time ? prev : current)
          const timingPadding = ((event.clientX -  xOffset - trackPixelInfo[0].x) + duration * 24 - initial.start_time * 24) / 24
          toTrack.clips.forEach((clip) => {
            if (clip.track_offset_time >= initial.start_time){
              clip.track_offset_time += timingPadding
            }
          })
          const ids = toTrack.clips.filter((clip) => clip.track_offset_time >= initial.start_time).map((clip) => clip.id)
          toTrack.clips.push({
            played_time: duration,
            track_id: toward,
            video_id: videoId,
            video: {
              filename: fileName
            },
            id,
            track_offset_time: (event.clientX -  xOffset - trackPixelInfo[0].x) / 24
          })
          console.log(toTrack.clips)
          await this.$apollo.mutate({
            variables: {
              ids,
              timingPadding,
              object: {
                played_time: duration,
                track_id: toward,
                track_offset_time: (event.clientX -  xOffset - trackPixelInfo[0].x) / 24,
                video_id: videoId,
                video_offset_time: 0
              }
            },
            mutation: gql`mutation ($ids: [bigint!]!, $timingPadding: float8!, $object:clips_insert_input!){
              update_clips(where: {id: {_in: $ids}}, _inc: {track_offset_time: $timingPadding}){
                returning{
                  id
                }
              }
              insert_clips_one(object: $object) {
                id
              }
            }`
          })
        } else {
          toTrack.clips.push({
            played_time: duration,
            track_id: toward,
            video_id: videoId,
            id,
            video: {
              filename: fileName
            },
            track_offset_time: (event.clientX -  xOffset - trackPixelInfo[0].x) / 24
          })
          await this.$apollo.mutate({
          variables: {
            object: {
              played_time: duration,
              track_id: toward,
              track_offset_time: (event.clientX -  xOffset - trackPixelInfo[0].x) / 24,
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
    }
  },
}
</script>

<style>
#opacity-slider{
  margin: 20px;
  width: calc(100% - 40px);
}
#opacity{
  text-align: left;
  margin: 20px;
}
#effect-file-name{
  text-align: left;
  margin: 10px
}
.drop-zone{
  margin: 10px auto;
  background-color: #ecf0f1;
  display: flex;
  height: 48px;
}
#effect{
  position: absolute;
  height: calc(100vh - 380px);
  right: 0;
  background-color: grey;
  width: calc(100vw - 840px);
  top: 36px;
  margin: 20px;
  border-radius: 16px;
  background-color: white;
  -webkit-box-shadow: 0 4px 25px 0 rgb(0 0 0 / 10%);
  box-shadow: 0 4px 25px 0 rgb(0 0 0 / 10%);
}
.clip{
  background-color: white;
  color: black;
  padding: 5px;
  margin-top: 8px;
  margin-bottom: 10px;
  position: absolute;
  text-align: start;
  padding: 0px;
  height: 32px;
  border-radius: 8px;
  text-overflow: ellipsis;
  -webkit-box-shadow: 0 4px 25px 0 rgb(0 0 0 / 10%);
  box-shadow: 0 4px 25px 0 rgb(0 0 0 / 10%);
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
  background-color: white;
}
#videos{
  position: absolute;
  bottom: 0px;
  left: 0px;
  width: 300px;
  background-color: #f5f7fb;
  height: 300px;
}
#editor{
  height: calc(100vh - 488px);
  position: relative;
}
.video{
  width: 80px;
  margin: 10px;
  height: 80px;
  color: black;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  padding: 5px;
  background-color: white;
  border-radius: 8px;
  display: block;
  -webkit-box-shadow: 0 4px 25px 0 rgb(0 0 0 / 10%);
  box-shadow: 0 4px 25px 0 rgb(0 0 0 / 10%);
}
.row{
  display: flex;
}
</style>