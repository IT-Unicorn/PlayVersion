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
    },{
      path: '/EditNode/:id',
      name: 'EditNode',
      component: require('@/components/node/AddNode').default
    },{
      path: '/direction',
      name: 'Direction',
      component: require('@/components/direction').default
    },{
      path: '/UploadLog/:id',
      name: 'UploadLog',
      component: require('@/components/uploadlog').default
    },{
      path: '/dashboard',
      name: 'dashboard',
      component: require('@/components/dashboard').default
    },{
      path: '/runlog',
      name: 'runlog',
      component: require('@/components/runlog').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
