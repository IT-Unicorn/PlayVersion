import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
Vue.use(ElementUI)
import 'element-ui/lib/theme-chalk/index.css'
if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false


// //正式环境监测更新
// const updater = require("electron-updater");
// const autoUpdater = updater.autoUpdater;

// autoUpdater.setFeedURL({
//   provider: "github", 
// });

// autoUpdater.on('update-available', function (info) {
//   this.$message.success(info)
// });


/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
