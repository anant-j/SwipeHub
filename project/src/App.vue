<template>
  <div id="app">
    <Navbar style="position: relative" />
    <Loader v-if="this.$store.state.loader" />
    <ShareScreen />
    <div style="position: relative">
      <router-view />
    </div>
  </div>
</template>
<script>
import Loader from "@/components/Loader.vue";
import Navbar from "@/components/Navbar.vue";
import ShareScreen from "@/components/ShareScreen.vue";
import store from "@/store/index.js";

export default {
  name: "App",
  components: {
    Loader,
    Navbar,
    ShareScreen,
  },
  store,
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
  color: #2c3e50;
  min-height: 100vh;
  background-color: rgb(20, 20, 20) !important;
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
  overflow-x: hidden;
  background-color: rgb(20, 20, 20) !important;
}
</style>
