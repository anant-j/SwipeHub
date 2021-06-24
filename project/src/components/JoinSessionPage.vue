<template>
  <div class="vertical-center">
    <div class="container h-100">
      <div class="row h-100 justify-content-center align-items-center">
 <b-form @submit.stop.prevent="onSubmit">
      <b-form-group id="username-label" label="Username *" label-for="username">
        <b-form-input
          id="username"
          name="username"
          placeholder="Enter Username"
          v-model="$v.form.username.$model"
          :state="validateState('username')"
          aria-describedby="username-feedback"
        ></b-form-input>

    <b-form-valid-feedback
          id="username-feedback"
        >Looks good</b-form-valid-feedback>
        <b-form-invalid-feedback
          id="username-feedback"
        >This is a required field and must be at least 3 characters.</b-form-invalid-feedback>
      </b-form-group>


      <b-button class="ml-2" variant="danger" @click="resetForm()">Back</b-button>
      <b-button class="ml-2" variant="warning" @click="resetForm()">Reset</b-button>
      <b-button type="submit" variant="success">Submit</b-button>
    </b-form>
        <!-- <form class="col-12" @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="username">First Name</label>
            <input
              type="text"
              v-model="user.username"
              id="username"
              name="username"
              class="form-control"
              :class="{ 'is-invalid': submitted && $v.user.username.$error }"
            />
            <div
              v-if="submitted && !$v.user.username.required"
              class="invalid-feedback"
            >
              Username is required
            </div>
          </div>
          <div class="text-center">
            <button
              type="button"
              class="btn btn-lg btn-joinSession btn-danger"
            >
              Back
            </button>
            <button
              type="button"
              class="btn btn-lg btn-joinSession btn-success"
            >
              Submit
            </button>
          </div>
        </form> -->
      </div>
    </div>
  </div>
</template>

<script>
// import Loader from "@/components/Loader.vue";
import store from "@/store/index.js";
import { required, minLength } from "vuelidate/lib/validators";

export default {
  name: "JoinSessionPage",
  store,
data() {
    return {
      form: {
        username: null,
        sessionId: null
      }
    };
  },
  validations: {
    form: {
      sessionId: {
        required
      },
      username: {
        required,
        minLength: minLength(3)
      }
    }
  },
  methods: {
    validateState(username) {
      const { $dirty, $error } = this.$v.form[username];
      return $dirty ? !$error : null;
    },
    resetForm() {
      this.form = {
        username: null,
        sessionId: null
      };

      this.$nextTick(() => {
        this.$v.$reset();
      });
    },
    onSubmit() {
      this.$v.form.$touch();
      if (this.$v.form.$anyError) {
        return;
      }

      alert("Form submitted!");
    }
  }
  }
</script>

<style scoped>
.vertical-center {
  height: 70vh;
  /* text-align: center; */
  align-items: center;
}
.container {
  max-width: 25vw;
}
button {
  margin: 10px;
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