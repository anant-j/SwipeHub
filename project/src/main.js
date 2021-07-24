import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import Toast from "vue-toastification";
import "./assets/alert.css";
import VueGtag from "vue-gtag";
import { BootstrapVue, IconsPlugin } from "bootstrap-vue";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import Multiselect from "vue-multiselect";
import axios from "axios";
import VueQrcode from "@chenfengyuan/vue-qrcode";
const storage = window.localStorage;
import MatchNotification from "@/components/MatchNotification";
import VueLazyload from "vue-lazyload";

let productionMode = true;
let backendUrl = "http://localhost:5001/theswipehub/us-central1";
let hostURL = "http://localhost:" + window.location.port;
document.title = "SwipeHub Dev Mode";
if (window.location.hostname === "localhost") {
  productionMode = false;
  store.state.devmode = 1;
}

Vue.config.productionTip = !productionMode;
if (productionMode) {
  Vue.use(
    VueGtag,
    {
      config: { id: "G-7V3PX5TM85" },
    },
    router
  );
  document.title = "SwipeHub";
  backendUrl = "https://us-central1-theswipehub.cloudfunctions.net";
  hostURL = "https://" + window.location.hostname;
}
Vue.mixin({
  data() {
    return {
      backend: backendUrl,
    };
  },
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
    /**
     * @param  {string} message : Content of the alert
     * @param  {string} type="s" Type: success, warning, error, info, default
     * @param  {number} timeout=false : Add int in miliseconds, false for persistent
     */
    showAlert(message, type = "s", timeout = false, id) {
      let final_message = MatchNotification;
      if (id !== "matchesAlert") {
        final_message = message.toString();
      }
      this.$toast.update(
        id,
        {
          content: final_message,
          options: {
            type: getType(type),
            timeout: parseInt(timeout),
          },
        },
        true
      );
    },
    hideAlert(id) {
      this.$toast.dismiss(id);
    },
    hideAllAlerts() {
      this.$toast.clear();
    },
    toHomePage() {
      this.$store.state.sessionState = 0;
    },
    toJoinSessionPage() {
      this.$store.state.sessionState = 1;
    },
    toCreateSessionPage() {
      this.$store.state.sessionState = 2;
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
    clearSession() {
      storage.removeItem("sessionId");
      storage.removeItem("userId");
      this.$store.replaceState({
        loader: false,
        userId: null,
        sessionId: null,
        activePage: 0,
        activeShareModal: false,
        isCreator: false,
        sessionState: 0,
        movieData: {},
        totalSwipes: 0,
        likedSet: new Set(),
        swipeHistory: [],
        matchData: [],
        totalMatches: 0,
        usersData: [],
      });
    },
    leaveSession() {
      const url = `${
        this.backend
      }/leaveSession?id=${this.getSessionId()}&user=${this.getUserId()}`;
      this.$store.state.loader = true;
      axios
        .get(url, {
          validateStatus: false,
        })
        .then(() => {
          this.clearSession();
          this.$router.push({ name: "Home" });
          this.$store.state.loader = false;
        });
    },
    copyToClipboard(item) {
      let data = "";
      let text = "";
      switch (item) {
        case "userId":
          data = this.getUserId();
          text = "User Id";
          break;
        case "sessionId":
          data = this.getSessionId();
          text = "Session Id";
          break;
        default:
          console.log("error while copying to clipboard");
        // this.showAlert("Alert occurred while copying to clipboard", "e", 7000);
        // code block
      }
      navigator.clipboard.writeText(data);
      this.showAlert(
        `${text} copied to clipboard`,
        "s",
        5000,
        "sessionIdCopidToClipboard"
      );
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
      // console.log(NotificationStore);
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
    globalSessionPoll() {
      const localTotalSwipes = [];
      for (const val of this.$store.state.swipeHistory) {
        localTotalSwipes.push(this.getId(val.id));
      }
      const localLikedList = Array.from(this.$store.state.likedSet);
      const params = {
        totalSwipes: localTotalSwipes,
        likedList: localLikedList,
        sessionId: this.getSessionId(),
        userId: this.getUserId(),
      };
      const data = Object.keys(params)
        .map((key) => `${key}=${encodeURIComponent(params[key])}`)
        .join("&");
      axios({
        url: `${this.backend}/polling`,
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        data,
      })
        .then((response) => {
          const numMatch = response.data.match;
          if (this.$store.state.totalMatches !== numMatch && numMatch > 0) {
            this.$store.state.totalMatches = numMatch;
            this.showAlert(`temp`, "s", 4800, "matchesAlert");
          }
          this.$store.state.totalMatches = numMatch;
          const userData = response.data.userData;
          const userDataArray = [];
          for (const iterator of Object.keys(userData)) {
            if (iterator !== this.getUserId()) {
              userDataArray.push({
                userId: iterator,
                value: userData[iterator],
              });
            } else {
              this.$store.state.totalSwipes = userData[iterator];
            }
          }
          this.updateUsersJoinLeaveNotification(Object.keys(userData));
          this.$store.state.usersData = userDataArray;
          for (let index = 0; index < localTotalSwipes.length; index++) {
            const element = localTotalSwipes[index];
            this.$store.state.likedSet.delete(element);
          }
        })
        .catch(() => {
          this.showAlert(
            "This session could not be loaded. It might have been ended by the creator. You will now be redirected to homepage.",
            "e",
            4800,
            "sessionLoadAlert"
          );
          let root = this;
          setTimeout(function () {
            root.clearSession();
            root.$router.push({ name: "Home" });
          }, 4800);
        });
    },
  },
});

function getType(types) {
  types = types.toLowerCase().trim();
  switch (types) {
    case "success":
    case "s":
      return "success";
    case "error":
    case "e":
      return "error";
    case "default":
    case "d":
      return "default";
    case "info":
    case "i":
      return "info";
    case "warning":
    case "w":
      return "warning";
    default:
      return "success";
  }
}
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
