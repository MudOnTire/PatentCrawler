const mysql = require("mysql");
const College = require("../models/college");
const Patent = require("../models/patent");
const PatentTask = require("../models/patentTask");

//Constructor
function DBService() {
    this.ipTpConnection = mysql.createConnection({
        host: '192.168.20.14',
        port: '3306',
        user: 'iptp',
        password: 'Cnuip1109',
        database: 'iptp'
    });
    this.localConnection = mysql.createConnection({
        host: 'localhost',
        port: '3306',
        user: 'iptp',
        password: 'Cnuip1109',
        database: 'patentfee'
    });
}

//连接中高平台数据库
DBService.prototype.connectIptp = function () {
    const connection = this.ipTpConnection;
    return new Promise((resolve, reject) => {
        connection.connect(function (err) {
            if (err) {
                console.error("iptp error connection: " + err.stack);
                reject();
                return;
            }
            console.log("connected to iptp mysql!");
            resolve();
        });
    });
}

//连接本地数据库
DBService.prototype.connectLocal = function () {
    const connection = this.localConnection;
    return new Promise((resolve, reject) => {
        connection.connect(function (err) {
            if (err) {
                console.error("local error connection: " + err.stack);
                reject();
                return;
            }
            console.log("connected to local mysql!");
            resolve();
        });
    });
}


//获取所有大学
DBService.prototype.getAllColleges = function () {
    const connection = this.ipTpConnection;
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
    const connection = this.ipTpConnection;
    return new Promise((resolve, reject) => {
        connection.query({
            sql: `select distinct p.IDPATENT, p.AD, p.TI, p.AN, p.PA, p.PIN, p.LASTLEGALSTATUS, p.PNM, p.PATTYPE \
                from iptp.st_patentinfo p \
                left join iptp.up_patent_storage ps on ps.patent_id=p.IDPATENT \
                where ps.storage_id = ? and p.LASTLEGALSTATUS != "无效" \
                order by p.IDPATENT`,
            values: [collegeStorageId]
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

//future_fee

//获取指定patent的future fee记录
DBService.prototype.getFutureFeeOfPatent = function (patentId) {
    const connection = this.localConnection;
    return new Promise((resolve, reject) => {
        connection.query({
            sql: `select * from future_fee where patent_id = ?`,
            values: [patentId]
        }, function (error, result, fields) {
            if (error) {
                reject(error);
            }
            resolve(result);
        })
    });
}

//删除一条指定的future fee记录
DBService.prototype.deleteFutureFeeOfPatent = function (patentId) {
    const connection = this.localConnection;
    return new Promise((resolve, reject) => {
        connection.query({
            sql: `delete from future_fee where patent_id = ?`,
            values: [patentId]
        }, function (error, result, fields) {
            if (error) {
                reject(error);
            }
            resolve(result);
        })
    });
}

//插入一条专利对应的future fee记录
DBService.prototype.createPatentFutureFee = function (patentId, patentApplyNumber, patentTitle, futureFees) {
    const connection = this.localConnection;
    return new Promise((resolve, reject) => {
        const feeString = JSON.stringify(futureFees);
        connection.query({
            sql: `insert into future_fee (patent_id, patent_apply_number, patent_title, future_fee) values(?, ?, ?, ?)`,
            values: [patentId, patentApplyNumber, patentTitle, feeString]
        }, function (error, result, fields) {
            if (error) {
                reject(error);
            }
            resolve(result);
        });
    });
}

//patent_task

//获取所有未执行的patent_task
DBService.prototype.getAllPatentTasks = function () {
    const connection = this.localConnection;
    return new Promise((resolve, reject) => {
        connection.query({
            sql: `select * from patent_task where is_done = 0`
        }, function (error, result, fields) {
            if (error) {
                reject(error);
            }
            const tasks = result.map((task, index) => {
                return new PatentTask(task["id"], task["patent_id"], task["patent_apply_number"], task["patent_title"], task["is_done"]);
            });
            resolve(tasks);
        });
    });
}

//删除所有的patent_task
DBService.prototype.deleteAllPatentTasks = function () {
    const connection = this.localConnection;
    return new Promise((resolve, reject) => {
        connection.query({
            sql: `TRUNCATE TABLE patent_task`
        }, function (error, result, fields) {
            if (error) {
                reject(error);
            }
            resolve(result);
        });
    });
}

//插入一条新patent_task任务记录
DBService.prototype.createPatentTask = function (patent) {
    const connection = this.localConnection;
    return new Promise((resolve, reject) => {
        connection.query({
            sql: `insert into patent_task (patent_id, patent_apply_number, patent_title, is_done) values(?, ?, ?, ?)`,
            values: [patent.id, patent.applyNum, patent.name, 0]
        }, function (error, result, fields) {
            if (error) {
                reject(error);
            }
            resolve(result);
        });
    });
}

//完成一个patent_task任务
DBService.prototype.donePatentTask = function (taskId) {
    const connection = this.localConnection;
    return new Promise((resolve, reject) => {
        connection.query({
            sql: `update patent_task set is_done = 1 where id = ?`,
            values: [taskId]
        }, function (error, result, fields) {
            if (error) {
                reject(error);
            }
            resolve(result);
        });
    });
}

module.exports = DBService;