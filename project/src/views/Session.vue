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
          v-if="(!showInfo || queue[0].id != scope.data.id) && photoAvailable"
          class="pic"
          @click="cardClicked()"
          :style="{
            'background-image': `url(${scope.data.id})`,
          }"
        />
        <div
          v-if="(showInfo || !photoAvailable) && queue[0].id == scope.data.id"
          class="pic_wrap"
          @click="cardClicked()"
        >
          <div class="pic_content">
            <h2>{{ getTitle }}</h2>
            <p>{{ getDescription }}</p>
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
      <img
        src="../assets/rewind.png"
        v-if="rewindAllow"
        @click="decide('rewind')"
      />
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
    // offset: 0,
    history: [],
  }),
  created() {
    this.$store.state.loader = true;
    this.$store.state.sessionActive = true;
    this.joinSession();
  },
  watch: {
    history(value) {
      this.$store.state.totalSwipes = value.length;
    },
  },
  computed: {
    photoAvailable() {
      const inputId = this.queue[0].id;
      const posterlink = inputId.split("?id=")[0];
      if (
        posterlink == "http://image.tmdb.org/t/p/originalnull" ||
        posterlink == "https://i.imgur.com/Sql8s2M.png"
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
  },
  methods: {
    joinSession() {
      axios
        .get(
          `${this.backend}/joinSession?id=${this.getSessionId}&user=${this.getUserId}`,
          {
            validateStatus: false,
          }
        )
        .then((result) => {
          this.$store.state.loader = false;
          const order = result.data.movies.order;
          const list = [];
          for (let i = 0; i < order.length; i++) {
            let posterlink = result.data.movies[order[i]].poster;
            if (posterlink == "http://image.tmdb.org/t/p/originalnull") {
              posterlink = "https://i.imgur.com/Sql8s2M.png";
            }
            list.push({
              id: posterlink + `?id=${order[i]}`,
            });
            this.$store.state.movieData[order[i]] =
              result.data.movies[order[i]];
            // this.offset++;
          }
          this.queue = this.queue.concat(list);
        });
    },
    onSubmit(choice) {
      this.rewindAllow = true;
      this.showInfo = false;
      if (this.queue.length < 3) {
        this.mock();
      }
      this.history.push(choice.item);
    },
    async decide(choice) {
      if (choice === "rewind") {
        if (this.history.length && this.rewindAllow) {
          this.$refs.tinder.rewind([this.history.pop()]);
          this.rewindAllow = false;
        }
      } else {
        this.$refs.tinder.decide(choice);
      }
    },
    cardClicked() {
      this.showInfo = !this.showInfo;
    },
  },
};
</script>

<style scoped>
body {
  margin: 0;
  background-color: #20262e;
  overflow-y: hidden;
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
  opacity: 0.3;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.pic_content {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 10%;
  /* word-break: break-all; */
  padding-left: 20px;
  padding-right: 20px;
  justify-content: center;
  align-items: center;
  color: black;
  z-index: 100;
  text-align: center;
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

