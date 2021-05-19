import Amplify from 'aws-amplify';
import awsconfig from './aws-exports';
Amplify.configure(awsconfig);
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import { createProvider } from './vue-apollo'
import VueDraggableResizable from 'vue-draggable-resizable'
import VideoEditingTimeline from 'video-editing-timeline-vue';
Vue.use(VideoEditingTimeline);

Vue.config.productionTip = false
Vue.component('vue-draggable-resizable', VueDraggableResizable)


new Vue({
  router,
  apolloProvider: createProvider(),
  render: h => h(App)
}).$mount('#app')
