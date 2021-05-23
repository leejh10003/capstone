import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import(/* webpackChunkName: "register" */ '../views/Register.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import(/* webpackChunkName: "login" */ '../views/Login.vue'),
  },
  {
    path: '/drop',
    name: 'Drop',
    component: () => import(/* webpackChunkName: "login" */ '../views/Drop.vue'),
  },
  {
    path: '/gpu',
    name: 'GPU',
    component: () => import(/* webpackChunkName: "login" */ '../views/GPU.vue'),
  },
  {
    path: '/project/:id(\\d+)',
    name: 'Project',
    component: () => import(/* webpackChunkName: "login" */ '../views/Project.vue'),
  },
  {
    path: '/layout',
    name: 'Layout',
    component: () => import (/* webpackChunkName: "login" */ '../views/Layout.vue'),
  },
  {
    path: '/drag',
    name: 'Drag',
    component: () => import (/* webpackChunkName: "login" */ '../views/TimelineWithVueDraggable.vue'),
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
