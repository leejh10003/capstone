<template>
  <div id="app">
    <button @click="top = 30">안녕!</button>
    <div :style="{width: '100vw', height: '200px', position: 'absolute', bottom: '0'}">
      <VueDragResize
          :isActive="true"
          :w="100"
          :h="200"
          :sticks="['mr', 'ml']"
          :snapToGrid="true"
          v-on:resizing="resize"
          v-on:dragging="resize"
          :parentLimitation="true"
        >
          <h3>Hello World!</h3>
          <p>{{ top }} х {{ left }}</p>
          <p>{{ width }} х {{ height }}</p>
        </VueDragResize>
    </div>
  </div>
</template>

<script>
import VueDragResize from "vue-drag-resize";

export default {
  components: {
    VueDragResize,
  },

  data() {
    return {
      width: 0,
      height: 0,
      top: 0,
      left: 0,
    };
  },

  methods: {
    resize(newRect) {
      this.width = Math.floor(newRect.width/1) * 1;
      this.height = Math.floor(newRect.height/1) * 1;
      this.top = Math.floor(newRect.top/1) * 1;
      this.left = Math.floor(newRect.left/1) * 1;
    },
  },
};
</script>