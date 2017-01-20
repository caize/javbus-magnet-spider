/**
 * Created by dianjie on 2017/1/8.
 */
var config = require("./config");
var db = require("./db");
var tools = require("./tools");
var logger = require("./logger");
var async = require('async');
var cheerio = require('cheerio');
var mysql = require('mysql');
var fs = require('fs');
var taskStartTime = "00:05:00";//任务将于每天此时间开始
var nextStartTime;//下次执行任务的具体时间


//数组爬的配置不在config.js文件上配置
//----------------------------必须自行手动控制
var indexUrl="https://www.javbus3.com/";//爬虫主站用于获取磁力链接组拼
var urlType=0;//自己控制，0无码1有码2欧美（必须）控制不好，会影响数据库
var linkArr=require('./data/uncensored/actresses/unhas.json');
//----------------------------

var page = 2;//页码
var linkIndex=16742;//链接索引位置
var threads=4;//线程数
var timer=1000;//一条线程结束后的等待时间（毫秒）
var pageTimer=5000;//爬一页后的等待时间（毫秒）
console.log(`类型>>>>>${urlType}`);
function maintask() {
    console.log(`page>>>>>${page},arrIndex>>>>>${linkIndex}`);
    tools.get(linkArr[linkIndex] + '/' + page, '', function (err, res) {
        if (err) {
            logger.log(err);
            //炸了，再执行自己
            if (err !== 404) {
                maintask();
            }else {
                if(linkIndex<linkArr.length-1){
                    page=1;
                    linkIndex++;
                    maintask();
                }else {
                    logger.log("好像是搞掂了！！！");
                }
            }
            return false;
        }
        var previewObj = [];
        var $ = cheerio.load(res, {decodeEntities: false, ignoreWhitespace: true});
        var items=$('#waterfall .item');
        var itemLen=items.length;
        // 没有可爬链接，爬下一个链接
        if (!itemLen) {
          if(linkIndex<linkArr.length-1){
              page=1;
              linkIndex++;
              maintask();
          }else {
              logger.log("好像是搞掂了！！！");
          }
          return ;
        }
        items.each(function (idx, element) {
            let url = $(this).children('.movie-box').attr('href');
            //没地址退出本次循环
            if (!url) return;
            //图片html实体
            let imgEle = $(this).find('.photo-frame img');
            //番号以及更新日期html实体
            let nD = $(this).find('.photo-info date');
            let picUrl = imgEle.attr('src');
            let title = imgEle.attr('title');
            //各种标签文字
            let tag = $(this).find('.photo-info .item-tag').text();
            //将标签格式化成数组
            let tagArr = tag.split(/\s/);
            let isHD = tagArr.includes("高清"),
                isSubtitled = tagArr.includes('字幕'),
                picName = tools.getUrlFileName(picUrl),
                name = nD.eq(0).text(),
                date = nD.eq(1).text();
            date=new Date(date)=='Invalid Date'?"1990-01-01":date;
            let insertSql = "INSERT INTO preview SET ?";
            let inserts = {
                title,
                name,
                updateTime: date,
                picUrl: picName,
                type: urlType,
                isHD,
                isSubtitled
            };
            insertSql = mysql.format(insertSql, inserts);
            db.query('SELECT * FROM preview WHERE name =' + mysql.escape(name), function (err, res) {
                if (err) {
                    logger.log("查询预览"+err);
                    return false;
                }
                if (!res.length) {
                    db.query(insertSql, function (err) {
                        if (err) {
                            logger.log(err);
                            return false;
                        }
                    });
                } else {
                    let id = res[0].id;
                    db.query("UPDATE preview SET `updateTime` = '" + date + "' WHERE `id` = " + id, function (err, res) {
                        if (err) {
                            logger.log("更新预览"+err);
                            return false;
                        }
                    })
                }
            });
            previewObj.push({
                url,
                sPic: picUrl,
                title,
                name
            });
        });
        // console.log(previewObj.length);
        async.mapLimit(previewObj, threads, function (obj, callback) {
            // 延时再执行
            let timeFun = function (res) {
                setTimeout(function () {
                    callback(null, Object.assign({}, obj, res));
                }, timer);
            };
            saveDetail(obj).then(function (res) {
                timeFun(res);
            }).catch(function () {
                //重试一次
                saveDetail(obj).then(function (res) {
                    timeFun(res);
                }).catch(function (rej) {
                    timeFun(rej);
                });
            });
        }, function (error, results) {
            let pre=linkArr[linkIndex].replace("http://", "").replace("https://", "");
            tools.saveTxt(`${pre+page}.txt`,JSON.stringify(results)).then(function () {
                page++;
                setTimeout(maintask, pageTimer)
            }).catch(function (rej) {
                logger.log("保存txt炸了啊！！,原因："+rej)
            })
        });
    }, 2);

}
//存详情
function saveDetail(obj) {
    let promise = new Promise(function (resolve, reject) {
        let {url, title, name}=obj;
        tools.get(url, '', function (err, res) {
            if (err) {
                logger.log(err);
                reject({});
                return false;
            }
            var $ = cheerio.load(res, {decodeEntities: false, ignoreWhitespace: true});
            let query = $('body script').eq(2).text();
            //磁力获取查询参数
            query = query.replace(/\s/ig, "").replace(/var/ig, '').replace(/;/ig, '&').replace(/'&?/ig, '');
            let infoArr = [];
            //番号信息数组文本
            $('.movie .info p').each(function (idx, element) {
                infoArr.push($(this).text())
            });

            let bPicUrl = $(".screencap .bigImage").attr('href');
            let bPicName = tools.getUrlFileName(bPicUrl);
            //时长索引
            let timeIndex = infoArr.findIndex(function (value) {
                return value.indexOf("長度:") == 0 ? true : false;
            });
            //发行日期索引
            let releaseDateIndex = infoArr.findIndex(function (value) {
                return value.indexOf("發行日期:") == 0 ? true : false;
            });
            //演员索引
            let actorIndex = infoArr.findIndex(function (value) {
                return value.indexOf("演員:") == 0 ? true : false;
            });
            let time = tools.getCenterText(infoArr[timeIndex], "長度:", "分鐘");
            let releaseDate = tools.getCenterText(infoArr[releaseDateIndex], "發行日期:");
            releaseDate=new Date(releaseDate)=='Invalid Date'?"1990-01-01":releaseDate;
            let actor = infoArr[actorIndex + 1] == "推薦:" ? "" : infoArr[actorIndex + 1];
            time = tools.replaceText(time);
            releaseDate = tools.replaceText(releaseDate);
            actor = tools.replaceText(actor).replace(/\s+/ig, "&&&");
            // console.log(time,releaseDate,actor)
            let insertSql = "INSERT INTO detail SET ?";
            let inserts = {
                title,
                name,
                releaseDate,
                time,
                actor,
                bPic: bPicName,
                type: urlType,
            };
            insertSql = mysql.format(insertSql, inserts);
            //返回大图地址
            let callBackResult = {bPic: bPicUrl};
            db.query('SELECT * FROM detail WHERE name =' + mysql.escape(name), function (err, res) {
                if (err) {
                    logger.log("查询详情"+err);
                    reject(callBackResult);
                    return false;
                }
                if (!res.length) {
                    db.query(insertSql, function (err) {
                        if (err) {
                            reject(callBackResult);
                            logger.log("插入详情"+err);
                            return false;
                        }
                    });
                }
                // 执行看有没更新或未存
                saveMagnet(obj, query).then(function () {
                    resolve(callBackResult)
                }).catch(function () {
                    reject(callBackResult)
                })
            });
        });
    });
    return promise;
}
//存磁力
function saveMagnet(obj, query) {
    let promise = new Promise(function (resolve, reject) {
        let {url, title, name}=obj;
        //获取磁力
        tools.get(indexUrl + "ajax/uncledatoolsbyajax.php?" + query, url, function (err, res) {
            if (err) {
                logger.log(err);
                reject({});
                return false;
            }
            let $ = cheerio.load(res, {decodeEntities: false, ignoreWhitespace: true});
            let td = $('tr[height=35px] td');
            let tdLen = td.length;
            if(tdLen){
                for (let i = 1; i <= tdLen / 3; i++) {
                    let oneRow = $(td[i * 3 - 3]).children('a').first();
                    let magnet = oneRow.attr('href');
                    let magnetName = tools.replaceText(oneRow.text());
                    let size = $(td[i * 3 - 2]).children('a').first().text();
                    size = tools.replaceText(size);
                    let tdText = $('tr').eq(i - 1).text();
                    let isHD = tdText.indexOf('HD') !== -1 ? true : false;
                    let isSubtitled = tdText.indexOf('SUB') !== -1 ? true : false;
                    // console.log(magnetName);
                    db.query('SELECT * FROM magnet WHERE magnet =' + mysql.escape(magnet), function (error, respon) {
                        if (error) {
                            logger.log("查询磁力"+error);
                            return false;
                        }
                        if (!respon.length) {
                            let insertSql = "INSERT INTO magnet SET ?";
                            let inserts = {
                                name,
                                magnet,
                                magnetName,
                                size,
                                isHD,
                                isSubtitled,
                                createTime: tools.getDateString()
                            };
                            insertSql = mysql.format(insertSql, inserts);
                            db.query(insertSql, function (errinfo) {
                                if (errinfo) {
                                    logger.log("插入磁力"+errinfo);
                                    return false;
                                }
                            });
                        }
                    });

                }
                resolve()
            }else {
                resolve()
            }
        })
    });
    return promise;
}
function main() {
    tools.existsPath(config.txtPath).then(function () {
        maintask()
    }).catch(function () {
        console.log(`大哥自己建${config.txtPath}文件目录吧`);
    })
}
main();
