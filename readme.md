# 一个简易打包器的制作

## 依赖解析

```js
const detective = require("detective");
const requires = detective(source);
```

深度遍历寻找依赖，返回一个依赖数组

## 源码比较简单，主要由三个函数构成

### createModuleObject()

 从目录信息构造需要的模块信息,传入一个文件path路径，返回一个而文件模块对象ModuleObject

### getModules()

  获取所有的模块信息，传入一个入口文件path路径，作为根路径，调用createModuleObject()生成模块对象，遍历根路径的依赖，可以把所有引用文件变成模块对象，返回一个所有文件对象模块的数组，根据ID来调用

### pack()

  传入一个Modules[]数组，通过工厂方式构造一个require()函数，把文件模块的ID和依赖暴露出来，方便require的调用，最后调用require(0),调用跟模块，返回一个立即执行的函数