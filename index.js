const http = require("http");
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
dbService.generateTasks();
// dbService.connectLocal();


// async function testConnect() {
//     return new Promise((resolve, reject) => {
//         http.get("http://cpquery.sipo.gov.cn/txnPantentInfoList.do", (res) => {
//             if (res.statusCode == 200) {
//                 let rawData = '';
//                 res.on('data', (chunk) => { rawData += chunk; });
//                 res.on('end', () => {
//                     if(rawData.length<=0){
//                         resolve(false);
//                     }else{
//                         resolve(true);
//                     }
//                 });
//             } else {
//                 resolve(false);
//             }
//         }).on('error', (e) => {
//             resolve(false);
//         });
//     });
// }

// async function prepare() {
//     while (token === null) {
//         let connectable = await testConnect();
//         if (connectable) {
//             ip = null;
//         } else {
//             ip = await ipUtil.getIP();
//         }
//         let tokenCrawler = new PatentCrawler(ip);
//         const breakSuccess = await tokenCrawler.breakAuth();
//         if (breakSuccess === true) {
//             token = tokenCrawler.token;
//         }
//         await tokenCrawler.end();
//     }
// }

// async function start() {
//     await prepare();
//     let crawlerTasks = [];
//     for (let crawlerIndex = 0; crawlerIndex < crawlerCount; crawlerIndex++) {
//         let crawlerTask = async function (done) {
//             const patentCrawler = new PatentCrawler(ip);
//             try {
//                 await patentCrawler.startCrawling(crawlerIndex, crawlerCount, token, dbService);
//                 done(null, 'success');
//             } catch (error) {
//                 console.log(`crawl${crawlerIndex} failed!!!`);
//                 await patentCrawler.end();
//                 done(null, "failure");
//             }
//         };
//         crawlerTasks.push(crawlerTask);
//     }
//     parallel(reflectAll(crawlerTasks), async function (err, results) {
//         const success = results.filter((val, index) => {
//             return val === 'success';
//         });
//         if (success.length < crawlerTasks.length) {
//             token = null;
//             await start();
//         }
//     });
// }

// start();