<template>
  <b-modal
    :visible="modalVisible"
    id="modal-center"
    @hide="$store.state.activeModal = false"
    hide-header-close
    centered
    title="Share via QR Code/Send Link"
    ok-only
    ok-title="Done"
  >
    <p class="my-4 text-center">
      <qrcode :value="this.getShareLink()" :options="{ width: 200 }"></qrcode
      ><br />
      <a :href="this.getShareLink()" target="_blank">{{
        this.getShareLink()
      }}</a>
      <br /><br />
      <button
        type="button"
        class="col-3 btn btn-primary btn-sm"
        @click="shareLinkNatively()"
      >
        Send Link
      </button>
    </p>
  </b-modal>
</template>

<script>
export default {
  name: "ShareScreen",
  computed: {
    modalVisible() {
      return this.$store.state.activeModal;
    },
  },
};
</script>

<style scoped>
</style>
