/**
 * Created by Administrator on 2017/1/10.
 */

//有690页无大概400
//https://www.javbus.com/actresses/
//https://www.javbus.com/uncensored/actresses/
var config = require("./config");
var db = require("./db");
var tools = require("./tools");
var logger = require("./logger");
var async = require('async');
var cheerio = require('cheerio');
let pageArr=[...Array(400).keys()].slice(1);
// let spider="https://www.javbus.com/actresses/";
let spider="https://www.javbus.com/uncensored/actresses/";
function main() {
    async.mapLimit(pageArr, 5, function (value, callback) {
        getUrl(value).then(function (res) {
            setTimeout(function () {
                callback(null, res);
            }, 1000);
        }).catch(function () {
            callback(null, []);
        })
    }, function (error, results) {
        let pre=spider.replace("http://", "").replace("https://", "");
        tools.saveTxt(`${pre}unhas.txt`,JSON.stringify(results),"./data/").then(function () {
            logger.log("好了好了！！")
        }).catch(function (rej) {
            logger.log("保存txt炸了啊！！,原因："+rej)
        })
    });
}
function getUrl(page) {
    return new Promise(function (resolve, reject) {
        console.log(page);
        tools.get(spider + page, '', function (err, res) {
            if (err) {
                logger.log(err);
                //炸了，再执行自己
                if (err !== 404) {
                    getUrl(page)
                }else {
                    reject()
                }
                return false;
            }
            let previewArr= [];
            let $ = cheerio.load(res, {decodeEntities: false, ignoreWhitespace: true});
            $('#waterfall .item').each(function (idx, element) {
                let url = $(this).children('.avatar-box').attr('href');
                //没地址退出本次循环
                if (!url) return;
                previewArr.push(url);
            });
            resolve(previewArr)
        }, 2);
    })

}
tools.existsPath("./data/").then(function () {
    main();
});
