const mysql = require("mysql");
const College = require("../models/college");
const Patent = require("../models/patent");

function createUrl(patentId, token) {
    const protocol = "http:";
    const hostname = "cpquery.sipo.gov.cn";
    const pathname = "/txnQueryFeeData.do";
    const result = `${protocol}//${hostname}${pathname}?select-key:shenqingh=${patentId}&token=${token}`;
    return result;
}

function DBService() {
    this.connection = mysql.createConnection({
        host: '192.168.20.14',
        port: '3306',
        user: 'iptp',
        password: 'Cnuip1109',
        database: 'iptp'
    });
}

DBService.prototype.connect = function (callback) {
    this.connection.connect(function (err) {
        if (err) {
            console.error('error connection: ' + err.stack);
            return;
        }
        console.log("connected to mysql!");
        callback();
    });
}

DBService.prototype.getAllColleges = function (callback) {
    var connection = this.connection;
    connection.query({
        sql: "select id,college_name from up_college"
    }, function (error, result, fields) {
        const colleges = result.map((college, index)=>{
            return new College(college["id"], college["college_name"]);
        });
        callback(colleges);
    });
}

// DBService.prototype.getPatentsOfCollege = function (collegeId, callback) {
//     var connection = this.connection;
//     connection.query({
//         sql: "select "
//     })
// }

module.exports = DBService;