<!--
 * @Author: yangrd
 * @Date: 2021-02-12 04:36:35
 * @LastEditTime: 2021-03-30 15:41:51
 * @Description: 登录页面
 * @FilePath: \WEB-OSS-Browser\src\pages\login.vue
 * @功能描述
-->
<template>
  <div class="login" v-loading="loading">
    <div class="login-child">
      <img src="../assets/bglogin.svg" alt="">
      <div class="tab-page">
            <div class="tab-child">
              <span>*AccessKeyId：</span>
              <el-input
                style="width: 360px"
                v-model="client.accessKeyId"
                :spellcheck="false"
                placeholder="your access key"
                size="small"
              ></el-input>
            </div>
            <div class="tab-child">
              <span>*AccessKeySecret：</span>
              <el-input
                style="width: 360px"
                show-password
                v-model="client.accessKeySecret"
                :spellcheck="false"
                placeholder="your access secret"
                size="small"
              ></el-input>
            </div>
            <div class="tab-child">
              <span>*Region：</span>
              <el-input
                style="width: 360px"
                v-model="client.region"
                :spellcheck="false"
                placeholder="oss-cn-hangzhou"
                size="small"
              ></el-input>
            </div>
            <div class="tab-child">
              <span>*Bucket：</span>
              <el-input
                style="width: 360px"
                v-model="client.bucket"
                :spellcheck="false"
                placeholder="your bucket name"
                size="small"
              ></el-input>
            </div>
            <div class="tab-child" style="width: 30px; margin-top: 5px">
              <div class="tab-checked">
                <el-checkbox v-model="client.keep">保持登录</el-checkbox>
                <el-checkbox v-model="client.keepKey">记住密钥</el-checkbox>
              </div>
            </div>
            <div class="tab-child" style="width: 30px; margin-top: 5px">
              <el-button
                type="primary"
                @click="akLoginClick"
                style="width: 100px"
                >登入</el-button
              >
            </div>
          </div>
    </div>
  </div>
</template>

<script>
import OSS from "ali-oss";
export default {
  name: "",
  components: {},
  props: {},
  data() {
    return {
      client: {
        accessKeyId: "",
        accessKeySecret: "",
        region: "",
        bucket: "",
        keep: false,
        keepKey: false,
      },
      loading: false,
    };
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {
    this.getLoginInfo();
  },
  methods: {
    getLoginInfo() {
      this.client = JSON.parse(window.localStorage.getItem("ossInfo")) || {};
    },
    setLoginInfo() {
      let ossInfo = { ...this.client };
      // 过期时间，保持登录1年内不过期，否则24小时后过期
      if (this.keep) {
        ossInfo.overdueDate = Math.round(new Date()) + 86400000 * 365;
      } else {
        ossInfo.overdueDate = Math.round(new Date()) + 86400000 * 1;
      }

      if (!this.client.keepKey) {
        ossInfo.accessKeySecret = "";
      }

      this.$store.commit("stateUpdate", {
        name: "bucket",
        data: ossInfo.bucket,
      });
      this.$store.commit("stateUpdate", {
        name: "accessKeyId",
        data: ossInfo.accessKeyId,
      });

      window.localStorage.setItem("ossInfo", JSON.stringify(ossInfo));
    },
    async akLoginClick() {
      console.log(this.client);
      let { accessKeyId, accessKeySecret, bucket, region } = this.client;
      if (!(accessKeyId && accessKeySecret && bucket && region)) {
        return;
      }
      this.loading = true;
      try {
        const client = new OSS(this.client);
        let { res } = await client.list({
          prefix: "",
          delimiter: "/",
        });
        console.log(res);
        if (res.status === 200) {
          this.setLoginInfo();
          window.localStorage.setItem("client", JSON.stringify(this.client));
          this.$router.push("home");
          this.$notify({
            title: "登录成功",
            message: `<p style="word-break:break-all;width:260px">${accessKeyId}<br/><span style="color:#409eff">登录成功</span></p>`,
            type: "success",
            position: "top-left",
            duration: 3000,
            dangerouslyUseHTMLString: true,
          });
        } else {
          this.$notify({
            title: "登录失败",
            message: `<p style="word-break:break-all;width:260px">${accessKeyId}<br/><span style="color:#e02433">请检查登录参数的正确性以及完整性。</span></p>`,
            type: "error",
            position: "top-left",
            duration: 3000,
            dangerouslyUseHTMLString: true,
          });
        }
      } catch (error) {
        this.$notify({
          title: "登录失败",
          message: `<p style="word-break:break-all;width:260px">${accessKeyId}<br/><span style="color:#e02433">请检查登录参数的正确性以及完整性。</span></p>`,
          type: "error",
          position: "top-left",
          duration: 3000,
          dangerouslyUseHTMLString: true,
        });
      }
      this.loading = false;
    },
  },
};
</script>

<style scoped lang="scss">
.login {
  width: 100%;
  height: 600px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.login-child {
  width: 100%;
  display: flex;
  justify-content: center;
  img{
    width: 500px;
  }
  .tab-page {
    width: 600px;
    height: 400px;
    .tab-child,
    .tab-textarea {
      width: 100%;
      height: 50px;
      padding-left: 170px;
      margin-top: 20px;
      box-sizing: border-box;
      position: relative;
      display: flex;
      align-items: center;
      .tab-checked {
        display: flex;
        align-items: center;
      }
      > span {
        font-size: 16px;
        color: #000;
        font-weight: 700;
        position: absolute;
        left: 0;
        top: 0;
        width: 170px;
        height: 50px;
        padding-right: 10px;
        box-sizing: border-box;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        user-select: none;
      }
    }
    .tab-textarea {
      align-items: flex-start;
      height: auto;
      > span {
        align-items: flex-start;
      }
    }
    .btn {
      width: 100%;
      display: flex;
      justify-content: center;
      margin-top: 40px;
    }
  }
}
</style>
