import Vue from 'vue';
import App from './App.vue';
import router from './router';

Vue.config.productionTip = false;

import iview from 'view-design';
import 'view-design/dist/styles/iview.css';
Vue.use(iview);

import Element from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(Element);

// import VueSocketIO from 'vue-socket.io';

// Vue.use(
//   new VueSocketIO({
//     debug: true,
//     connection: 'http://125.220.157.228:80',
//   }),
// );

new Vue({
  router,
  render: h => h(App),
}).$mount('#app');
