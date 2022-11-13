<!--
 * @Author: yangrd
 * @Date: 2021-02-12 04:03:08
 * @LastEditTime: 2021-03-30 15:49:51
 * @Description: 
 * @FilePath: \WEB-OSS-Browser\src\components\header.vue
 * @功能描述
-->
<template>
  <div class="header">
    <img src="../assets/imgs/logo.svg" />
    <div class="version">
      <span>WEB-OSS-Browser</span>
      <span>{{version}}</span>
    </div>

    <div class="operation" v-if="headerVisible">
      <div class="operation-child">
        <span class="iconfont icon-wenjianjia"></span>
        <span>文件</span>
      </div>
      <div class="operation-child" @click="bookmarksClick">
        <span class="iconfont icon-xing11"></span>
        <span>书签管理</span>
      </div>
      <div class="operation-child" @click="openSourceVisible = true">
        <span class="iconfont icon-guanyu"></span>
        <span>关于</span>
      </div>
      <div class="operation-child">
        <span class="iconfont icon-yonghu1"></span>
        <span style="color: #22a4ff">{{ accessKeyId }}</span>
      </div>

      <div class="operation-child" @click="ExitClick">
        <span class="iconfont icon-zhuxiao"></span>
        <span>注销</span>
      </div>
    </div>

    <el-dialog
      title="书签管理"
      :visible.sync="bookmarksVisible"
      width="800px"
      :before-close="handleClose"
      append-to-body
      class="header-dialog"
    >
      <el-table :data="bookmarks" stripe style="width: 100%">
        <el-table-column prop="path" label="URL">
          <span
            class="url"
            slot-scope="scope"
            @click="toPathClick(scope.row.path)"
          >
            oss://{{ bucket }}/{{ scope.row.path }}
          </span>
        </el-table-column>
        <el-table-column prop="date" label="时间" width="170">
          <span slot-scope="scope">{{
            dateFormat("YYYY-mm-dd HH:MM:SS", scope.row.date)
          }}</span>
        </el-table-column>
        <el-table-column prop="date" label="操作" width="70">
          <div slot-scope="scope">
            <el-button
              type="text"
              class="delete"
              @click="deleteClick(scope.row.path)"
              >删除</el-button
            >
          </div>
        </el-table-column>
      </el-table>
      <div class="mkdir-btn">
        <div class="ace-btns">
          <div class="btn-child" @click="bookmarksVisible = false">
            <i class="iconfont icon-dashujukeshihuaico-"></i>
            <span>关闭</span>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog
      title="关于"
      :visible.sync="openSourceVisible"
      width="500px"
      :before-close="handleClose"
      append-to-body
      class="header-dialog"
    >
      <div class="open-source">
        <div class="version">
          <img src="../assets/imgs/logo.svg" />
          <span>WEB-OSS-Browser</span>
          <span>{{version}}</span>
        </div>
        <span
          >开源地址:
          <a href="https://js-vue.com/archives/web-oss-browser" target="view_window"
            >https://js-vue.com/archives/web-oss-browser</a
          ></span
        >
      </div>

      <div class="mkdir-btn">
        <div class="ace-btns">
          <div class="btn-child" @click="openSourceVisible = false">
            <i class="iconfont icon-dashujukeshihuaico-"></i>
            <span>关闭</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { dateFormat } from "@/tool/index";
import { mapState } from "vuex";
export default {
  name: "",
  components: {},
  props: {},
  data() {
    return {
      bookmarksVisible: false,
      openSourceVisible: false,
      bookmarks: [],
      dateFormat,
      version: "v1.1.0",
    };
  },
  computed: mapState({
    // 箭头函数可使代码更简练
    accessKeyId: (state) => state.accessKeyId,
    headerVisible: (state) => state.headerVisible,
    bucket: (state) => state.bucket,
    bookmarksRefreshDelete: (state) => state.bookmarksRefreshDelete,
    accessKeyId: (state) => state.accessKeyId,
  }),
  watch: {},
  created() {},
  mounted() {
    let client = JSON.parse(window.localStorage.getItem("client"));
    !client && (this.show = false);
  },
  methods: {
    deleteClick(path) {
      let bookmarks = JSON.parse(window.localStorage.getItem(this.accessKeyId));
      let list = [];
      bookmarks[`${this.bucket}_book`].map((item) => {
        if (item.path != path) {
          list.push(item);
        }
      });

      bookmarks[`${this.bucket}_book`] = list;

      window.localStorage.setItem(this.accessKeyId, JSON.stringify(bookmarks));

      this.getBookmarks();

      this.$store.commit("stateUpdate", {
        name: "bookmarksRefreshDelete",
        data: !this.bookmarksRefreshDelete,
      });
    },
    toPathClick(path) {
      this.$store.commit("stateUpdate", {
        name: "path",
        data: path,
      });
      this.bookmarksVisible = false;
    },
    getBookmarks() {
      let bookmarks =
        JSON.parse(window.localStorage.getItem(this.accessKeyId)) || {};
      this.bookmarks = bookmarks[`${this.bucket}_book`] || [];
    },
    bookmarksClick() {
      this.getBookmarks();
      this.bookmarksVisible = true;
    },
    handleClose(none) {
      none();
    },
    ExitClick() {
      const _this = this;
      this.$confirm("是否退出登录？", "注销", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          window.localStorage.removeItem("client");
          let client = JSON.parse(window.localStorage.getItem("client"));
          !client && _this.$router.push("/login");
          !client &&
            this.$notify({
              title: "退出登录",
              message: `<p style="word-break:break-all;width:260px">${this.accessKeyId}<br/><span style="color:#409eff">已清空用户信息缓存</span></p>`,
              type: "success",
              position: "top-left",
              duration: 3000,
              dangerouslyUseHTMLString: true,
            });
        })
        .catch(() => {});
    },
  },
};
</script>


<style lang="scss">
.el-dialog__body {
  padding: 0;
}
.el-dialog__header {
  padding: 10px 10px 10px;
  background-color: #f6f6f6;
}
.el-dialog__headerbtn {
  top: 15px;
}
.el-dialog {
  border-radius: 6px;
  overflow: hidden;
}
</style>


<style scoped lang="scss">
.header {
  width: 100%;
  height: 60px;
  background-color: #222222;
  padding: 0 20px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 9;
  user-select: none;
  > img {
    width: 40px;
    height: 40px;
    background-color: #fff;
    border-radius: 50%;
  }
  .version {
    width: 300px;
    > span:nth-child(1) {
      color: #f5f5f5;
      font-size: 18px;
      font-weight: 700;
      font-family: "微软雅黑";
      margin-left: 10px;
    }
    > span:nth-child(2) {
      color: #ff6600;
      font-size: 13px;
      font-weight: 700;
      margin-left: 6px;
    }
  }
  .operation {
    width: 100%;
    height: 60px;
    box-sizing: border-box;
    display: flex;
    justify-content: flex-end;
    padding-left: 200px;
    position: relative;
    .operation-child:nth-child(1) {
      background-color: #247b2e;
      position: absolute;
      left: 40px;
      top: 0;
    }
    .operation-child:nth-last-child(1) {
      margin-right: -20px;
    }
    .operation-child {
      min-width: 100px;
      height: 100%;
      box-sizing: border-box;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      > span:nth-child(1) {
        font-size: 15px;
      }
      > span:nth-child(2) {
        font-size: 15px;
        margin-left: 6px;
      }
    }
  }
}
.ace-btns {
  height: 30px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  margin-right: 0px;
  user-select: none;
  .btn-child {
    height: 30px;
    min-width: 40px;
    padding: 0 8px;
    background-color: #fff;
    box-sizing: border-box;
    border: 1px solid rgba($color: #888, $alpha: 0.3);
    border-right: 0px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    input[type="file"] {
      opacity: 0;
      position: absolute;
      left: 0;
      top: -100%;
      width: 100%;
      height: 200%;
      cursor: pointer;
    }
    > span {
      font-size: 14px;
      margin-left: 3px;
    }
    > .icon-jia {
      color: #3c763d;
      font-weight: 700;
    }
    > .icon-shangchuan {
      color: #31708f;
    }
    &:hover {
      background-color: #e6e6e6;
    }
    &:active {
      background-color: #f5f5f5;
    }
  }
}

.mkdir-btn {
  width: 100%;
  height: 40px;
  border-top: 1px solid rgba($color: #888, $alpha: 0.2);
  background-color: #f6f6f6;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 6px;
  box-sizing: border-box;
  .ace-btns {
    .btn-child {
      border: 1px solid rgba($color: #888, $alpha: 0.2);
      border-radius: 5px;
      margin-left: 10px;
      > i {
        margin-top: 1px;
      }
    }

    .btn-child:nth-child(1) {
      background-color: #5cb85c;
      color: #fff;
      &:hover {
        background-color: #449d44;
      }
      &:active {
        background-color: #398439;
      }
      > i {
        color: #fff;
        margin-top: 1px;
      }
    }
  }
}

.open-source {
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  .version {
    display: flex;
    align-items: center;
    > img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }
    > span:nth-child(2) {
      color: #333;
      font-size: 18px;
      font-family: "微软雅黑";
      margin-left: 10px;
    }
    > span:nth-child(3) {
      color: #ff6600;
      font-size: 13px;
      font-weight: 700;
      margin-left: 6px;
    }
  }
  > span {
    margin-top: 10px;
    font-size: 16px;
    color: #888;
    > a {
      color: #409eff;
      cursor: pointer;
    }
  }
}

.url {
  color: #409eff;
  cursor: pointer;
  user-select: none;
  &:hover {
    text-decoration: underline;
  }
}
.delete {
  color: #f56c6c;
  &:hover {
    text-decoration: underline;
  }
  font-size: 15px;
}
</style>
