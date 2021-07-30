<template>
  <div class="vertical-center">
    <div class="container h-100">
      <div class="row h-100 justify-content-center align-items-center">
        <b-form @submit.stop.prevent="nextPage">
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
                  v-model="username"
                  v-bind:class="{
                    'form-control': true,
                    'is-invalid':
                      !this.validUsername(username) && usernameBlurred,
                    'is-valid': this.validUsername(username) && usernameBlurred,
                  }"
                  v-on:blur="usernameBlurred = true"
                  aria-describedby="username-feedback"
                  maxlength="30"
                  v-on:keyup.enter="nextPage"
                ></b-form-input>
                <b-form-invalid-feedback id="username-feedback"
                  >User ID is required and cannot contain special
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
                  selectLabel=""
                  deselectLabel=""
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
                  selectLabel=""
                  deselectLabel=""
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
                  selectLabel=""
                  deselectLabel=""
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
                  selectLabel=""
                  deselectLabel=""
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
                  selectLabel=""
                  deselectLabel=""
                >
                </multiselect>
                <br />
              </div>
            </b-col>
          </b-row>

          <div class="button-center">
            <b-button
              class="ml-2 col-3"
              variant="danger"
              @click="toHomePage()"
              >{{ backButton }}</b-button
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
import "vue-multiselect/dist/vue-multiselect.min.css";
// import axios from "axios";

import store from "@/store/index.js";
import Multiselect from "vue-multiselect";
import * as data from "@/assets/data.js";
import { JWTService } from "@/firebase_config.js";

export default {
  name: "CreateSessionPage",
  store,
  components: {
    Multiselect,
  },
  data() {
    return {
      username: "",
      usernameBlurred: false,
      usernameValid: false,
      localState: 0,
      submitButton: "Next",
      backButton: "Back",
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
      sortType: { name: "Popularity", value: "Popularity" },
      sortOptions: [
        { name: "Popularity", value: "Popularity" },
        { name: "Release Date", value: "Release" },
        { name: "Revenue", value: "Revenue" },
      ],
    };
  },
  watch: {
    localState(value) {
      if (value >= 3) {
        this.submitButton = "Submit";
      } else {
        this.submitButton = "Next";
      }
      if (value === 0) {
        this.backButton = "Back";
      } else {
        this.backButton = "Home";
      }
    },
    username(value) {
      this.username = value.trim();
    },
    country() {
      const tempPlatformOptions = this.platformOptions.filter((platform) =>
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
      if (state == "username") {
        this.usernameBlurred = true;
        if (this.validUsername(this.username)) {
          this.usernameValid = true;
        } else {
          this.usernameValid = false;
        }
      }
    },
    validUsername(username) {
      if (
        username.length != 0 &&
        !data.reservedKeywords.includes(username.trim().toLowerCase()) &&
        username
          .toLowerCase()
          .split("")
          .every((char) => data.alphaNumeric.includes(char))
      ) {
        return true;
      }
      return false;
    },
    resetForm() {
      this.localState = 0;
      this.username = "";
      this.usernameBlurred = false;
      this.usernameValid = false;
      this.language = data.defaultLanguage;
      this.platform = data.defaultPlatform;
      this.country = data.defaultCountry;
      this.category = null;
    },
    nextPage() {
      this.validateState("username");
      if (!this.usernameValid) {
        return;
      }
      if (this.localState < 3) {
        this.localState += 1;
        return;
      }
      this.createSession();
    },
    addTag(newTag) {
      const tag = {
        name: newTag,
        code: newTag.substring(0, 2) + Math.floor(Math.random() * 10000000),
      };
      this.categoryOptions.push(tag);
      this.category.push(tag);
    },
    createSession() {
      this.$store.state.loader = true;
      const username = this.username;
      const language = this.language.id;
      const platform = this.platform.id;
      const country = this.country.id;
      const categories = this.category;
      const type = this.contentType.name === "Movie";
      const order = this.sortType.value;
      let categoryList = "";
      if (categories !== null) {
        for (const category of categories) {
          categoryList += category.id.toString() + "|";
        }
        categoryList = categoryList.substring(0, categoryList.length - 1);
      }
      // const params = {
      //   username: username,
      //   categories: categoryList,
      //   languages: language,
      //   platform: platform,
      //   region: country,
      //   type: type,
      //   order: order,
      // };
      JWTService({
        requestType: "create",
        username: username,
        categories: categoryList,
        language: language,
        platform: platform,
        region: country,
        type: type,
        order: order,
      })
        .then((result) => {
          this.setSessionId(result.data.sessionId);
          this.setUserId(result.data.userId);
          this.setJWT(result.data.token);
          this.$store.state.isCreator = true;
          this.$store.state.activeShareModal = true;
          this.$router.push({ name: "Session" });
        })
        .catch((error) => {
          console.log(error);
        });
      // const data = Object.keys(params)
      //   .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      //   .join("&");
      // axios({
      //   url: `${this.backend}/createSession`,
      //   method: "POST",
      //   headers: { "content-type": "application/x-www-form-urlencoded" },
      //   data,
      // })
      //   .then((response) => {
      //     if (response.status === 200) {
      //       const sessionId = response.data.sessionId;
      //       this.setSessionId(sessionId);
      //       this.setUserId(username);
      //       this.$router.push({ name: "Session" });
      //     } else {
      //       this.showAlert(
      //         "This session could not be created!",
      //         "e",
      //         4800,
      //         "sessionCreateAlert"
      //       );
      //     }
      //   })
      //   .catch(() => {
      //     this.showAlert(
      //       "The session could not be created! Please try again later",
      //       "e",
      //       5000,
      //       "sessionCreateAlert"
      //     );
      //     this.$store.state.loader = false;
      //   });
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
