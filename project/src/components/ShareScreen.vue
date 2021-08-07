<template>
  <b-modal
    :visible="shareModalVisible"
    id="modal-center"
    @hide="$store.state.activeShareModal = false"
    hide-header-close
    centered
    title="Share via QR Code/Send Link"
    ok-only
    ok-title="Done"
  >
    <p class="my-4 text-center">
      <qrcode
        :value="this.getShareLink()"
        :options="{ width: 200 }"
        style="
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        "
      ></qrcode
      ><br />
      <button
        type="button"
        class="col-8 btn btn-light"
        style="
          -webkit-user-select: text;
          -moz-user-select: text;
          -ms-user-select: text;
          user-select: text;
        "
      >
        {{ this.getShareLink() }}
      </button>
      <!-- <a class="link">{{ this.getShareLink() }}</a> -->
      <br /><br />
      <button
        type="button"
        class="col-4 btn btn-primary btn-sm"
        @click="shareLinkNatively()"
      >
        Send Link &nbsp;&nbsp;
        <i class="fas fa-share-square"></i>
      </button>
      <br />
      <button
        type="button"
        class="col-4 btn btn-dark btn-sm mt-3"
        @click="copyShareLink()"
      >
        Copy Link &nbsp;&nbsp;
        <i class="fas fa-copy"></i>
      </button>
    </p>
  </b-modal>
</template>

<script>
import { share } from "@/mixins/share.js";
export default {
  name: "ShareScreen",
  mixins: [share],
  computed: {
    shareModalVisible() {
      return this.$store.state.activeShareModal;
    },
  },
};
</script>

<style scoped>
.link {
  color: white;
  text-decoration: none;
  border: 1px solid black;
  border-radius: 20px;
  padding: 10px;
  background: #333;
}
</style>
