<template>
  <div id="app">
    <div :style="{width: '500px', height: '100px'}">
      <VueDragResize
          :isActive="true"
          :w="200"
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
      this.width = Math.floor(newRect.width/10) * 10;
      this.height = Math.floor(newRect.height/10) * 10;
      this.top = Math.floor(newRect.top/10) * 10;
      this.left = Math.floor(newRect.left/10) * 10;
    },
  },
};
</script>