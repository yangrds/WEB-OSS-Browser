<!--
 * @Author: yangrd
 * @Date: 2021-02-11 22:51:04
 * @LastEditTime: 2021-03-05 14:54:21
 * @Description: 首页
 * @FilePath: \WEB-OSS-Browser\src\pages\web-oss.vue
 * @功能描述
-->
<template>
  <div class="web-oss">
    <div class="oss-main">
      <Header />
        <router-view />
    </div>
  </div>
</template>

<script>
export default {
  name: "rewrew",
  components: {},
  props: {},
  data() {
    return {};
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {
  },
  methods: {},
};
</script>

<style scoped lang="scss">
.web-oss {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  box-sizing: border-box;
  .oss-main {
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
    position: relative;
    padding-top: 60px;
    box-sizing: border-box;
  }
}
</style>
