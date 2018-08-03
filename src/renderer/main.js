import Vue from 'vue'
import axios from 'axios'
import App from './App'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import * as filters from './filters' // global filters
Vue.use(ElementUI)
import 'element-ui/lib/theme-chalk/index.css'

import iconv from 'iconv-lite'
Vue.prototype.$iconv = iconv
if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false
// 将自定义filter注册到Vue对象上
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
