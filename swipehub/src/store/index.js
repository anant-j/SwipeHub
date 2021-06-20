import { createStore } from 'vuex'

export default createStore({
  // state: {
  // },
  // mutations: {
  // },
  // actions: {
  // },
  // modules: {
  // }
  state: {
    count: 0
  },
  mutations: {
    increment (state) {
      state.count++
    }
  }
})
