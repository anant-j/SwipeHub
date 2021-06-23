<template>
  <div id="session">
    <Tinder
      ref="tinder"
      key-name="id"
      :queue.sync="queue"
      :offset-y="-15"
      @submit="onSubmit"
    >
      <template slot-scope="scope">
        <div
          v-if="!showInfo || queue[0].id != scope.data.id"
          class="pic"
          @click="showInfo = !showInfo"
          :style="{
            'background-image': `url(http://image.tmdb.org/t/p/original/${scope.data.id})`,
          }"
        />
        <div
          v-if="showInfo && queue[0].id == scope.data.id"
          class="pic_wrap"
          @click="showInfo = !showInfo"
        >
          <div class="pic_content">{{ scope.data.id }}</div>
          <div
            class="pic_img"
            :style="{
              'background-image': `url(http://image.tmdb.org/t/p/original/${scope.data.id})`,
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
        src="../assets/super-like.png"
      />
      <img
        class="card-overlay rewind-pointer"
        slot="rewind"
        src="../assets/rewind.png"
      />
    </Tinder>
    <div class="btns">
      <img src="../assets/rewind.png" @click="decide('rewind')" />
      <img src="../assets/nope.png" @click="decide('nope')" />
      <img src="../assets/super-like.png" @click="decide('super')" />
      <img src="../assets/like.png" @click="decide('like')" />
      <img src="../assets/help.png" @click="decide('help')" />
    </div>
  </div>
</template>

<script>
import Tinder from "vue-tinder";
import source from "@/views/bing.js";

export default {
  name: "Session",
  components: { Tinder },
  data: () => ({
    showInfo: false,
    queue: [],
    offset: 0,
    history: [],
  }),
  created() {
    this.$store.state.sessionActive = true;
    this.mock();
  },
  methods: {
    mock(count = 10, append = true) {
      const list = [];
      for (let i = 0; i < count; i++) {
        list.push({ id: source[this.offset] });
        this.offset++;
      }
      if (append) {
        this.queue = this.queue.concat(list);
      } else {
        this.queue.unshift(...list);
      }
    },
    onSubmit(choice) {
      this.showInfo = false;
      if (this.queue.length < 3) {
        this.mock();
      }
      this.history.push(choice.item);
    },
    async decide(choice) {
      if (choice === "rewind") {
        if (this.history.length) {
          this.$refs.tinder.rewind([this.history.pop()]);
        }
      } else if (choice === "help") {
        window.open("https://shanlh.github.io/vue-tinder");
      } else {
        this.$refs.tinder.decide(choice);
      }
    },
    clicked() {
      alert("clicked");
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
  top: 40%;
  word-break: break-all;
  padding-left: 20px;
  padding-right: 20px;
  justify-content: center;
  align-items: center;
  color: black;
  z-index: 100;
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

