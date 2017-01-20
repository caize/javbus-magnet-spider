## javbus-magnet-spider
javbus网站爬虫
### 声明：该项目仅供学习交流,请勿用于其他用途!
项目参考与[看知乎](https://github.com/atonasting/zhihuspider)，定时任务未实现，也不打算实现，需要实现的可fork代码加[node-schedule](https://github.com/node-schedule/node-schedule)实现功能！！
### 环境配置
1.装个mysql数据库，5.5或5.6均可，图省事可以直接用lnmp或lamp来装，回头还能直接在浏览器看日志；

2.先安个node.js环境；

3.执行npm -g install forever，安装forever好让爬虫在后台跑；

4.把所有代码整到本地（整=git clone）

5.在项目目录下执行npm install安装依赖库


6.建立一个空mysql数据库和一个有完整权限的用户，执行代码里的javbus.sql，创建数据库结构；

7.编辑config.js，标明（必须）的配置项必须填写或修改，其余项可以暂时不改：

``` javascript
exports.txtPath = "./txt/";//生成txt文件的路径（必须）
exports.sPicPath = "./sPic/";//保存小图的路径（必须）(遍历txt下载的时候需要使用)
exports.bPicPath = "./bPic/";//保存大图的路径（必须）(遍历txt下载的时候需要使用
exports.dbconfig = {
    host: '127.0.0.1',//数据库服务器（必须）
    user: 'root',//数据库用户名（必须）
    password: 'password',//数据库密码（必须）
    database: 'database',//数据库名（必须）
    port: 3306,//数据库服务器端口（必须）
    poolSize: 20,
    acquireTimeout: 30000
};
//https://www.javbus3.com/有码
//https://www.javbus3.com/uncensored/无码
//https://www.javbus.org/欧美
exports.urlpre = "https://www.javbus3.com/uncensored/";//爬虫地址;（必须）
exports.urlType=0;//自己控制，0无码1有码2欧美（必须）
exports.indexUrl="https://www.javbus3.com/";//爬虫主站
```


8.最后开爬`forever start index.js -a`

