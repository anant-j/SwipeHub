<template>
  <div class="vertical-center">
    <div class="container">
      <h1>SwipeHub</h1>
      <br /><br />
      <button
        type="button"
        class="col-3 btn outerbtn btn-primary btn-lg"
        @click="toJoinSessionPage()"
      >
        Join Session
      </button>
      <br /><br />
      <button
        type="button"
        class="col-3 btn outerbtn btn-info btn-lg"
        @click="toCreateSessionPage()"
      >
        Create Session
      </button>
    </div>
  </div>
</template>

<script>
import store from "@/plugins/store/index.js";

export default {
  name: "InitialPage",
  store,
};
</script>

<style scoped>
.vertical-center {
  min-height: 100%; /* Fallback for browsers do NOT support vh unit */
  min-height: 80vh; /* These two lines are counted as one :-)       */
  position: relative;
  text-align: center;
  display: flex;
  align-items: center;
}
@media only screen and (max-width: 700px) {
  .outerbtn {
    width: 90vw;
  }
}
</style>
