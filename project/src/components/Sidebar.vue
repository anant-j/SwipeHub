<template>
  <div>
    <button
      class="btn btn-primary"
      style="position: absolute; right: 0px; top: 67px"
      @click="showSidebar()"
      v-if="!isSideBarOpen && !isCardDescriptionActive"
    >
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
