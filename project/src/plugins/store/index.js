import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);

const defaultStore = {
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
};
export default new Vuex.Store({
  state: defaultStore,
});
