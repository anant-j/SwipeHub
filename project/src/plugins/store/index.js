import Vue from "vue";
import Vuex from "vuex";
import { defaultStore } from "@/mixins/utilities.js";
Vue.use(Vuex);

export default new Vuex.Store({
  state: defaultStore,
});
