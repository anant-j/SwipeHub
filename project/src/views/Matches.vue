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
import store from "@/plugins/store/index.js";
import axios from "axios";
import { sessionDb, auth } from "@/firebase_config.js";
import { ref, onValue } from "firebase/database";
import { signInWithCustomToken } from "firebase/auth";

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
    if (!this.sessionDataPresent()) {
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
    // this.matchPoll();
    this.signIn();
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
            movie.release.toLowerCase().trim().includes(searchValue) ||
            movie.description.toLowerCase().trim().includes(searchValue)
          )
            this.localMatchStore.push(movie);
        }
      }
    },
  },
  methods: {
    signIn() {
      signInWithCustomToken(auth, this.getJWT())
        .then(() => {
          this.getMatchData();
          this.$store.state.loader = false;
        })
        .catch(() => {
          this.$store.state.loader = false;
          this.showAlert(
            "Please join a session first",
            "e",
            5000,
            "loginFailed"
          );
          this.$router.push({ name: "Home" });
        });
    },
    async getMatchData() {
      const dbRef = ref(sessionDb, `${this.getSessionId()}/sessionActivity`);
      onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        console.log(data);
        const matchData = data.matches;
        if (!data) {
          this.leaveSession(true);
        }
        if (data.isValid != undefined && data.isValid != null) {
          if (!data.isValid) {
            this.leaveSession(true);
          }
        }
        if (matchData) {
          const numMatch = matchData.length;
          this.$store.state.totalMatches = numMatch;
          this.$store.state.matchData = [];
          // const movieList = [];
          for (const movieId of matchData) {
            if (this.$store.state.movieData[movieId]) {
              const tempMovieData = {
                movieId: movieId,
                title: this.$store.state.movieData[movieId].title,
                posterURL:
                  "https://image.tmdb.org/t/p/original/" +
                  this.$store.state.movieData[movieId].poster_path,
                description: this.$store.state.movieData[movieId].overview,
                release: this.$store.state.movieData[movieId].release_date,
              };
              // movieList.push(tempMovieData);
              this.$store.state.matchData.push(tempMovieData);
            } else {
              this.getMovieData(movieId).then((movieData) => {
                this.$store.state.movieData[movieId] = movieData;
                const tempMovieData = {
                  movieId: movieId,
                  title: movieData.title,
                  posterURL:
                    "https://image.tmdb.org/t/p/original/" +
                    movieData.poster_path,
                  description: movieData.overview,
                  release: movieData.release_date,
                };
                // movieList.push(tempMovieData);
                this.$store.state.matchData.push(tempMovieData);
              });
            }
            // this.$store.state.matchData = movieList;
            if (this.searchField == "") {
              this.localMatchStore = this.$store.state.matchData;
            }
          }
        }
      });
    },
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
          sessionId: this.getSessionId(),
          userId: this.getUserId(),
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
              if (iterator !== this.getUserId()) {
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
