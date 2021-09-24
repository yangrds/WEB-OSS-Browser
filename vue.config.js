/*
 * @Author: yangrd
 * @Date: 2021-02-12 03:06:10
 * @LastEditTime: 2021-03-05 11:06:12
 * @Description: 
 * @FilePath: \WEB-OSS-Browser\vue.config.js
 * @功能描述
 */

const path = require('path');
const { name } = require('./package');
function resolve(dir) {
  return path.join(__dirname, dir);
}
module.exports = {
  lintOnSave: true,
  productionSourceMap: false,
  chainWebpack: (config) => {
    config.resolve.alias
      .set('@', resolve('src'))
  },
  devServer: {
    port:7002,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  configureWebpack: {
    output: {
      library: `${name}-[name]`,
      libraryTarget: 'umd', // 把微应用打包成 umd 库格式
      jsonpFunction: `webpackJsonp_${name}`,
    },
  },
};