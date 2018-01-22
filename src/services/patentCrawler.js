const Nightmare = require('nightmare');
const urlUtil = require('../utils/urlUtil');

const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.75 Safari/537.36";

const nightmare = Nightmare({ show: true }).useragent(userAgent).viewport(1280, 800);

function Crawler() { }

Crawler.prototype.getFeeOfPatent = function (applyNumber, token) {
    const url = urlUtil.createUrl(applyNumber, token);
    return new Promise((resolve, reject) => {
        nightmare
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