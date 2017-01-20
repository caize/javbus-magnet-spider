/**
 * Created by dianjie on 2017/1/7.
 */
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
