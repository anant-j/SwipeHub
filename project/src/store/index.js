import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    loader: false,
    sessionActive: false,
    isCreator: false,
    sessionState: 0,
    movieData: {},
    totalSwipes: 0,
    matchData: {},
    totalMatches: 0,
  },
});
