const Nightmare = require('nightmare');
const urlUtil = require('../utils/urlUtil');

const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.75 Safari/537.36";

function Crawler() { }

Crawler.prototype.getFeeOfPatent = function (applyNumber, token) {
    const url = urlUtil.createUrl(applyNumber, token);
    return new Promise((resolve, reject) => {
        
    });
}

module.exports = Crawler;