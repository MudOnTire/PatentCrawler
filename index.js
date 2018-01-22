const DBService = require('./src/services/dbService');
const patentUtil = require('./src/utils/patentUtil');
const PatentCrawler = require('./src/services/patentCrawler');
const FutureFee = require('./src/models/futureFee');

const dbService = new DBService();
const patentCrawler = new PatentCrawler();

const token = "F87AB233C0174DBB85B341B41A5852D0";

async function start() {
    await dbService.connect();
    let colleges = await dbService.getAllColleges();
    for (let i = 0; i < colleges.length; i++) {
        let college = colleges[i];
        let patents = await dbService.getPatentsOfCollege(college.storageId);
        for (let j = 0; j < patents.length; j++) {
            let patent = patents[j];
            let applyNumber = patentUtil.getPatentApplyNumber(patent.applyNum);
            const result = await patentCrawler.getFeeOfPatent(applyNumber, token);
            const futureFees = result.map((data, index) => {
                return new FutureFee(data.feeType, data.feeAmount, data.deadline);
            });
            console.log(futureFees);
        }
    }
}

start();
