<template>
    <Weboss />
</template>

<script>
import Weboss from "@/pages/web-oss";
export default {
  name: "App",
  mounted() {},
  methods: {
    // 更新路由，重置页面
    resetPageFun(to) {
      let client = JSON.parse(window.localStorage.getItem("client"));
      if (to === "/login") {
        client && this.$router.push("/home");
        this.$store.commit("stateUpdate", {
          name: "headerVisible",
          data: false,
        });
      } else {
        !client && this.$router.push("/login");
        this.$store.commit("stateUpdate", {
          name: "headerVisible",
          data: true,
        });
        this.$store.commit("stateUpdate", {
          name: "path",
          data: "",
        });
      }
    },
    // 更新用户信息
    resetUserInfoFun() {
      let { bucket, accessKeyId } =
        JSON.parse(window.localStorage.getItem("ossInfo")) || {};
      this.$store.commit("stateUpdate", { name: "bucket", data: bucket });
      this.$store.commit("stateUpdate", {
        name: "accessKeyId",
        data: accessKeyId,
      });
    },
  },
  watch: {
    "$route.path": function (to) {
      this.resetPageFun(to);
      this.resetUserInfoFun();
    },
  },

  components: { Weboss },
};
</script>

<style>
@import url("./assets/css/ress.scss");
@import url("http://at.alicdn.com/t/font_2373078_qxhhuv1bnrp.css");
.icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
