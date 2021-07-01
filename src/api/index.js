/*
 * @Author: yangrd
 * @Date: 2021-02-12 14:30:22
 * @LastEditTime: 2021-03-04 17:28:03
 * @Description: api管理
 * @FilePath: \WEB-OSS-Browser\src\api\index.js
 * @功能描述
 */



import OSS from "ali-oss";

export function getClient() {
      return new OSS(JSON.parse(window.localStorage.getItem('client')) || {});
}





// 获取【文件/目录】列表
export const fileList = (prefix, marker) => getClient().list({ prefix, delimiter: '/', 'max-keys': 1000, marker })


// 获取【文件/目录】列表（全部） 
export const allList = (prefix) => getClient().list({ prefix, 'max-keys': 1000 })


// 继续列出文件（主要用于递归子目录）
export const maxList = (marker) => getClient().list({ marker, 'max-keys': 1000 })




export const copy = (key, file) => getClient().copy(key, file)



// 获取下载地址
export const signatureUrl = (key, response) => getClient().signatureUrl(key, { response })

// 分片上传（断点续传）
export const multipartUpload = async (key, file, options = {}, client) => {

      return client.multipartUpload(key, file, options)

}

// 分片上传（编辑器）
export const editorMultipartUpload = (key, file, options = {}) => getClient().multipartUpload(key, file, options)

// 分片上传（普通备用）
export const clipMultipartUpload = (key, file, options = {}) => getClient().multipartUpload(key, file, options)

// 简单上传
export const simplePut = (key, file) => getClient().put(key, file)

// 批量删除
export const deleteMulti = (keys) => getClient().deleteMulti(keys, {
      quiet: true
})

// 批量删除
export const deleteKey = (key) => getClient().delete(key, {
      quiet: true
})

