import MatchNotification from "@/components/MatchNotification";

export const notification = {
  methods: {
    /**
     * @param  {string} message : Content of the alert
     * @param  {string} type="s" Type: success, warning, error, info, default
     * @param  {number} timeout=false : Add int in miliseconds, false for persistent
     */
    showAlert(message, type = "s", timeout = false, id) {
      let final_message = MatchNotification;
      if (id !== "matchesAlert") {
        final_message = message.toString();
      }
      this.$toast.update(
        id,
        {
          content: final_message,
          options: {
            type: getType(type),
            timeout: parseInt(timeout),
          },
        },
        true
      );
    },
    hideAlert(id) {
      this.$toast.dismiss(id);
    },
    hideAllAlerts() {
      this.$toast.clear();
    },
  },
};

function getType(types) {
  types = types.toLowerCase().trim();
  switch (types) {
    case "success":
    case "s":
      return "success";
    case "error":
    case "e":
      return "error";
    case "default":
    case "d":
      return "default";
    case "info":
    case "i":
      return "info";
    case "warning":
    case "w":
      return "warning";
    default:
      return "success";
  }
}
