<template>
  <div id="app">
    <div v-if="this.$store.state.devmode == 2">
      {{ omitted }}
      {{ sessionDataPresent }}
    </div>
    <Navbar />
    <Loader v-if="this.$store.state.loader" />
    <ShareScreen />
    <Sidebar
      v-if="sessionDataPresent && this.$store.state.activePage > 0"
      style="z-index: 1000; position: relative"
    />
    <br />
    <br />
    <div style="position: relative">
      <router-view />
    </div>
  </div>
</template>

<script>
import Loader from "@/components/Loader.vue";
import Navbar from "@/components/Navbar.vue";
import Sidebar from "@/components/Sidebar.vue";
import ShareScreen from "@/components/ShareScreen.vue";
import store from "@/plugins/store/index.js";
import { eventLogger } from "@/firebase_config.js";

export default {
  name: "App",
  components: {
    Loader,
    Navbar,
    Sidebar,
    ShareScreen,
  },
  store,
  mounted() {
    eventLogger("Application Loaded");
  },
  computed: {
    omitted() {
      const temp = {};
      for (const [key, value] of Object.entries(this.$store.state)) {
        if (key != "movieData" && key != "likedList") {
          temp[key] = value;
        }
        if (key == "likedList") {
          temp[key] = Array.from(this.$store.state.likedList);
        }
      }
      return temp;
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
