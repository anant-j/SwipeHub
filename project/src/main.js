import Vue from "vue";
import App from "./App.vue";
import router from "@/plugins/router";
import store from "@/plugins/store";
import Toast from "vue-toastification";
import "./assets/alert.css";
import { BootstrapVue, IconsPlugin } from "bootstrap-vue";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import Multiselect from "vue-multiselect";
import VueQrcode from "@chenfengyuan/vue-qrcode";
const storage = window.localStorage;
import VueLazyload from "vue-lazyload";
import { movieDb } from "@/firebase_config.js";
import { doc, getDoc } from "firebase/firestore";

if (window.location.hostname === "localhost") {
  store.state.hostURL = "http://localhost:" + window.location.port;
  document.title = "SwipeHub Dev Mode";
  store.state.devmode = 1;
  Vue.config.productionTip = true;
} else {
  document.title = "SwipeHub";
  store.state.hostURL = "https://" + window.location.hostname;
  store.state.devmode = 0;
  Vue.config.productionTip = false;
}
Vue.mixin({
  computed: {
    getSessionId() {
      const vuex = this.$store.state.sessionId;
      const local = storage.getItem("sessionId");
      if (vuex) {
        return vuex;
      }
      if (local) {
        return local;
      }
      return null;
    },
    getUserId() {
      const vuex = this.$store.state.userId;
      const local = storage.getItem("userId");
      if (vuex) {
        return vuex;
      }
      if (local) {
        return local;
      }
      return null;
    },
    getJWT() {
      const vuex = this.$store.state.JWT;
      const local = storage.getItem("SwipeHub_JWT");
      if (vuex) {
        return vuex;
      }
      if (local) {
        return local;
      }
      return null;
    },
    sessionDataPresent() {
      if (this.getSessionId && this.getUserId && this.getJWT) {
        return true;
      }
      return false;
    },
  },
  methods: {
    setSessionId(sessionId) {
      const validatedSessionId = sessionId.toString().toUpperCase();
      this.$store.state.sessionId = validatedSessionId;
      storage.setItem("sessionId", validatedSessionId);
    },
    setJWT(token) {
      this.$store.state.JWT = token;
      storage.setItem("SwipeHub_JWT", token);
    },
    setUserId(userId) {
      this.$store.state.userId = userId;
      storage.setItem("userId", userId);
    },
    async getMovieData(id) {
      const docRef = doc(movieDb, "media", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        return null;
      }
    },
    updateUsersJoinLeaveNotification(newData) {
      const NotificationStore = {
        joined: [],
        left: [],
      };
      const oldUserDataPair = this.$store.state.usersData;
      const oldData = [];
      for (const userData of oldUserDataPair) {
        oldData.push(userData["userId"]);
      }
      for (const user of oldData) {
        if (!newData.includes(user) && user != this.getUserId) {
          NotificationStore["left"].push(user);
        }
      }
      for (const user of newData) {
        if (!oldData.includes(user) && user != this.getUserId) {
          NotificationStore["joined"].push(user);
        }
      }
      let NotificationMessage = "";
      if (NotificationStore["joined"].length > 0) {
        let joinMessage = "";
        for (const joiner of NotificationStore["joined"]) {
          joinMessage += joiner + ", ";
        }
        joinMessage = joinMessage.slice(0, -2);
        NotificationMessage += `${joinMessage} has joined the session. `;
      }
      if (NotificationStore["left"].length > 0) {
        let leaveMessage = "";
        for (const leaver of NotificationStore["left"]) {
          leaveMessage += leaver + ", ";
        }
        leaveMessage = leaveMessage.slice(0, -2);
        NotificationMessage += `${leaveMessage} has left the session. `;
      }
      if (NotificationMessage != "") {
        this.showAlert(NotificationMessage, "i", 4000, "userNotification");
      }
      return;
    },
  },
});

const options = {
  position: "top-center",
  maxToasts: 3,
  closeOnClick: false,
  pauseOnHover: false,
};

Vue.use(Toast, options);
Vue.use(BootstrapVue);
Vue.use(IconsPlugin);
Vue.use(VueLazyload);
Vue.component(VueQrcode.name, VueQrcode);
Vue.component("multiselect", Multiselect);

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
