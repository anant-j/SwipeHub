<template>
  <div class="home">
    <br>
    <button
      type="button"
      class="btn btn-success"
      v-on:click="$router.push({ name: 'Session' })"
    >
      Session Page
    </button>
  </div>
</template>

<script>
// import Loader from "@/components/Loader.vue";
import store from "@/store/index.js";

export default {
  name: "Home",
  store,
};
</script>
