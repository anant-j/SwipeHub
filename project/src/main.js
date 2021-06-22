import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Toast from "vue-toastification"
import "./assets/alert.css"

Vue.config.productionTip = false

const options = {
  position: 'top-center',
  maxToasts: 3,
  closeOnClick: false,
  pauseOnHover: false
}

Vue.use(Toast, options);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
