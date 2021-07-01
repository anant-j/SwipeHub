<template>
  <div class="container">
    <span>So easy!</span>
    <button class="action" @click.stop="clicked">CLICK ME</button>
  </div>
</template>

<script>
export default {
  methods: {
    clicked() {
      alert("Clicked!");
    },
  },
};
</script>
