<template>
  <div id="app">
    <Navbar style="position: relative" />
    <div class="centered">
      <router-view />
    </div>
  </div>
</template>
<script>
import Navbar from "@/components/Navbar.vue";
import store from "@/store/index.js";

export default {
  name: "App",
  components: {
    Navbar,
  },
  store,
  methods: {},
};
</script>

<style>
@font-face {
  font-family: "tfont";
  src: url("./assets/GothamRounded-Book.otf") format("opentype");
  font-display: swap;
}

body {
  overflow: hidden;
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
  position: relative;
  text-align: center;
}

@media only screen and (min-width: 600px) {
body {
  overflow: hidden !important;
}
}
</style>
