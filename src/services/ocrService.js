const AipOcrClient = require("baidu-aip-sdk").ocr;
const fs = require("fs");

const APP_ID = "10734995";
const API_KEY = "NXRHYZGNRorLViQfkhFdmGkz";
const SECRET_KEY = "ELdM8MsdAtsav8V7WCICqnl3rjmBqzch";

function OCRService() {
    this.ocrClient = new AipOcrClient(APP_ID, API_KEY, SECRET_KEY);
}

OCRService.prototype.getVerifyCodeResult = function () {
    const ocrClient = this.ocrClient;
    return new Promise((resolve, reject) => {
        const image = fs.readFileSync("./assets/freeze.jpg").toString("base64");
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