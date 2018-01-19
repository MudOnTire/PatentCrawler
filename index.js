var DBService = require('./src/services/dbService');

var dbService = new DBService();
dbService.connect(function () {
    dbService.getAllColleges();
});