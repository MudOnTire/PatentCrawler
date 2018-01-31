//services
const PatentCrawler = require('./src/services/patentCrawler');
//uitls
const ipUtil = require("./src/utils/ipUtil");

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
            crawler = new PatentCrawler(ip);
        }
        const breakSuccess = await crawler.breakAuth();
        if (breakSuccess === true) {
            try {
                await crawler.startCrawling(crawlerIndex, crawlerCount);
                allTasksSuccess = true;
            } catch (err) {
                console.log(err);
            }
            shouldSwitchIp = false;
        } else if (breakSuccess === "switchIp") {
            shouldSwitchIp = true;
        } else {
            shouldSwitchIp = false
        }
    }
}

main(0);
main(1);
