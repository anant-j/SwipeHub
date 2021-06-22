<template>
  <div class="home">
    <HelloWorld msg="Anant & Varun"/>
    <h1>{{$store.state.count}}</h1>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'
import store from '../store/index.js'  

export default {
  name: 'Home',
  store,
  components: {
    HelloWorld
  },
  mounted: function(){
    this.$store.state.sessionActive = false;
    this.$store.state.count+=1;
  }
}
</script>
