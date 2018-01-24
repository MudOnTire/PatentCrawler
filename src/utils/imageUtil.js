const sharp = require("sharp");

function imageDenoiseAsync(path) {
    return new Promise((resolve, reject) => {
        sharp(path)
            .sharpen(10, 0, 4)
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