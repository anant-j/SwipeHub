<template>
  <div class="container" style="cursor: pointer" v-on:click="toMatchPage()">
    <a style="cursor: pointer; margin: 10px 0">
      You've got {{ this.$store.state.totalMatches }} matches. Click this
      notification to view matches</a
    >
  </div>
</template>

<script>
import store from "@/plugins/store/index.js";
export default {
  name: "MatchNotification",
  store,
  methods: {
    toMatchPage() {
      this.$router.push({ name: "Matches" });
    },
  },
};
</script>
