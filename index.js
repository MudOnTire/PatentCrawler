//services
const PatentCrawler = require('./src/services/patentCrawler');
//uitls
const ipUtil = require("./src/utils/ipUtil");
const parallel = require("async/parallel");

let token = null;
let crawlerCount = 2;

//主函数
async function main(crawlerIndex) {
    let allTasksSuccess = false;
    let shouldSwitchIp = false
    let ip = null;
    let crawler = new PatentCrawler();
    while (!allTasksSuccess) {
        if (shouldSwitchIp) {
            ip = await ipUtil.getIP();
            await crawler.end();
            crawler = new PatentCrawler(ip);
        }
        const breakSuccess = await crawler.breakAuth();
        if (breakSuccess === true) {
            try {
                await crawler.startCrawling(crawlerIndex, crawlerCount);
                allTasksSuccess = true;
            } catch (err) {
                console.log(err);
                continue;
            }
            shouldSwitchIp = false;
        } else if (breakSuccess === "switchIp") {
            shouldSwitchIp = true;
        } else {
            shouldSwitchIp = false
        }
    }
}

let crawlerTasks = [];

for (let i = 0; i < crawlerCount; i++) {
    let crawlerTask = async function () {
        await main(i);
    };
    crawlerTasks.push(crawlerTask);
}

parallel(crawlerTasks);