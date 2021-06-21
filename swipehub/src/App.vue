<template>
  <div id="app">
    <Navbar :sessionActive="sessionActive" />
    <div class="centered">
      <button type="button" class="btn btn-primary" @click="toast(this.$store.state.count)">Notification</button>
    <Loader v-if="this.$store.state.loader"/>
      <router-view />
            <button type="button" class="btn btn-warning" v-on:click="this.$store.state.loader = !this.$store.state.loader ">
        Loader is {{ this.$store.state.loader }}
      </button>
      <br><br>
      <button type="button" class="btn btn-success" v-on:click="sessionActive = !sessionActive">
        Session is {{ sessionActive }}
      </button>
      <br><br>
      <button type="button" class="btn btn-danger" v-on:click="this.$store.state.count++">
        Session is {{ this.$store.state.count }}
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
import './assets/navbar_style.css'

export default {
  name: "App",
  components: {
    Navbar,
    Loader
  },
  setup () {
    const toast = (content) => {
        createToast({ title: content, description: 'some description'}, {type: 'success', position: 'top-center', timeout:5000})
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
