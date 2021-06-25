<template>
  <div class="vertical-center">
    <div class="container h-100">
      <div class="row h-100 justify-content-center align-items-center">
        <b-form @submit.stop.prevent="onSubmit">
          <b-form-group
            id="username-label"
            label="Username *"
            label-for="username"
          >
            <b-form-input
              id="username"
              name="username"
              placeholder="Enter Username"
              v-model="$v.form.username.$model"
              :state="validateState('username')"
              aria-describedby="username-feedback"
              maxlength=30
            ></b-form-input>

            <b-form-valid-feedback id="username-feedback"
              >Looks good</b-form-valid-feedback
            >
            <b-form-invalid-feedback id="username-feedback"
              >User ID is required and cannot conatin special characters.</b-form-invalid-feedback
            >
          </b-form-group>
          <br>

    <div>
      <label class="typo__label">Language</label>
      <multiselect v-model="language" :options="languageOptions" :custom-label="langName" placeholder="Select one" :allow-empty="false" label="name" :searchable="true" track-by="name"></multiselect>
    </div>
<br>
    <div>
      <label class="typo__label">Platform</label>
      <multiselect v-model="platform" :options="platformOptions" :custom-label="platformName" placeholder="Select one" :allow-empty="false" label="name" :searchable="true" track-by="name"></multiselect>
    </div>
<br>
    <div>
      <label class="typo__label">Country</label>
      <multiselect v-model="country" :options="countryOptions" :custom-label="countryName" placeholder="Select one" :allow-empty="false" label="name" :searchable="true" track-by="name"></multiselect>
    </div>

          <br>
          
          <br>
          <div class="button-center">
          <b-button class="ml-2 col-3" variant="danger" @click="toHomePage()"
            >Back</b-button
          >
          <b-button class="ml-2 col-3" variant="warning" @click="resetForm()"
            >Reset</b-button
          >
          <b-button class="col-3" type="submit" variant="success">Submit</b-button>
          </div>
        </b-form>
      </div>
    </div>
  </div>
</template>

<script>
// import Loader from "@/components/Loader.vue";
import "vue-multiselect/dist/vue-multiselect.min.css"

import store from "@/store/index.js";
import { required, helpers } from "vuelidate/lib/validators";
const alphaNumAndDotValidator = helpers.regex('alphaNumAndDot', /^[a-z\d.]*$/i);
import Multiselect from 'vue-multiselect'
import * as data from "@/assets/data.js"
export default {
  name: "CreateSessionPage",
  store,
    components: {
      Multiselect
  },
  data() {
    return {
      form: {
        username: null
      },
      language: data.defaultLanguage,
      languageOptions: data.languages,
      platform: data.defaultPlatform,
      platformOptions: data.platforms,
      country: data.defaultCountry,
      countryOptions: data.countries
    };
  },
  validations: {
    form: {
      username: {
        required,
        alphaNumAndDotValidator
      },
    },
  },
  methods: {
    langName ({ name }) {
      return `${name}`
    },
    platformName ({ name }) {
      return `${name}`
    },
    countryName ({ name }) {
      return `${name}`
    },
    validateState(state) {
      const { $dirty, $error } = this.$v.form[state];
      return $dirty ? !$error : null;
    },
    resetForm() {
      this.form = {
        username: null,
      };
      this.language= data.defaultLanguage,
      this.platform= data.defaultPlatform,
      this.country= data.defaultCountry
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

.button-center{
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
.errorLink{
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

