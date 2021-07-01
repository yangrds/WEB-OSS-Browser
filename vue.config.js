/*
 * @Author: yangrd
 * @Date: 2021-02-12 03:06:10
 * @LastEditTime: 2021-03-05 11:06:12
 * @Description: 
 * @FilePath: \WEB-OSS-Browser\vue.config.js
 * @功能描述
 */

const path = require('path');

function resolve(dir) {
  return path.join(__dirname, dir);
}
module.exports = {
  lintOnSave: true,
  productionSourceMap: false,
  chainWebpack: (config) => {
    config.resolve.alias
      .set('@', resolve('src'))
  }
};