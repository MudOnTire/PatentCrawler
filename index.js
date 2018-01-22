const DBService = require('./src/services/dbService');
const patentUtil = require('./src/utils/patentUtil');
const PatentCrawler = require('./src/services/patentCrawler');
const FutureFee = require('./src/models/futureFee');

const dbService = new DBService();
const patentCrawler = new PatentCrawler();

const token = "297C323254DB4D2BA0A19EBE52225BCB";

async function start() {
    await dbService.connectIptp();
    await dbService.connectLocal();
    let colleges = await dbService.getAllColleges();
    for (let i = 0; i < colleges.length; i++) {
        let college = colleges[i];
        let patents = await dbService.getPatentsOfCollege(college.storageId);
        for (let j = 0; j < patents.length; j++) {
            let patent = patents[j];
            let applyNumber = patentUtil.getPatentApplyNumber(patent.applyNum);
            const feeResult = await patentCrawler.getFeeOfPatent(applyNumber, token);
            const futureFees = feeResult.map((data, index) => {
                return new FutureFee(data.feeType, data.feeAmount, data.deadline);
            });
            console.log(futureFees);
            await dbService.deleteFutureFeeOfPatent(patent.id);
            const insertResult = await dbService.createPatentFutureFee(patent.id, patent.applyNum, patent.name, futureFees);
            console.log(insertResult);
        }
    }
}

start();
