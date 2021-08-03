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
  totalMatches,
  swipeData,
  matchData,
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
  totalMatches: totalMatches,
  swipeData: swipeData,
  matchData: matchData,
  usersData: usersData,
  hostURL: hostURL,
};
export default new Vuex.Store({
  state: defaultStore,
});
