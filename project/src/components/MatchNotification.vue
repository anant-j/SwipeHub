<template>
  <div class="container" style="cursor: pointer" v-on:click="toMatchPage()">
    <a style="cursor: pointer; margin: 10px 0">
      You've got {{ this.$store.state.totalMatches }} matches. Click this
      notification to view matches</a
    >
  </div>
</template>

<script>
import store from "@/store/index.js";
import router from "@/router";
export default {
  name: "MatchNotification",
  store,
  methods: {
    toMatchPage() {
      router.push({ name: "Matches" });
    },
  },
};
</script>
