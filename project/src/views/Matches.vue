<template>
  <div v-if="!this.$store.state.loader">
    <div id="cardHolder" class="row row-cols-1 row-cols-md-4 g-3 mt-3 mb-3">
      <div
        class="col"
        v-for="item in this.$store.state.matchData"
        :key="item.movieId"
      >
        <div class="card text-white bg-dark h-100 text-center">
          <img
            class="card-img-top"
            style="max-height: 50vh; object-fit: contain; margin-top: 30px"
            alt="..."
            :src="item.posterURL"
          />
          <div class="card-body">
            <h5 class="card-title">
              <b>{{ item.title }}</b>
            </h5>
            <p class="card-text">{{ item.description }}</p>
          </div>
          <div class="card-footer">
            <small class="text-muted">Released on {{ item.release }}</small>
          </div>
        </div>
      </div>
    </div>
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
        const movieData = response.data.movies;
        const movieList = [];
        for (const iterator of Object.keys(movieData)) {
          let posterlink = movieData[iterator].poster.replace(
            "http://",
            "https://"
          );
          if (posterlink == "https://image.tmdb.org/t/p/originalnull") {
            posterlink = "https://i.imgur.com/Sql8s2M.png";
          }
          movieList.push({
            movieId: iterator,
            title: movieData[iterator].title,
            posterURL: posterlink,
            description: movieData[iterator].description,
            release: movieData[iterator].release_date,
          });
        }
        this.$store.state.matchData = movieList;
        this.$store.state.totalMatches = movieList.length;
      });
    },
  },
};
</script>

<style scoped>
#cardHolder {
  margin-left: 15px;
  margin-right: 15px;
}
</style>