const DBService = require('./src/services/dbService');
const patentUtil = require('./src/utils/patentUtil');
const PatentCrawler = require('./src/services/patentCrawler');
const FutureFee = require('./src/models/futureFee');

const dbService = new DBService();
const patentCrawler = new PatentCrawler();

const token = "9C02544B9BD64C00BDB2C621DDDC8AEC";

//生成所有的任务
async function reGenerateTasks() {
    await dbService.connectIptp();
    await dbService.connectLocal();
    await dbService.deleteAllPatentTasks();
    let colleges = await dbService.getAllColleges();
    for (let i = 0; i < colleges.length; i++) {
        let college = colleges[i];
        let patents = await dbService.getPatentsOfCollege(college.storageId);
        console.log(`${college.name}: ${patents.length} tasks`)
        for (let j = 0; j < patents.length; j++) {
            let patent = patents[j];
            await dbService.createPatentTask(patent);
        }
    }
}

//执行任务
async function start() {
    await dbService.connectLocal();
    const tasks = await dbService.getAllPatentTasks();
    for (let i = 0; i < tasks.length; i++) {
        let task = tasks[i];
        let applyNumber = patentUtil.getPatentApplyNumber(task.patentApplyNumber);
        const feeResult = await patentCrawler.getFeeOfPatent(applyNumber, token).catch((err) => {
            console.error(err);
        });
        if (!feeResult) {
            --i;
            continue;
        }
        const futureFees = feeResult.map((data, index) => {
            return new FutureFee(data.feeType, data.feeAmount, data.deadline);
        });
        await dbService.deleteFutureFeeOfPatent(task.patentId);
        const insertResult = await dbService.createPatentFutureFee(task.patentId, task.patentApplyNumber, task.patentTitle, futureFees);
        const updateResult = await dbService.donePatentTask(task.id);
        console.log(task.id);
    }
    console.log("All tasks done!!!");
}

start();
// reGenerateTasks();
