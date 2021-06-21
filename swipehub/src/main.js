import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Toast from "vue-toastification"
import "./assets/alert.css"

const options = {
    position: 'top-center',
    maxToasts: 3,
    closeOnClick: false,
  }
  
createApp(App).use(store).use(Toast, options).use(router).mount('#app')
