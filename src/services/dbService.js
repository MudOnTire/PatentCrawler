var mysql = require("mysql");

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
        sql: "select college_name from up_college where id = ?",
        values: [1]
    }, function (error, result, fields) {
        console.log(fields);
    });
}

module.exports = DBService;