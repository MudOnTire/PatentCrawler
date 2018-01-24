const AipOcrClient = require("baidu-aip-sdk").ocr;
const fs = require("fs");

const APP_ID = "10740609";
const API_KEY = "zPX4gUpoKstyvw5DrjK91OxG";
const SECRET_KEY = "a6KC17nwcgeBMFRo77hrYdxhYDLPyUHS";

function OCRService() {
    this.ocrClient = new AipOcrClient(APP_ID, API_KEY, SECRET_KEY);
}

OCRService.prototype.getVerifyCodeResult = function () {
    const ocrClient = this.ocrClient;
    return new Promise((resolve, reject) => {
        const image = fs.readFileSync("./assets/authCode.png").toString("base64");
        const options = {
            probability: true
        };
        ocrClient.accurateBasic(image, options).then(function (result) {
            var result = JSON.stringify(result);
            resolve(result);
        }).catch(function (err) {
            console.log(err);
            reject(err);
        });;
    });
}

module.exports = OCRService;