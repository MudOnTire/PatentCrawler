//http://cpquery.sipo.gov.cn/txnQueryFeeData.do?select-key:shenqingh=2015102992769&token=C3CEFEB4F3854F08B5AC506252477201
function createUrl(applyNumber, token) {
    const protocol = "http:";
    const hostname = "cpquery.sipo.gov.cn";
    const pathname = "/txnQueryFeeData.do";
    const result = `${protocol}//${hostname}${pathname}?select-key:shenqingh=${applyNumber}&token=${token}`;
    return result;
}

module.exports = {
    createUrl: createUrl
}