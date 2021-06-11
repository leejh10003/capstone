import Amplify from 'aws-amplify';
import awsconfig from './aws-exports';
Amplify.configure(awsconfig);
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import { apolloProvider } from './vue-apollo'
import VueDraggableResizable from 'vue-draggable-resizable'
import VideoEditingTimeline from 'video-editing-timeline-vue'
Vue.use(VideoEditingTimeline);
import 'material-icons/iconfont/material-icons.css'
import 'vuesax/dist/vuesax.css' 
import Vuesax from 'vuesax'
import lineClamp from 'vue-line-clamp'
import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
//import i18n from './lang'
Vue.use(Element,)

Vue.config.productionTip = false
Vue.component('vue-draggable-resizable', VueDraggableResizable)
Vue.use(Vuesax)
Vue.use(lineClamp, {})

new Vue({
  router,
  apolloProvider,
  render: h => h(App)
}).$mount('#app')
