<!--
 * @Author: yangrd
 * @Date: 2021-02-12 03:36:03
 * @LastEditTime: 2021-02-12 03:40:27
 * @Description: 
 * @FilePath: \weboss\src\pages\home.vue
 * @功能描述
-->
<template>
  <div class="home">
    <!-- 总控制台 -->
    <CloudDiskHeader />

    <!-- 文件列表 -->
    <CloudDiskList />

    <!-- 代码编辑器 -->
    <editor v-if="editorShow" />

    <!-- 数据传输控制台 -->
    <CloudDiskDataPass v-show="transmissionShow" />

    <!-- 微型传输控制台 -->
    <div
      class="transmission-control"
      v-show="!transmissionShow"
      @click="
        $store.commit('stateUpdate', { name: 'transmissionShow', data: true })
      "
    >
      <span class="iconfont icon-shangchuan" style="margin-right: 2px"></span>
      <span style="color: #888; font-weight: 700">{{
        `${diskInfo().current}/${diskInfo().all}`
      }}</span>
    </div>
  </div>
</template>

<script>
import editor from "@/components/ace-editor";
import { mapState } from "vuex";
import CloudDiskHeader from "@/components/CloudDiskHeader";
import CloudDiskList from "@/components/CloudDiskList";
import CloudDiskDataPass from "@/components/CloudDiskDataPass";
export default {
  name: "",
  components: { editor, CloudDiskHeader, CloudDiskList, CloudDiskDataPass },
  props: {},
  data() {
    return {};
  },
  computed: mapState({
    // 箭头函数可使代码更简练
    path: (state) => state.path,
    editorShow: (state) => state.editorShow,
    transmissionShow: (state) => state.transmissionShow,
    uploadList: (state) => state.uploadList,
  }),
  watch: {
    path(to) {},
  },
  created() {},
  async mounted() {
  },
  methods: {
    diskInfo() {
      let current = 0;
      this.uploadList.map((item) => {
        if (item.status === "1") {
          current += 1;
        }
      });
      return { current, all: this.uploadList.length };
    },
  },
};
</script>

<style lang="scss">
.el-table td,
.el-table th {
  padding: 0px 0 0 0;
}
</style>

<style scoped lang="scss">
.home {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: relative;
  .transmission-control {
    height: 24px;
    position: absolute;
    right: 0;
    bottom: 0;
    padding: 0 10px;
    background-color: #fff;
    opacity: 0.8;
    box-shadow: 0 0px 5px 0 rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    box-sizing: border-box;
    z-index: 3000;
    cursor: pointer;
  }
}
</style>
