<template>
  <!-- 数据传输控制台 -->
  <div class="data-pass">
    <el-tabs type="border-card">
      <el-tab-pane label="上传">
        <div class="tabs-item">
          <div class="control">
            <div class="upload-btns">
              <el-tooltip
                class="item"
                effect="dark"
                content="启动全部"
                placement="top-start"
              >
                <div class="btn-child" @click="fileControl('start')">
                  <span class="iconfont icon-ai23"></span>
                </div>
              </el-tooltip>

              <el-tooltip
                class="item"
                effect="dark"
                content="暂停全部"
                placement="top-start"
              >
                <div class="btn-child" @click="fileControl('stop')">
                  <span class="iconfont icon-pause"></span>
                </div>
              </el-tooltip>

              <el-tooltip
                class="item"
                effect="dark"
                content="清空已完成"
                placement="top-start"
              >
                <div class="btn-child" @click="emptyFile('has')">
                  <span class="iconfont icon-lajitong"></span>
                </div>
              </el-tooltip>

              <el-tooltip
                class="item"
                effect="dark"
                content="清空全部"
                placement="top-start"
              >
                <div class="btn-child" @click="emptyFile('all')">
                  <span class="iconfont icon-lajitong"></span>
                </div>
              </el-tooltip>
            </div>
          </div>
          <div class="upload-list">
            <div
              class="upload-item"
              v-for="(item, index) in uploadList"
              :key="index"
            >
              <div class="upload-info">
                <span>{{ item.title }}</span>
                <div class="progress">
                  <div
                    class="progress-child"
                    :style="{
                      width: NumberTwoDecimal(item.progress * 100) + '%',
                      backgroundColor:
                        item.status === '0' ? '#1E90FF' : '#FFD700',
                    }"
                  ></div>
                </div>
              </div>
              <span class="upload-status">{{
                item.status === "0"
                  ? "上传中"
                  : item.status === "-1"
                  ? "停止"
                  : "完成"
              }}</span>
              <span class="upload-size"
                >{{
                  item.currentSize > item.size
                    ? renderSize(item.size)
                    : renderSize(item.currentSize)
                }}/{{ renderSize(item.size) }}</span
              >
              <div class="upload-btns">
                <div
                  class="btn-child"
                  @click="stopClick(item)"
                  v-if="item.status != '1'"
                >
                  <span
                    :class="`iconfont ${
                      item.status === '0' ? 'icon-pause' : 'icon-ai23'
                    }`"
                  ></span>
                </div>

                <div class="btn-child" @click="emptyFile('key', item.uploadId)">
                  <span class="iconfont icon-dashujukeshihuaico-"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 关闭数据传输控制台 -->
    <span
      class="iconfont icon-dashujukeshihuaico-"
      @click="
        $store.commit('stateUpdate', { name: 'transmissionShow', data: false })
      "
    ></span>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { renderSize, NumberTwoDecimal } from "@/tool/index";
export default {
  name: "",
  components: {},
  props: {},
  data() {
    return {
      renderSize,
      NumberTwoDecimal,
      client: null,
    };
  },
  computed: mapState({
    // 箭头函数可使代码更简练
    path: (state) => state.path,
    uploadList: (state) => state.uploadList,
  }),
  watch: {
    uploadList(to) {
    },
  },
  created() {},
  mounted() {
    this.emptyFile("not");
  },
  methods: {
    stopClick(item) {
      if (item.status === "-1") {
        this.$store.dispatch("sliceUpload", item);
      } else {
        item.client.cancel();
      }
    },
    fileControl(type) {
      let uploadList = this.uploadList;
      if (type === "start") {
        uploadList.map((item) => {
          if (item.status === "-1") {
            this.$store.dispatch("sliceUpload", item);
          }
        });
      } else {
        uploadList.map((item) => {
          if (item.status === "0") {
            item.client.cancel();
          }
        });
      }
    },
    emptyFile(type, uploadId) {
      let uploadList =
        JSON.parse(window.localStorage.getItem("uploadList")) || [];

      // 清空全部
      if (type === "all") {
        uploadList = [];
      } else if (type === "not") {
        // 清空未完成
        uploadList = uploadList.filter((item) => item.progress === 1);
      } else if (type === "has") {
        // 清空已完成
        uploadList = uploadList.filter((item) => item.progress < 1);
      } else if (type === "key") {
        // 根据uploadId精确删除
        uploadList = uploadList.filter((item) => item.uploadId != uploadId);
      }

      // 更新缓存
      window.localStorage.setItem("uploadList", JSON.stringify(uploadList));

      // 更新状态管理器
      this.$store.commit("stateUpdate", {
        name: "uploadList",
        data: uploadList,
      });
    },
  },
};
</script>


<style lang="scss">
.el-tabs--border-card > .el-tabs__content {
  padding: 0;
}
</style>

<style scoped lang="scss">
.data-pass {
  width: 600px;
  position: absolute;
  right: 0;
  bottom: 0;
  opacity: 0.9;
  z-index: 3000;

  .tabs-item {
    width: 100%;
    height: 340px;
    .control {
      width: 100%;
      height: 40px;
      padding-left: 10px;
      box-sizing: border-box;
      border-bottom: 1px solid rgba($color: #000000, $alpha: 0.1);
    }
    .upload-list {
      width: 100%;
      height: 300px;
      box-sizing: border-box;
      overflow: auto;
      .upload-item {
        width: 100%;
        height: 50px;
        border-bottom: 1px solid rgba($color: #888, $alpha: 0.3);
        padding-left: 10px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        position: relative;
        .upload-info {
          width: 200px;
          height: 100%;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          justify-content: center;
          > span {
            width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          > .progress {
            width: 190px;
            height: 4px;
            border-radius: 4px;
            margin-top: 5px;
            overflow: hidden;
            border: 1px solid #dcdcdc;
            > .progress-child {
              width: 100px;
              height: 100%;
              background-color: #337ab7;
            }
          }
        }
        .upload-status {
          width: 100px;
          //   margin-left: 30px;
          text-align: center;
          color: #337ab7;
          font-size: 13px;
          font-weight: 700;
        }
        .upload-size {
          font-size: 12px;
          color: #888;
          margin-left: 20px;
        }
        .upload-btns {
          height: 100%;
          margin-left: 20px;
          position: absolute;
          right: 20px;
          top: 0;
          .btn-child {
            width: 20px;
            height: 20px;
            > span {
              font-size: 15px;
            }
          }
        }
      }
    }
  }

  >.icon-dashujukeshihuaico- {
    position: absolute;
    right: 7px;
    top: 7px;
    font-size: 24px;
    font-weight: 700;
    cursor: pointer;
    
  }
}
</style>

<style scoped lang="scss">
.upload-btns {
  height: 40px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  .btn-child {
    width: 40px;
    height: 30px;
    background-color: #fff;
    box-sizing: border-box;
    border: 1px solid rgba($color: #888, $alpha: 0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    margin-right: 5px;
    border-radius: 5px;
    &:hover {
      background-color: #e6e6e6;
    }
    &:active {
      background-color: #f5f5f5;
    }
  }
}
</style>
