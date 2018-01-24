const sharp = require("sharp");

function imageDenoiseAsync(path) {
    return new Promise((resolve, reject) => {
        sharp(path)
            .sharpen()
            // .threshold(138)
            .toFile("./assets/authCodeSharpen.png", (error, info) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(info);
                }
            });
    });
}

module.exports = {
    imageDenoiseAsync: imageDenoiseAsync
}