import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Toast from "vue-toastification"
import "./assets/alert.css"
import 'bootstrap/dist/css/bootstrap.css'
import VueGtag from "vue-gtag";

Vue.config.productionTip = false

Vue.mixin({
  methods: {
    /**
     * @param  {string} message : Content of the alert 
     * @param  {string} type="s" Type: success, warning, error, info, default
     * @param  {number} timeout=false : Add int in miliseconds, false for persistent
     * @param  {boolean} icon=true : Show icon/symbol
     */
    showAlert(message, type = "s", timeout = false, icon = true) {
      this.$toast(message.toString(), { type: getType(type), timeout: parseInt(timeout), icon: icon});
    },
  }
})

function getType(types) {
  types = types.toLowerCase().trim();
  switch (types) {
    case "success":
    case "s":
      return "success"
    case "error":
    case "e":
      return "error"
    case "default":
    case "d":
      return "default"
    case "info":
    case "i":
      return "info"
    case "warning":
    case "w":
      return "warning"
    default:
      return "success"
  }
}
const options = {
  position: 'top-center',
  maxToasts: 3,
  closeOnClick: false,
  pauseOnHover: false
}

Vue.use(VueGtag, {
  config: { id: "G-7V3PX5TM85" }
}, router);

Vue.use(Toast, options);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
