<template>
  <div id="app">
    <Navbar :sessionActive="sessionActive" />
    <div class="centered">
      <button @click="toast">Notification</button>
    <Loader v-if="this.$store.state.loader"/>
      <router-view />
      <button v-on:click="sessionActive = !sessionActive">
        Session is {{ sessionActive }}
      </button>
      <button v-on:click="this.$store.state.count++">
        Session is {{ this.$store.state.count }}
      </button>
      <button v-on:click="this.$store.state.loader = !this.$store.state.loader ">
        Loader is {{ this.$store.state.loader }}
      </button>
    </div>
  </div>
</template>

<script>
import "bootstrap/dist/css/bootstrap.min.css";
import "jquery/src/jquery.js";
import "bootstrap/dist/js/bootstrap.min.js";
import Navbar from "./components/Navbar.vue";
import Loader from "./components/Loader.vue";
import store from "./store/index.js";
import { createToast } from 'mosha-vue-toastify';
import 'mosha-vue-toastify/dist/style.css'

export default {
  name: "App",
  components: {
    Navbar,
    Loader
  },
  setup () {
    const toast = () => {
        createToast({ title: 'Some title', description: 'some good description'}, {type: 'success', position: 'top-center'})
    }
    return { toast }
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

.centered{
    text-align: center;
}
</style>
