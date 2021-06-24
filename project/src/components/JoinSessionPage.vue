<template>
<div class="vertical-center">
  <div class="container h-100">
  <div class="row h-100 justify-content-center align-items-center">
    <form class="col-12" novalidate>
      <div class="form-group">
        <label for="usernameInput">Username</label>
        <input type="text" class="form-control" id="username" placeholder="Enter a username">
      </div>
      <div class="form-group">
        <label for="sessionIdInput">Session Id</label>
        <input type="text" class="form-control" id="sessionIdInput" placeholder="Session ID">
      </div>
      <div class="text-center">
        <button type="button" class="btn btn-lg btn-joinSession btn-danger"
            @click="toHomePage()">Back</button>
        <button type="button" class="btn btn-lg btn-joinSession btn-success"
            @click="validate1()">Submit</button>
      </div>
    </form>   
  </div>
</div>
</div>
</template>

<script>
// import Loader from "@/components/Loader.vue";
import store from "@/store/index.js";

export default {
  name: "JoinSessionPage",
  store,
};
</script>

<style scoped>
.vertical-center{
  height: 70vh; 
  /* text-align: center; */
  align-items: center;
}
.container {
  max-width: 20vw;
}
input{
  margin-bottom: 20px;
}
button{
  margin: 10px;
}
@media only screen and (max-width:600px) {
  .outerbtn {
    width: 90vw;
  }

  .container {
    max-width: 90vw;
  }

}
</style>