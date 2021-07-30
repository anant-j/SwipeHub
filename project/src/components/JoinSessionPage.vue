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
                'is-invalid':
                  (this.validUsername(username) != 3 && usernameBlurred) ||
                  usernameNullTrigger,
                'is-valid':
                  this.validUsername(username) == 3 && usernameBlurred,
              }"
              aria-describedby="username-feedback"
              maxlength="30"
            ></b-form-input>
            <b-form-valid-feedback id="username-feedback"
              >Looks good</b-form-valid-feedback
            >
            <b-form-invalid-feedback
              id="username-feedback"
            ></b-form-invalid-feedback>
            <span
              class="invalid-form-error"
              v-show="this.usernameState == 0 && usernameNullTrigger"
              >User ID cannot be empty.</span
            >
            <span class="invalid-form-error" v-if="this.usernameState == 1"
              >User ID cannot be: {{ username }}.</span
            >
            <span class="invalid-form-error" v-show="this.usernameState == 2"
              >User ID cannot contain special characters.</span
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
                  (this.validSessionId(sessionId) != 4 && sessionIdBlurred) ||
                  sessionIdNullTrigger,
                'is-valid':
                  this.validSessionId(sessionId) == 4 && sessionIdBlurred,
              }"
              aria-describedby="sessionId-feedback"
              maxlength="6"
            ></b-form-input>
            <b-form-valid-feedback id="sessionId-feedback"
              >Looks good</b-form-valid-feedback
            >
            <b-form-invalid-feedback id="sessionId-feedback">
            </b-form-invalid-feedback>
            <span
              class="invalid-form-error"
              v-show="this.sessionIdState == 0 && sessionIdNullTrigger"
              >Session ID cannot be empty.</span
            >
            <span class="invalid-form-error" v-show="this.sessionIdState == 1"
              >Session ID must be 6 characters.</span
            >
            <span class="invalid-form-error" v-if="this.sessionIdState == 2"
              >Session ID cannot be : {{ sessionId }}</span
            >
            <span class="invalid-form-error" v-show="this.sessionIdState == 3"
              >Session ID cannot contain special characters.</span
            >
            <span
              class="invalid-form-error"
              v-show="
                (this.sessionIdState > 0 && this.sessionIdState < 4) ||
                (this.sessionIdState == 0 && sessionIdNullTrigger)
              "
              ><br />Don't have a session ID?
              <span class="errorLink" @click="toCreateSessionPage()"
                ><u><b>Create a Session</b></u></span
              ></span
            >
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
// import axios from "axios";
import { reservedKeywords, alphaNumeric } from "@/assets/data.js";
import { JWTService } from "@/firebase_config.js";

export default {
  name: "JoinSessionPage",
  store,
  data() {
    return {
      username: null,
      usernameState: 0,
      usernameBlurred: false,
      sessionId: null,
      sessionIdState: 0,
      sessionIdBlurred: false,
      usernameNullTrigger: false,
      sessionIdNullTrigger: false,
    };
  },
  mounted() {
    if (this.getSessionId()) {
      this.sessionId = this.getSessionId();
    }
  },
  watch: {
    username(value) {
      this.username = value.trim();
    },
    sessionId(value) {
      this.sessionId = value.trim();
    },
  },
  methods: {
    validateState() {
      if (this.usernameState != 3) {
        this.usernameNullTrigger = true;
      }
      if (this.sessionIdState != 4) {
        this.sessionIdNullTrigger = true;
      }
      if (this.usernameState == 3 && this.sessionIdState == 4) {
        return true;
      }
      return false;
    },
    validUsername(username) {
      if (username == null || username.length == 0) {
        this.usernameBlurred = false;
        this.usernameState = 0;
        return 0;
      }
      this.usernameNullTrigger = false;
      this.usernameBlurred = true;
      if (reservedKeywords.includes(username.trim().toLowerCase())) {
        this.usernameState = 1;
        return 1;
      }
      if (
        !username
          .toLowerCase()
          .split("")
          .every((char) => alphaNumeric.includes(char))
      ) {
        this.usernameState = 2;
        return 2;
      }
      this.usernameState = 3;
      return 3;
    },
    validSessionId(sessionId) {
      if (sessionId == null || sessionId.length == 0) {
        this.sessionIdBlurred = false;
        this.sessionIdState = 0;
        return 0;
      }
      this.sessionIdNullTrigger = false;
      this.sessionIdBlurred = true;
      if (sessionId.length != 6) {
        this.sessionIdState = 1;
        return 1;
      }
      if (reservedKeywords.includes(sessionId.trim().toLowerCase())) {
        this.sessionIdState = 2;
        return 2;
      }
      if (
        !sessionId
          .toLowerCase()
          .split("")
          .every((char) => alphaNumeric.includes(char))
      ) {
        this.sessionIdState = 3;
        return 3;
      }
      this.sessionIdState = 4;
      return 4;
    },
    onSubmit() {
      if (!this.validateState()) {
        return;
      }
      this.isSessionValid();
    },
    isSessionValid() {
      const username = this.username;
      const sessionId = this.sessionId;
      this.$store.state.loader = true;
      JWTService({
        requestType: "join",
        username: username,
        sessionId: sessionId,
      })
        .then((result) => {
          if (result.data.status == "error") {
            this.showAlert(result.data.message, "e", 5000, "JWTError");
          } else {
            this.setSessionId(sessionId);
            this.setUserId(username);
            this.setJWT(result.data.token);
            this.$store.state.isCreator = result.data.isCreator;
            this.$router.push({ name: "Session" });
          }
        })
        .catch((error) => {
          console.log(error);
        });

      // axios
      //   .get(`${this.backend}/sessionValid?id=${sessionId}`, {
      //     validateStatus: false,
      //   })
      //   .then((result) => {
      //     if (result.status === 200) {
      //       this.setSessionId(sessionId);
      //       this.setUserId(username);
      //       this.$router.push({ name: "Session" });
      //     } else {
      //       this.showAlert(
      //         "This session could not be found!",
      //         "e",
      //         4800,
      //         "sessionNotFound"
      //       );
      //       this.$store.state.loader = false;
      //     }
      //   })
      //   .catch(() => {
      //     this.showAlert(
      //       "This session could not be found!",
      //       "e",
      //       4800,
      //       "sessionNotFound"
      //     );
      //     this.$store.state.loader = false;
      //   });
    },
  },
};
</script>

<style scoped>
.invalid-form-error {
  font-size: 15px;
  color: #dc3545;
}
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
