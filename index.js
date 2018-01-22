const DBService = require('./src/services/dbService');

const dbService = new DBService();
// dbService.connect(function () {
//     dbService.getAllColleges((colleges)=>{
//         dbService.getPatentsOfCollege(colleges[0].storageId, )
//     });
// });

async function start(){
    await dbService.connect();
    let colleges = await dbService.getAllColleges();
    
}

start();