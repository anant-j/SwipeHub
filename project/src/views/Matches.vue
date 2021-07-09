<template>
  <div v-if="!this.$store.state.loader">
    <div
      class="card mx-auto mt-3 text-center"
      style="max-width: 500px"
      id="noCards"
      v-if="this.$store.state.totalMatches == 0"
    >
      <div class="card-body" style="color: black">
        <h5 class="card-title">No matches found</h5>
        <p class="card-text">
          Please swipe right on more cards for matches to appear
        </p>
        <router-link class="btn btn-primary" to="/session"
          >Start Swiping</router-link
        >
      </div>
    </div>
    <div v-else>
      <b-form-input
        v-model="searchField"
        style="width: 95%; margin: auto; margin-top: 20px"
        placeholder="Search via Title, Synopsis or Release Date"
      ></b-form-input>
      <!-- <input
        v-model="searchField"
        placeholder="Enter Search Field"
        class="align-self-center"
        style="
          width: 97%;
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 10px;
          padding: 5px;
        "
      /> -->
      <div
        id="cardHolder"
        class="row row-cols-1 row-cols-sm-3 row-cols-md-4 g-3 mt-3 mb-3"
        @click="pageActivity()"
      >
        <div
          class="col"
          v-for="item in this.localMatchStore"
          :key="item.movieId"
        >
          <div class="card text-white bg-dark h-100 text-center">
            <img
              class="card-img-top"
              style="max-height: 50vh; object-fit: contain; margin-top: 30px"
              alt="..."
              v-lazy="{
                src: item.posterURL,
                loading: 'https://i.giphy.com/media/N256GFy1u6M6Y/giphy.webp',
              }"
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
  </div>
</template>

<script>
import store from "@/store/index.js";
import axios from "axios";

export default {
  name: "Matches",
  store,
  data: () => ({
    timer: null,
    lastInteraction: new Date(),
    localMatchStore: [],
    searchField: "",
  }),
  created() {
    window.addEventListener("scroll", this.pageActivity);
    if (!this.sessionDataPresent) {
      this.showAlert(
        "Please join or create a session",
        "w",
        5000,
        "sessionDataNotAvailable"
      );
      this.$router.push({ name: "Home" });
      return;
    }
    this.$store.state.loader = true;
    this.$store.state.activePage = 2;
    this.matchPoll();
  },
  destroyed() {
    window.removeEventListener("scroll", this.pageActivity);
    clearTimeout(this.timer);
  },
  watch: {
    searchField(value) {
      this.pageActivity();
      if (value == "") {
        this.localMatchStore = this.$store.state.matchData;
      } else {
        // searchAlgorithm(value)
        this.localMatchStore = [];
        const searchValue = value.toLowerCase().trim();
        const localMovieData = this.$store.state.matchData;
        for (const movie of localMovieData) {
          if (
            movie.title.toLowerCase().trim().includes(searchValue) ||
            movie.description.toLowerCase().trim().includes(searchValue) ||
            movie.release.toLowerCase().trim().includes(searchValue)
          )
            this.localMatchStore.push(movie);
        }
      }
    },
  },
  methods: {
    pageActivity() {
      this.lastInteraction = new Date();
    },
    pollAllowed() {
      const currentTime = new Date();
      if ((currentTime - this.lastInteraction) / 1000 > 60) {
        return false;
      }
      if (!document.hasFocus()) {
        return false;
      }
      return true;
    },
    matchPoll() {
      if (this.pollAllowed()) {
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
        })
          .then((response) => {
            this.$store.state.loader = false;
            const movieData = response.data.movies;
            const movieList = [];
            for (const iterator of Object.keys(movieData)) {
              let posterlink = movieData[iterator].poster.replace(
                "http://",
                "https://"
              );
              if (posterlink === "https://image.tmdb.org/t/p/originalnull") {
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
            const userData = response.data.userData;
            const userDataArray = [];
            for (const iterator of Object.keys(userData)) {
              if (iterator !== this.getUserId) {
                userDataArray.push({
                  userId: iterator,
                  value: userData[iterator],
                });
              } else {
                this.$store.state.totalSwipes = userData[iterator];
              }
            }
            this.updateUsersJoinLeaveNotification(Object.keys(userData));
            this.$store.state.usersData = userDataArray;
            this.$store.state.matchData = movieList;
            if (this.searchField == "") {
              this.localMatchStore = this.$store.state.matchData;
            }
            this.$store.state.totalMatches = movieList.length;
          })
          .catch(() => {
            this.$store.state.loader = false;
          });
      }
      this.timer = setTimeout(() => this.matchPoll(), 10000);
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
