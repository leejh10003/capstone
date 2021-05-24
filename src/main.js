import Amplify from 'aws-amplify';
import awsconfig from './aws-exports';
Amplify.configure(awsconfig);
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import { createProvider } from './vue-apollo'
import VueDraggableResizable from 'vue-draggable-resizable'
import VideoEditingTimeline from 'video-editing-timeline-vue'
Vue.use(VideoEditingTimeline);
import 'material-icons/iconfont/material-icons.css'
import 'vuesax/dist/vuesax.css' 
import Vuesax from 'vuesax'

Vue.config.productionTip = false
Vue.component('vue-draggable-resizable', VueDraggableResizable)
Vue.use(Vuesax)

new Vue({
  router,
  apolloProvider: createProvider(),
  render: h => h(App)
}).$mount('#app')
