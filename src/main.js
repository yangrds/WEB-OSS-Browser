import './public-path';
import Vue from 'vue'
import App from './App.vue'
import './el'
import Header from '@/components/header'

Vue.config.productionTip = false



Vue.component('Header', Header)

import routes from './router/index'

import store from '@/store/index'


import VueRouter from 'vue-router';

import '@/tool/codeModules'

Vue.config.productionTip = false
let router = null;
let instance = null
function render(props = {}) {
  const { container } = props;

  router = new VueRouter({
    base: '/main/oss/aaa',
    routes
  });

  Vue.use(VueRouter)

  instance = new Vue({
    router,
    store,
    render: h => h(App),
  }).$mount(container ? container.querySelector('#app') : '#app')
}

// 独立运行时
if (!window.__POWERED_BY_QIANKUN__) {
  render();
}


export async function bootstrap() {
  console.log('[vue] vue app bootstraped');
}
export async function mount(props) {
  console.log('[vue] props from main framework', props);
  render(props);
}
export async function unmount() {
  instance.$destroy();
  instance.$el.innerHTML = '';
  instance = null;
  router = null
}

