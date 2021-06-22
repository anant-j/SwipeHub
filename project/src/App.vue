<template>
  <div id="app">
    <Navbar :sessionActive="sessionActive" />
    <div class="centered">
      <br>
      <button type="button" class="btn btn-primary" @click="showToast(`Notification ${$store.state.count}`, 'success', 3000)">
        Notification
      </button>
      <Loader v-if="this.$store.state.loader" />
      <router-view />
      <button
        type="button"
        class="btn btn-warning"
        v-on:click="$store.state.loader = !$store.state.loader"
      >
        Loader is {{ this.$store.state.loader }}
      </button>
      <br /><br />
      <button
        type="button"
        class="btn btn-success"
        v-on:click="sessionActive = !sessionActive"
      >
        Session is {{ sessionActive }}
      </button>
      <br /><br />
      <button
        type="button"
        class="btn btn-danger"
        v-on:click="$store.state.count++"
      >
        Session is {{ this.$store.state.count }}
      </button>
    </div>
  </div>
</template>
<script>
import Navbar from "./components/Navbar.vue";
import Loader from "./components/Loader.vue";
import store from "./store/index.js";

export default {
  name: "App",
  components: {
    Navbar,
    Loader,
  },
  store,
  data: function () {
    return {
      sessionActive: false,
    };
  },
  methods: {
    increment() {
      this.$store.commit("increment");
    },
    showToast(message, type, timeout) {
      this.$toast(message, {type: type, timeout: timeout});
    },
  },
};
</script>

<style>
@font-face {
  font-family: "tfont";
  src: url("./assets/GothamRounded-Book.otf") format("opentype");
  font-display: swap;
}

#app {
  font-family: tfont, Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */
  color: #2c3e50;
  height: 100vh;
  width: 100vw;
  background-color: rgb(20, 20, 20) !important;
  overflow-x: hidden;
  color: white;
  user-select: none;
  -moz-user-select: none;
  -khtml-user-select: none;
  -webkit-user-select: none;
  -o-user-select: none;
}

html,
body,
template {
  padding: 0 !important;
  margin: 0 !important;
}

.centered {
  text-align: center;
}
</style>
