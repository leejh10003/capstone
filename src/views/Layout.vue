<template>
  <VideoEditingTimeline :config="config" />
</template>

<script>
import VideoEditingTimeline from 'video-editing-timeline-vue';

export default {
  components: {
    VideoEditingTimeline: VideoEditingTimeline
  },
  data() {
    return {
       config: {
            canvasWidth: 5000,
            canvasHeight: 50,
            minimumScale: 10, // 一个小刻度长度(单位px)
            minimumScaleTime: 1, // 一个小刻度代表时间（单位秒）
       }
    };
  }
};
</script>