/**
 * Created by Administrator on 2017/1/8.
 */
var config = require("./config");
var db = require("./db");
var tools = require("./tools");
var logger = require("./logger");
var async = require('async');
var cheerio = require('cheerio');
var mysql = require('mysql');
function saveMagnet(obj) {
    let promise=new Promise(function (resolve,reject) {
        let {url,title,name}=obj;
        tools.get(url, '', function (err, res) {
            if (err) {
                logger.log(err);
                reject();
                return false;
            }
            let $ = cheerio.load(res, {decodeEntities: false,ignoreWhitespace: true});
            let query=$('body script').eq(2).text();
            //磁力获取查询参数
            query=query.replace(/\s/ig,"").replace(/var/ig,'').replace(/;/ig,'&').replace(/'&?/ig,'');

            //获取磁力
            tools.get(config.urlpre+"ajax/uncledatoolsbyajax.php?"+query,url,function (err, res) {
                console.log(res)
                let $ = cheerio.load(res, {decodeEntities: false,ignoreWhitespace: true});
                let td=$('tr td');
                let tdLen=td.length;
                for (let i=1;i<=tdLen/3;i++){
                    let oneRow=$(td[i*3-3]).children('a').first();
                    let magnet=oneRow.attr('href');
                    console.log(oneRow.text());
                    let magnetName=tools.replaceText(oneRow.text());
                    let size=$(td[i*3-2]).children('a').first().text();
                    size=tools.replaceText(size);
                    let tdText=$('tr').eq(i-1).text();
                    console.log(tdText)
                    let isHD=tdText.indexOf('HD')!==-1?true:false;
                    let isSubtitled=tdText.indexOf('SUB')!==-1?true:false;
                    // console.log(magnet);
                    db.query('SELECT * FROM magnet WHERE magnet ='+ mysql.escape(magnet),function (error,respon) {
                        if (error) {
                            logger.log(error);
                            reject();
                            return false;
                        }
                        if(!respon.length){
                            let insertSql = "INSERT INTO magnet SET ?";
                            let inserts ={
                                name,
                                magnet,
                                magnetName,
                                size,
                                isHD,
                                isSubtitled,
                                createTime:tools.getDateString()
                            };
                            console.log(inserts);
                            insertSql = mysql.format(insertSql, inserts);
                            db.query(insertSql, function (errinfo) {
                                if (errinfo) {
                                    reject();
                                    logger.log(errinfo);
                                    return false;
                                }
                                resolve()
                            });
                        }else {
                            resolve()
                        }
                    });

                }
            })
        });
    });
    return promise;
}
//saveMagnet({url:"https://www.javbus3.com/SNIS-789",title:"",name:""})
 // tools.get("https://www.javbus3.com/page/185", '', function (err, res) {
 //  console.log(err);
 //  console.log(res)
 // })
// let insertSql = "INSERT INTO magnet SET ?";
// let inserts ={
// 	name:"",
// 	magnet:"",
// 	magnetName:"",
// 	size:15,
// 	isHD:false,
// 	isSubtitled:false,
// 	createTime:''
// };
// console.log(inserts);
// insertSql = mysql.format(insertSql, inserts);
// db.query(insertSql, function (errinfo) {
// 	if (errinfo) {
// 		logger.log(errinfo);
// 		return false;
// 	}
// });
