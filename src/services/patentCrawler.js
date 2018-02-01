const Nightmare = require('nightmare');
const urlUtil = require('../utils/urlUtil');
const patentUtil = require('../utils/patentUtil');
// const imageUtil = require('../utils/imageUtil');
const DBService = require("../services/dbService");
const OCRService = require("../services/ocrService");
const FutureFee = require('../models/futureFee');

const userAgents = ["Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; rv:11.0) like Gecko",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.75 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; WOW64; rv:57.0) Gecko/20100101 Firefox/57.0",
    "Mozilla/5.0 (Windows; U; Windows NT 5.2) AppleWebKit/525.13 (KHTML, like Gecko) Version/3.1 Safari/525.13",
    "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.12) Gecko/20080219 Firefox/2.0.0.12 Navigator/9.0.0.6",
    "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0; .NET CLR 2.0.50727; 360SE)",
    "Opera/9.80 (Windows NT 6.1; U; zh-cn) Presto/2.9.168 Version/11.50",
    "Mozilla/5.0 (Windows; U; Windows NT 6.1; ) AppleWebKit/534.12 (KHTML, like Gecko) Maxthon/3.0 Safari/534.12",
    "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.1; WOW64; Trident/5.0;  SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; InfoPath.3; .NET4.0C; .NET4.0E; SE 2.X MetaSr 1.0)",
    "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/535.1 (KHTML, like Gecko) Chrome/13.0.782.41 Safari/535.1 QQBrowser/6.9.11079.201"];

// min =< result < max
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

//随机获取一个useragent
function getRandomUserAgent() {
    const r = getRandomInt(0, userAgents.length);
    return userAgents[r];
}

//随机生成一个IP
function getRandomIP() {
    const ip = `${getRandomInt(20, 255)}.${getRandomInt(20, 255)}.${getRandomInt(20, 255)}.${getRandomInt(20, 255)}`;
    return ip;
}

//Constructor
function Crawler(ip) {
    this.ip = ip;
    let switches = {};
    if (ip) {
        switches["proxy-server"] = ip
    }
    this.nightmare = Nightmare({
        switches: switches,
        show: true,
        gotoTimeout: 10000,
        loadTimeout: 10000,
        waitTimeout: 10000,
        executionTimeout: 10000
    }).viewport(1024, 1000);
}

//爬取指定专利的年费信息
Crawler.prototype.getFeeOfPatent = function (applyNumber, token) {
    const url = urlUtil.createUrl(applyNumber, token);
    const nightmare = this.nightmare;
    return new Promise((resolve, reject) => {
        nightmare
            .useragent(getRandomUserAgent())
            .goto(url, { "X-Forwarded-For": getRandomIP() })
            .wait("#djfid")
            .wait(getRandomInt(200, 500))
            .evaluate(() => {
                const trs = document.querySelectorAll('#djfid table tr');
                let futureFees = [];
                for (let i = 0; i < trs.length; i++) {
                    const tr = trs[i];
                    const tds = tr.querySelectorAll("td");
                    if (tds.length === 3) {
                        const spanSelector = "span";
                        const feeType = tds[0].querySelector(spanSelector).title;
                        const feeAmount = tds[1].querySelector(spanSelector).title;
                        const deadline = tds[2].querySelector(spanSelector).title;
                        futureFees.push({ feeType: feeType, feeAmount: feeAmount, deadline: deadline });
                    }
                }
                return futureFees;
            })
            .then((fees) => {
                resolve(fees);
            }).catch((error) => {
                reject(error);
            });
    });
}

//判断是否在过期提示页面
Crawler.prototype.isInExpirePage = function () {
    const nightmare = this.nightmare;
    return new Promise((resolve, reject) => {
        nightmare
            .refresh()
            .wait(1000)
            .evaluate(() => {
                var backA = document.querySelector("div.binding a");
                return backA && backA.textContent === "返回";
            })
            .then((isExpire) => {
                if (isExpire) {
                    resolve(true);
                } else {
                    reject(false);
                }
            })
            .catch((error) => {
                reject(false);
            })
    })
}

//判断是否在专利详情页面 
Crawler.prototype.isInPatentDetailPage = function () {
    const nightmare = this.nightmare;
    return new Promise((resolve, reject) => {
        nightmare
            .refresh()
            .wait(1000)
            .evaluate(() => {
                var tab = document.querySelector(".tab_body>.tab_list");
                return !!tab;
            })
            .then((isPatentDetail) => {
                if (isPatentDetail) {
                    resolve(true);
                } else {
                    reject(false);
                }
            })
            .catch((error) => {
                reject(false);
            })
    })
}

//获取验证码的坐标和宽高
Crawler.prototype.getAuthImageRect = function () {
    const nightmare = this.nightmare;
    return new Promise((resolve, reject) => {
        nightmare
            .goto("http://cpquery.sipo.gov.cn/txnPantentInfoList.do")
            .wait("#authImg")
            .wait(500)
            .evaluate(() => {
                var authImg = document.querySelector("#authImg");
                var domRect = authImg.getBoundingClientRect();
                var rect = {
                    x: domRect.left,
                    y: domRect.top,
                    width: domRect.width,
                    height: domRect.height
                };
                return rect;
            })
            .then((rect) => {
                resolve(rect);
            }).catch((error) => {
                reject(error);
            });
    });
}

//截取验证码图片
Crawler.prototype.getAuthImage = function (rect) {
    const nightmare = this.nightmare;
    return new Promise((resolve, reject) => {
        nightmare
            .goto("http://cpquery.sipo.gov.cn/txnPantentInfoList.do")
            .refresh()
            .wait("#authImg")
            .wait(500)
            .screenshot('./assets/authCode.png', rect, () => {
                resolve();
            })
            .then()
            .catch(() => {
                reject();
            });
    });
}

//通过验证码获取token
Crawler.prototype.getTokenWithAuthCode = function (code) {
    const nightmare = this.nightmare;
    return new Promise((resolve, reject) => {
        nightmare
            .wait(1000)
            .type("#very-code", code)
            .wait(1000)
            .type(".input_bg1.input_bg_over", "2014208680884")
            .click("td>a[href='javascript:;']")
            .click("#query")
            .wait(".mi_icon")
            .click(".mi_icon")
            .wait(1000)
            .url()
            .then((url) => {
                let pattern = /token=([^&]+)&/
                let match = url.match(pattern);
                if (match.length > 0) {
                    resolve(match[1]);
                } else {
                    reject();
                }
            })
            .catch((error) => {
                reject(error);
            });
    });
}

//开始爬取
Crawler.prototype.startCrawling = async function (crawlerIndex, crawlerCount) {
    const dbService = new DBService();
    const crawler = this;
    dbService.connectLocal();
    const tasks = await dbService.getPatentTaskForSingleCrawler(crawlerIndex, crawlerCount);
    for (let i = 0; i < tasks.length; i++) {
        let task = tasks[i];
        let applyNumber = patentUtil.getPatentApplyNumber(task.patentApplyNumber);
        let feeResult = null;
        try {
            feeResult = await crawler.getFeeOfPatent(applyNumber, token)
        } catch (error) {
            const isDetail = await crawler.isInPatentDetailPage();
            if (isDetail) {
                --i;
                continue;
            } else {
                const isExpire = await crawler.isInExpirePage();
                if (isExpire) {
                    throw "Token Expired!!!";
                }
            }
        }
        if (!feeResult) {
            --i;
            continue;
        }
        const futureFees = feeResult.map((data, index) => {
            return new FutureFee(data.feeType, data.feeAmount, data.deadline);
        });
        await dbService.deleteFutureFeeOfPatent(task.patentApplyNumber);
        const insertResult = await dbService.createPatentFutureFee(task.patentApplyNumber, futureFees);
        const updateResult = await dbService.donePatentTask(task.id);

        console.log(task.id);
    }
    console.log(`All tasks of crawler${crawlerIndex} done!!!`);
}

//停止运行
Crawler.prototype.end = function () {
    const nightmare = this.nightmare;
    return new Promise((resolve, reject) => {
        nightmare
            .end()
            .then(() => {
                resolve();
            })
            .catch(() => {
                reject();
            });
    });
}

//破解进入查询页面, 成功返回true，失败则不断重试
Crawler.prototype.breakAuth = async function () {
    const crawler = this;
    const ocrService = new OCRService();
    var clipRect = {
        x: 231,
        y: 289,
        width: 50,
        height: 26
    };
    try {
        await crawler.getAuthImage(clipRect);
    } catch (error) {
        return "switchIp";
    }
    // const imgInfo = await imageUtil.imageDenoiseAsync("./assets/authCode.png");
    // console.log(imgInfo);
    const resultStr = await ocrService.getVerifyCodeResult();
    const result = JSON.parse(resultStr);
    console.log(resultStr);
    const wordsResult = result["words_result"];
    if (!wordsResult || wordsResult.length === 0) {
        return false;
    }
    let codeText = result.words_result[0].words;
    const pattern = /.*(\d).*([+-]).*(\d)/;
    const match = codeText.match(pattern);
    if (match) {
        let num1 = Number(match[1]);
        let operator = match[2];
        let num2 = Number(match[3]);
        let answer = (operator === "+" ? num1 + num2 : num1 - num2).toString();
        try {
            let tokenResult = await crawler.getTokenWithAuthCode(answer);
            token = tokenResult;
            return true;
        } catch (error) {
            console.log(`验证失败：${error}`);
            return false;
        }
    } else {
        return false;
    }
}

//测试方法
Crawler.prototype.test = function () {
    const nightmare = this.nightmare;
    nightmare
        .goto("http://cpquery.sipo.gov.cn/txnPantentInfoList.do")
        .type("#very-code", 2)
        .type(".input_bg1.input_bg_over", "2014208680884")
        .click("td>a[href='javascript:;']")
        .click("#query")
        .url()
        .then()
}

module.exports = Crawler;