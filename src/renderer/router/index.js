import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: require('@/components/home').default
    },{
      path: '/addNode',
      name: 'AddNode',
      component: require('@/components/node/AddNode').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
