<template>
  <div id="session" v-if="!this.$store.state.loader">
    <transition name="fade">
      <img
        v-lazy="{
          src: getBackDrop,
          loading: 'https://i.giphy.com/media/N256GFy1u6M6Y/giphy.webp',
        }"
        v-if="isCardDescriptionActive"
        class="backgroundImage"
      />
    </transition>
    <Tinder
      ref="tinder"
      key-name="id"
      :queue.sync="queue"
      :offset-y="-15"
      :allowSuper="superAllowed"
      @submit="onSubmit"
      v-if="!isCardDescriptionActive"
    >
      <template slot-scope="scope">
        <div class="pic_wrap" v-on:dblclick="cardClicked()">
          <div class="pic_content">
            <a class="iconP" @click="showInfoModal()">
              <i class="fas fa-info-circle"></i>
            </a>
            <p class="titleP">
              <b>{{ getTitle }}</b>
            </p>
            <div class="mt-2 mb-3">
              <span v-for="(genre, index) in getGenres" :key="index">
                <b-badge
                  pill
                  class="badgeStyle"
                  v-if="getGenreFromId(genre) != null"
                >
                  {{ getGenreFromId(genre) }} </b-badge
                >&nbsp;
              </span>
            </div>
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
        src="@/assets/like.png"
      />
      <img
        class="card-overlay nope-pointer"
        slot="nope"
        src="@/assets/nope.png"
      />
      <!-- <img
        class="card-overlay super-pointer"
        slot="super"
        src="@/assets/like.png"
      /> -->
      <img
        class="card-overlay rewind-pointer"
        slot="rewind"
        src="@/assets/rewind.png"
      />
    </Tinder>
    <b-modal
      :visible="isCardDescriptionActive"
      @hide="hideInfoModal()"
      hide-header-close
      no-close-on-backdrop
      centered
      :title="`${getTitle}`"
      ok-only
      ok-title="Done"
      style="padding: 0; margin: 0"
      class="modalb"
      v-if="this.queue.length > 0"
    >
      <template #modal-header>
        <h4>{{ getTitle }}</h4>
        <b-button
          size="sm"
          variant="primary"
          style="float: right"
          @click="toggleSidebar()"
        >
          <i
            v-show="isSideBarOpen"
            class="fas fa-chevron-right"
            title="Close Sidebar"
            key="rightArrow"
          />
          <i
            v-show="!isSideBarOpen"
            class="fas fa-chevron-left"
            title="Open Sidebar"
            key="leftArrow"
          />
        </b-button>
      </template>
      <div class="my-4">
        <p
          style="
            font-size: 17px;
            height: 25vh;
            padding-left: 10px;
            padding-right: 10px;
            padding-top: -10px;
            margin-top: -10px;
            overflow-y: auto;
          "
        >
          {{ getDescription }}
        </p>
        <div style="padding-left: 10px; padding-right: 10px">
          <b>Categories : </b>
          <span v-for="(genre, index) in getGenres" :key="index">
            <b-badge
              pill
              class="badgeStyle"
              v-if="getGenreFromId(genre) != null"
            >
              {{ getGenreFromId(genre) }} </b-badge
            >&nbsp;
          </span>
          <br />
          <b>Released : {{ getReleaseDate }}</b>
          <br />
          <span v-if="getOriginalTitle"
            ><b>Also known as: {{ getOriginalTitle }}</b></span
          >
          <span v-if="getPlatforms">
            <br />
            <b>Available on : </b>
            <span v-for="platform in getPlatforms" :key="platform">
              <img
                :id="`imageTarget${platform}`"
                style="height: 30px; margin-right: 10px"
                :src="getPlatformDetails(platform).image"
                v-if="getPlatformDetails(platform).valid"
              />
              <b-tooltip
                :target="`imageTarget${platform}`"
                noninteractive
                placement="up"
                v-if="getPlatformDetails(platform).valid"
              >
                {{ getPlatformDetails(platform).name }}
              </b-tooltip></span
            >
            <!-- this.getPlatformImage(platform) -->
          </span>
        </div>
        <br />
        <br />
        <div class="text-center">
          <img
            style="
              height: 50px;
              border-radius: 100px;
              cursor: pointer;
              margin-right: 10px;
              margin-bottom: 0px;
            "
            src="@/assets/nope.png"
            @click="decide('nope')"
          />
          <img
            style="
              height: 50px;
              border-radius: 100px;
              cursor: pointer;
              margin-left: 10px;
              margin-bottom: 0px;
            "
            src="@/assets/like.png"
            @click="decide('like')"
          />
        </div>
      </div>
      <template #modal-footer>
        <a
          class="btn btn-danger"
          :href="getTrailerUrl"
          target="_blank"
          v-if="getTrailerUrl != null"
          ><i class="fab fa-youtube fa-lg"></i> Watch Trailer</a
        >
        <b-button
          variant="primary"
          style="float: right"
          @click="hideInfoModal()"
        >
          Done
        </b-button>
      </template>
    </b-modal>
    <transition name="fade">
      <div class="btns" v-if="!isCardDescriptionActive">
        <img src="@/assets/nope.png" @click="decide('nope')" />
        <img
          src="@/assets/rewind.png"
          v-if="rewindAllow"
          @click="decide('rewind')"
        />
        <!-- <img src="@/assets/super-like.png" @click="decide('super')" /> -->
        <!-- <img src="@/assets/help.png" @click="cardClicked()" /> -->
        <img src="@/assets/like.png" @click="decide('like')" />
      </div>
    </transition>
  </div>
</template>

<script>
import Tinder from "vue-tinder";
import { sessionDb, auth, eventLogger } from "@/firebase_config.js";
import { ref, onValue, off, set } from "firebase/database";
import { signInWithCustomToken, signOut } from "firebase/auth";
import { notification, memberNotification } from "@/mixins/notification.js";
import { cleanup, mediaTools } from "@/mixins/utilities.js";
import { requestSubsequentCards } from "@/firebase_config.js";

export default {
  name: "Session",
  components: { Tinder },
  mixins: [notification, cleanup, mediaTools, memberNotification],
  data: () => ({
    showInfo: false,
    rewindAllow: false,
    superAllowed: false,
    subsequentAllowed: true,
    keyAllowed: true,
    queue: [],
    shown: new Set(),
    signedIn: false,
    sessionCountry: null,
  }),
  mounted() {
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
    this.signIn();
    document.addEventListener("keydown", this.keyDownListener);
    document.addEventListener("keyup", this.keyUpListener);
    eventLogger("Session Page Loaded");
  },
  destroyed() {
    document.removeEventListener("keydown", this.keyDownListener);
    document.removeEventListener("keyup", this.keyUpListener);
    if (this.signedIn) {
      signOut(auth);
      const dbRef = ref(sessionDb, `${this.getSessionId}/sessionActivity`);
      off(dbRef);
    }
  },
  computed: {
    photoAvailable() {
      const inputId = this.queue[0].id;
      const poster = this.getImageURL(
        inputId.split("?id=")[1],
        inputId.split("?id=")[0]
      );
      if (!poster.valid) {
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
    getPlatforms() {
      if (!this.sessionCountry) {
        return null;
      }
      const inputId = this.queue[0].id;
      const movieId = inputId.split("?id=")[1];
      let provider =
        this.$store.state.movieData[movieId].providers[this.sessionCountry];
      return provider || null;
    },
    getTrailerUrl() {
      const inputId = this.queue[0].id;
      const movieId = inputId.split("?id=")[1];
      let trailer = this.$store.state.movieData[movieId].trailerURL;
      if (trailer == "") {
        return null;
      }
      return trailer || null;
    },
    getGenres() {
      const inputId = this.queue[0].id;
      const movieId = inputId.split("?id=")[1];
      const genres = this.$store.state.movieData[movieId].genre_ids;
      return genres;
    },
    getBackDrop() {
      if (this.queue.length > 0) {
        const inputId = this.queue[0].id;
        const movieId = inputId.split("?id=")[1];
        const backdrop = this.$store.state.movieData[movieId].backdrop_path;
        return this.getImageURL(movieId, backdrop).url;
      }
      return "";
    },
    getDescription() {
      const inputId = this.queue[0].id;
      const movieId = inputId.split("?id=")[1];
      const movieDescription = this.$store.state.movieData[movieId].overview;
      return movieDescription;
    },
    getReleaseDate() {
      const inputId = this.queue[0].id;
      const movieId = inputId.split("?id=")[1];
      const movieReleaseDate =
        this.$store.state.movieData[movieId].release_date;
      return movieReleaseDate;
    },
    getOriginalTitle() {
      const inputId = this.queue[0].id;
      const movieId = inputId.split("?id=")[1];
      const title = this.$store.state.movieData[movieId].title;
      const originalTitle =
        this.$store.state.movieData[movieId].original_title ||
        this.$store.state.movieData[movieId].original_name;
      if (title != originalTitle) {
        return originalTitle;
      }
      return null;
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
          this.getSessionData();
          this.signedIn = true;
        })
        .catch(() => {
          this.signInFail();
          return;
        });
    },
    async getSessionData() {
      const dbRef = ref(sessionDb, `${this.getSessionId}/sessionActivity`);
      onValue(dbRef, (snapshot) => {
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
        if (data.region) {
          this.sessionCountry = data.region;
        }
        const allUserData = data.users;
        const userData = {};
        for (const iterator of Object.keys(allUserData)) {
          if (allUserData[iterator].isActive) {
            userData[iterator] = allUserData[iterator];
          }
        }
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

        const matches = this.computeMatches(userData);
        if (matches) {
          const numMatch = matches.length;
          // if (this.$store.state.totalMatches !== numMatch && numMatch > 0) {
          //   this.$store.state.totalMatches = numMatch;
          //   this.showAlert(`temp`, "s", 4800, "matchesAlert");
          // }
          this.$store.state.totalMatches = numMatch;
        } else {
          this.$store.state.totalMatches = 0;
        }
        const allMovies = data.mediaOrder;
        if (allMovies) {
          for (const id of allMovies) {
            if (!Object.keys(mySwipes).includes(id)) {
              if (id == -1 || id == "null") {
                this.addCard("null");
              }
              if (!this.$store.state.movieData[id]) {
                this.getMovieData(id).then((movieData) => {
                  this.$store.state.movieData[id] = movieData;
                  this.addCard(id);
                });
              } else {
                this.addCard(id);
              }
            } else {
              this.removeCard(id);
            }
          }
          if (allMovies.includes("null")) {
            this.subsequentAllowed = false;
          }
        }
      });
    },
    addLastCard() {
      if (this.shown.has(-1)) {
        return;
      }
      const list = [];
      const posterLink = this.noCardUrl;
      this.$store.state.movieData[-1] = {
        overview:
          "We've run out of cards to show you!<br><br><h3 style='color: cyan;'>Swipe Left to View Swipe History</h3><br>OR<br><br><h3 style='color: #66ff00;'>Swipe Right to View Matches</h3>",
        poster: posterLink,
        release_date: "N/A",
        title: "Uh-oh",
      };
      list.push({
        id: posterLink + `?id=-1`,
      });
      this.queue = this.queue.concat(list);
      this.shown.add(-1);
      return;
    },
    removeCard(id) {
      const index = this.queue.findIndex(
        (item) => item.id.split("?id=")[1] === id
      );
      if (index > -1) {
        this.queue.splice(index, 1);
      }
      return;
    },
    addCard(id) {
      this.$store.state.loader = false;
      if (id == -1 || id == "null" || id == null) {
        this.addLastCard();
        return;
      }
      if (this.shown.has(id)) {
        return;
      }
      const cardData = this.$store.state.movieData[id];
      const list = [];
      let posterlink = this.getImageURL(id, cardData.poster_path).url;
      list.push({
        id: posterlink,
      });
      this.queue = this.queue.concat(list);
      this.shown.add(id);
    },
    onSubmit(choice) {
      // this.rewindAllow = true;
      this.showInfo = false;
      this.$store.state.totalSwipes += 1;
      const id = this.getIdfromURL(choice.item.id);
      this.hideInfoModal();
      if (this.queue.length == 9 && this.subsequentAllowed) {
        requestSubsequentCards();
      }
      if (id == "-1") {
        if (choice.type === "nope") {
          this.$router.push({ name: "History" });
        }
        if (choice.type === "like") {
          this.$router.push({ name: "Matches" });
        }
        return;
      }
      this.swipe(id, choice.type);
    },
    swipe(id, type) {
      const dbRef = ref(
        sessionDb,
        `${this.getSessionId}/sessionActivity/users/${this.getUserId}/swipes/${id}`
      );
      if (type === "like") {
        set(dbRef, true);
      } else if (type === "nope") {
        set(dbRef, false);
      }
      return;
    },
    async decide(choice) {
      try {
        if (this.isCardDescriptionActive) {
          const cardId = this.queue[0].id;
          this.removeCard(cardId);
          choice = { item: { id: cardId }, type: choice };
          this.onSubmit(choice);
          return;
        }
        if (choice === "rewind") {
          if (this.$store.state.swipeHistory.length && this.rewindAllow) {
            this.$refs.tinder.rewind([this.$store.state.swipeHistory.pop()]);
            this.rewindAllow = false;
          }
        } else {
          this.$refs.tinder.decide(choice);
        }
      } catch (error) {
        this.$store.state.loader = true;
        await this.timedDelay(5000);
        if (this.$store.state.loader == true) {
          this.$store.state.loader == false;
          this.addLastCard();
        }
      }
      return;
    },
    cardClicked() {
      this.showInfoModal();
    },
    keyDownListener: function (evt) {
      if (
        evt.code === "ArrowLeft" &&
        document.hasFocus() &&
        !this.$store.state.activeShareModal &&
        this.keyAllowed == true
      ) {
        this.keyAllowed = false;
        this.decide("nope");
      }
      if (
        evt.code === "ArrowRight" &&
        document.hasFocus() &&
        !this.$store.state.activeShareModal &&
        this.keyAllowed == true
      ) {
        this.keyAllowed = false;
        this.decide("like");
      }
    },
    keyUpListener: function (evt) {
      if (evt.code === "ArrowLeft" || evt.code === "ArrowRight") {
        this.keyAllowed = true;
      }
    },
  },
};
</script>

<style scoped>
* {
  scrollbar-width: thin;
  scrollbar-color: transparent gray;
}

/* Works on Chrome, Edge, and Safari */
*::-webkit-scrollbar {
  width: 12px;
}

*::-webkit-scrollbar-track {
  background: transparent;
}

*::-webkit-scrollbar-thumb {
  background-color: gray;
  border-radius: 20px;
  border: 1px solid white;
}

.badgeStyle {
  font-size: 13.5px;
  font-weight: 500;
  background: rgba(23, 162, 184, 0.5);
  margin-bottom: 5px;
}

/deep/ .modal-content {
  color: white;
  /* background: rgba(0, 0, 0, 0.65) !important; */
  background: rgba(0, 0, 0, 0.65);
}
/deep/ .modal-backdrop {
  color: white;
  /* background-color: rgba(0, 0, 0, 0) !important; */
  background-color: rgba(0, 0, 0, 0);
}

.modalb {
  color: white !important;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

.backgroundImage {
  position: absolute;
  width: 100vw;
  height: 90vh;
  /* size: contain !important; */
  object-fit: cover !important;
}
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
  /* cursor: pointer; */
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
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.pic_content {
  position: absolute;
  bottom: -1px;
  min-height: 75px;
  max-height: 50%;
  width: 100%;
  padding-left: 20px;
  padding-right: 20px;
  color: white;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px) grayscale(50);
  z-index: 100;
  /* justify-content: center; */
  /* align-items: center; */
  /* text-align: center; */
}

.titleP {
  width: 80%;
  margin-top: 10px !important;
  /* padding-top: 15px !important; */
  margin-bottom: 0px !important;
  padding-bottom: 0px !important;
  font-size: 17px;
}

.releaseP {
  font-size: 15px;
}

.iconP {
  float: right !important;
  font-size: 30px;
  color: white !important;
  padding: none;
  margin: none;
  /* margin-top: -50px !important; */
  cursor: pointer;
}

.iconP:hover {
  color: rgb(13, 110, 253) !important;
  background-color: transparent !important;
}

.btns {
  position: relative;
  width: 100vw;
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
