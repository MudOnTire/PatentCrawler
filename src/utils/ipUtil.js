const http = require("http");

function getIP() {
    return new Promise((resolve, reject) => {
        http.get('http://www.mogumiao.com/proxy/api/get_ip_al?appKey=fb08cd6a139e429baf103505d9a69d41&count=1&expiryDate=0&format=1', (res) => {
            const { statusCode } = res;
            const contentType = res.headers['content-type'];

            let error;
            if (statusCode !== 200) {
                error = new Error(`Request Failed. Status Code: ${statusCode}`);
            }
            if (error) {
                console.error(error.message);
                // consume response data to free up memory
                res.resume();
                reject();
                return;
            }

            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => { rawData += chunk; });
            res.on('end', () => {
                try {
                    const ipInfo = JSON.parse(rawData);
                    console.log(ipInfo);
                    const ip = `${ipInfo.msg[0].ip}:${ipInfo.msg[0].port}`;
                    resolve(ip);
                } catch (e) {
                    console.error(e.message);
                    reject();
                }
            });
        }).on('error', (e) => {
            console.error(`Got error: ${e.message}`);
            reject();
        });
    });
}

module.exports = {
    getIP: getIP
}