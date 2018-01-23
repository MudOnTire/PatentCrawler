const Nightmare = require('nightmare');
const urlUtil = require('../utils/urlUtil');

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

const nightmare = Nightmare({ show: true }).viewport(1280, 800);

function Crawler() { }

Crawler.prototype.getFeeOfPatent = function (applyNumber, token) {
    const url = urlUtil.createUrl(applyNumber, token);
    return new Promise((resolve, reject) => {
        nightmare
            .useragent(getRandomUserAgent())
            .goto(url)
            .wait("#djfid")
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
                        console.log(`${feeType}-${feeAmount}-${deadline}`);
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

module.exports = Crawler;