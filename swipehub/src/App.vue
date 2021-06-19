<template>
  <div id="app">
  <Navbar :sessionActive="sessionActive"/>
  <router-view/>
  <button v-on:click="sessionActive = !sessionActive">Activate Session</button>
  </div>
</template>

<script>
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
