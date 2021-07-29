<template>
  <div id="session" v-if="!this.$store.state.loader">
    <!-- <br />
    <h4>{{ tempInfo }}</h4> -->
    <Tinder
      ref="tinder"
      key-name="id"
      :queue.sync="queue"
      :offset-y="-15"
      @submit="onSubmit"
    >
      <template slot-scope="scope">
        <div
          v-if="(!showInfo || queue[0].id !== scope.data.id) && photoAvailable"
          class="pic"
          v-on:dblclick="cardClicked()"
          :style="{
            'background-image': `url(${scope.data.id})`,
          }"
        />
        <div
          v-if="(showInfo || !photoAvailable) && queue[0].id === scope.data.id"
          class="pic_wrap"
          v-on:dblclick="cardClicked()"
        >
          <div class="pic_content">
            <p style="font-size: 23px">
              <b>{{ getTitle }}</b>
            </p>
            <button
              class="btn btn-primary"
              @click="activeDescriptionModal = true"
              v-if="getFontSize[0]"
            >
              View Synopsis
            </button>
            <p
              :style="{ 'font-size': `${getFontSize[1]}` }"
              v-html="getDescription"
              v-else
            ></p>
            <hr />
            <p v-if="!isLastCard">Released : {{ getReleaseDate }}</p>
            <b-modal
              :visible="activeDescriptionModal"
              id="modal-center"
              @hide="activeDescriptionModal = false"
              hide-header-close
              centered
              :title="`Synopsis: ${getTitle}`"
              ok-only
              ok-title="Done"
              style="padding: 0; margin: 0"
            >
              <div class="my-4 text-center" style="padding: 0; margin: 0">
                <p
                  style="
                    height: 27vh;
                    padding: 20px;
                    padding-top: 0px;
                    margin-top: 0px;
                    overflow-y: scroll;
                  "
                >
                  {{ getDescription }}
                </p>
                <b>Released : {{ getReleaseDate }}</b>
                <br />
                <br />
                <img
                  style="
                    height: 50px;
                    border: 1px solid black;
                    border-radius: 100px;
                    cursor: pointer;
                    margin-right: 10px;
                    margin-bottom: 0px;
                  "
                  src="../assets/nope.png"
                  @click="decide('nope')"
                />
                <img
                  style="
                    height: 50px;
                    border: 1px solid black;
                    border-radius: 100px;
                    cursor: pointer;
                    margin-left: 10px;
                    margin-bottom: 0px;
                  "
                  src="../assets/like.png"
                  @click="decide('like')"
                />
              </div>
            </b-modal>
          </div>
          <div
            class="pic_img"
            :style="{
              'background-image': `url(${scope.data.id})`,
            }"
          ></div>
        </div>
      </template>
      <img
        class="card-overlay like-pointer"
        slot="like"
        src="../assets/like.png"
      />
      <img
        class="card-overlay nope-pointer"
        slot="nope"
        src="../assets/nope.png"
      />
      <img
        class="card-overlay super-pointer"
        slot="super"
        src="../assets/like.png"
      />
      <img
        class="card-overlay rewind-pointer"
        slot="rewind"
        src="../assets/rewind.png"
      />
    </Tinder>
    <div class="btns">
      <img src="../assets/nope.png" @click="decide('nope')" />
      <!-- <img
        src="../assets/rewind.png"
        v-if="rewindAllow"
        @click="decide('rewind')"
      /> -->
      <!-- <img src="../assets/super-like.png" @click="decide('super')" /> -->
      <img src="../assets/like.png" @click="decide('like')" />
    </div>
  </div>
</template>

<script>
import Tinder from "vue-tinder";
import axios from "axios";
import {
  sessionDb,
  movieDb,
  auth,
  eventLogger,
  swipe,
} from "../firebase_config";
import { doc, getDoc } from "firebase/firestore";
import { ref, onValue } from "firebase/database";
import { signInWithCustomToken } from "firebase/auth";

export default {
  name: "Session",
  components: { Tinder },
  data: () => ({
    tempInfo: "",
    showInfo: false,
    rewindAllow: false,
    queue: [],
    lastInteraction: 0,
    sessionPausedNotifications: true,
    activeDescriptionModal: false,
    timer: null,
    subsequentPollAllowed: true,
    noCardUrl: "https://i.imgur.com/8MfHjli.png",
    noImageUrl: "https://i.imgur.com/Sql8s2M.png",
    TMDBNull: "https://image.tmdb.org/t/p/originalnull",
  }),
  mounted() {
    if (!this.sessionDataPresent()) {
      console.log("Session Data Not Present");
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
    this.$store.state.activePage = 1;
    this.lastInteraction = 0;
    this.signIn();
    // this.getCards(
    //   `${this.backend}/joinSession?id=${this.getSessionId}&user=${this.getUserId}`
    // );
    // this.poll();
    // document.addEventListener("keyup", this.keyListener);
    eventLogger("Session Page Loaded");
  },
  destroyed() {
    document.removeEventListener("keyup", this.keyListener);
    clearTimeout(this.timer);
  },
  computed: {
    photoAvailable() {
      const inputId = this.queue[0].id;
      const posterlink = inputId.split("?id=")[0];
      if (
        posterlink === this.TMDBNull ||
        posterlink === this.noImageUrl ||
        posterlink === this.noCardUrl
      ) {
        return false;
      }
      return true;
    },
    isLastCard() {
      const inputId = this.queue[0].id;
      const movieId = inputId.split("?id=")[1];
      return movieId == -1;
    },
    getTitle() {
      const inputId = this.queue[0].id;
      const movieId = inputId.split("?id=")[1];
      const movieName = this.$store.state.movieData[movieId].title;
      return movieName;
    },
    getDescription() {
      const inputId = this.queue[0].id;
      const movieId = inputId.split("?id=")[1];
      const movieDescription = this.$store.state.movieData[movieId].overview;
      return movieDescription;
    },
    getFontSize() {
      const descLength = this.getDescription.length;
      let res = 0;
      let showIcon = false;
      if (descLength <= 300) {
        res = 18;
      } else if (descLength > 300 && descLength <= 500) {
        res = 15;
      } else {
        showIcon = true;
      }
      return [showIcon, `${res}px`];
    },
    getReleaseDate() {
      const inputId = this.queue[0].id;
      const movieId = inputId.split("?id=")[1];
      const movieReleaseDate =
        this.$store.state.movieData[movieId].release_date;
      return movieReleaseDate;
    },
  },
  methods: {
    signIn() {
      signInWithCustomToken(auth, this.getJWT())
        .then(() => {
          this.getSessionData();
          this.$store.state.loader = false;
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(errorCode, errorMessage);
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
    async getMovieData(id) {
      const docRef = doc(movieDb, "media", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        return null;
      }
    },
    async getSessionData() {
      const dbRef = ref(sessionDb, `${this.getSessionId()}/sessionActivity`);
      onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        this.tempInfo = JSON.stringify(data);
        for (const id of data.mediaOrder) {
          if (
            !Object.prototype.hasOwnProperty.call(
              this.$store.state.movieData,
              id
            )
          ) {
            this.getMovieData(id).then((movieData) => {
              this.$store.state.movieData[id] = movieData;
              this.addCard(id);
            });
          }
        }
      });
    },
    addLastCard() {
      const list = [];
      const posterLink = this.noCardUrl;
      this.$store.state.movieData[-1] = {
        adult: false,
        description:
          "We've run out of cards to show you!<br><br><h3 style='color: red;'>Swipe Left to Leave Session</h3><br>OR<br><br><h3 style='color: #66ff00;'>Swipe Right to View Matches</h3>",
        poster: posterLink,
        release_date: "N/A",
        title: "Uh-oh",
      };
      list.push({
        id: posterLink + `?id=-1`,
      });
      this.queue = this.queue.concat(list);
      this.subsequentPollAllowed = false;
      return;
    },
    addCard(id) {
      const cardData = this.$store.state.movieData[id];
      const list = [];
      let posterlink =
        "https://image.tmdb.org/t/p/original" + cardData.poster_path;
      if (posterlink === this.TMDBNull) {
        posterlink = this.noImageUrl;
      }
      posterlink = posterlink.replace("http://", "https://");
      const finalPosterLink = posterlink + `?id=${id}`;
      if (!this.queue.includes(finalPosterLink)) {
        list.push({
          id: finalPosterLink,
        });
      }
      this.queue = this.queue.concat(list);
    },
    getCards(url) {
      axios
        .get(url, {
          validateStatus: false,
        })
        .then((result) => {
          this.$store.state.loader = false;
          if (result.data.totalSwipes !== undefined) {
            this.$store.state.totalSwipes = result.data.totalSwipes;
          }
          if (result.data.isCreator !== undefined) {
            this.$store.state.isCreator = result.data.isCreator;
          }
          const order = result.data.movies.order;
          if (order.length == 0) {
            this.addLastCard();
            return;
          }
          const list = [];
          for (let i = 0; i < order.length; i++) {
            if (order[i] == null) {
              this.addLastCard();
              return;
            }
            // if (!(order[i] in this.$store.state.movieData)) {
            this.$store.state.movieData[order[i]] =
              result.data.movies[order[i]];
            let posterlink = result.data.movies[order[i]].poster;
            if (posterlink === this.TMDBNull) {
              posterlink = this.noImageUrl;
            }
            posterlink = posterlink.replace("http://", "https://");
            const finalPosterLink = posterlink + `?id=${order[i]}`;
            if (!this.queue.includes(finalPosterLink)) {
              list.push({
                id: finalPosterLink,
              });
            }
          }
          this.queue = this.queue.concat(list);
        })
        .catch(() => {
          this.addLastCard();
        });
    },
    poll() {
      if (this.pollAllowed()) {
        if (document.hasFocus()) {
          this.sessionPausedNotifications = false;
          this.globalSessionPoll();
        }
      } else {
        if (!this.sessionPausedNotifications) {
          this.showAlert(
            "Session is paused. Swipe again to receive session updates",
            "w",
            4900,
            "sessionPausedAlert"
          );
          this.sessionPausedNotifications = true;
        }
      }
      this.timer = setTimeout(() => this.poll(), 5000);
    },
    onSubmit(choice) {
      this.lastInteraction = new Date();
      this.rewindAllow = true;
      this.showInfo = false;
      this.activeDescriptionModal = false;
      this.$store.state.totalSwipes += 1;
      const id = this.getId(choice.item.id);
      if (id == "-1") {
        if (choice.type === "nope") {
          this.leaveSession();
        }
        if (choice.type === "like" || choice.type === "super") {
          this.$router.push({ name: "Matches" });
        }
        return;
      }
      if (this.queue.length === 9 && this.subsequentPollAllowed) {
        this.getCards(
          `${
            this.backend
          }/subsequentCards?id=${this.getSessionId()}&userId=${this.getUserId()}&totalCards=${
            this.$store.state.totalSwipes
          }`
        );
      }
      if (choice.type === "like" || choice.type === "super") {
        swipe({ requestType: "like", id: id });
        this.$store.state.likedSet.add(id);
      }
      if (choice.type === "nope") {
        swipe({ requestType: "dislike", id: id });
      }
      this.$store.state.swipeHistory.push(choice.item);
    },
    async decide(choice) {
      if (choice === "rewind") {
        if (this.$store.state.swipeHistory.length && this.rewindAllow) {
          this.$refs.tinder.rewind([this.$store.state.swipeHistory.pop()]);
          this.rewindAllow = false;
        }
      } else {
        this.$refs.tinder.decide(choice);
      }
    },
    cardClicked() {
      this.lastInteraction = new Date();
      this.showInfo = !this.showInfo;
    },
    pollAllowed() {
      const currentTime = new Date();
      if (
        (currentTime - this.lastInteraction) / 1000 > 60 ||
        this.lastInteraction === 0
      ) {
        return false;
      }
      return true;
    },
    keyListener: function (evt) {
      if (evt.keyCode === 37) {
        this.decide("nope");
      }
      if (evt.keyCode === 39) {
        this.decide("like");
      }
    },
  },
};
</script>

<style>
body,
#app,
template {
  overflow: hidden;
}
</style>
<style scoped>
body {
  margin: 0;
  background-color: #20262e;
  /* overflow-y: hidden; */
}

.card-overlay {
  max-width: 230px !important;
  max-height: 75px !important;
  width: auto !important;
  height: auto !important;
}

#session .vue-tinder {
  position: absolute;
  z-index: 1;
  left: 1px;
  right: 0;
  top: 50px;
  margin: auto;
  height: 69vh;
  width: 46vh;
  cursor: pointer;
}

.nope-pointer,
.like-pointer {
  position: absolute;
  z-index: 1;
  top: 20px;
  width: 64px;
  height: 64px;
}

.nope-pointer {
  right: 10px;
}

.like-pointer {
  left: 10px;
}

.super-pointer {
  position: absolute;
  z-index: 1;
  bottom: 80px;
  left: 0;
  right: 0;
  margin: auto;
  width: 112px;
  height: 78px;
}

.rewind-pointer {
  position: absolute;
  z-index: 1;
  top: 20px;
  right: 10px;
  width: 112px;
  height: 78px;
}

.pic {
  width: 100%;
  height: 100%;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  animation: blurOut ease 1s;
  -webkit-animation: blurOut ease 1s;
  -moz-animation: blurOut ease 1s;
  -o-animation: blurOut ease 1s;
  -ms-animation: blurOut ease 1s;
  /* box-shadow: 0 4px 9px rgba(0, 0, 0, 0.15); */
}

.pic_wrap {
  height: 100%;
  width: 100%;
}

.pic_img {
  position: absolute;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
  opacity: 0.75;
  filter: blur(3px);
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.pic_content {
  position: absolute;
  width: 100%;
  height: 100%;
  padding-top: 20px;
  /* word-break: break-all; */
  padding-left: 20px;
  padding-right: 20px;
  justify-content: center;
  align-items: center;
  color: white;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
  text-align: center;
  animation: fadeIn ease 1s;
  -webkit-animation: fadeIn ease 1s;
  -moz-animation: fadeIn ease 1s;
  -o-animation: fadeIn ease 1s;
  -ms-animation: fadeIn ease 1s;
}

.btns {
  position: relative;
  left: 0;
  right: 0;
  top: 80vh;
  margin: auto;
  height: 65px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 300px;
  max-width: 355px;
}

.btns img {
  margin-right: 12px;
  box-shadow: 0 4px 9px rgba(0, 0, 0, 0.15);
  border-radius: 50%;
  cursor: pointer;
  /* -webkit-tap-highlight-color: transparent; */
}

.btns img:nth-child(2n + 1) {
  width: 53px;
}

.btns img:nth-child(2n) {
  /* width: 65px; */
  width: 53px;
}

.btns img:nth-last-child(1) {
  margin-right: 0;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@-moz-keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@-webkit-keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@-o-keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@-ms-keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes blurOut {
  0% {
    filter: blur(3px);
  }
  100% {
    filter: blur(0px);
  }
}

@-moz-keyframes blurOut {
  0% {
    filter: blur(3px);
  }
  100% {
    filter: blur(0px);
  }
}

@-webkit-keyframes blurOut {
  0% {
    filter: blur(3px);
  }
  100% {
    filter: blur(0px);
  }
}

@-o-keyframes blurOut {
  0% {
    filter: blur(3px);
  }
  100% {
    filter: blur(0px);
  }
}

@-ms-keyframes blurOut {
  0% {
    filter: blur(3px);
  }
  100% {
    filter: blur(0px);
  }
}

@media only screen and (max-width: 600px) {
  #session .vue-tinder {
    top: 50px;
    margin: auto;
    width: calc(100% - 20px);
    height: 60vh;
    width: 40vh;
  }

  .btns {
    top: 70vh;
  }
}
</style>
