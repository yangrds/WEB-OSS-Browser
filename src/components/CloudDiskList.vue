<template>
  <!-- 文件目录 -->
  <div class="fileList" @dragover.prevent @drop="dropFile">
    <el-table
      stripe
      :data="ossList"
      ref="fileList"
      v-loading="loading"
      height="600"
      style="width: 100%"
      @selection-change="toggleRowSelection"
    >
      <el-table-column type="selection" width="34"> </el-table-column>
      <el-table-column label="名称">
        <div slot-scope="scope" class="file-name">
          <svg class="icon" aria-hidden="true">
            <use :xlink:href="suffixIconTool(scope.row)"></use>
          </svg>

          <span
            style="color: #337ab7; cursor: pointer"
            @click="fileNameClick(scope.row)"
            >{{ dirTitleTool(scope.row) }}</span
          >
        </div>
      </el-table-column>
      <el-table-column prop="date" label="类型 / 大小" width="130px">
        <span slot-scope="scope">{{
          scope.row.dir ? "目录" : renderSize(scope.row.size)
        }}</span>
      </el-table-column>
      <el-table-column label="最后修改时间" width="200">
        <span slot-scope="scope">{{
          scope.row.dir
            ? ""
            : dateFormat("YYYY-mm-dd HH:MM", scope.row.lastModified)
        }}</span>
      </el-table-column>
      <el-table-column
        prop="date"
        label="操作"
        width="240"
        header-align="right"
      >
        <div class="ace-operation" slot-scope="scope">
          <el-button
            @click="getQRCode(scope.row)"
            v-if="!scope.row.dir"
            type="text"
            style="font-size: 15px; font-weight: 700; color: #409eff"
            >获取地址</el-button
          >

          <el-button
            @click="downloadClick(scope.row)"
            v-if="!scope.row.dir"
            type="text"
            style="font-size: 15px; font-weight: 700; color: #409eff"
            >下载</el-button
          >

          <el-button
            type="text"
            @click="renameClick(scope.row)"
            style="font-size: 15px; font-weight: 700; color: #888"
            >重命名</el-button
          >
          <el-button
            @click="deleteKeyTool(scope.row)"
            type="text"
            style="font-size: 15px; font-weight: 700; color: #f56c6c"
            >删除</el-button
          >
        </div>
      </el-table-column>
    </el-table>
    <el-dialog
      title="重命名"
      :visible.sync="renameVisible"
      width="400px"
      :before-close="handleClose"
      append-to-body
      :close-on-click-modal="false"
    >
      <div class="rename-path">
        <span>所在目录</span>
        <span>oss://yrdbok/{{ path }}</span>
      </div>

      <div class="rename-path">
        <span>重命名</span>
        <el-input
          v-model="rename.to"
          :spellcheck="false"
          style="width: 240px"
        ></el-input>
      </div>
      <div class="mkdir-btn">
        <div class="ace-btns">
          <div class="btn-child" @click="renameConfirm">
            <i class="iconfont icon-queding1"></i>
            <span>确定</span>
          </div>
          <div class="btn-child" @click="renameVisible = false">
            <i class="iconfont icon-dashujukeshihuaico-"></i>
            <span>取消</span>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog
      title="地址详情"
      :visible.sync="qrcodeVisible"
      width="600px"
      :before-close="handleClose"
      append-to-body
      :close-on-click-modal="false"
    >
      <div class="text-child">
        <span>名称</span>
        <el-input
          :value="downloadAddress.name"
          spellcheck="false"
          style="width: 400px"
          disabled
        ></el-input>
      </div>
      <div class="text-child">
        <span>地址</span>
        <el-input
          :value="downloadAddress.url"
          style="width: 400px"
          spellcheck="false"
          ref="InputCopy"
        />
        <el-button style="margin-left: 10px" type="success" @click="CopyClick"
          >复制地址</el-button
        >
      </div>

      <span class="referer-info"
        >如果您设置了Referer
        白名单且Referer不允许为空，则通过浏览器直接访问该URL会失败</span
      >

      <div ref="qrcode" id="qrcode"></div>

      <div class="mkdir-btn">
        <div class="ace-btns">
          <div class="btn-child" @click="qrcodeVisible = false">
            <i class="iconfont icon-dashujukeshihuaico-"></i>
            <span>关闭</span>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog
      title="图片预览"
      :visible.sync="imgPreviewVisible"
      width="800px"
      :before-close="handleClose"
      append-to-body
      :close-on-click-modal="false"
    >
      <div class="img-preview">
        <img :src="imgPreviewUrl" alt="" />
      </div>
      <div class="mkdir-btn">
        <div class="ace-btns">
          <div class="btn-child" @click="imgPreviewVisible = false">
            <i class="iconfont icon-dashujukeshihuaico-"></i>
            <span>关闭</span>
          </div>
        </div>
      </div>
    </el-dialog>
    
  </div>
</template>

<script>
import { renderSize, dateFormat, download } from "@/tool/index";
import { signatureUrl, copy, deleteMulti, deleteKey } from "@/api/index";
import { mapState } from "vuex";
import axios from "axios";
export default {
  name: "",
  components: {},
  props: {},
  data() {
    return {
      download,
      renderSize,
      dateFormat,
      rename: {},
      renameVisible: false,
      qrcodeVisible: false,
      imgPreviewVisible: false,
      imgPreviewUrl: "",
      downloadAddress: {},
    };
  },
  computed: mapState({
    // 箭头函数可使代码更简练
    path: (state) => state.path,
    loading: (state) => state.loading,
    ossList: (state) => state.ossList,
    CodeEditor: (state) => state.CodeEditor,
  }),
  watch: {},
  created() {},
  mounted() {
    this.refresh();
  },
  methods: {
    async downloadClick(row) {
      let url = await signatureUrl(row.name);
      download(url, this.dirTitleTool(row));
    },

    CopyClick() {
      this.$refs.InputCopy.select();
      document.execCommand("Copy");
      this.$notify({
        title: "剪切板",
        message: "文件地址复制成功",
        type: "success",
        position: "top-left",
        duration: 2000,
      });
    },
    getQRCode(row) {
      this.downloadAddress = row;
      this.qrcodeVisible = true;
      this.$nextTick(() => {
        this.$refs.qrcode.innerHTML = "";
        var qrcode = new QRCode(this.$refs.qrcode, {
          text: row.url,
          width: 300,
          height: 300,
          colorDark: "#000",
          colorLight: "#fff",
          correctLevel: QRCode.CorrectLevel.H,
        });
      });
    },
    async deleteKeyTool(row) {
      if (row.dir) {
        this.$store.commit("stateUpdate", {
          name: "selections",
          data: [{ dir: true, name: row.name }],
        });
        this.$store.commit("stateUpdate", {
          name: "deleteVisible",
          data: true,
        });
        return;
      }
      this.$confirm(
        `此操作将永久删除：${this.dirTitleTool(row)} 是否继续?`,
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(async () => {
          await deleteKey(row.name);
          this.$store.dispatch("fileUpdate");
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    async renameConfirm() {
      const _this = this;
      // 关闭重命名对话框
      this.renameVisible = false;
      // 目录/文件，标题加工
      let { to, from, dir } = this.rename;
      dir && (to = to + "/");
      dir && (from = from + "/");
      // dir 为目录标识
      if (dir) {
        this.$store.commit("stateUpdate", {
          name: "copyPath",
          data: `${this.path}${from}`,
        });
        this.$store.commit("stateUpdate", {
          name: "copys",
          data: [{ dir: true, name: `${this.path}${from}` }],
        });
        this.$store.commit("stateUpdate", { name: "shear", data: true });
        await this.$store.dispatch("pasteClick", {
          toFile: `${this.path}${to}`,
          emptys: [{ dir: true, name: `${this.path}${from}` }],
        });
      } else {
        copy(`${this.path}${to}`, `${this.path}${from}`).then(async (data) => {
          await deleteKey(`${this.path}${from}`);
          _this.$store.dispatch("fileUpdate");
          _this.renameVisible = false;
        });
      }
    },
    renameClick(row) {
      this.renameVisible = true;
      let name = row.name.replace(this.path, "").replace("/", "");
      this.rename = { to: name, from: name, dir: row.dir };
    },
    handleClose(none) {
      none();
    },
    toggleRowSelection(rows) {
      // 更新至状态管理，便于受控于控制台
      this.$store.commit("stateUpdate", { name: "selections", data: rows });
    },
    dropFile(event) {
      event = window.event || event;
      event.preventDefault();
      event.stopPropagation();
      let files = Array.from(event.dataTransfer.files);
      files.map((file) => {
        this.$store.dispatch("sliceUpload", { file });
      });
    },
    // 刷新
    async refresh() {
      this.$store.dispatch("fileUpdate");
    },
    // 文件/目录
    async fileNameClick(row) {
      let suffix = row.name.split(".");

      // 判断为目录，将目录名更新至path，触发列表更新
      if (row.dir) {
        this.$store.commit("stateUpdate", { name: "path", data: row.name });
        return;
      }

      if (this.imgSuffixTool(row.name)) {
        this.imgPreviewUrl = row.url;
        this.imgPreviewVisible = true;
        return;
      }

      // 下载指定文件
      const result = await axios({
        url: signatureUrl(row.name, {
          "content-disposition": `attachment; filename=code.js`,
        }),
        method: "get",
      });
      // 初始化编辑器数据容器
      let CodeEditor = this.CodeEditor;
      // 下载文件为JSON后缀，不能将返回数据直接注入容器，需先格式化为文本
      if (suffix[suffix.length - 1] === "json") {
        CodeEditor.code = JSON.stringify(result.data, null, "\t");
      } else {
        // 将数据注入容器
        CodeEditor.code = result.data;
      }
      // 文件大小
      CodeEditor.size = renderSize(row.size);
      // 文件名称（路劲）
      CodeEditor.path = row.name;

      CodeEditor.suffix =
        "." + row.name.split(".")[row.name.split(".").length - 1];
      // 更新编辑器容器
      this.$store.commit("stateUpdate", {
        name: "CodeEditor",
        data: CodeEditor,
      });
      // 唤起编辑器
      this.$store.commit("stateUpdate", { name: "editorShow", data: true });
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
    // 文件名加工
    dirTitleTool({ name, dir }) {
      let names = name.split("/");
      let fileName = dir ? names[names.length - 2] : names[names.length - 1];
      return fileName;
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
      suffix === "jar" && (icon = "#icon-java");
      suffix === "class" && (icon = "#icon-java");
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


<style scoped lang="scss">
.rename-path {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  box-sizing: border-box;
  margin-bottom: 10px;
  > span:nth-child(1) {
    width: 70px;
    display: block;
    font-size: 16px;
    font-weight: 700;
    color: #606266;
    margin-right: 10px;
  }
  > input {
    width: 100px;
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
    display: flex;
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
.referer-info {
  display: block;
  width: 400px;
  height: 70px;
  padding: 0 10px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  border-radius: 5px;
  background-color: #fcf8e3;
  border: 1px solid #888;
  margin: 10px 0 0 70px;
  color: #a58d62;
}
#qrcode {
  width: 100%;
  display: flex;
  padding-left: 70px;
  box-sizing: border-box;
  margin: 10px 0 10px;
}
.text-child {
  width: 100%;
  height: 50px;
  padding: 0 20px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  margin-top: 10px;
  > span {
    width: 50px;
    font-size: 16px;
    font-weight: 800;
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
</style>

<style scoped lang="scss">
.fileList {
  width: 100%;
  overflow: auto;
  .file-name {
    width: 100%;
    display: flex;
    align-items: center;
    font-size: 20px;
    > svg {
      margin-right: 10px;
    }
    span {
      font-size: 13px;
    }
  }
  .ace-operation {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }
}

.img-preview {
  width: 800px;
  height: 600px;
  display: flex;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  > img {
    max-height: 100%;
    max-height: 100%;
  }
}
</style>
