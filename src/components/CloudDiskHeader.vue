<template>
  <!-- 头部控制台 -->
  <div class="file-header">
    <div class="top">
      <div class="ace-btns">
        <div class="btn-child" @click="pathBack">
          <span class="iconfont icon-arrowLeft-fill"></span>
        </div>
        <div class="btn-child" @click="refresh">
          <span class="iconfont icon-shuaxin"></span>
        </div>
        <div
          class="btn-child"
          @click="$store.commit('stateUpdate', { name: 'path', data: '' })"
        >
          <span class="iconfont icon-home"></span>
        </div>
      </div>
      <div class="ace-path">
        <span>oss://{{ bucket }}/{{ path }}</span>
      </div>
      <div class="ace-btns">
        <div
          class="btn-child"
          style="border-right: 1px solid rgba(0, 0, 0, 0.2)"
          @click="collection"
        >
          <span :class="star"></span>
        </div>
      </div>
    </div>
    <div class="bottom">
      <div class="ace-btns">
        <div class="btn-child">
          <i class="iconfont icon-shangchuan"></i>
          <span>文件</span>
          <input type="file" @change="dirUpload" multiple />
        </div>
        <div class="btn-child">
          <i class="iconfont icon-shangchuan"></i>
          <span>目录</span>
          <input
            type="file"
            @change="dirUpload"
            webkitdirectory
            directory
            multiple
          />
        </div>
        <div class="btn-child" @click="mkdirFileClick">
          <i class="iconfont icon-jia"></i>
          <span>创建目录</span>
        </div>
        <div class="btn-child" @click="downloadAddressClick">
          <i class="iconfont icon-xiazai3"></i>
          <span>获取地址</span>
        </div>
        <div class="btn-child" @click="clipClick">
          <i class="iconfont icon-ziyuan" style="color: #2ab4ff"></i>
          <span>图片裁剪</span>
        </div>
        <div class="btn-child" @click="copyClick(null)">
          <i class="iconfont icon-fuzhi"></i>
          <span>复制</span>
        </div>
        <div class="btn-child" @click="copyClick(true)">
          <i class="iconfont icon-jianqie"></i>
          <span>移动</span>
        </div>
        <div
          class="btn-child"
          @click="operationClick('delete')"
          style="border-right: 1px solid rgba(0, 0, 0, 0.2)"
        >
          <i class="iconfont icon-dashujukeshihuaico-"></i>
          <span>删除</span>
        </div>
        <div class="paste" v-if="copys.length > 0">
          <div class="paste-child" @click="pasteClick">
            <i class="iconfont icon-niantie"></i>
            <span>粘贴 ({{ copys.length }})</span>
          </div>
          <span
            class="iconfont icon-dashujukeshihuaico-"
            @click="cancelPasteClick"
          ></span>
        </div>
      </div>
    </div>

    <el-dialog
      title="创建目录"
      :visible.sync="mkdirVisible"
      width="400px"
      :before-close="handleClose"
      append-to-body
    >
      <div class="mkdir">
        <span>目录名称</span>
        <el-input v-model="mkdirName" placeholder="目录名称"></el-input>
      </div>
      <div class="mkdir-btn">
        <div class="ace-btns">
          <div class="btn-child" @click="mkdirClick">
            <i class="iconfont icon-queding1"></i>
            <span>确定</span>
          </div>
          <div class="btn-child" @click="mkdirVisible = false">
            <i class="iconfont icon-dashujukeshihuaico-"></i>
            <span>取消</span>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog
      :title="deleteConfirm ? '文件删除' : '将删除以下目录和文件'"
      :visible.sync="deleteVisible"
      width="600px"
      :before-close="() => closeFun('deleteVisible', false)"
      append-to-body
    >
      <div class="delete-progress" v-if="deleteConfirm">
        <span>{{
          this.deleteTotal > 1000
            ? "删除文件数量超限，可能会受到OSS服务器的并发限制，正在删除......"
            : "正在删除......"
        }}</span>
        <div class="delete-child">
          <span
            :style="{ width: Percentage(deleteNum, deleteTotal) + '%' }"
          ></span>
        </div>
        <span>{{ deleteNum }} / {{ deleteTotal }}</span>
      </div>
      <div class="delete-list" v-if="!deleteConfirm">
        <div
          class="delete-child"
          v-for="(item, index) in selections"
          :key="index"
        >
          <svg class="icon" aria-hidden="true">
            <use
              :xlink:href="
                item.name[item.name.length - 1] === '/'
                  ? '#icon-wenjianjia'
                  : suffixIconTool(item)
              "
            ></use>
          </svg>

          <span>{{ item.name }}</span>
        </div>
      </div>
      <div class="mkdir-btn">
        <div class="ace-btns">
          <div class="btn-child" @click="deleteFile" v-if="!deleteConfirm">
            <i class="iconfont icon-queding1"></i>
            <span>确定</span>
          </div>
          <div class="btn-child" @click="closeFun('deleteVisible', false)">
            <i class="iconfont icon-dashujukeshihuaico-"></i>
            <span>关闭</span>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog
      title="拷贝"
      :visible.sync="copyVisible"
      width="600px"
      :before-close="() => closeFun('copyVisible', false)"
      append-to-body
    >
      <div class="copy-progress">
        <span>{{
          this.copyTotal > 1000
            ? "由于拷贝文件数量超限，可能会受到OSS服务器的并发限制，正在粘贴......"
            : "正在粘贴......"
        }}</span>
        <div class="copy-child">
          <span :style="{ width: Percentage(copyNum, copyTotal) + '%' }"></span>
        </div>
        <span>{{ copyNum }} / {{ copyTotal }}</span>
      </div>

      <div class="mkdir-btn">
        <div class="ace-btns">
          <div class="btn-child" @click="closeFun('copyVisible', false)">
            <i class="iconfont icon-dashujukeshihuaico-"></i>
            <span>关闭</span>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog
      :title="`下载地址[${downloads.length}]`"
      width="1000px"
      :visible.sync="downloadVisible"
      :before-close="() => closeFun('downloadVisible', false)"
      append-to-body
    >
      <div class="delete-list">
        <div
          class="delete-child"
          v-for="(item, index) in downloads"
          :key="index"
        >
          <svg class="icon" aria-hidden="true">
            <use
              :xlink:href="
                item.name[item.name.length - 1] === '/'
                  ? '#icon-wenjianjia'
                  : suffixIconTool(item)
              "
            ></use>
          </svg>
          <span>{{ item.url }}</span>
        </div>
      </div>
      <div class="mkdir-btn">
        <div class="ace-btns">
          <div class="btn-child" @click="closeFun('downloadVisible', false)">
            <i class="iconfont icon-dashujukeshihuaico-"></i>
            <span>关闭</span>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog
      title="云端裁剪-控制台"
      width="1400px"
      top="20px"
      class="clip-dialog"
      :close-on-click-modal="false"
      :visible.sync="clipVisible"
      :before-close="(none) => none()"
      append-to-body
    >
      <div class="clip">
        <clip
          :ImgFiles="ImgFiles"
          v-if="clipVisible"
          :isFile="false"
          @close="() => (clipVisible = false)"
        />
      </div>
      <div class="mkdir-btn">
        <div class="ace-btns">
          <div class="btn-child" @click="clipVisible = false">
            <i class="iconfont icon-dashujukeshihuaico-"></i>
            <span>关闭</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from "vuex";
import {
  fileList,
  multipartUpload,
  simplePut,
  deleteMulti,
  deleteKey,
  allList,
  maxList,
  signatureUrl,
  copy,
  getClient,
} from "@/api/index";
import { uuid, Percentage } from "@/tool/index";
import clip from "@/components/clip";
import OSS from "ali-oss";
export default {
  name: "",
  components: { clip },
  props: {},
  data() {
    return {
      star: "",
      Percentage,
      mkdirVisible: false,
      clipVisible: false,
      ImgFiles: [],
      mkdirName: "",
      suffixs: [],
    };
  },
  computed: mapState({
    // 箭头函数可使代码更简练
    path: (state) => state.path,
    uploadList: (state) => state.uploadList,
    selections: (state) => state.selections,
    copys: (state) => state.copys,
    copyPath: (state) => state.copyPath,
    copyNum: (state) => state.copyNum,
    copyTotal: (state) => state.copyTotal,
    copyVisible: (state) => state.copyVisible,
    deleteNum: (state) => state.deleteNum,
    deleteTotal: (state) => state.deleteTotal,
    deleteVisible: (state) => state.deleteVisible,
    deleteConfirm: (state) => state.deleteConfirm,
    shear: (state) => state.shear,
    downloadVisible: (state) => state.downloadVisible,
    downloads: (state) => state.downloads,
    bucket: (state) => state.bucket,
    bookmarksRefreshDelete: (state) => state.bookmarksRefreshDelete,
  }),
  watch: {
    path() {
      this.refresh();
    },
    bookmarksRefreshDelete() {
      this.refresh();
    },
  },
  created() {},
  async mounted() {
    this.collectionStatus();
  },
  methods: {
    async clipClick() {
      const _this = this;
      let ImgFiles = [];
      await this.selections.map(async (item) => {
        if (_this.imgSuffixTool(item.name)) {
          ImgFiles.push({
            name: _this.dirTitleTool(item),
            path: item.name,
            url: await signatureUrl(item.name),
          });
        }
      });
      if (ImgFiles.length < 1) {
        return;
      }
      this.ImgFiles = ImgFiles;

      this.clipVisible = true;
    },

    mkdirFileClick() {
      this.mkdirName = "";
      this.mkdirVisible = true;
    },
    closeFun(name, data) {
      this.$store.commit("stateUpdate", { name, data });
    },
    async downloadAddressClick() {
      if (this.selections.length < 1) {
        return;
      }
      this.closeFun("downloads", []);
      this.closeFun("downloadVisible", true);
      let list = await this.$store.dispatch("getfiles", this.selections);
      this.closeFun("downloads", list);
    },
    operationClick(type) {
      if (this.selections.length < 1) {
        this.$message.error("错误，勾选数据为空");
        return;
      }
      if (type === "delete") {
        this.$store.commit("stateUpdate", {
          name: "deleteVisible",
          data: true,
        });
      }
    },
    /* 
      由于SDK限制每次所请求的目录内文件最多返回1000个文件
      该方法递归循环子目录文件列表
    */
    async infiniteList(nextMarker) {
      let max = nextMarker;
      let flag = true;
      let files = [];
      while (flag) {
        const res = await maxList(max);
        max = res.nextMarker;
        flag = res.isTruncated;
        files.push(...res.objects);
      }
      return files;
    },

    // 粘贴文件
    async pasteClick() {
      // emptys 参数为剪切模式的所需删除文件列表
      this.$store.dispatch("pasteClick", { emptys: this.copys });
    },
    // 取消粘贴
    cancelPasteClick() {
      this.$store.commit("stateUpdate", { name: "copys", data: [] });
    },
    // 裁剪/复制
    async copyClick(type) {
      this.$store.commit("stateUpdate", { name: "shear", data: type });
      this.$store.commit("stateUpdate", {
        name: "copys",
        data: this.selections,
      });
      this.$store.commit("stateUpdate", { name: "copyPath", data: this.path });
    },
    // 批量删除
    async deleteFile() {
      this.$store.dispatch("deleteFile", this.selections);
    },
    // 创建目录
    async mkdirClick() {
      // 检测字符串是否全为空格
      let empty = this.mkdirName.match(/^\s+$/);
      // 空字符串和全空格，抛出异常
      if (empty != null || !this.mkdirName) {
        this.$message.error("目录名称非法");
        return;
      }
      // 关闭对话框
      this.mkdirVisible = false;
      // 创建目录
      await simplePut(`${this.path}${this.mkdirName}/`, new Blob([""]));
      // 更新【文件/目录】列表
      this.$store.dispatch("fileUpdate");
    },
    handleClose(none) {
      none();
    },
    dirUpload(e) {
      let files = Array.from(e.target.files);
      e.target.value = "";
      files.map((file) => {
        this.$store.dispatch("sliceUpload", { file });
      });
    },
    // 刷新
    async refresh() {
      await this.$store.dispatch("fileUpdate");
      this.collectionStatus();
    },
    // 后退
    pathBack() {
      let path = this.path;
      let paths = path.split("/");
      paths.splice(paths.length - 2, 1);
      this.$store.commit("stateUpdate", {
        name: "path",
        data: paths.join("/"),
      });
      this.refresh();
    },
    // 书签状态更新
    collectionStatus() {
      let star = "iconfont icon-xingxing";
      let { accessKeyId } =
        JSON.parse(window.localStorage.getItem("ossInfo")) || {};
      let bookmarks =
        JSON.parse(window.localStorage.getItem([accessKeyId])) || {};
      let items = bookmarks[`${this.bucket}_book`] || [];
      items.map((item) => {
        if (this.path === item.path) {
          star = "iconfont icon-pingjiaxingxing";
        }
      });
      this.star = star;
    },
    // 添加书签
    collection() {
      let { accessKeyId } =
        JSON.parse(window.localStorage.getItem("ossInfo")) || {};
      let bookmarks =
        JSON.parse(window.localStorage.getItem([accessKeyId])) || {};
      let items = bookmarks[`${this.bucket}_book`] || [];
      let list = [];
      let flag = true;
      let message = "书签添加成功";
      items.map((item) => {
        if (this.path === item.path) {
          flag = false;
        } else {
          list.push({ path: item, date: Math.round(new Date()) });
        }
      });
      if (flag) {
        items.push({ path: this.path, date: Math.round(new Date()) });
      } else {
        items = list;
        message = "书签删除成功";
      }

      bookmarks[`${this.bucket}_book`] = items;

      window.localStorage.setItem([accessKeyId], JSON.stringify(bookmarks));

      this.collectionStatus();
      this.$notify({
        title: "书签更新",
        message: `<p style="word-break:break-all;width:260px">${accessKeyId}<br/><span style="color:#e02433">${message}</span></p>`,
        type: 'success',
        position: "top-left",
        duration: 3000,
        dangerouslyUseHTMLString: true,
      });
    },
    // 文件名加工
    dirTitleTool({ name, dir }) {
      let names = name.split("/");

      let fileName = dir ? names[names.length - 2] : names[names.length - 1];

      return dir ? fileName + "/" : fileName;
    },
    imgSuffixTool(name) {
      let names = name.split(".");
      let flag = false;
      name = names[names.length - 1];
      if (
        name === "png" ||
        name === "jpeg" ||
        name === "jpg" ||
        name === "gif" ||
        name === "webp"
      ) {
        flag = true;
      }
      return flag;
    },
    // 后缀Icon加工
    suffixIconTool(row) {
      if (row.dir) {
        return "#icon-wenjianjia";
      }
      let icon = "#icon-wendang1";
      let names = row.name.split(".");
      let suffix = names[names.length - 1];
      suffix === "zip" && (icon = "#icon-yasuobao");
      suffix === "pdf" && (icon = "#icon-pdf");
      suffix === "docx" && (icon = "#icon-WORD");
      suffix === "doc" && (icon = "#icon-WORD");
      suffix === "md" && (icon = "#icon-file-markdown");
      suffix === "vue" && (icon = "#icon-Vue");
      suffix === "java" && (icon = "#icon-java");
      suffix === "js" && (icon = "#icon-js");
      suffix === "jsx" && (icon = "#icon-jsx");
      suffix === "php" && (icon = "#icon-php");
      suffix === "css" && (icon = "#icon-CSS1");
      suffix === "less" && (icon = "#icon-CSS1");
      suffix === "scss" && (icon = "#icon-CSS1");
      suffix === "xlsx" && (icon = "#icon-xlsx");
      suffix === "json" && (icon = "#icon-JSON");
      suffix === "txt" && (icon = "#icon-TXT");
      suffix === "png" && (icon = "#icon-huabanfuben");
      suffix === "jpg" && (icon = "#icon-huabanfuben");
      suffix === "jpeg" && (icon = "#icon-huabanfuben");
      suffix === "gif" && (icon = "#icon-huabanfuben");
      suffix === "webp" && (icon = "#icon-huabanfuben");
      suffix === "svg" && (icon = "#icon-huabanfuben");
      suffix === "icon" && (icon = "#icon-huabanfuben");
      suffix === "psd" && (icon = "#icon-PSDtubiao");
      suffix === "exe" && (icon = "#icon-windows");
      suffix === "html" && (icon = "#icon-chrome");
      suffix === "htm" && (icon = "#icon-chrome");
      suffix === "xml" && (icon = "#icon-xml");
      suffix === "ts" && (icon = "#icon-ts");

      return icon;
    },
  },
};
</script>


<style lang="scss">
.clip-dialog .el-dialog {
  margin: 0 auto;
}
</style>


<style scoped lang="scss">
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

.paste {
  height: 30px;
  border: 1px solid rgba($color: #000000, $alpha: 0.1);
  border-left: 0px;
  display: flex;
  align-items: center;
  padding-right: 16px;
  position: relative;
  box-sizing: border-box;
  cursor: pointer;
  > .paste-child {
    width: 100%;
    height: 100%;
    padding-right: 4px;
    display: flex;
    align-items: center;
    &:hover {
      background-color: #f5f5f5;
    }
    > i {
      color: #409eff;
    }
    > span {
      height: 100%;
      display: flex;
      align-items: center;
      margin-left: 2px;
    }
  }

  > span {
    width: 16px;
    height: 100%;
    display: flex;
    align-items: center;
    border-left: 1px solid rgba($color: #888, $alpha: 0.2);
    position: absolute;
    right: 0;
    top: 0;
    cursor: pointer;
    &:hover {
      background-color: #f5f5f5;
    }
  }
}

.copy-progress,
.delete-progress {
  width: 100%;
  height: 100px;
  padding: 0 8px;
  box-sizing: border-box;
  > span:nth-child(1) {
    display: block;
    margin-top: 14px;
    font-size: 16px;
    color: #888;
  }
  > span:nth-child(3) {
    font-size: 13px;
    color: #000;
    font-weight: 700;
    margin-top: 6px;
  }
  > span {
    display: block;
    margin-top: 14px;
    font-size: 16px;
    color: #888;
  }
  .copy-child,
  .delete-child {
    width: 100%;
    height: 22px;
    background-color: #f5f5f5;
    border-radius: 4px;
    overflow: hidden;
    margin-top: 10px;
    > span:nth-child(1) {
      height: 100%;
      display: block;
      background-color: #5cb85c;
    }
  }
}
</style>

<style scoped lang="scss">
.mkdir {
  width: 100%;
  height: 100px;
  display: flex;
  align-items: center;
  padding: 10px 20px;
  box-sizing: border-box;
  border-top: 1px solid rgba($color: #888, $alpha: 0.2);
  > span {
    width: 120px;
    font-size: 18px;
    font-weight: 700;
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
.delete-list {
  width: 100%;
  padding: 4px 10px;
  box-sizing: border-box;
  margin-top: 0px;
  height: 400px;
  overflow: auto;
  .delete-child {
    width: 100%;
    font-size: 15px;
    display: flex;
    align-items: center;
    > span {
      margin-left: 5px;
      color: #333;
      font-size: 14px;
    }
  }
}
</style>

<style scoped lang="scss">
.file-header {
  width: 100%;
  height: 75px;
  box-sizing: border-box;
  > .top {
    width: 100%;
    height: 40px;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    padding: 0 10px;
    .ace-path {
      width: 100%;
      background-color: #fff;
      box-sizing: border-box;
      height: 30px;
      border: 1px solid rgba($color: #888, $alpha: 0.3);
      border-right: 0px;
      display: flex;
      align-items: center;
      padding-left: 10px;
      > span {
        color: #555;
        font-weight: 900;
        font-size: 13px;
      }
    }
  }
  > .bottom {
    width: 100%;
    height: 35px;
    background-color: #fff;
    box-sizing: border-box;
    padding: 0 10px;
    border-bottom: 1px solid rgba($color: #000000, $alpha: 0.1);
    display: flex;
  }
}
</style>

