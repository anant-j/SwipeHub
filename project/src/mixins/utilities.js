const storage = window.localStorage;
import { leave } from "@/firebase_config.js";

export const defaultStore = {
  devmode: 0,
  loader: false,
  userId: null,
  sessionId: null,
  JWT: null,
  isCreator: false,
  activePage: 0,
  activeShareModal: false,
  sessionState: 0,
  movieData: {},
  totalSwipes: 0,
  matchData: [],
  totalMatches: 0,
  usersData: [],
  hostURL: "https://www.theswipehub.com",
};

export const cleanup = {
  methods: {
    clearSessionHard() {
      storage.removeItem("sessionId");
      storage.removeItem("userId");
      storage.removeItem("SwipeHub_JWT");
      this.$store.replaceState(defaultStore);
    },
    clearSessionSoft() {
      storage.removeItem("sessionId");
      storage.removeItem("userId");
      storage.removeItem("SwipeHub_JWT");
      this.$store.state.totalSwipes = {};
      this.$store.state.matchData = [];
      this.$store.state.totalMatches = 0;
      this.$store.state.usersData = [];
      this.$store.state.userId = null;
      this.$store.state.sessionId = null;
      this.$store.state.JWT = null;
      this.$store.state.isCreator = false;
    },
    leaveSession(kick = false) {
      if (kick) {
        this.showAlert(
          "This session has been ended by the creator. Please join or create a new session.",
          "e",
          5000,
          "sessionEnded"
        );
      } else {
        leave();
      }
      this.clearSessionHard();
      this.$router.push({ name: "Home" });
    },
  },
};

export const mediaTools = {
  methods: {
    getIdfromURL(inputUrl) {
      const movieId = inputUrl.split("?id=")[1];
      return movieId;
    },
  },
};
