import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Toast from "vue-toastification"
import "./assets/alert.css"
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import VueGtag from "vue-gtag";

Vue.config.productionTip = false

Vue.mixin({
  methods: {
    showToast(message, type, timeout) {
      this.$toast(message, { type: type, timeout: timeout });
    },
  }
})

const options = {
  position: 'top-center',
  maxToasts: 3,
  closeOnClick: false,
  pauseOnHover: false
}

Vue.use(VueGtag, {
  config: { id: "G-7V3PX5TM85" }
}, router);

Vue.use(BootstrapVue)
Vue.use(IconsPlugin)
Vue.use(Toast, options);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
