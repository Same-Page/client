#### [Read English Version](https://github.com/Same-Page/client/blob/master/README_EN.md)

# 一叶

《一叶》是一款[浏览器插件](https://chrome.google.com/webstore/detail/same-page/bldcellajihanglphncgjmceklbibjkk)，它让你可以在任意网页上实时聊天。你也可以修改源代码，将一叶部署在你自己的网站上。

主要功能包括有:

- 同网页聊天
- 同网站聊天
- 用户创建特定主题的房间聊天
- 用户之间可以关注，发私信等

## 项目结构

一叶的前端代码在本项目里。

Client 文件夹主要有 chatbox 和 inject-script 两部分，都是用 create-react-app 创建的。工作方法是首先在网页里引入 inject-script，然后 inject-script 运行时会生成一个包含了聊天盒的 iframe。
这种分离的设计有两个优点：

1. 聊天盒因为功能很多所以文件较大，所以不用在每次加载页面的时候就加载它，而是当用户想要使用的时候才打开。
2. Iframe 可以起到很好的隔离作用，你的网站和一叶之间不会互相影响，不论是 javascript 还是 css 样式。

Inject script 部分的文件比较小，它的功能有：

1. 在网页上增加一个按钮，点击按钮可以打开含有聊天盒的 iframe。
2. 自动连接聊天服务器，显示多少人在当前网页或网站，显示实时聊天弹幕。

## 如何开发与本地运行

### 本地运行客户端

前面提到了客户端分有 inject-script 和 chatbox 两部分，两者都要启动聊天盒才能正常使用，下面会解释原因。
我们先运行 chatbox 部分

```
cd client/chatbox
npm install .
npm start
```

第一次运行需要先 `npm install .`安装依赖的库，之后则不用。项目会运行于 localhost:3000，但聊天盒并不能独立工作，接下来我们运行 injection-script 的部分。

```
cd client/inject-script
npm install .
npm start
```

现在如果你去 localhost:3210，就可以看到客户端正常运行了，点击右下角的圆圈打开聊天盒。

客户端默认会和官方的服务器通讯，而不是你的本地后端，你可以更改默认的设定，让客户端和你的本地后端通讯。如何运行后端代码请见后端的代码库

[聊天系统后端](https://github.com/Same-Page/chat-backend)

[基本系统后端](https://github.com/Same-Page/web-backend)

## 如何部署前端

### 生成客户端文件

Inject-script 和 chatbox 两部分要分别生成。
生成聊天盒的客户端文件。

```
cd client/chatbox
npm run build
```

生成 inject-script 的客户端文件。

```
cd client/inject-scirpt
npm run build
```

生成的文件在对应的 build 文件夹里，更多细节可以参考 Facebook 官方的 create-react-app 教程。

### 部署到你的网站上

将 inject-script 的`client/inject-scirpt/build/content-static`文件夹上传到你的服务器，确保可以以`your-website.com/build/content-static`的形式访问里面的文件. 接下来在你的网站里引入下面两行即可

```
<link href="https://your-website.com/build/content-static/css/main.css" rel="stylesheet">
<script src="https://your-website.com/build/content-static/js/main.js" ></script>
```

如果聊天盒的部分也要使用你自己生成的版本，相似的，上传你的`client/chatbox/build/`文件夹到你的服务器，确保可以访问`your-website.com/build/static`里面的文件。同时要记得修改 injection script 中设置的 chatbox iframe 的地址指向你自己上传的这个版本，`your-website.com/build/index.html`，也可以在你的网站定义下面的设置。

```
window.spConfig = {
  chatboxUrl: 'your-website.com/build/index.html'
}
```
