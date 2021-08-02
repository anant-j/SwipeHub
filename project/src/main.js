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

let productionMode = true;
let hostURL = "http://localhost:" + window.location.port;
document.title = "SwipeHub Dev Mode";
if (window.location.hostname === "localhost") {
  productionMode = false;
  store.state.devmode = 1;
}

Vue.config.productionTip = !productionMode;
if (productionMode) {
  document.title = "SwipeHub";
  hostURL = "https://" + window.location.hostname;
}
Vue.mixin({
  methods: {
    getSessionId() {
      if (this.$store.state.sessionId === null) {
        if (
          storage.getItem("sessionId") === undefined ||
          storage.getItem("sessionId") === null
        ) {
          return null;
        } else {
          return storage.getItem("sessionId");
        }
      } else {
        return this.$store.state.sessionId;
      }
    },
    getUserId() {
      if (this.$store.state.userId === null) {
        if (
          storage.getItem("userId") === undefined ||
          storage.getItem("userId") === null
        ) {
          return null;
        } else {
          return storage.getItem("userId");
        }
      } else {
        return this.$store.state.userId;
      }
    },
    getJWT() {
      if (this.$store.state.JWT === null) {
        if (
          storage.getItem("SwipeHub_JWT") === undefined ||
          storage.getItem("SwipeHub_JWT") === null
        ) {
          return null;
        } else {
          return storage.getItem("SwipeHub_JWT");
        }
      } else {
        return this.$store.state.JWT;
      }
    },
    sessionDataPresent() {
      if (!this.getSessionId() || !this.getUserId() || !this.getJWT()) {
        return false;
      }
      return true;
    },
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
    copyToClipboard(item) {
      let data = "";
      // let text = "";
      switch (item) {
        case "userId":
          data = this.getUserId();
          // text = "User Id";
          break;
        case "sessionId":
          data = this.getSessionId();
          // text = "Session Id";
          break;
        default:
          console.log("error while copying to clipboard");
      }
      navigator.clipboard.writeText(data);
      // this.showAlert(
      //   `${text} copied to clipboard`,
      //   "s",
      //   5000,
      //   "sessionIdCopidToClipboard"
      // );
    },
    createShareLink() {
      const joinLink = this.getShareLink();
      navigator.clipboard.writeText(joinLink);
      this.$store.state.activeShareModal = true;
      this.showAlert(
        "Shareable link copied to clipboard.",
        "s",
        5000,
        "shareableLinkCopidToClipboard"
      );
    },
    getShareLink() {
      return `${hostURL}/?join=${this.getSessionId()}`;
    },
    shareLinkNatively() {
      const joinLink = this.getShareLink();
      navigator
        .share({
          title: "SwipeHub Session Share",
          text: `Come join my Swipehub session with Session Id: ${this.getSessionId()}.`,
          url: joinLink,
        })
        .then(() => console.log("Successful share! 🎉"))
        .catch((err) => console.error(err));
    },
    getId(inputUrl) {
      const movieId = inputUrl.split("?id=")[1];
      return movieId;
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
        if (!newData.includes(user) && user != this.getUserId()) {
          NotificationStore["left"].push(user);
        }
      }
      for (const user of newData) {
        if (!oldData.includes(user) && user != this.getUserId()) {
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
