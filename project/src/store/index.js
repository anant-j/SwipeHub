import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  // state: {
  // },
  // mutations: {
  // },
  // actions: {
  // },
  // modules: {
  // }
  state: {
    count: 0,
    loader: false
  },
  mutations: {
    increment (state) {
      state.count++
    }
  }
})
