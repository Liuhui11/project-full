<template>
  <div>
    <h1>用户中心</h1>
  </div>
</template>

<script>
export default {
  async mounted() {
    const ret = this.$http.get('/user/info');
    console.log(ret, '00000000000');
  },
}
</script>
