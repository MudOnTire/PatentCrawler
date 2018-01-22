const DBService = require('./src/services/dbService');
const patentUtil = require('./src/utils/patentUtil');

const dbService = new DBService();
const token = "D393028003594E8C85E86A05DA9A9F4A";

async function start() {
    await dbService.connect();
    let colleges = await dbService.getAllColleges();
    for (let index in colleges) {
        let college = colleges[index];
        let patents = await dbService.getPatentsOfCollege(college.storageId);
        for(let index in patents){
            let patent = patents[index];
            let applyNumber = patentUtil.getPatentApplyNumber(patent.applyNum);
            let url = urlUtil.createUrl(applyNumber, token);
            
        }
    }
}

start();
