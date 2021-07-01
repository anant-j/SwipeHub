<template>
  <div id="session" v-if="!this.$store.state.loader">
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
            <p :style="{ 'font-size': `${getFontSize}` }">
              {{ getDescription }}
            </p>
            <hr />
            <p>Released : {{ getReleaseDate }}</p>
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
      <!-- <img src="../assets/help.png" @click="decide('help')" /> -->
    </div>
  </div>
</template>

<script>
import Tinder from "vue-tinder";
import axios from "axios";

export default {
  name: "Session",
  components: { Tinder },
  data: () => ({
    showInfo: false,
    rewindAllow: false,
    queue: [],
    lastInteraction: 0,
    sessionPausedNotifications: true,
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
    this.$store.state.activePage = 1;
    this.getCards(
      `${this.backend}/joinSession?id=${this.getSessionId}&user=${this.getUserId}`
    );
    this.poll();
  },
  computed: {
    photoAvailable() {
      const inputId = this.queue[0].id;
      const posterlink = inputId.split("?id=")[0];
      if (
        posterlink === "http://image.tmdb.org/t/p/originalnull" ||
        posterlink === "https://i.imgur.com/Sql8s2M.png"
      ) {
        return false;
      }
      return true;
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
      const movieDescription = this.$store.state.movieData[movieId].description;
      return movieDescription;
    },
    getFontSize() {
      const descLength = this.getDescription.length;
      let res = 0;
      if (descLength <= 300) {
        res = 20;
      } else if (descLength > 300 && descLength <= 500) {
        res = 15;
      } else if (descLength > 500 && descLength < 700) {
        res = 13;
      } else {
        res = 17 - descLength / 150;
      }
      return `${res}px`;
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
          const list = [];
          for (let i = 0; i < order.length; i++) {
            let posterlink = result.data.movies[order[i]].poster;
            if (posterlink === "http://image.tmdb.org/t/p/originalnull") {
              posterlink = "https://i.imgur.com/Sql8s2M.png";
            }
            posterlink = posterlink.replace("http://", "https://");
            list.push({
              id: posterlink + `?id=${order[i]}`,
            });
            this.$store.state.movieData[order[i]] =
              result.data.movies[order[i]];
          }
          this.queue = this.queue.concat(list);
        })
        .catch(() => {
          this.showAlert(
            "This session could not be loaded. It might have been ended by the creator. You will now be redirected to homepage.",
            "e",
            5000,
            "sessionLoadAlert"
          );
          let root = this;
          setTimeout(function () {
            root.clearSession();
            root.$router.push({ name: "Home" });
          }, 5000);
        });
    },
    poll() {
      if (this.pollAllowed() && this.$store.state.activePage === 1) {
        this.sessionPausedNotifications = false;
        this.globalSessionPoll();
      } else {
        if (
          !this.sessionPausedNotifications &&
          this.$store.state.activePage === 1
        ) {
          this.showAlert(
            "Session is paused. Swipe again to receive session updates",
            "w",
            4900,
            "sessionPausedAlert"
          );
          this.sessionPausedNotifications = true;
        }
      }
      setTimeout(() => this.poll(), 5000);
    },
    onSubmit(choice) {
      this.lastInteraction = new Date();
      this.rewindAllow = true;
      this.showInfo = false;
      this.$store.state.totalSwipes += 1;
      if (this.queue.length === 9) {
        this.getCards(
          `${this.backend}/subsequentCards?id=${this.getSessionId}&userId=${this.getUserId}&totalCards=${this.$store.state.totalSwipes}`
        );
      }
      if (choice.type === "like" || choice.type === "super") {
        const id = this.getId(choice.item.id);
        this.$store.state.likedList.push(id);
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
        (currentTime - this.lastInteraction) / 1000 > 45 ||
        this.lastInteraction === 0
      ) {
        return false;
      }
      return true;
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
