//services
const PatentCrawler = require('./src/services/patentCrawler');
//uitls
const ipUtil = require("./src/utils/ipUtil");
const parallel = require("async/parallel");
const reflectAll = require('async/reflectAll');

let crawlerCount = 2;

//主函数
// async function main(crawlerIndex) {
//     let allTasksSuccess = false;
//     let shouldSwitchIp = false
//     let ip = null;
//     let crawler = new PatentCrawler();
//     while (!allTasksSuccess) {
//         if (shouldSwitchIp) {
//             ip = await ipUtil.getIP();
//             await crawler.end();
//             crawler = new PatentCrawler(ip);
//         }
//         const breakSuccess = await crawler.breakAuth();
//         if (breakSuccess === true) {
//             try {
//                 await crawler.startCrawling(crawlerIndex, crawlerCount);
//                 allTasksSuccess = true;
//             } catch (err) {
//                 console.log(err);
//                 continue;
//             }
//             shouldSwitchIp = false;
//         } else if (breakSuccess === "switchIp") {
//             shouldSwitchIp = true;
//         } else {
//             shouldSwitchIp = false
//         }
//     }
// }

let ip = null;
let token = null;
async function prepare() {
    while (token === null) {
        let tokenCrawler = new PatentCrawler(ip);
        const breakSuccess = await tokenCrawler.breakAuth();
        if (breakSuccess === true) {
            token = tokenCrawler.token;
        } else if (breakSuccess === "switchIp") {
            ip = await ipUtil.getIP();
        }
        await tokenCrawler.end();
    }
}

async function start() {
    await prepare();
    let crawlerTasks = [];
    for (let crawlerIndex = 0; crawlerIndex < crawlerCount; crawlerIndex++) {
        let crawlerTask = async function (callback) {
            const patentCrawler = new PatentCrawler(ip);
            try {
                await patentCrawler.startCrawling(crawlerIndex, crawlerCount, token);
                callback(null, 'success');
            } catch (error) {
                console.log("crawl failed: ");
                console.log(error);
                await patentCrawler.end();
                callback('failure');
            }
        };
        crawlerTasks.push(crawlerTask);
    }
    parallel(reflectAll(crawlerTasks), function (err, results) {
        const failed = results.filter((val, index) => {
            return val === 'failure';
        });
        if (failed && failed.length > 0) {
            start();
        }
    });
}

start();

// let crawlerTasks = [];

// for (let i = 0; i < crawlerCount; i++) {
//     let crawlerTask = async function () {
//         await main(i);
//     };
//     crawlerTasks.push(crawlerTask);
// }

// parallel(crawlerTasks);