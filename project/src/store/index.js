import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    devmode: 0,
    loader: false,
    userId: null,
    sessionId: null,
    activePage: 0,
    activeShareModal: false,
    isCreator: false,
    sessionState: 0,
    movieData: {},
    totalSwipes: 0,
    likedList: [],
    swipeHistory: [],
    matchData: {},
    totalMatches: 0,
    usersData: [],
  },
});
