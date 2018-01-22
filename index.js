var DBService = require('./src/services/dbService');

var dbService = new DBService();
dbService.connect(function () {
    dbService.getAllColleges((colleges)=>{
        dbService.getPatentsOfCollege(colleges[0].storageId);
    });
});