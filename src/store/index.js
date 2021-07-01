import Vue from 'vue'
import Vuex from 'vuex'
import OSS from "ali-oss";
import { uuid } from "@/tool/index";
import router from '@/router/index'
Vue.use(Vuex)


export default new Vuex.Store({
    state: {
        bucket: '',
        accessKeyId: '',
        headerVisible: true,
        bookmarksRefreshDelete: true,
        // 当前目录
        path: '',
        // 目录列表
        ossList: [],
        // 加载状态
        loading: false,
        // 编辑器
        CodeEditor: {
            size: '',
            code: '',
            path: ''
        },
        language: {},
        // 编辑器显示
        editorShow: false,
        // 上传列表
        uploadList: [],
        // 数据传输控制台
        transmissionShow: false,
        // 当前所勾选【文件/目录】数据
        selections: [],
        // 拷贝容器
        copys: [],
        copyPath: '',
        copyNum: 0,
        copyTotal: 0,
        copyVisible: false,
        deleteNum: 0,
        deleteConfirm: false,
        deleteTotal: 0,
        deleteVisible: false,
        state: false,
        downloadVisible: false,
        downloads: []
    },
    mutations: {
        // 更新state数据
        stateUpdate(state, { name, data }) {
            state[name] = data
        },
        // 根据uploadId取消上传
        progressCancel(state, { uploadId }) {
            state.uploadList.map((item) => {
                if (item.uploadId === uploadId) {
                    item.status = '-1'
                }
            })
            window.localStorage.setItem('uploadList', JSON.stringify(state.uploadList))
        },
        // 精确更新上传进度
        progressUpdate(state, { uploadId, progress, checkpoint }) {
            // 更新文件信息状态
            state.uploadList.map((item) => {
                // 根据进度回调注入的uploadId参数对比上传列表uploadId
                if (item.uploadId === uploadId) {
                    // 更新进度信息（强制保留后两位小数点，不足补0）
                    item.progress = progress
                    // 记录断点续传信息
                    item.checkpoint = checkpoint
                    // progress为1，表示已上传完成，更新上传状态为1（完成）
                    if (progress === 1) {
                        item.status = '1'
                    }

                    // 当前上传数据大小，checkpoint不存在则说明该上传信息无切片信息（OSS服务器不接受小于100K的分片信息）
                    item.currentSize += checkpoint ? checkpoint.partSize : item.size
                }
            })
            // 加入缓存
            window.localStorage.setItem('uploadList', JSON.stringify(state.uploadList))

        }

    },
    actions: {

        async sliceUpload({ state, commit, dispatch }, { file, checkpoint, uploadId, progress, currentSize, path }) {
            const { multipartUpload } = require("@/api/index");
            commit('stateUpdate', { name: 'transmissionShow', data: true })
            // 创建OSS实力对象（断点续传，每个文件上传都需要单独实例对象）
            let client = new OSS(JSON.parse(window.localStorage.getItem("client")));
            // 缓存当前上传列表
            let uploadList = state.uploadList;
            // 初始化上传唯一标识符
            uploadId = uploadId ? uploadId : uuid(16, 16);
            // 文件信息初始化
            let fileChild = {
                title: file.name, // 文件名称
                size: file.size,  // 文件大小
                currentSize: currentSize ? currentSize : 0, // 当前上传文件大小
                uploadId, // 上传ID
                progress: progress ? progress : 0, // 上传进度
                checkpoint: checkpoint ? checkpoint : {}, // 断点续传记录
                status: "0", // 上传状态，0上传中，1完成，-1停止
                client, // oss实例对象
                file, // 文件对象
                path: path ? path : `${state.path}${file.name}`, // 文件上传地址
            };
            // 判断为断点续传，将新数据替换旧数据，否则新加一条上传数据
            if (checkpoint) {
                uploadList = uploadList.map((item) => {
                    if (uploadId === item.uploadId) {
                        return fileChild
                    } else {
                        return item
                    }
                })
            } else {
                // 加入上传列表
                uploadList.unshift(fileChild);
            }
            // 同步更新上传列表
            commit("stateUpdate", {
                name: "uploadList",
                data: uploadList,
            });
            // 定义OSS上传参数
            let options = {
                // 进度回调
                progress: function (progress, checkpoint) {
                    // 同步更新进度状态
                    commit("progressUpdate", {
                        uploadId,
                        progress,
                        checkpoint,
                    });
                },
                // 元信息
                meta: { year: 2020, people: "test" },
                // 文件类型
                mime: file.type,
            }

            checkpoint && (options.checkpoint = checkpoint)
            // 判断如果为断点，则开启续传
            // 开始上传
            multipartUpload(
                `${state.path}${file.name}`,
                file,
                options,
                client
            ).then((data) => {
                dispatch('fileUpdate')
            }).catch((error) => {
                // 抛出异常（一般为手动停止上传，或者遭遇网络异常）
                commit("progressCancel", { uploadId });
            });
        },


        async fileUpdate({ state, commit }) {

            // 检查登录时间戳，过期重置至登录页面

            let { overdueDate } = JSON.parse(window.localStorage.getItem('ossInfo')) || {}

            let date = Math.round(new Date())

            if (date > overdueDate) {
                window.localStorage.removeItem('client')
                router.push('/login')
            }


            const { fileList } = require("@/api/index");

            /* 
      由于SDK限制每次所请求的目录内文件最多返回1000个文件
      该方法递归循环子目录文件列表
    */
            async function infiniteList(nextMarker, objects, prefixes) {
                let max = nextMarker;
                let flag = true;
                while (flag) {
                    const res = await fileList(state.path, max);
                    max = res.nextMarker;
                    flag = res.isTruncated;
                    objects && objects.push(...res.objects);
                    prefixes && prefixes.push(...res.prefixes);
                }

                return { objects, prefixes };
            }
            // 开启加载状态
            commit('stateUpdate', { name: 'loading', data: true })
            // 请求文件列表
            let rf = await fileList(state.path);
            let { objects, prefixes, res, isTruncated, nextMarker } = rf
            if (isTruncated) {
                const result = await infiniteList(nextMarker, objects, prefixes)
                objects = result.objects
                prefixes = result.prefixes
            }

            // 初始化列表
            let list = [];
            // 遍历目录加入列表
            prefixes &&
                prefixes.map((item) => {
                    list.push({ name: item, dir: true });
                });
            // 遍历文件加入列表
            objects && objects.map((item) => {
                if (item.name) {
                    let names = item.name.split("/");
                    if (names[names.length - 1]) {
                        list.push(item);
                    }
                }
            });
            // 更新列表
            commit('stateUpdate', { name: 'ossList', data: list })
            // 结束加载状态
            commit('stateUpdate', { name: 'loading', data: false })
        },


        // 批量删除
        async deleteFile({ state, dispatch, commit }, dir) {
            const { deleteKey } = require("@/api/index");
            commit('stateUpdate', { name: 'deleteVisible', data: true })
            commit('stateUpdate', { name: 'deleteNum', data: 0 })
            commit('stateUpdate', { name: 'deleteConfirm', data: true })
            // 初始化容器
            let files = await dispatch("getfiles", dir);
            // 提取容器内文件路劲
            let keys = files.map((item) => item.name);
            // 批量删除
            deleteKeyTool(keys);
            async function deleteKeyTool(keys) {
                commit('stateUpdate', { name: 'deleteTotal', data: keys.length })
                for (let i = 0; i < keys.length; i++) {
                    deleteKey(keys[i]).then(() => {
                        commit('stateUpdate', { name: 'deleteNum', data: state.deleteNum += 1 })
                        if (state.deleteNum >= state.deleteTotal) {
                            commit('stateUpdate', { name: 'deleteVisible', data: false })
                            dispatch("fileUpdate");
                            commit('stateUpdate', { name: 'deleteConfirm', data: false })
                        }
                    });
                }
            }
        },

        // 递归容器
        async getfiles({ state }, temps) {
            const { maxList, allList } = require("@/api/index");
            // 初始化容器
            let files = [];
            // 遍历当前选中项
            for (let i = 0; i < temps.length; i++) {
                let item = temps[i];
                if (item.dir) {
                    // 判断为目录，获取目录内子目录，max=1000条（OSS SDK限制）
                    const { objects, isTruncated, nextMarker } = await allList(item.name);
                    // 文件列表加入容器
                    files.push(...objects);
                    // 子目录文件超限，继续列出文件，加入容器
                    if (isTruncated) {
                        const maxs = await infiniteList(nextMarker);
                        files.push(...maxs);
                    }
                } else {
                    // 非目录，直接加入容器
                    files.push(item);
                }
            }
            /* 
由于SDK限制每次所请求的目录内文件最多返回1000个文件
该方法递归循环子目录文件列表
*/
            async function infiniteList(nextMarker) {
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
            }


            return files;
        },


        // 粘贴文件
        async pasteClick({ state, commit, dispatch }, info = {}) {
            const { copy, maxList, allList } = require("@/api/index");
            // 初始化进度
            commit('stateUpdate', { name: 'copyNum', data: 0 })
            // 唤起进度条对话框
            commit('stateUpdate', { name: 'copyVisible', data: true })
            // 初始化容器,getfiles方法获取当前目录下的文件及目录（递归子目录/文件）
            let files = await dispatch('getfiles', state.copys)
            // 待粘贴文件信息加工容器
            let list = [];
            // 待删除文件信息加工容器
            let deletes = [];
            // 开始遍历
            files.map((item) => {
                // 复制时缓存的PATH替换当前PATH，加入待粘贴容器
                list.push({
                    to: item.name.replace(state.copyPath, info.toFile ? info.toFile : state.path),
                    from: item.name,
                });
                // 将源文件信息，加入待删除容器（如果此操作为剪切模式，则该容器全部数据将注入deleteMulti接口，进行批量删除）
                deletes.push(item.name);
            });

            // 初始化百分比参数
            state.copyTotal = list.length;

            // 遍历拷贝所有文件（异步）
            for (let i = 0; i < list.length; i++) {
                copy(list[i].to, list[i].from).then(async () => {
                    commit('stateUpdate', { name: 'copyNum', data: state.copyNum += 1 })
                    // 拷贝结束
                    if (state.copyNum >= state.copyTotal) {
                        // 关闭进度条
                        commit('stateUpdate', { name: 'copyVisible', data: false })
                        // 剪切模式
                        if (state.shear) {
                            commit("stateUpdate", { name: "copys", data: [] })
                            await dispatch("deleteFile", info.emptys);
                        } else {
                            // 刷新目录
                            dispatch("fileUpdate");
                        }

                    }
                });
            }

        },
    }
})