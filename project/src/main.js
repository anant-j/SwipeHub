import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import Toast from "vue-toastification";
import "./assets/alert.css";
import VueGtag from "vue-gtag";
import Vuelidate from "vuelidate";
import { BootstrapVue, IconsPlugin } from "bootstrap-vue";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import Multiselect from "vue-multiselect";
import axios from "axios";
import VueQrcode from "@chenfengyuan/vue-qrcode";
const storage = window.localStorage;

let productionMode = false;
let backendUrl = "http://localhost:5001/theswipehub/us-central1";
let hostURL = "http://localhost:" + window.location.port;
document.title = "SwipeHub Dev Mode";
if (window.location.hostname !== "localhost") {
  productionMode = true;
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
  computed: {
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
    sessionDataPresent() {
      if (
        this.getSessionId === null ||
        this.getSessionId === undefined ||
        this.getUserId === null ||
        this.getUserId === undefined
      ) {
        return false;
      }
      return true;
    },
  },
  methods: {
    /**
     * @param  {string} message : Content of the alert
     * @param  {string} type="s" Type: success, warning, error, info, default
     * @param  {number} timeout=false : Add int in miliseconds, false for persistent
     */
    showAlert(message, type = "s", timeout = false, id) {
      // this.$toast.dismiss(id);
      // this.$toast(message.toString(), {
      //   id: id,
      //   type: getType(type),
      //   timeout: parseInt(timeout),
      //   icon: icon,
      // });
      this.$toast.update(
        id,
        {
          content: message.toString(),
          options: {
            type: getType(type),
            timeout: parseInt(timeout),
          },
        },
        true
      );
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
      this.$store.state.sessionId = sessionId;
      storage.setItem("sessionId", sessionId.toUpperCase());
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
        activePage: false,
        activeModal: false,
        isCreator: false,
        sessionState: 0,
        movieData: {},
        totalSwipes: 0,
        likedList: [],
        swipeHistory: [],
        matchData: {},
        totalMatches: 0,
        usersData: [],
      });
    },
    leaveSession() {
      const url = `${this.backend}/leaveSession?id=${this.getSessionId}&user=${this.getUserId}`;
      axios
        .get(url, {
          validateStatus: false,
        })
        .then(() => {
          this.clearSession();
          this.$router.push({ name: "Home" });
        });
    },
    copyToClipboard(item) {
      let data = "";
      let text = "";
      switch (item) {
        case "userId":
          data = this.getUserId;
          text = "User Id";
          break;
        case "sessionId":
          data = this.getSessionId;
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
      this.$store.state.activeModal = true;
      this.showAlert(
        "Shareable link copied to clipboard.",
        "s",
        5000,
        "shareableLinkCopidToClipboard"
      );
    },
    getShareLink() {
      return `${hostURL}/?join=${this.getSessionId}`;
    },
    shareLinkNatively() {
      const joinLink = this.getShareLink();
      navigator
        .share({
          title: "SwipeHub Session Share",
          text: `Come join my Swipehub session with Session Id: ${this.getSessionId}.`,
          url: joinLink,
        })
        .then(() => console.log("Successful share! 🎉"))
        .catch((err) => console.error(err));
    },
    getId(inputUrl) {
      const movieId = inputUrl.split("?id=")[1];
      return movieId;
    },
    globalSessionPoll() {
      const localTotalSwipes = [];
      for (const val of this.$store.state.swipeHistory) {
        localTotalSwipes.push(this.getId(val.id));
      }
      const localLikedList = this.$store.state.likedList;
      const params = {
        totalSwipes: localTotalSwipes,
        likedList: localLikedList,
        sessionId: this.getSessionId,
        userId: this.getUserId,
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
            this.showAlert(
              `You've got ${numMatch} matches`,
              "s",
              4800,
              "matchesAlert"
            );
          }
          this.$store.state.totalMatches = numMatch;
          const userData = response.data.userData;
          const userDataArray = [];
          for (const iterator of Object.keys(userData)) {
            if (iterator !== this.getUserId) {
              userDataArray.push({
                userId: iterator,
                value: userData[iterator],
              });
            }
          }
          this.$store.state.usersData = userDataArray;
          for (const iterator of localLikedList) {
            const index = this.$store.state.likedList.indexOf(iterator);
            if (index > -1) {
              this.$store.state.likedList.splice(index, 1);
            }
          }
        })
        .catch(() => {
          // handle error
          this.showAlert(
            "This session could not be loaded. It might have been ended by the creator. You will now be redirected to homepage.",
            "e",
            5000,
            "sessionLoadAlert"
          );
          let root = this;
          setTimeout(function () {
            root.clearSession();
            root.$router.push({ name: "Home" });
          }, 5000);
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
Vue.use(Vuelidate);
Vue.use(BootstrapVue);
Vue.use(IconsPlugin);
Vue.component(VueQrcode.name, VueQrcode);
Vue.component("multiselect", Multiselect);

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
