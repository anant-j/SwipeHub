import { notification } from "@/mixins/notification";

export const clipboard = {
  mixins: [notification],
  methods: {
    copyToClipboard(item) {
      let data = "";
      let text = "";
      switch (item) {
        case "userId":
          data = this.getUserId();
          text = "User Id";
          break;
        case "sessionId":
          data = this.getSessionId();
          text = "Session Id";
          break;
        default:
          console.log("error while copying to clipboard");
      }
      navigator.clipboard.writeText(data);
      this.showAlert(
        `${text} copied to clipboard`,
        "s",
        5000,
        "sessionIdCopidToClipboard"
      );
    },
  },
};

export const share = {
  methods: {
    createShareLink() {
      const joinLink = this.getShareLink();
      navigator.clipboard.writeText(joinLink);
      this.$store.state.activeShareModal = true;
      this.showAlert(
        "Shareable link copied to clipboard.",
        "s",
        5000,
        "shareableLinkCopidToClipboard"
      );
    },
    getShareLink() {
      return `${this.$store.state.hostURL}/?join=${this.getSessionId()}`;
    },
    shareLinkNatively() {
      const joinLink = this.getShareLink();
      navigator
        .share({
          title: "SwipeHub Session Share",
          text: `Come join my Swipehub session with Session Id: ${this.getSessionId()}.`,
          url: joinLink,
        })
        .then(() => console.log("Successful share! 🎉"))
        .catch((err) => console.error(err));
    },
  },
};
