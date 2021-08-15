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
      <div
        id="cardHolder"
        class="row row-cols-1 row-cols-sm-3 row-cols-md-4 g-3 mt-3 mb-3"
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
import { sessionDb, auth, eventLogger } from "@/firebase_config.js";
import { ref, onValue, off } from "firebase/database";
import { signInWithCustomToken, signOut } from "firebase/auth";
import { notification, memberNotification } from "@/mixins/notification.js";
import { cleanup } from "@/mixins/utilities.js";

export default {
  name: "Matches",
  store,
  mixins: [notification, cleanup, memberNotification],
  data: () => ({
    signedIn: false,
    localMatchStore: [],
    searchField: "",
  }),
  created() {
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
    this.signIn();
    eventLogger("Matches page loaded");
  },
  destroyed() {
    if (this.signedIn) {
      signOut(auth);
      const dbRef = ref(sessionDb, `${this.getSessionId}/sessionActivity`);
      off(dbRef);
    }
  },
  watch: {
    searchField(value) {
      if (value == "") {
        this.localMatchStore = this.$store.state.matchData;
      } else {
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
      signInWithCustomToken(auth, this.getJWT)
        .then((auth) => {
          const uid = auth.user.uid;
          const dataFromUid = this.getDataFromUid(uid);
          if (dataFromUid == null) {
            this.signInFail();
            return;
          }
          const uidSessionId = dataFromUid.sessionId;
          const uiduserId = dataFromUid.userId;
          if (
            uiduserId !== this.getUserId ||
            uidSessionId !== this.getSessionId
          ) {
            this.signInFail();
            return;
          }
          this.$store.state.isCreator = dataFromUid.isCreator;
          this.getMatchData();
          this.signedIn = true;
        })
        .catch(() => {
          this.signInFail();
          return;
        });
    },
    async getMatchData() {
      const dbRef = ref(sessionDb, `${this.getSessionId}/sessionActivity`);
      onValue(dbRef, (snapshot) => {
        this.$store.state.loader = false;
        const data = snapshot.val();
        if (!data) {
          this.leaveSession(true);
          off(dbRef);
          return;
        }
        if (data.isValid != undefined && data.isValid != null) {
          if (!data.isValid) {
            this.leaveSession(true);
            off(dbRef);
            return;
          }
        }
        const userData = data.users;
        const mySwipes = userData[this.getUserId]["swipes"] || {};
        if (userData) {
          const userDataArray = [];
          for (const iterator of Object.keys(userData)) {
            if (!userData[iterator].swipes) {
              userData[iterator]["swipes"] = {};
            }
            if (iterator !== this.getUserId) {
              userDataArray.push({
                userId: iterator,
                value: Object.keys(userData[iterator].swipes).length,
              });
            } else {
              this.$store.state.totalSwipes = Object.keys(mySwipes).length;
            }
            this.updatedMemberNotification(userData);
          }
          this.$store.state.usersData = userDataArray;
        } else {
          this.$store.state.usersData = [];
        }

        const matchData = this.computeMatches(userData);
        if (matchData) {
          const numMatch = matchData.length;
          this.$store.state.totalMatches = numMatch;
          this.$store.state.matchData = [];
          for (const movieId of matchData) {
            if (this.$store.state.movieData[movieId]) {
              const tempMovieData = {
                movieId: movieId,
                title: this.$store.state.movieData[movieId].title,
                posterURL: this.getImageURL(
                  movieId,
                  this.$store.state.movieData[movieId].poster_path
                ).url,
                description: this.$store.state.movieData[movieId].overview,
                release: this.$store.state.movieData[movieId].release_date,
              };
              this.$store.state.matchData.push(tempMovieData);
            } else {
              this.getMovieData(movieId).then((movieData) => {
                this.$store.state.movieData[movieId] = movieData;
                const tempMovieData = {
                  movieId: movieId,
                  title: movieData.title,
                  posterURL: this.getImageURL(movieId, movieData.poster_path)
                    .url,
                  description: movieData.overview,
                  release: movieData.release_date,
                };
                this.$store.state.matchData.push(tempMovieData);
              });
            }
            if (this.searchField == "") {
              this.localMatchStore = this.$store.state.matchData;
            }
          }
        }
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
