//example 'CN201410264652.6' => '201410264652.6'
function getPatentApplyNumber(rawNumber) {
    const result = rawNumber.replace("CN", "").replace(".", "");
    return result;
}

module.exports = {
    getPatentApplyNumber: getPatentApplyNumber
}