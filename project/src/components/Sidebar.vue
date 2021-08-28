<template>
  <div>
    <div
      v-if="!isSideBarOpen && !isCardDescriptionActive"
      style="position: absolute; right: 0px; top: 67px"
    >
      <button class="btn btn-primary" @click="showSidebar()">
        <!-- <span>
        S<br />
        e<br />
        s<br />
        s<br />
        i<br />
        o<br />
        n
        <br /><br />
        I <br />
        n <br />
        f <br />
        o <br />
      </span>
      <br /> -->
        <i class="fas fa-chevron-left"></i>
      </button>
      <br /><br />
      <button
        class="btn btn-danger usersIcon"
        v-if="this.$store.state.usersData.length > 0"
        @click="showSidebar()"
      >
        <i class="fas fa-users"></i>
        <span class="badge">{{ this.$store.state.usersData.length + 1 }}</span>
      </button>
      <br /><br />
      <button
        class="btn btn-info matchesIcon"
        v-if="
          this.$store.state.totalMatches > 0 &&
          this.$store.state.activePage != 2
        "
        @click="$router.push({ name: 'Matches' })"
      >
        <p class="matchesP">M<br />a<br />t<br />c<br />h<br />e<br />s</p>
        <span class="badge">{{ this.$store.state.totalMatches }}</span>
      </button>
    </div>
    <b-sidebar
      :visible="isSideBarOpen"
      @hidden="hideSidebar()"
      id="sidebar-right"
      title="Sidebar"
      v-bind:sidebar-class="{ sidebarTransparentBack: isCardDescriptionActive }"
      right
      shadow
      bg-variant="dark"
      text-variant="light"
      no-header
      no-close-on-route-change
      ><hr style="margin-top: 0px" />
      <div
        class="row"
        style="
          margin-top: -5px;
          margin-bottom: -20px;
          padding: 5px;
          padding-bottom: 0px;
          padding-top: 0px;
        "
      >
        <b-button
          variant="primary"
          style="width: 40px; height: 40px; margin-left: 20px"
          @click="hideSidebar()"
          v-if="!isCardDescriptionActive"
        >
          <i class="fas fa-chevron-right"></i
        ></b-button>

        <p
          class="col"
          style="float: right !important; width: auto; margin-left: 30px"
        >
          <span><b>Session Id:</b> {{ getSessionId }}</span
          ><br />
          <span><b>My User Id:</b> {{ getUserId }}</span>
        </p>
      </div>
      <div class="whiteColor px-1 py-1">
        <hr
          class="dropdown-divider"
          v-if="this.$store.state.totalMatches > 0"
        />
        <a
          v-if="this.$store.state.totalMatches > 0"
          class="whiteColor dropdown-item"
          id="swipePlaceHolder"
          >Matches :
          {{ this.$store.state.totalMatches }}
        </a>
        <hr class="dropdown-divider" />
        <a class="whiteColor dropdown-item" id="swipePlaceHolder"
          >My Swipes : {{ $store.state.totalSwipes }}</a
        >
        <hr class="dropdown-divider" />
        <div
          class="whiteColor"
          v-for="item in this.$store.state.usersData"
          :key="item.userId"
        >
          <a class="whiteColor dropdown-item"
            >{{ item.userId }} : {{ item.value }}</a
          >
          <hr class="whiteColor dropdown-divider" />
        </div>
      </div>
    </b-sidebar>
  </div>
</template>

<script>
import store from "@/plugins/store/index.js";

export default {
  name: "Sidebar",
  store,
};
</script>

<style scoped>
.matchesIcon {
  color: white;
  text-decoration: none;
  display: inline-block;
}

.matchesIcon .badge {
  position: absolute;
  float: center;
  top: 120px;
  left: -10px;
  border-radius: 25%;
  background: red;
  color: white;
}

.matchesP {
  line-height: 20px;
  padding-bottom: 0px;
  margin-bottom: 0px;
}
.usersIcon {
  color: white;
  padding-left: 10px;
  padding-right: 10px;
  text-decoration: none;
  display: inline-block;
}

.usersIcon .badge {
  position: absolute;
  float: center;
  top: 53px;
  left: -10px;
  border-radius: 25%;
  background: blue;
  color: white;
}

/deep/ .b-sidebar {
  position: fixed;
  padding-top: 55.5px !important;
}

/deep/ .sidebarTransparentBack {
  background-color: rgba(0, 0, 0, 0.65) !important;
  color: white !important;
}

.whiteColor {
  color: white !important;
}

a:hover {
  background-color: black !important;
}
</style>
