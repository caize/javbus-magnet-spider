/**
 * Created by dianjie on 2017/1/8.
 */
var mysql = require('mysql');
var config = require('./config');
var pool;//普通查询池

//初始化
exports.init = function () {
    init();
}

function init() {
    pool = mysql.createPool(config.dbconfig);
}

//单句执行
exports.query = function (sql, callback) {
    if (!pool || pool._closed) init();
    pool.getConnection(function (err, conn) {
        if (err) {
            callback(err);
            return;
        }
        conn.query(sql, function (err, rows) {
            if (err) {
                callback(err);
                return;
            }
            conn.release();
            callback(null, rows);
        });
    });
}
//防注入转换
exports.escape = mysql.escape;

exports.end = function () {
    pool.end(function (err) {
        if (err)
            console.error("Destory db pool error: " + err);
        else
            console.log("MySQL pool ended successfully.");
    });
}
