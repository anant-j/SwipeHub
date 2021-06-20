<template>
  <div id="app">
    <Navbar :sessionActive="sessionActive" />
    <div class="centered">
      <router-view />
      <button v-on:click="sessionActive = !sessionActive">
        Session is {{ sessionActive }}
      </button>
      <button v-on:click="this.$store.state.count++">
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
import store from "./store/index.js";

export default {
  name: "App",
  components: {
    Navbar,
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


.loader {
  border: 16px solid #f3f3f3;
  border-radius: 50%;
  border-top: 16px solid #3498db;
  width: 120px;
  height: 120px;
  -webkit-animation: spin 2s linear infinite; /* Safari */
  animation: spin 2s linear infinite;
  position: absolute;
  margin-left: auto;
  margin-top: auto;
  margin-bottom: auto;
  margin-right: auto;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  text-align: center;
  display: none;
}

/* Safari */
@-webkit-keyframes spin {
  0% {
    -webkit-transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
