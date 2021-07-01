/*
 * @Date: 2020-12-01 14:56:17
 * @LastEditTime: 2021-03-05 11:10:17
 * @LastEditors: Please set LastEditors
 * @FilePath: \WEB-OSS-Browser\src\tool\clip.js
 * @sketch: 滑动插件
 */

function _q(node) {
  return document.querySelector(node)
}


export function urltoImage(url, fn) {
  var img = new Image();
  img.src = url;
  img.onload = function () {
    fn(img);
  }
};

// 通过url转file对象
export async function fileImgTool(url, fileName, power = 1, size) {
  let suffix = fileName.split('.')[fileName.split('.').length - 1]
  suffix = suffix.replace('jpg', 'jpeg')
  return new Promise((resolve) => {
    var img = new Image();
    img.src = url;
    img.crossOrigin = "Anonymous";
    img.onload = function () {
      var cvs = document.createElement('canvas');
      var ctx = cvs.getContext('2d');
      cvs.width = size ? size.swidth : img.width;
      cvs.height = size ? size.sheight : img.height;
      cvs.sx = size ? size.sx : 0
      cvs.sy = size ? size.sy : 0
      ctx.drawImage(img, cvs.sx, cvs.sy, cvs.width, cvs.height, 0, 0, cvs.width, cvs.height);
      resolve(dataURLtoFile(cvs.toDataURL(`image/${suffix}`, power), fileName))
    }
  })
}

// 通过字节计算文件大小
export const sizeCount = (bytes) => {
  var symbols = ["bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  var exp = Math.floor(Math.log(bytes) / Math.log(2));
  if (exp < 1) {
    exp = 0;
  }
  var i = Math.floor(exp / 10);
  bytes = bytes / Math.pow(2, 10 * i);

  if (bytes.toString().length > bytes.toFixed(2).toString().length) {
    bytes = bytes.toFixed(2);
  }
  return bytes + " " + symbols[i];
}



// 将base64转换成file对象
function dataURLtoFile(dataurl, filename = 'file.png') {
  let arr = dataurl.split(',')
  let mime = arr[0].match(/:(.*?);/)[1]
  let bstr = atob(arr[1])
  let n = bstr.length
  let u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }

  let file = new File([u8arr], `${filename}`, {
    type: mime
  })

  return file
}

// 生成本地图片URL地址
export function getObjectURL(file) {
  let url = null;
  if (window.createObjectURL !== undefined) {
    // basic
    url = window.createObjectURL(file);
  } else if (window.webkitURL !== undefined) {
    // webkit or chrome
    url = window.webkitURL.createObjectURL(file);
  } else if (window.URL !== undefined) {
    // mozilla(firefox)
    url = window.URL.createObjectURL(file);
  }
  return url;
}


export function sizeTool(file) {

  return new Promise((resolve) => {
    let img = new Image()
    img.src = getObjectURL(file)
    img.onload = function () {
      resolve({
        w: img.naturalWidth,
        h: img.naturalHeight
      })
    }
  })

}


export function resetTool(width, height, _this) {
  _q('#clip').style.left = '20px';
  _q('#clip').style.top = '30px';
  _q('#clip').style.width = width + 'px';
  _q('#clip').style.height = height + 'px';
  _this.params.left = '20px';
  _this.params.top = '30px';
  _this.params.width = width + 'px';
  _this.params.height = height + 'px';
}


//获取相关CSS属性方法
export function getCss(o, key) {
  let str = o.currentStyle ? o.currentStyle[key] : document.defaultView.getComputedStyle(o, false)[key];
  return str
};

export function moveTool(_this) {

  // 裁剪
  _q('.determine').onclick = async function drawImageFun() {
    let img = _q('#img-bg')

    /* 
    裁剪信息
    [sx] X轴偏移量
    [sy] Y轴偏移量
    [swidth] 裁剪宽度
    [sheight] 裁剪高度
    */
    let sx = parseInt(_this.params.left) - img.offsetLeft
    let sy = parseInt(_this.params.top) - img.offsetTop
    let swidth = parseInt(_this.params.width)
    let sheight = parseInt(_this.params.height)
    let fileName = _this.fileImgs[_this.index].name
    let tempFile = await fileImgTool(img.src, fileName, 1, { sx, sy, swidth, sheight })
    _this.tailoringClick(tempFile, swidth, sheight)
    resetTool(swidth, sheight, _this, 'max')
  }

  /* 
  拖拽，缩放 事件注册
  [params.currentX] 鼠标按下时坐标x轴
  [params.currentY] 鼠标按下时坐标y轴
  [point.onselectstart] 防止IE文字选中，有助于拖拽平滑
  [point.onmousedown] point当前注册事件的DOM节点
  [document.onmousemove] 开启全DOM拖拽（只有通过point.onmousedown注册的节点才具备权限）
  [e.stopPropagation()] 阻止事件继续传播
  */
  function moveDragFun(point, target, kind) {
    _this.params.width = getCss(target, "width");
    _this.params.height = getCss(target, "height");
    _this.params.left = getCss(target, "left");
    _this.params.top = getCss(target, "top");

    point.onmousedown = function (event) {

      _this.params.flag = true;
      if (!event) {
        event = window.event;
      }
      var e = event;
      _this.params.currentX = e.clientX;
      _this.params.currentY = e.clientY;

      point.onselectstart = function () {
        return false;
      };
      e.stopPropagation();
      document.onmousemove = function (e) {
        if (_this.params.flag) {
          var nowX = e.clientX; // 鼠标移动时x坐标
          var nowY = e.clientY; // 鼠标移动时y坐标
          var disX = nowX - _this.params.currentX; // 鼠标x方向移动距离
          var disY = nowY - _this.params.currentY; // 鼠标y方向移动距离
          _q('.size-x').value = _q('#clip').offsetLeft - _q('#img-bg').offsetLeft
          _q('.size-y').value = _q('#clip').offsetTop - 30
          _q('.size-w').value = parseInt(getCss(_q('#clip'), "width"))
          _q('.size-h').value = parseInt(getCss(_q('#clip'), "height"))
          // 拖拽，八方向缩放
          if (kind === 'leftTop') {
            target.style.left = parseInt(_this.params.left) + disX + "px";
            target.style.width = parseInt(_this.params.width) - disX + "px";
            target.style.top = parseInt(_this.params.top) + disY + "px";
            target.style.height = parseInt(_this.params.height) - disY + "px";
          } else if (kind === 'rightTop') {
            target.style.top = parseInt(_this.params.top) + disY + "px";
            target.style.height = parseInt(_this.params.height) - disY + "px";
            target.style.width = parseInt(_this.params.width) + disX + "px";
          } else if (kind === 'rightBot') {
            target.style.width = parseInt(_this.params.width) + disX + "px";
            target.style.height = parseInt(_this.params.height) + disY + "px";
          } else if (kind === 'topCenter') {
            target.style.top = parseInt(_this.params.top) + disY + "px";
            target.style.height = parseInt(_this.params.height) - disY + "px";
          } else if (kind === 'botCenter') {
            target.style.height = parseInt(_this.params.height) + disY + "px";
          } else if (kind === 'rightCenter') {
            target.style.width = parseInt(_this.params.width) + disX + "px";
          } else if (kind === 'leftCenter') {
            target.style.left = parseInt(_this.params.left) + disX + "px";
            target.style.width = parseInt(_this.params.width) - disX + "px";
          } else if (kind === 'leftBot') {
            target.style.left = parseInt(_this.params.left) + disX + "px";
            target.style.width = parseInt(_this.params.width) - disX + "px";
            target.style.height = parseInt(_this.params.height) + disY + "px";
          } else {
            target.style.left = parseInt(_this.params.left) + disX + "px";
            target.style.top = parseInt(_this.params.top) + disY + "px";
          }
          // 鼠标抬起
          document.onmouseup = function () {
            _this.params.flag = false;
            _this.params.left = getCss(target, "left");
            _this.params.top = getCss(target, "top");
            _this.params.width = getCss(target, "width");
            _this.params.height = getCss(target, "height");
            document.onmousemove = null
          }

        }

      }

    }

  }


  // 拖拽事件注册，八方向缩放事件注册

  // 拖拽
  moveDragFun(_q('#mask'), _q('#clip'), 'clip')
  // 左上
  moveDragFun(_q('#leftTop'), _q('#clip'), 'leftTop')
  // 左下
  moveDragFun(_q('#leftBot'), _q('#clip'), 'leftBot')
  // 右上
  moveDragFun(_q('#rightTop'), _q('#clip'), 'rightTop')
  // 右下
  moveDragFun(_q("#rightBot"), _q("#clip"), "rightBot");
  // 上中
  moveDragFun(_q("#topCenter"), _q("#clip"), "topCenter");
  // 下中
  moveDragFun(_q("#botCenter"), _q("#clip"), "botCenter");
  // 右中
  moveDragFun(_q("#rightCenter"), _q("#clip"), "rightCenter");
  // 左中
  moveDragFun(_q("#leftCenter"), _q("#clip"), "leftCenter");

}
