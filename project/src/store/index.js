import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    loader: false,
    sessionId: "",
    userId: "",
    sessionActive: false,
    cardsLoaded: false,
    sessionState: 0,
    movieData: {}
  },
});
