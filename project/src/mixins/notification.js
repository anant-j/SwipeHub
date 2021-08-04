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

export const memberNotification = {
  methods: {
    updatedMemberNotification(newData) {
      const NotificationStore = {
        joined: [],
        left: [],
      };
      const oldUserDataPair = this.$store.state.usersData;
      console.log(oldUserDataPair);
      const oldData = [];
      for (const userData of oldUserDataPair) {
        oldData.push(userData["userId"]);
      }
      for (const user of oldData) {
        if (!newData[user] && user != this.getUserId) {
          NotificationStore["left"].push(user);
        }
      }
      for (const user of Object.keys(newData)) {
        if (
          !oldData.includes(user) &&
          user != this.getUserId &&
          newData[user]["joinedAt"] >= newData[this.getUserId]["joinedAt"]
        ) {
          NotificationStore["joined"].push(user);
        }
      }
      let NotificationMessage = "";
      if (NotificationStore["joined"].length > 0) {
        let joinMessage = "";
        for (const joiner of NotificationStore["joined"]) {
          joinMessage += joiner + ", ";
        }
        joinMessage = joinMessage.slice(0, -2);
        NotificationMessage += `${joinMessage} has joined the session. `;
      }
      if (NotificationStore["left"].length > 0) {
        let leaveMessage = "";
        for (const leaver of NotificationStore["left"]) {
          leaveMessage += leaver + ", ";
        }
        leaveMessage = leaveMessage.slice(0, -2);
        NotificationMessage += `${leaveMessage} has left the session. `;
      }
      if (NotificationMessage != "") {
        this.showAlert(NotificationMessage, "i", 4000, "userNotification");
      }
      return;
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
