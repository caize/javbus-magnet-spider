/**
 * Created by dianjie on 2017/1/8.
 */
var fs = require('fs');
var request = require('request');
var zlib = require('zlib');
var config = require("./config");
var logger = require("./logger");
var tools = require("./tools");

//////////////////网络访问部分
var maxretry = 3;//请求如果出错的话，最大重试次数
var self = this;
exports.get = function (url, referer = '', callback, retry) {
    if (!retry) retry = 0;
    var headers = {
        'Accept': 'text/html, application/xhtml+xml, */*',
        'Accept-Language': 'zh-CN',
        'User-Agent': 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; WOW64; Trident/6.0)',
        'Connection': 'Keep-Alive',
        'Accept-Encoding': 'gzip,deflate',
		'Cookie':'existmag=all',
        'Referer': referer
    };

    request({
            url: url,
            headers: headers,
            timeout: 15000,
            encoding: null
        },
        function (error, response, data) {
            if (!error && response.statusCode == 200) {
                var buffer = new Buffer(data);
                var encoding = response.headers['content-encoding'];
                if (encoding == 'gzip') {
                    zlib.gunzip(buffer, function (err, decoded) {
                        callback(err && ('unzip error' + err), decoded && decoded.toString());
                    });
                } else if (encoding == 'deflate') {
                    zlib.inflate(buffer, function (err, decoded) {
                        callback(err && ('deflate error' + err), decoded && decoded.toString());
                    })
                } else {
                    callback(null, buffer.toString());
                }
            }
            else {
                //小于错误次数则重试
                if (retry < maxretry) {
                    logger.debug("retry getting url : " + url);
                    self.get(url, referer, callback, retry + 1);
                }
                else
                    callback(error || response.statusCode);
            }
        });
}
//获取图片并保存于本地（删除旧图片）
exports.getPic = function (url, path, callback,retry) {
    if (!url) {
        callback(null);
        return;
    }
    if (!retry) retry = 0;
    var file = tools.getUrlFileName(url);
    var savePic=function() {
        var stream =request
            .get(url)
            .on('error', function (err) {
                if (retry < maxretry) {
                    retry++;
                    savePic();
                }
                else
                    callback(err);
            })
            .pipe(fs.createWriteStream(path + file));
        stream.on('finish', function () {callback(null)});

    };
    fs.readFile(path + file, function (err, buffer) {
        if (err) {
            savePic();
        }else {
            //删除再下载
            fs.unlink(path + file, function (err) {
                if (err) {
                    logger.log('删除'+path + file+"失败")
                    return false;
                }
                savePic();
            })
        }
    })
}

//////////////////工具部分

//获取当前日期时间字符串
exports.getDateTimeString = function (d) {
    if (!d) d = new Date();
    var yyyy = d.getFullYear().toString();
    var mm = (d.getMonth() + 1).toString();
    var dd = d.getDate().toString();
    var hh = d.getHours().toString();
    var mi = d.getMinutes().toString();
    var ss = d.getSeconds().toString();
    return yyyy + "-" + (mm[1] ? mm : "0" + mm) + "-" + (dd[1] ? dd : "0" + dd) + " " + (hh[1] ? hh : "0" + hh) + ":" + (mi[1] ? mi : "0" + mi) + ":" + (ss[1] ? ss : "0" + ss);

}

//获取当前日期字符串
exports.getDateString = function (d) {
    if (!d) d = new Date();
    var yyyy = d.getFullYear().toString();
    var mm = (d.getMonth() + 1).toString();
    var dd = d.getDate().toString();
    return yyyy + "-" + (mm[1] ? mm : "0" + mm) + "-" + (dd[1] ? dd : "0" + dd);
}

//获取当前日期字符串
exports.getCNDateString = function (d) {
    if (!d) d = new Date();
    var yyyy = d.getFullYear().toString();
    var mm = (d.getMonth() + 1).toString();
    var dd = d.getDate().toString();
    return yyyy + "年" + mm + "月" + dd + "日";
}

//获取url地址的文件名部分
exports.getUrlFileName = function (url) {
    if (url == undefined || url == null) return '';
    var paths = url.split('/');
    return paths[paths.length - 1];
}

//复制文件
exports.copyfile = function (sourceFile, targetFile) {
    try {
        fs.writeFileSync(targetFile, fs.readFileSync(sourceFile));
        return null;
    }
    catch (err) {
        return err;
    }
}
//去首尾空格
exports.replaceText = function (text) {
    return text.replace(/(^\s*)|(\s*$)/g, "");
}
//获取文本中间
exports.getCenterText=function(text,prev,next) {
    let prevIndex=0;
    let prevLen=0;
    let nextIndex=text.length;
    if(prev){
        prevIndex=text.indexOf(prev);
        prevLen=prev.length
    }
    if(next){
        nextIndex=text.indexOf(next);
    }
    return text.slice(prevIndex+prevLen,nextIndex)
}
//保存txt
exports.saveTxt=function (path,data,home) {
    return new Promise(function (resolve, reject) {
        console.log(path);
        let textPath=home||config.txtPath;
        let partPath=path.slice(0,path.lastIndexOf('.txt'));
        if (fs.existsSync(textPath+path)) {
            logger.log("existed: " + path);
            fs.writeFileSync(textPath+partPath+".1.txt", data, 'utf8');
            resolve();
        }else {
            //逐级判断并建立目录
            let paths = path.split("/");
            let checkdir = home||config.txtPath;
            for (let i in paths) {
                if (i < paths.length - 1 && paths[i].length > 0) {
                    checkdir += "/" + paths[i];
                    if (!fs.existsSync(checkdir))
                        fs.mkdirSync(checkdir);
                }
            }
            fs.writeFileSync(textPath+path, data, 'utf8');
            resolve();
        }
    })
}
//创建目录
exports.existsPath=function(path) {
    return new Promise(function (resolve, reject) {
        // 判断目录是否存在
        fs.exists(path, function (exists) {
            // 不存在创建
            if (!exists) {
                fs.mkdir(path, function (err) {
                    if (err) {
                        reject()
                    } else {
                        resolve()
                    }
                })
            } else {
                resolve()
            }
        });
    })

}