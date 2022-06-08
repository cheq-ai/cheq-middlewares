const rtiParams = require('../constans/rtiParams');


function rtiRequestBuilder(req, eventType, params) {

    const reqParams = {}
    reqParams[rtiParams.API_KEY] = params.apiKey;
    reqParams[rtiParams.TAG_HASH] = params.tagHash;
    reqParams[rtiParams.CLIENT_IP] = '66.29.154.103', //getIp(req);
    reqParams[rtiParams.REQUEST_URL] = getReqUrl(req);
    reqParams[rtiParams.RESOURCE_TYPE] = getContentType(req);
    reqParams[rtiParams.METHOD] = req.method;
    reqParams[rtiParams.HOST] = getHost(req);
    reqParams[rtiParams.USER_AGENT] = getUserAgent(req);
    reqParams[rtiParams.ACCEPT] = getAcceptHeader(req);
    reqParams[rtiParams.ACCEPT_LANGUAGE] = getAcceptLanguage(req);
    reqParams[rtiParams.ACCEPT_ENCODING] = getAcceptEncoding(req);
    reqParams[rtiParams.HEADER_NAMES] = getHeaderNames(req);
    reqParams[rtiParams.CHEQ_COOKIE] = req.cookies[rtiParams.CHEQ_COOKIE_NAME];
    reqParams[rtiParams.EVENT_TYPE] = eventType;

    return reqParams
}






function getIp(req) {

    const remoteAddress = req.connection.remoteAddress;
    const xForwardedFor = (req.headers['X-Forwarded-For'] || req.headers['x-forwarded-for'] || '').split(',')[0];
    return remoteAddress || xForwardedFor;
}

function getReqUrl(req) {
    return `${req.protocol}://${req.get('host')}${req.originalUrl}`
}

function getContentType(req) {
    return req.headers['content-type'] || req.headers['Content-Type'];
}

function getHost(req) {
    return req.headers['host'] || req.headers['Host'];
}

function getUserAgent(req) {
    return  req.headers['user-agent'] || req.headers['User-Agent'];
}

function getAcceptHeader(req) {
    return  req.headers['accept'] || req.headers['Accept'];
}

function getAcceptLanguage(req) {
    return  req.headers['accept-language'] || req.headers['Accept-Language'];
}

function getAcceptEncoding(req) {
    return  req.headers['accept-encoding'] || req.headers['Accept-Encoding'];
}

function getHeaderNames(req) {
    return  'Host,User-Agent,Accept,Accept-Language,Accept-Encoding,Cookie'
}



module.exports = {rtiRequestBuilder}


