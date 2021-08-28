<template>
  <div id="nav">
    <!-- <router-link to="/">Home</router-link> |
    <router-link to="/about" v-if="this.$store.state.sessionActive">About</router-link> -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container-fluid">
        <router-link
          class="navbar-brand"
          to="/"
          v-on:click.native="toHomePage()"
          >SwipeHub</router-link
        >
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <router-link
                class="nav-link"
                to="/"
                v-on:click.native="toHomePage()"
                >Home</router-link
              >
            </li>
            <li class="nav-item" v-if="this.sessionDataPresent">
              <router-link class="nav-link" to="/session">Session</router-link>
            </li>
            <li class="nav-item" v-if="this.sessionDataPresent">
              <router-link class="nav-link" to="/matches"
                >Matches
                <span v-if="this.$store.state.totalMatches > 0"
                  >({{ this.$store.state.totalMatches }})
                </span>
              </router-link>
            </li>
            <li class="nav-item" v-if="this.sessionDataPresent">
              <router-link class="nav-link" to="/history"
                >My Swipes
                <span v-if="this.$store.state.totalSwipes > 0"
                  >({{ $store.state.totalSwipes }})
                </span>
              </router-link>
            </li>
            <li class="nav-item" v-if="this.$store.state.devmode > 0">
              <a @click="toggleDevMode()" class="nav-link"
                >Devmode : {{ this.$store.state.devmode }}</a
              >
            </li>
          </ul>
          <ul class="navbar-nav">
            <li
              class="nav-item"
              @click="
                showShareModal();
                hideModal();
              "
              v-if="this.$store.state.activePage"
            >
              <a class="nav-link" id="matchTab">Share Joinable Link</a>
            </li>
            <li
              class="nav-item"
              @click="leaveSession()"
              v-if="this.$store.state.activePage"
            >
              <a
                class="nav-link"
                id="leaveSessionBtn"
                v-if="!this.$store.state.isCreator"
                >Leave Session</a
              >
              <a
                class="nav-link"
                id="leaveSessionBtn"
                v-if="this.$store.state.isCreator"
                >End Session</a
              >
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </div>
</template>

<script>
import "bootstrap/dist/css/bootstrap.min.css";
import "jquery/src/jquery.js";
import "bootstrap/dist/js/bootstrap.min.js";
import store from "@/plugins/store/index.js";
import { cleanup } from "@/mixins/utilities.js";
import { navigation } from "@/mixins/navigation.js";
import { clipboard, share } from "@/mixins/share.js";
import { eventLogger } from "@/firebase_config.js";

export default {
  name: "Navbar",
  store,
  mixins: [cleanup, navigation, clipboard, share],
  watch: {
    $route() {
      document
        .getElementById("navbarSupportedContent")
        .classList.remove("show");
    },
  },
  methods: {
    hideModal() {
      document
        .getElementById("navbarSupportedContent")
        .classList.toggle("show");
    },
    toggleDevMode() {
      if (this.$store.state.devmode == 1) {
        this.$store.state.devmode = 2;
      } else if (this.$store.state.devmode == 2) {
        this.$store.state.devmode = 1;
      } else {
        console.log("Not in dev mode");
      }
    },
    showShareModal() {
      eventLogger("Share modal displayed");
      this.$store.state.activeShareModal = true;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#nav {
  z-index: 9999;
  position: absolute;
  width: 100%;
}

#nav a {
  color: white;
}

#nav a:hover {
  color: red;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

.navbar-brand {
  color: white !important;
}

.nav-item {
  cursor: pointer;
}
</style>
