<template>
  <div v-if="!this.$store.state.loader">
    <div class="row row-cols-1 row-cols-md-3 g-4">
      <div class="col">
        <div class="card h-100">
          <img class="card-img-top" alt="..." />
          <div class="card-body">
            <h5 class="card-title">Card title</h5>
            <p class="card-text">
              This is a wider card with supporting text below as a natural
              lead-in to additional content. This content is a little bit
              longer.
            </p>
          </div>
          <div class="card-footer">
            <small class="text-muted">Last updated 3 mins ago</small>
          </div>
        </div>
      </div>
      <div class="col">
        <div class="card h-100">
          <img class="card-img-top" alt="..." />
          <div class="card-body">
            <h5 class="card-title">Card title</h5>
            <p class="card-text">
              This card has supporting text below as a natural lead-in to
              additional content.
            </p>
          </div>
          <div class="card-footer">
            <small class="text-muted">Last updated 3 mins ago</small>
          </div>
        </div>
      </div>
      <div class="col">
        <div class="card h-100">
          <img class="card-img-top" alt="..." />
          <div class="card-body">
            <h5 class="card-title">Card title</h5>
            <p class="card-text">
              This is a wider card with supporting text below as a natural
              lead-in to additional content. This card has even longer content
              than the first to show that equal height action.
            </p>
          </div>
          <div class="card-footer">
            <small class="text-muted">Last updated 3 mins ago</small>
          </div>
        </div>
      </div>
    </div>
    <!-- {{ this.$store.state.matchData }} -->
  </div>
</template>

<script>
import store from "@/store/index.js";
import axios from "axios";

export default {
  name: "Matches",
  store,
  created() {
    if (!this.sessionDataPresent) {
      this.showAlert("Please join or create a session", "w", 5000);
      this.$router.push({ name: "Home" });
      return;
    }
    this.$store.state.loader = true;
    this.$store.state.activePage = 2;
    this.matchPoll();
  },
  methods: {
    matchPoll() {
      const params = {
        sessionId: this.getSessionId,
        userId: this.getUserId,
      };
      const data = Object.keys(params)
        .map((key) => `${key}=${encodeURIComponent(params[key])}`)
        .join("&");
      axios({
        url: `${this.backend}/matchPolling`,
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        data,
      }).then((response) => {
        this.$store.state.loader = false;
        //   if(this.response.status(200)) {
        console.log(response.data);
        this.$store.state.matchData = response.data.movies;
        //   }
      });
    },
  },
};
</script>

<style>
</style>