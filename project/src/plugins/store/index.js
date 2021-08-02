import Vue from "vue";
import Vuex from "vuex";
import {
  devmode,
  loader,
  userId,
  sessionId,
  JWT,
  isCreator,
  activePage,
  activeShareModal,
  sessionState,
  movieData,
  totalSwipes,
  matchData,
  totalMatches,
  usersData,
  hostURL,
} from "@/mixins/utilities.js";
Vue.use(Vuex);

const defaultStore = {
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
};
export default new Vuex.Store({
  state: defaultStore,
});
