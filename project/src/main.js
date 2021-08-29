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
import "@fortawesome/fontawesome-free/css/all.css";
// import "@fortawesome/fontawesome-free/js/all.js";

document.title = "SwipeHub";
let host = "https://" + window.location.hostname;
if (window.location.hostname === "localhost") {
  host = "http://localhost:" + window.location.port;
  document.title = "SwipeHub Dev Mode";
  store.state.devmode = 1;
  Vue.config.productionTip = true;
} else {
  store.state.devmode = 0;
  Vue.config.productionTip = false;
}

Vue.mixin({
  data: () => ({
    hostURL: host,
    noCardUrl: "https://i.imgur.com/8MfHjli.png",
    noImageUrl: "https://i.imgur.com/Sql8s2M.png",
    TMDBNull: "https://image.tmdb.org/t/p/originalnull",
    TMDBUrl: "https://image.tmdb.org/t/p/original/",
  }),
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
    isCardDescriptionActive() {
      return (
        this.$store.state.activeDescriptionModal &&
        this.$store.state.activePage == 1
      );
    },
    isSideBarOpen() {
      return this.$store.state.activeSidebar;
    },
  },
  methods: {
    hideInfoModal() {
      this.$store.state.activeDescriptionModal = false;
    },
    showInfoModal() {
      this.$store.state.activeDescriptionModal = true;
    },
    hideSidebar() {
      this.$store.state.activeSidebar = false;
    },
    showSidebar() {
      this.$store.state.activeSidebar = true;
    },
    toggleSidebar() {
      this.$store.state.activeSidebar = !this.$store.state.activeSidebar;
    },
    computeMatches(userData) {
      const matches = [];
      const allLikes = [];
      const matchMap = {};
      if (Object.keys(userData).length <= 1) {
        return matches;
      }
      for (const eachUser of Object.keys(userData)) {
        const likes = userData[eachUser]["swipes"];
        for (const movieId in likes) {
          if (likes[movieId]) {
            allLikes.push(movieId);
          }
        }
      }
      for (const mediaId of allLikes) {
        if (!matchMap[mediaId]) {
          matchMap[mediaId] = 1;
        } else {
          matchMap[mediaId] += 1;
        }
        if (
          matchMap[mediaId] == Object.keys(userData).length &&
          Object.keys(userData).length > 1
        ) {
          matches.push(mediaId);
        }
      }
      return matches;
    },
    timedDelay(ms) {
      return new Promise((res) => setTimeout(res, ms));
    },
    signInFail() {
      this.$store.state.loader = false;
      this.showAlert("Please join a session first", "e", 5000, "loginFailed");
      this.$router.push({ name: "Home" });
      return;
    },
    getDataFromUid(uid) {
      const sessionId = uid.split("|")[0];
      const userId = uid.split("|")[1];
      const isCreator = uid.split("|")[2] == "true";
      if (!sessionId || !userId) {
        return null;
      }
      return { sessionId: sessionId, userId: userId, isCreator: isCreator };
    },
    getImageURL(id, imgUrl) {
      if (imgUrl.includes("?id=")) {
        id = imgUrl.split("?id=")[1];
        imgUrl = imgUrl.split("?id=")[0];
      }
      imgUrl = imgUrl.replace("http://", "https://");
      if (imgUrl == this.TMDBNull) {
        return {
          type: "no image",
          valid: false,
          url: `${this.noImageUrl}?id=${id}`,
        };
      }
      if (imgUrl == this.noCardUrl) {
        return {
          type: "no card",
          valid: false,
          url: `${this.noCardUrl}?id=${id}`,
        };
      }
      if (imgUrl.startsWith("/")) {
        return this.getImageURL(id, this.TMDBUrl + imgUrl);
      }
      return { type: "regular", valid: true, url: `${imgUrl}?id=${id}` };
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
    async getMovieData(id) {
      const docRef = doc(movieDb, "media", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        return null;
      }
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
