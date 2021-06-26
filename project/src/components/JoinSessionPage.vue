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
              v-model="$v.form.username.$model"
              :state="validateState('username')"
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
              v-model="$v.form.sessionId.$model"
              :state="validateState('sessionId')"
              aria-describedby="sessionId-feedback"
              minlength="6"
              maxlength="6"
            ></b-form-input>

            <b-form-valid-feedback id="sessionId-feedback"
              >Looks good</b-form-valid-feedback
            >
            <b-form-invalid-feedback id="sessionId-feedback"
              >Session ID is required and must be 6 characters.<br />Don't have
              a session ID?
              <span class="errorLink" @click="toCreateSessionPage()"
                ><u><b>Create a Session</b></u></span
              ></b-form-invalid-feedback
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
// import Loader from "@/components/Loader.vue";
import store from "@/store/index.js";
import {
  required,
  minLength,
  maxLength,
  helpers,
} from "vuelidate/lib/validators";
const alphaNumAndDotValidator = helpers.regex("alphaNumAndDot", /^[a-z\d.]*$/i);

export default {
  name: "JoinSessionPage",
  store,
  data() {
    return {
      form: {
        username: null,
        sessionId: null,
      },
    };
  },
  validations: {
    form: {
      sessionId: {
        required,
        minLength: minLength(6),
        maxLength: maxLength(6),
      },
      username: {
        required,
        alphaNumAndDotValidator,
      },
    },
  },
  methods: {
    validateState(state) {
      const { $dirty, $error } = this.$v.form[state];
      return $dirty ? !$error : null;
    },
    onSubmit() {
      this.$v.form.$touch();
      if (this.$v.form.$anyError) {
        return;
      }

      alert("Form submitted!");
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
