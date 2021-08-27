const storage = window.localStorage;
import { categories } from "@/assets/data.js";
import { leave } from "@/firebase_config.js";
import { eventLogger } from "@/firebase_config";

export const cleanup = {
  methods: {
    clearSessionHard() {
      storage.removeItem("sessionId");
      storage.removeItem("userId");
      storage.removeItem("SwipeHub_JWT");
      this.$store.replaceState({
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
        totalMatches: 0,
        swipeData: [],
        matchData: [],
        usersData: [],
      });
    },
    clearSessionSoft() {
      storage.removeItem("sessionId");
      storage.removeItem("userId");
      storage.removeItem("SwipeHub_JWT");
      this.$store.state.totalSwipes = 0;
      this.$store.state.totalMatches = 0;
      this.$store.state.usersData = [];
      this.$store.state.userId = null;
      this.$store.state.sessionId = null;
      this.$store.state.JWT = null;
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
        eventLogger("Session ended by user");
        leave();
      }
      this.clearSessionHard();
      this.$router.push({ name: "Home" });
    },
  },
};

export const mediaTools = {
  methods: {
    getGenreFromId(id) {
      for (const eachCategory of categories) {
        if (eachCategory.id === id) {
          return eachCategory.name;
        }
      }
      return null;
    },
    getIdfromURL(inputUrl) {
      const movieId = inputUrl.split("?id=")[1];
      return movieId;
    },
  },
};
