<template>
  <div class="vertical-center">
    <div class="container h-100">
      <div class="row h-100 justify-content-center align-items-center">
        <b-form @submit.stop.prevent="onSubmit">
          <b-form-group id="username-label" label-for="username">
            <label>Username <span style="color: red">*</span></label>
            <b-form-input
              id="username"
              name="username"
              placeholder="Enter Username"
              v-model="username"
              v-bind:class="{
                'form-control': true,
                'is-invalid': !this.validUsername(username) && usernameBlurred,
                'is-valid': this.validUsername(username) && usernameBlurred,
              }"
              v-on:blur="usernameBlurred = true"
              aria-describedby="username-feedback"
              maxlength="30"
            ></b-form-input>
            <b-form-valid-feedback id="username-feedback"
              >Looks good</b-form-valid-feedback
            >
            <b-form-invalid-feedback id="username-feedback"
              >User ID is required and cannot conatin special
              characters.</b-form-invalid-feedback
            >
          </b-form-group>
          <br />
          <b-form-group id="sessionId-label" label-for="sessionId">
            <label>Session ID <span style="color: red">*</span></label>
            <b-form-input
              id="sessionId"
              name="sessionId"
              placeholder="Enter Session ID"
              v-model="sessionId"
              v-bind:class="{
                'form-control': true,
                'is-invalid':
                  !this.validSessionId(sessionId) && sessionIdBlurred,
                'is-valid': this.validSessionId(sessionId) && sessionIdBlurred,
              }"
              v-on:blur="sessionIdBlurred = true"
              aria-describedby="sessionId-feedback"
              minlength="6"
              maxlength="6"
            ></b-form-input>
            <b-form-valid-feedback id="sessionId-feedback"
              >Looks good</b-form-valid-feedback
            >
            <b-form-invalid-feedback id="sessionId-feedback">
              Session ID is required and must be 6 characters.<br />Don't have a
              session ID?
              <span class="errorLink" @click="toCreateSessionPage()"
                ><u><b>Create a Session</b></u></span
              >
            </b-form-invalid-feedback>
            <!-- <span
              v-if="
                this.sessionId != null &&
                !this.validSessionId(this.sessionId) &&
                this.sessionId.length > 0
              "
              >Test</span
            > -->
          </b-form-group>
          <br />
          <div class="button-center">
            <b-button class="ml-2 col-3" variant="danger" @click="toHomePage()"
              >Back</b-button
            >
            <b-button class="col-3" type="submit" variant="success"
              >Join</b-button
            >
          </div>
        </b-form>
      </div>
    </div>
  </div>
</template>

<script>
import store from "@/store/index.js";
import axios from "axios";
import { reservedKeywords, alphaNumeric } from "@/assets/data.js";

export default {
  name: "JoinSessionPage",
  store,
  data() {
    return {
      username: null,
      usernameBlurred: false,
      usernameValid: false,
      sessionId: null,
      sessionIdBlurred: false,
      sessionIdValid: false,
    };
  },
  mounted() {
    if (this.getSessionId !== null || this.getSessionId !== undefined) {
      this.sessionId = this.getSessionId;
    }
  },
  methods: {
    validateState() {
      this.usernameBlurred = true;
      this.sessionIdBlurred = true;
      if (this.validUsername(this.username)) {
        this.usernameValid = true;
      } else {
        this.usernameValid = false;
      }
      if (this.validSessionId(this.sessionId)) {
        this.sessionIdValid = true;
      } else {
        this.sessionIdValid = false;
      }
    },
    validUsername(username) {
      if (
        username != null &&
        username.length != 0 &&
        !reservedKeywords.includes(username.trim().toLowerCase()) &&
        username
          .toLowerCase()
          .split("")
          .every((char) => alphaNumeric.includes(char))
      ) {
        return true;
      }
      return false;
    },
    validSessionId(sessionId) {
      if (
        sessionId != null &&
        sessionId.length == 6 &&
        !reservedKeywords.includes(sessionId.trim().toLowerCase()) &&
        sessionId
          .toLowerCase()
          .split("")
          .every((char) => alphaNumeric.includes(char))
      ) {
        return true;
      }
      return false;
    },
    onSubmit() {
      this.validateState();
      if (!this.usernameValid || !this.sessionIdValid) {
        return;
      }
      this.isSessionValid();
    },
    isSessionValid() {
      const username = this.username;
      const sessionId = this.sessionId;
      this.$store.state.loader = true;
      axios
        .get(`${this.backend}/sessionValid?id=${sessionId}`, {
          validateStatus: false,
        })
        .then((result) => {
          if (result.status === 200) {
            this.setSessionId(sessionId);
            this.setUserId(username);
            this.$router.push({ name: "Session" });
          } else {
            this.showAlert(
              "This session could not be found!",
              "e",
              4800,
              "sessionNotFound"
            );
            this.$store.state.loader = false;
          }
        })
        .catch(() => {
          this.showAlert(
            "This session could not be found!",
            "e",
            4800,
            "sessionNotFound"
          );
          this.$store.state.loader = false;
        });
    },
  },
};
</script>

<style scoped>
.vertical-center {
  height: 70vh;
  /* text-align: center; */
  align-items: center;
}

.button-center {
  text-align: center;
  align-items: center;
}

.container {
  max-width: 25vw;
}
button {
  margin: 10px;
  min-width: 100px;
}
.errorLink {
  cursor: pointer;
}
@media only screen and (max-width: 600px) {
  .outerbtn {
    width: 90vw;
  }

  .container {
    max-width: 90vw;
  }
}
</style>
