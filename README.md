# WEB-OSS-Browser开源文档（使用教程）

> 经过两个月的努力[WEB-OSS-Browser](http://home.yangrd.com/)基本开发完毕，本工具为B/S架构，直连阿里云ali-oss，不参杂任何第三方接口，不需要担心您的隐私泄露（可以参阅[源码](https://github.com/yrd688/WEB-OSS-Browser)检查API接口），WEB-OSS-Browser包括文件管理，文件复制/裁剪，二维码生成，代码编辑，图片裁剪，文件上传（断点续传），文件下载，批量获取下载地址，书签管理，图片预览，图片裁剪，后续将会更新更多实用新功能。

## 免责声明

本网站所展示项目都属于 **非商业盈利行为**，其目的是为了更好的交流及讨论技术，创建更和谐的社区环境。 本网站及其所展示项目的部分设计资源均来源于网络，如果这部分资源侵犯了您的合法权益，请您第一时间联系我， 我将已最快的速度将侵犯您权益的内容下线处理。

**联系方式：** yangrd_bbs@aliyun.com

**WEB-OSS-Browser** 基于MIT协议开放源代码， 特此免费授予获得副本的任何人 软件和相关文档文件（以下简称“软件”）的交易 在软件中不受限制，包括但不限于权利 使用，复制，修改，合并，发布，分发，再许可和/或出售 本软件的副本

**核心资源：** 本软件核心代码来自[ **ali-sdk/ali-oss** ](https://github.com/ali-sdk/ali-oss)您可以查看其开源代码及开源许可证

**责任归属**：本人不对 **WEB-OSS-Browser** 任何时间造成的任何后果承担任何责任，在使用前请务必参阅[WEB-OSS-Browser源代码](https://github.com/yrd688/WEB-OSS-Browser)

本工具在UI方面参照阿里云官方OSS-Browser设计（如果涉及侵权，将会第一时间更改）

**全部代码围绕着ali-sdk/ali-oss进行开发，没有抄袭OSS-Browser一个字节**，[OSS-Browser](https://github.com/aliyun/oss-browser)作为阿里云官方客户端工具（桌面程序）稳定性将是毋庸置疑的，他是WEB-OSS-Browser一直学习以及追赶的目标。

## [GitHub开源地址](https://github.com/yrd688/WEB-OSS-Browser)

## 登录WEB-OSS-Browser

<img src="https://yangrdbok.oss-cn-beijing.aliyuncs.com/BLOG/Images/Snipaste_2021-03-30_16-28-06.jpg" alt="Snipaste_2021-03-30_16-28-06" style="zoom:50%;" />

**准备工作**

关于[如何获取AccessKeyId和AccessKeySecret](https://help.aliyun.com/document_detail/63482.html?spm=5176.12818093.0.dexternal.40dd16d0pYP1Vn)

配置跨域资源共享（CORS）规则

通过浏览器直接访问OSS时，CORS配置规则要求如下：

- **来源**：设置精准域名（例如`www.aliyun.com`）或带有通配符星号（*）的域名（例如`*.aliyun.com`）。
- **允许 Methods**：建议您根据实际使用场景，选择不同的Methods。例如分片上传时，设置为**PUT**；删除文件时，设置为**DELETE**。
- **允许 Headers**：设置为`*`。
- **暴露 Headers**：设置为`ETag`、`x-oss-request-id`和`x-oss-version-id`

<img src="https://yangrdbok.oss-cn-beijing.aliyuncs.com/BLOG/Images/Snipaste_2021-03-30_16-52-56.jpg" alt="Snipaste_2021-03-30_16-52-56" style="zoom:67%;" />

感觉上面的配置很复杂？（使用官方oss工具也需要配置），打开跨域设置，按照上面的填写即可，来源可以填写自己特定的域名，*代表所有

## 文件上传（断点续传）

1. **工具的右下角可以直接打开上传管理器**
2. **点击工具栏的文件可以选择文件上传（支持多选）**
3. **点击工具栏的目录可以选择文件上传（整个目录）**
4. **请确保每次同时上传文件不超过1000个（数量过大可能导致阿里云API接口拥堵）**

<img src="https://yangrdbok.oss-cn-beijing.aliyuncs.com/BLOG/Images/Snipaste_2021-03-30_17-04-00.jpg" alt="Snipaste_2021-03-30_17-04-00" style="zoom:80%;" />

## 获取地址

**勾选需要的文件，点击工具栏获取地址，可以批量获取所有文件的下载地址**

<img src="https://yangrdbok.oss-cn-beijing.aliyuncs.com/BLOG/Images/Snipaste_2021-03-30_17-08-44.jpg" alt="Snipaste_2021-03-30_17-08-44" style="zoom:80%;" />

点击目录列表文件对应的获取地址，可以获取该文件的二维码，以及下载地址

<img src="https://yangrdbok.oss-cn-beijing.aliyuncs.com/BLOG/Images/Snipaste_2021-03-30_17-21-36.jpg" alt="Snipaste_2021-03-30_17-21-36" style="zoom:50%;" />

## 图片裁剪

**点击工具栏的图片裁剪，可以唤醒图片裁剪控制台**

<img src="https://yangrdbok.oss-cn-beijing.aliyuncs.com/BLOG/Images/Snipaste_2021-03-30_17-25-06.jpg" alt="Snipaste_2021-03-30_17-25-06" style="zoom:80%;" />

**可以对云端图片直接进行裁剪（从云端下载至内存中转为流数据）可以重选一张图片替换云端图片，多次裁剪均不满意，可以一键恢复原图（重选后的图片不支持），点金更新按钮，可以将全部图片更新至云端。**

## 复制/移动

**勾选需要的文件，点击复制/移动，然后选择文件夹，点击粘贴可拷贝至对应，目录。**

**注意：移动文件在拷贝结束后会删除源文件，请不要进行大批量移动，以免API接口拥堵造成误删文件。**

## 删除

点击工具栏的删除按钮，可以删除已勾选的文件，文件批量删可以进行大批量操作（漏删的话在执行即可）

## 在线代码编辑器

WEB-OSS-Browser集成ACE代码编辑器，支持代码在线编辑，支持110+种语言

1. 支持代码智能补全/提示
2. 支持全局搜索/替换关键字
3. 支持编辑过程中切换语言高亮
4. 支持展开/收缩代码块
5. 支持代码异常标注
6. 基本的代码编辑均支持

![Snipaste_2021-03-30_17-41-13](https://yangrdbok.oss-cn-beijing.aliyuncs.com/BLOG/Images/Snipaste_2021-03-30_17-41-13.jpg)

## 图片预览

点击图片的文件名即可打开文件预览界面

**WEB-OSS-Browser**基本的操作就介绍到这里，更多功能可以下载源码部署，或者查看[测试案例](http://oss.yangrd.com/)