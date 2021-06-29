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
              <router-link
                class="nav-link"
                to="/matches"
                @click.native="checkPollPending()"
                >Matches</router-link
              >
            </li>
          </ul>
          <ul class="navbar-nav" v-if="this.$store.state.activePage">
            <li
              class="nav-item"
              @click="
                createShareLink();
                hideModal();
              "
            >
              <a class="nav-link" id="matchTab">Share Joinable Link</a>
            </li>
            <li class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle"
                href="#"
                id="navbarDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Session Info
              </a>
              <ul
                class="dropdown-menu dropdown-menu-dark"
                aria-labelledby="navbarDropdown"
              >
                <li>
                  <a class="dropdown-item" id="userIdPlaceholder"
                    >User Id: {{ getUserId }}</a
                  >
                </li>
                <li>
                  <hr class="dropdown-divider" />
                </li>
                <li>
                  <a
                    class="dropdown-item"
                    id="sessionIdPlaceholder"
                    @click="copyToClipboard('sessionId')"
                    >Session Id: {{ getSessionId }}</a
                  >
                </li>
                <li>
                  <hr class="dropdown-divider" />
                </li>
                <li>
                  <a class="dropdown-item" id="swipePlaceHolder"
                    >Total Swipes : {{ $store.state.totalSwipes }}</a
                  >
                </li>
                <div
                  v-for="item in this.$store.state.usersData"
                  :key="item.userId"
                >
                  <li>
                    <hr class="dropdown-divider" />
                  </li>
                  <li>
                    <a class="dropdown-item"
                      >{{ item.userId }} : {{ item.value }}</a
                    >
                  </li>
                </div>
              </ul>
            </li>
            <li class="nav-item" @click="leaveSession()">
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
import store from "../store/index.js";
export default {
  name: "Navbar",
  store,
  watch: {
    $route() {
      document
        .getElementById("navbarSupportedContent")
        .classList.toggle("show");
    },
  },
  methods: {
    hideModal() {
      document
        .getElementById("navbarSupportedContent")
        .classList.toggle("show");
    },
    checkPollPending() {
      if (this.$store.state.likedList.length > 0) {
        this.globalSessionPoll();
      }
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
