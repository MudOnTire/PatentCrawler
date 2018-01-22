const mysql = require("mysql");
const College = require("../models/college");
const Patent = require("../models/patent");

//Constructor
function DBService() {
    this.connection = mysql.createConnection({
        host: '192.168.20.14',
        port: '3306',
        user: 'iptp',
        password: 'Cnuip1109',
        database: 'iptp'
    });
}

//连接数据库
DBService.prototype.connect = function () {
    const connection = this.connection;
    return new Promise((resolve, reject) => {
        connection.connect(function (err) {
            if (err) {
                console.error("error connection: " + err.stack);
                reject();
                return;
            }
            console.log("connected to mysql!");
            resolve();
        });
    });
}

//获取所有大学
DBService.prototype.getAllColleges = function () {
    const connection = this.connection;
    return new Promise((resolve, reject) => {
        connection.query({
            sql: "select id,college_name,storage_id from up_college"
        }, function (error, result, fields) {
            if (error) {
                reject(error);
            }
            const colleges = result.map((college, index) => {
                return new College(college["id"], college["college_name"], college["storage_id"]);
            });
            resolve(colleges);
        });
    });
}

//获取大学的所有非无效专利
DBService.prototype.getPatentsOfCollege = function (collegeStorageId) {
    const connection = this.connection;
    return new Promise((resolve, reject) => {
        connection.query({
            sql: `select distinct p.IDPATENT, p.AD, p.TI, p.AN, p.PA, p.PIN, p.LASTLEGALSTATUS, p.PNM, p.PATTYPE \
                from iptp.st_patentinfo p \
                left join iptp.up_patent_storage ps on ps.patent_id=p.IDPATENT \
                where ps.storage_id = ${collegeStorageId} and p.LASTLEGALSTATUS != "无效" \
                order by p.IDPATENT`
        }, function (error, result, fields) {
            if (error) {
                reject(error);
            }
            const patents = result.map((patent, index) => {
                return new Patent(patent["IDPATENT"], patent["TI"], patent["AN"], patent["AD"], patent["PA"], patent["PIN"], patent["LASTLEGALSTATUS"], patent["PATTYPE"]);
            });
            resolve(patents);
        });
    });
}
module.exports = DBService;