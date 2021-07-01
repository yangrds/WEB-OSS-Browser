<template>
  <div class="ace-mask">
    <div class="ace-main">
      <div class="ace-header">
        <div class="ace-title">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-tubiaozhizuomobanyihuifu-"></use>
          </svg>
          <span>在线编辑器（{{ aceSize }}）</span>

          <div class="close" @click="closeClick">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-dashujukeshihuaico-"></use>
            </svg>
          </div>
        </div>
        <div class="ace-path">
          <span>oss://yrdbok/{{ acePath }}</span>
        </div>
      </div>
      <div id="editor"></div>
      <div class="footer">
        <div class="left">
          <el-select
            v-if="status === 'editor'"
            v-model="codeType"
            style="width: 120px"
            size="mini"
            placeholder="请选择语言"
            @change="languageChange"
          >
            <el-option
              v-for="item in modes"
              :key="item.mode"
              :label="item.caption"
              :value="item.mode"
            >
            </el-option>
          </el-select>
        </div>
        <div class="right">
          <div class="ace-btns" style="margin-top: 1px">
            <div
              class="btn-child"
              v-if="status === 'editor'"
              @click="saveUpdate"
            >
              <i class="iconfont icon-baocuncunchu"></i>
              <span>保存</span>
            </div>
            <div
              class="btn-child"
              style="margin-left: 10px"
              @click="closeClick"
            >
              <i class="iconfont icon-dashujukeshihuaico-"></i>
              <span>关闭</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { editorMultipartUpload } from "@/api/index";
import { editorInit } from "@/tool/ace";
import { mapState } from "vuex";
import { modes } from "@/tool/codeModules";
export default {
  name: "",
  components: {},
  props: {},
  data() {
    return {
      editor: {},
      acePath: "",
      aceSize: "",
      modes,
      codeType: "js",
      status: "",
    };
  },
  computed: mapState({
    // 箭头函数可使代码更简练
    path: (state) => state.path,
    CodeEditor: (state) => state.CodeEditor,
  }),
  watch: {},
  created() {},
  mounted() {
    this.value = this.CodeEditor.code;
    this.acePath = this.CodeEditor.path;
    this.aceSize = this.CodeEditor.size;
    let { editor, language, status } = editorInit(
      this.value,
      this.CodeEditor.suffix
    );
    this.status = status;
    this.editor = editor;
    this.codeType = language.caption;
  },
  methods: {
    languageChange(mode) {
      this.editor.getSession().setMode(mode);
    },
    closeClick() {
      this.$store.commit("stateUpdate", { name: "editorShow", data: false });
    },
    save() {
      this.$emit("save", this.editor.getValue());
    },
    async saveUpdate() {
      let names = this.acePath.split("/");
      const res = await editorMultipartUpload(
        this.acePath,
        this.createFile(this.editor.getValue(), names[names.length - 1])
      );
      this.$message({
        showClose: true,
        message: `${this.acePath} 文件保存成功。`,
        type: "success",
      });
    },
    // 通过字符串创建
    createFile(str, name) {
      var blob = new Blob([str]);
      let myFile = new File([blob], name);
      return myFile;
    },
  },
};
</script>


<style lang="scss">
.ace_editor {
  margin: auto;
  height: 100%;
  width: 100%;
}
.icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>

<style scoped lang="scss">
.ace-mask {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 99;
  background-color: rgba($color: #000000, $alpha: 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  .ace-main {
    width: 800px;
    height: 650px;
    background-color: #fff;
    border-radius: 4px;
    overflow: hidden;
    .ace-header {
      width: 100%;
      height: 70px;
      background-color: #f6f6f6;
      .ace-title {
        width: 100%;
        height: 40px;
        font-size: 20px;
        display: flex;
        align-items: center;
        padding-left: 10px;
        box-sizing: border-box;
        user-select: none;
        position: relative;
        .close {
          position: absolute;
          right: 10px;
          top: 0;
          height: 35px;
          font-size: 24px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          cursor: pointer;
        }
        > span {
          font-size: 16px;
          font-weight: 700;
          color: #888;
          margin-left: 5px;
        }
      }
      .ace-path {
        width: 100%;
        height: 30px;
        background-color: #dff0d8;
        color: #000;
        padding-left: 5px;
        box-sizing: border-box;
        font-size: 14px;
        display: flex;
        align-items: center;
      }
    }
    #editor {
      width: 100%;
      height: 540px;
      overflow: auto;
      box-shadow: 0 2px 2px rgba(0, 0, 0, 0.12);
    }
    .footer {
      width: 100%;
      height: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 10px;
      box-sizing: border-box;
      background-color: #f6f6f6;
      .left,
      .right {
        margin-top: 1px;
        .ace-btn {
          width: 100%;
          font-size: 18px;
          > span {
            font-size: 14px;
            margin-left: 4px;
          }
        }
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
