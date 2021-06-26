<template>
  <div class="vertical-center">
    <div class="container h-100">
      <div class="row h-100 justify-content-center align-items-center">
        <b-form @submit.stop.prevent="onSubmit">
          <b-row>
            <b-col>
              <b-form-group
                id="username-label"
                label-for="username"
                v-if="localState >= 0"
              >
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

                <!-- <b-form-valid-feedback id="username-feedback"
                  >Looks good</b-form-valid-feedback
                > -->
                <b-form-invalid-feedback id="username-feedback"
                  >User ID is required and cannot conatin special
                  characters.</b-form-invalid-feedback
                >
              </b-form-group>
            </b-col>
            <b-col>
              <div v-if="localState >= 0">
                <label class="typo__label"
                  >Country <span style="color: red">*</span></label
                >
                <multiselect
                  v-model="country"
                  :options="countryOptions"
                  placeholder="Select one"
                  :allow-empty="false"
                  label="name"
                  :searchable="true"
                  track-by="name"
                  deselectLabel="Currently Selected"
                ></multiselect>
                <br />
              </div>
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <div v-if="localState >= 1">
                <label class="typo__label"
                  >Language <span style="color: red">*</span></label
                >
                <multiselect
                  v-model="language"
                  :options="languageOptions"
                  placeholder="Select one"
                  :allow-empty="false"
                  label="name"
                  :searchable="true"
                  track-by="name"
                  deselectLabel="Currently Selected"
                ></multiselect>
                <br />
              </div>
            </b-col>
            <b-col>
              <div v-if="localState >= 1">
                <label class="typo__label"
                  >Platform <span style="color: red">*</span></label
                >
                <multiselect
                  v-model="platform"
                  :options="tempPlatformOptions"
                  placeholder="Select one"
                  :allow-empty="false"
                  label="name"
                  :searchable="true"
                  track-by="name"
                  deselectLabel="Currently Selected"
                >
                  <template slot="singleLabel"
                    ><img
                      class="option__image"
                      height="20px"
                      :src="platform.logo"
                      :alt="platform.name"
                    /><span class="option__desc"
                      ><span class="option__title">
                        {{ platform.name }}</span
                      ></span
                    ></template
                  >
                </multiselect>
                <br />
              </div>
            </b-col>
          </b-row>
          <div v-if="localState >= 2">
            <label class="typo__label">Categories (Optional)</label>
            <multiselect
              v-model="category"
              placeholder="Search or add a Category"
              label="name"
              track-by="name"
              :options="categoryOptions"
              :multiple="true"
              :taggable="true"
              @tag="addTag"
            >
            </multiselect>
          </div>
          <br />
          <b-row>
            <b-col>
              <div v-if="localState >= 3">
                <label class="typo__label"
                  >Content Type <span style="color: red">*</span></label
                >
                <multiselect
                  v-model="contentType"
                  :options="contentOptions"
                  placeholder="Select one"
                  :allow-empty="false"
                  label="name"
                  :searchable="false"
                  track-by="name"
                  deselectLabel="Currently Selected"
                ></multiselect>
                <br />
              </div>
            </b-col>
            <b-col>
              <div v-if="localState >= 3">
                <label class="typo__label"
                  >Sort by <span style="color: red">*</span></label
                >
                <multiselect
                  v-model="sortType"
                  :options="sortOptions"
                  placeholder="Select one"
                  :allow-empty="false"
                  label="name"
                  :searchable="true"
                  track-by="name"
                  deselectLabel="Currently Selected"
                >
                </multiselect>
                <br />
              </div>
            </b-col>
          </b-row>

          <div class="button-center">
            <b-button class="ml-2 col-3" variant="danger" @click="toHomePage()"
              >Back</b-button
            >
            <b-button class="ml-2 col-3" variant="warning" @click="resetForm()"
              >Reset</b-button
            >
            <b-button
              class="col-3"
              @click="nextPage()"
              v-if="submitButtonEnabled"
              variant="success"
              >{{ submitButton }}</b-button
            >
          </div>
        </b-form>
      </div>
    </div>
  </div>
</template>

<script>
// import Loader from "@/components/Loader.vue";
import "vue-multiselect/dist/vue-multiselect.min.css";

import store from "@/store/index.js";
import { required, helpers } from "vuelidate/lib/validators";
const alphaNumAndDotValidator = helpers.regex("alphaNumAndDot", /^[a-z\d.]*$/i);
import Multiselect from "vue-multiselect";
import * as data from "@/assets/data.js";
export default {
  name: "CreateSessionPage",
  store,
  components: {
    Multiselect,
  },
  data() {
    return {
      form: {
        username: null,
      },
      localState: 0,
      submitButton: "Next",
      submitButtonEnabled: true,
      language: data.defaultLanguage,
      languageOptions: data.languages,
      platform: data.defaultPlatform,
      platformOptions: data.platforms,
      tempPlatformOptions: data.platforms,
      country: data.defaultCountry,
      countryOptions: data.countries,
      category: null,
      categoryOptions: data.categories,
      contentType: { name: "Movie" },
      contentOptions: [{ name: "Movie" }, { name: "TV" }],
      sortType: { name: "Popularity" },
      sortOptions: [
        { name: "Popularity" },
        { name: "Release Date" },
        { name: "Revenue" },
      ],
    };
  },
  validations: {
    form: {
      username: {
        required,
        alphaNumAndDotValidator,
      },
    },
  },
  watch: {
    localState(value) {
      if (value >= 3) {
        this.submitButton = "Submit";
      } else {
        this.submitButton = "Next";
      }
    },
    "form.username": function (value) {
      this.form.username = value.trim();
    },
    country() {
      let tempPlatformOptions = this.platformOptions.filter((platform) =>
        platform.country.includes(this.country.id)
      );
      if (!tempPlatformOptions.includes(this.platform)) {
        this.platform = tempPlatformOptions[0];
      }
      this.tempPlatformOptions = tempPlatformOptions;
    },
  },
  methods: {
    validateState(state) {
      const { $dirty, $error } = this.$v.form[state];
      return $dirty ? !$error : null;
    },
    resetForm() {
      this.form = {
        username: null,
      };
      (this.localState = 0),
        (this.language = data.defaultLanguage),
        (this.platform = data.defaultPlatform),
        (this.country = data.defaultCountry),
        (this.category = null);
      this.$nextTick(() => {
        this.$v.$reset();
      });
    },
    nextPage() {
      this.$v.form.$touch();
      if (this.$v.form.$anyError) {
        return;
      }
      if (this.form.username != null && this.localState < 4) {
        this.localState += 1;
      }
    },
    onSubmit() {
      this.$v.form.$touch();
      if (this.$v.form.$anyError) {
        return;
      }
      if (this.localState < 4) {
        this.localState += 1;
        return;
      }
      alert("Form submitted!");
    },
    addTag(newTag) {
      const tag = {
        name: newTag,
        code: newTag.substring(0, 2) + Math.floor(Math.random() * 10000000),
      };
      this.categoryOptions.push(tag);
      this.category.push(tag);
    },
  },
};
</script>

<style scoped>
.vertical-center {
  height: 85vh;
  /* text-align: center; */
  align-items: center;
}

.button-center {
  text-align: center;
  align-items: center;
}

.container {
  max-width: 45vw;
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
