
<template>
  <div id="tailoring">
    <div class="clip-loading" v-if="clipNum != clipTotal">
      <div class="clip-progress">
        <div class="clip-child" style="background-color: #888">
          <span :style="{ width: Percentage(clipNum, clipTotal) + '%' }"></span>
          <span style="color: #fff">{{ clipNum }} / {{ clipTotal }}</span>
        </div>
      </div>
    </div>
    <div class="cloud-loading" v-if="cloudNum != cloudTotal">
      <div class="clip-progress">
        <div class="clip-child">
          <span
            :style="{
              width: Percentage(cloudNum, cloudTotal) + '%',
              backgroundColor: '#67c23a',
            }"
          ></span>
          <span>{{ cloudNum }} / {{ cloudTotal }}</span>
        </div>
      </div>
    </div>
    <div class="files-top">
      <img
        :src="getObjectURL(item)"
        v-for="(item, num) in fileImgs"
        :key="num"
        @click="tabImgClick(item, num)"
        :style="{ borderColor: num === index ? '#79bbff' : 'rgba(0,0,0,.2)' }"
      />
    </div>

    <div class="utils">
      <div class="child-size">
        <span>X轴：</span>
        <input
          class="size-x"
          @input="
            ({ target }) => {
              moveChange(target.value, 'size-x');
            }
          "
          type="number"
          :value="pixel().x"
        />
      </div>

      <div class="child-size">
        <span>Y轴：</span>
        <input
          class="size-y"
          type="number"
          @input="
            ({ target }) => {
              moveChange(target.value, 'size-y');
            }
          "
          :value="pixel().y"
        />
      </div>

      <div class="child-size">
        <span>宽度：</span>
        <input
          class="size-w"
          @input="
            ({ target }) => {
              moveChange(target.value, 'size-w');
            }
          "
          :value="pixel().w"
          type="number"
        />
      </div>

      <div class="child-size">
        <span>高度：</span>
        <input
          class="size-h"
          @input="
            ({ target }) => {
              moveChange(target.value, 'size-h');
            }
          "
          type="number"
          :value="pixel().h"
        />
      </div>
      <div class="the-zoom">
        <el-tooltip
          :content="maskPixel === 'min' ? '裁剪框最小化' : '裁剪框最大化'"
          placement="top"
        >
          <span
            :class="`iconfont ${
              maskPixel === 'min' ? 'icon-Minimize1' : 'icon-Maximize'
            }`"
            @click="maskPixelClick()"
          ></span>
        </el-tooltip>
      </div>

      <div class="child-pixel">
        <span>尺寸：</span>
        <span>{{ size.w }}*{{ size.h }}</span>
      </div>
      <div class="child-pixel">
        <span>大小：</span>
        <span>{{ sizeCount(size.byte) }}</span>
      </div>

      <div class="ace-btns clip-btns">
        <div class="btn-child" @click="electionClick">
          <i class="iconfont icon-huabanfuben" style="color: #53a8ff"></i>
          <span>重选</span>
          <input type="file" @change="electionClick" />
        </div>
        <div class="btn-child determine">
          <i class="iconfont icon-jianqie" style="color: #409eff"></i>
          <span>裁剪</span>
        </div>
        <div class="btn-child" @click="reduction">
          <i class="iconfont icon-huanyuan" style="color: #e3713d"></i>
          <span>还原</span>
        </div>
        <div class="btn-child" @click="cloudSyncClick">
          <i class="iconfont icon-shangchuan" style="color: #de8a18"></i>
          <span>更新</span>
        </div>
      </div>
    </div>
    <div class="img-wrap">
      <div id="clip" ref="refclip">
        <div id="mask"></div>
        <div id="leftTop"></div>
        <div id="rightTop"></div>
        <div id="leftBot"></div>
        <div id="rightBot"></div>
        <div id="leftCenter"></div>
        <div id="rightCenter"></div>
        <div id="topCenter"></div>
        <div id="botCenter"></div>
      </div>
      <img
        :style="{
          width: size.w + 'px',
          height: size.h + 'px',
        }"
        id="img-bg"
        ref="refImg"
        ondragstart="return false"
        :src="imgurl"
        alt=""
      />
    </div>
  </div>
</template>

<script>
import { Percentage } from "@/tool/index";
import { simplePut } from "@/api/index";
import {
  moveTool,
  getObjectURL,
  sizeTool,
  resetTool,
  fileImgTool,
  sizeCount,
  getCss,
} from "@/tool/clip";

const _q = (node) => document.querySelector(node);

export default {
  props: {
    ImgFiles: {
      type: Array,
      default() {
        return [];
      },
    },
    isFile: {
      type: Boolean,
      default: true,
    },
    editorIndex: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      maskPixel: "max",
      clipNum: 0,
      clipTotal: 0,
      cloudNum: 0,
      cloudTotal: 0,
      Percentage,
      imgurl: "",
      move: false,
      startX: 0,
      index: 0,
      // 文件列表
      fileImgs: [],
      initFiles: [],
      // 尺寸列表
      fileSizes: [{ w: 100, h: 100, byte: 0 }],
      // 图像属性
      params: {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        currentX: 0,
        currentY: 0,
        flag: false,
        kind: "drag",
      },
      size: {
        w: 0,
        h: 0,
        byte: 0,
      },
    };
  },
  watch: {},
  created() {},
  async mounted() {
    await this.initTool();
  },
  beforeUpdate() {},
  updated() {},
  methods: {
    maskPixelClick() {
      let { w, h } = this.size;
      if (this.maskPixel === "min") {
        w = 100;
        h = 100;
      }

      resetTool(w, h, this);

      this.maskPixel = this.maskPixel === "min" ? "max" : "min";
    },
    pixel() {
      let x = 0;
      let y = 0;
      let w = 100;
      let h = 100;
      if (!!_q("#clip")) {
        x = _q("#clip").offsetLeft - _q("#img-bg").offsetLeft;
        y = _q("#clip").offsetTop - 30;
        w = parseInt(getCss(_q("#clip"), "width"));
        h = parseInt(getCss(_q("#clip"), "height"));
      }
      return { x, y, w, h };
    },
    async electionClick({ target }) {
      let file = target.files[0];
      // 替换缓存中的文件集合
      this.initFiles[this.index] = file;
      // 当前图像文件更新
      this.fileImgs[this.index] = file;
      // 更新对应文件信息
      let temp = await sizeTool(file);
      temp.byte = file.size;

      this.fileSizes[this.index] = temp;
      // 重置切换至当前图片（刷新）
      this.tabImgClick(this.initFiles[this.index], this.index);
    },
    async initTool() {
      if (!this.isFile) {
        // 注入图像为网络地址，批量加工为file对象
        let list = [];
        this.clipTotal = this.ImgFiles.length;
        for (let i = 0; i < this.ImgFiles.length; i++) {
          const { url, name } = this.ImgFiles[i];
          // URL加工为FILE（canvas转换）
          let temp = await fileImgTool(url, name);
          this.clipNum = i + 1;
          list.push(temp);
        }

        // 将注入的文件集合，初始化缓存
        this.initFiles = list;
      } else {
        // 非URL模式，直接获取组件外的文件集合
        let temps = [];
        this.ImgFiles.map((item) => {
          temps.push(item.file);
        });
        this.initFiles = temps;
      }

      // 从初始化缓存中获取数据
      this.fileImgs = [...this.initFiles];

      // 展示图像初始化
      this.imgurl = this.getObjectURL(this.fileImgs[0]);

      // 图片裁剪主方法
      moveTool(this);
      // 初始化图像
      await this.sizeInit();
      // 图像准备中，从第一张开始
      this.$nextTick(() => {
        this.tabImgClick(this.fileImgs[0], 0);
      });
    },
    getObjectURL,
    // 还原图像
    async reduction() {
      // 从缓存中的文件集合，恢复至现有文件集合
      this.fileImgs[this.index] = this.initFiles[this.index];
      // 获取图像尺寸
      let temp = await sizeTool(this.initFiles[this.index]);
      // 获取图像文件大小
      temp.byte = this.initFiles[this.index].size;
      // 更新至对应图片信息容器
      this.fileSizes[this.index] = temp;
      // 重置切换至当前图片（刷新）
      this.tabImgClick(this.initFiles[this.index], this.index);
    },

    // 坐标宽高
    moveChange(value, type) {
      if (type === "size-x") {
        this.params.left = parseInt(value) + 20 + "px";
        this.$refs.refclip.style.left = parseInt(value) + 20 + "px";
      } else if (type === "size-y") {
        this.params.top = parseInt(value) + 30 + "px";
        this.$refs.refclip.style.top = parseInt(value) + 30 + "px";
      } else if (type === "size-w") {
        this.params.width = parseInt(value) + "px";
        this.$refs.refclip.style.width = parseInt(value) + "px";
      } else if (type === "size-h") {
        this.params.height = parseInt(value) + "px";
        this.$refs.refclip.style.height = parseInt(value) + "px";
      }
    },
    /* 
    更新至云端
    */
    async cloudSyncClick() {
      this.cloudNum = 0;
      this.cloudTotal = this.ImgFiles.length;
      this.ImgFiles.map(async (temp, index) => {
        let file = {};
        this.fileImgs.map((item) => {
          item.name === temp.name && (file = item);
        });
        const { res, name } = await simplePut(temp.path, file);
        if (res.status === 200) {
          this.$notify({
            title: "成功",
            message: `<p style="word-break:break-all;width:260px">${name}<br/><span style="color:#409eff">云端更新成功</span></p>`,
            type: "success",
            position: "top-left",
            dangerouslyUseHTMLString: true,
          });
        } else {
          this.$notify({
            title: "错误",
            message: `<p style="word-break:break-all;width:260px">${name}<br/><span style="color:#e02433">云端更新失败</span></p>`,
            type: "error",
            position: "top-left",
            dangerouslyUseHTMLString: true,
          });
        }
        this.cloudNum += 1;
      });
    },
    // 获取图像原始尺寸,原始大小
    async sizeInit() {
      let list = [];
      for (let i = 0; i < this.fileImgs.length; i++) {
        let item = this.fileImgs[i];
        let temp = await sizeTool(item);
        temp.byte = item.size;
        list.push(temp);
      }
      this.fileSizes = list;
    },
    // 裁剪事件
    tailoringClick(file, swidth, sheight) {
      // 当前图像文件更新
      this.fileImgs[this.index] = file;
      // 生成本地url地址
      this.imgurl = this.getObjectURL(file);
      // 图像文件信息更新
      this.fileSizes[this.index] = { w: swidth, h: sheight, byte: file.size };

      // 更新展示信息
      this.size = { w: swidth, h: sheight, byte: file.size };
    },
    // 切换图像
    tabImgClick(file, index) {
      this.index = index;
      this.imgurl = this.getObjectURL(file);
      let { w, h, byte } = this.fileSizes[this.index];
      this.size = { w, h, byte };
      resetTool(100, 100, this);
    },
    sizeCount,
  },
};
</script>


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
  .btn-child:nth-last-child(1) {
    border-right: 1px solid rgba($color: #000, $alpha: 0.2);
  }
}
.clip-btns {
  position: absolute;
  right: 10px;
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
}

.clip-progress {
  width: 100%;
  padding: 0 100px;
  box-sizing: border-box;
  position: relative;
  .clip-child {
    width: 100%;
    height: 16px;
    background-color: #fff;
    border-radius: 5px;
    overflow: hidden;
    margin-top: 10px;
    position: relative;
    > span:nth-child(1) {
      height: 100%;
      display: block;
      background-color: #67c23a;
    }
    > span:nth-child(2) {
      height: 100%;
      position: absolute;
      right: 10px;
      top: 0;
      display: flex;
      align-items: center;
      font-size: 12px;
      color: #000;
    }
  }
}
</style>

<style scoped lang="scss">
#tailoring {
  box-sizing: border-box;
  position: relative;
  user-select: none;
  width: 100%;
  .cloud-loading,
  .clip-loading {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 9999;
    background-color: #fff;
    display: flex;
    align-items: center;
  }
  .cloud-loading {
    background-color: rgba($color: #000, $alpha: 0.7);
  }
  .files-top {
    width: 100%;
    height: 100px;
    display: flex;
    align-items: center;
    padding: 0 10px;
    box-sizing: border-box;
    position: relative;
    overflow: auto;
    border-bottom: 1px solid rgba($color: #888, $alpha: 0.3);
    > img {
      width: 70px;
      height: 70px;
      margin-right: 20px;
      border-radius: 10px;
      cursor: pointer;
      box-sizing: border-box;
      border: 2px solid;
    }
  }
  .utils {
    width: 100%;
    height: 50px;
    box-sizing: border-box;
    position: relative;
    z-index: 99;
    display: flex;
    align-items: center;
    padding-left: 10px;
    box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.1);
    .the-zoom {
      width: 40px;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #66b1ff;
      margin-right: 15px;
      margin-left: -5px;
      span {
        cursor: pointer;
        font-size: 16px;
      }
      > span:nth-child(1) {
        font-size: 18px;
      }
    }
    .child-size,
    .child-pixel,
    .child-range {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      box-sizing: border-box;
      margin-right: 20px;
      input {
        width: 60px;
        height: 20px;
        padding-left: 4px;
        box-sizing: border-box;
        background: #f5f5f5;
        border-radius: 2px;
        outline: none;
        border: none;
        font-size: 12px;
        color: #0000cd;
      }
      > span:nth-child(1) {
        font-size: 14px;
        font-weight: 700;
        color: #888;
      }
    }
    .child-range {
      > span {
        margin-right: 5px;
      }
    }
    .child-pixel {
      > span:nth-child(2) {
        font-size: 12px;
        color: #0000cd;
      }
    }
  }
  .img-wrap {
    justify-content: center;
    background: #e3e7e9;
    background-position: 0 0, 10px 10px, 10px 10px, 20px 20px;
    background-size: 20px 20px;
    background-image: linear-gradient(45deg, #f6fafc 25%, transparent 0),
      linear-gradient(45deg, transparent 75%, #f6fafc 0),
      linear-gradient(45deg, #f6fafc 25%, transparent 0),
      linear-gradient(45deg, transparent 75%, #f6fafc 0);
    width: 100%;
    height: 600px;
    overflow: auto;
    padding: 30px 20px;
    position: relative;
    box-sizing: border-box;
    #img-bg {
      user-select: none;
    }
  }
  #clip {
    width: 100px;
    height: 100px;
    border: 1px solid #0000cd;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 99;
    user-select: none;
    box-sizing: border-box;
    #mask {
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.1);
    }

    cursor: move;
    #leftTop,
    #rightTop,
    #leftBot,
    #rightBot,
    #leftCenter,
    #rightCenter,
    #topCenter,
    #botCenter {
      border: 1px solid;
      width: 4px;
      height: 4px;
      box-sizing: content-box;
      background-color: #fff;
      position: absolute;
    }
    #leftTop {
      top: -3px;
      left: -3px;
      cursor: nw-resize;
    }
    #rightTop {
      top: -3px;
      right: -3px;
      cursor: ne-resize;
    }
    #leftBot {
      bottom: -3px;
      left: -3px;
      cursor: sw-resize;
    }
    #rightBot {
      bottom: -3px;
      right: -3px;
      cursor: se-resize;
    }
    #leftCenter {
      left: -3px;
      top: 50%;
      transform: translateY(-50%);
      cursor: w-resize;
    }
    #rightCenter {
      right: -3px;
      top: 50%;
      transform: translateY(-50%);
      cursor: e-resize;
    }
    #topCenter {
      left: 50%;
      top: -3px;
      transform: translateX(-50%);
      cursor: n-resize;
    }
    #botCenter {
      left: 50%;
      bottom: -3px;
      transform: translateX(-50%);
      cursor: s-resize;
    }
  }
}
</style>
