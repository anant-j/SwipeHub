<template>
  <div v-if="!this.$store.state.loader">
    <InitialPage v-if="this.$store.state.sessionState == 0" />
    <JoinSessionPage v-if="this.$store.state.sessionState == 1" />
    <CreateSessionPage v-if="this.$store.state.sessionState == 2" />
  </div>
</template>

<script>
import InitialPage from "@/components/InitialPage.vue";
import JoinSessionPage from "@/components/JoinSessionPage.vue";
import CreateSessionPage from "@/components/CreateSessionPage.vue";
import store from "@/store/index.js";

export default {
  name: "Home",
  components: { InitialPage, JoinSessionPage, CreateSessionPage },
  store,
  mounted() {
    this.$store.state.sessionActive = false;
    if (window.location.href.includes("?join=")) {
      const id = window.location.href.split("=")[1];
      this.setSessionId(id);
      this.$store.state.sessionState = 1;
      this.$store.state.sessionIdLocked = true;
    }
  },
};
</script>

<style>
</style>