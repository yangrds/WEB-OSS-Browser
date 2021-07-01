import Vue from 'vue'
import App from './App.vue'
import './el'
import Header from '@/components/header'

Vue.component('Header', Header)

import router from './router/index'

import store from '@/store/index'

import '@/tool/codeModules'


Vue.config.productionTip = false


// router.beforeEach((to, from, next) => {
//   // let client = JSON.parse(window.localStorage.getItem('client'))
//   // if (to.fullPath === '/login') {
//   //   client && router.push('/home')
//   //   store.commit("stateUpdate", { name: "headerVisible", data: false });
//   // } else {
//   //   !client && router.push('/login')
//   //   store.commit("stateUpdate", { name: "headerVisible", data: true });
//   // }
//   next()
// })



new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
