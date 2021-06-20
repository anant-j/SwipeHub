<template>
  <div id="app">
  <Navbar :sessionActive="sessionActive"/>
  <router-view/>
  <button v-on:click="sessionActive = !sessionActive">Session is {{sessionActive}}</button>
  </div>
</template>

<script>
import 'bootstrap/dist/css/bootstrap.min.css'
import 'jquery/src/jquery.js'
import 'bootstrap/dist/js/bootstrap.min.js'
import Navbar from './components/Navbar.vue'

export default {
  name: 'App',
  components: {
    Navbar
  },
  data: function() {
    return {
      sessionActive: false
    };
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100vh;
  width: 100vw;
  background-color: black;
}

html, body, template{
  padding: 0!important;
  margin: 0!important;
}
</style>
