const storage = window.localStorage;
import { leave } from "@/firebase_config.js";

export const devmode = 0;
export const loader = false;
export const userId = null;
export const sessionId = null;
export const JWT = null;
export const isCreator = false;
export const activePage = 0;
export const activeShareModal = false;
export const sessionState = 0;
export const movieData = {};
export const totalSwipes = 0;
export const matchData = [];
export const totalMatches = 0;
export const usersData = [];
export const hostURL = "https://www.theswipehub.com";

export const cleanup = {
  methods: {
    clearSessionHard() {
      storage.removeItem("sessionId");
      storage.removeItem("userId");
      storage.removeItem("SwipeHub_JWT");
      this.$store.replaceState({
        devmode: devmode,
        loader: loader,
        userId: userId,
        sessionId: sessionId,
        JWT: JWT,
        isCreator: isCreator,
        activePage: activePage,
        activeShareModal: activeShareModal,
        sessionState: sessionState,
        movieData: movieData,
        totalSwipes: totalSwipes,
        matchData: matchData,
        totalMatches: totalMatches,
        usersData: usersData,
        hostURL: hostURL,
      });
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
