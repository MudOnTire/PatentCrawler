//services
const PatentCrawler = require('./src/services/patentCrawler');
//uitls
const ipUtil = require("./src/utils/ipUtil");
const parallel = require("async/parallel");
const reflectAll = require('async/reflectAll');
const DBService = require("./src/services/dbService");

let crawlerCount = 5;
let ip = null;
let token = null;

const dbService = new DBService();
dbService.connectLocal();

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
        let crawlerTask = async function (done) {
            const patentCrawler = new PatentCrawler(ip);
            try {
                await patentCrawler.startCrawling(crawlerIndex, crawlerCount, token, dbService);
                done(null, 'success');
            } catch (error) {
                console.log(`crawl${crawlerIndex} failed!!!`);
                await patentCrawler.end();
                done(null, "failure");
            }
        };
        crawlerTasks.push(crawlerTask);
    }
    parallel(reflectAll(crawlerTasks), async function (err, results) {
        const success = results.filter((val, index) => {
            return val === 'success';
        });
        if (success.length < crawlerTasks.length) {
            token = null;
            await start();
        }
    });
}

start();