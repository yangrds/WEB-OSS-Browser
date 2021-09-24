/*
 * @Author: yangrd
 * @Date: 2021-02-12 02:59:19
 * @LastEditTime: 2021-02-12 04:38:49
 * @Description: 
 * @FilePath: \weboss\src\router\index.js
 * @功能描述
 */
import VueRouter from 'vue-router'
import Vue from 'vue'


Vue.use(VueRouter)

const routes = [
    { path: '/login', component: () => import('@/pages/login') },
    {
        path: '/',
        component: () => import('@/pages/home'),
        meta: {
            pageName: '首页'
        }
    },

]

export default routes