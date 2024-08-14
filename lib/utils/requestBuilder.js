const { rtiParams } = require('../constants/rti');
const { slpParams } = require('../constants/slp');
const pJson = require('../../package.json');
const {URL} = require('url');

function rtiRequestBuilder(req, eventType, params) {
	const { apiKey, tagHash, getResourceType, getJa3, getChannel } = params;
	const reqParams = {};

	reqParams[rtiParams.EVENT_TYPE] = eventType;
	reqParams[rtiParams.API_KEY] = apiKey;
	reqParams[rtiParams.TAG_HASH] = tagHash;
	reqParams[rtiParams.RESOURCE_TYPE] = typeof getResourceType === 'function' ? getResourceType(req) : 'text/html';
	reqParams[rtiParams.CHEQ_COOKIE] = getCheqCookie(req.headers.cookie);
	reqParams[rtiParams.METHOD] = req.method;
	reqParams[rtiParams.CLIENT_IP] = getHeaderByName(req.headers, 'X-Forwarded-For');
	reqParams[rtiParams.REQUEST_URL] = getReqUrl(req);
	reqParams[rtiParams.REQUEST_TIME] = new Date().getTime();
	reqParams[rtiParams.HEADER_NAMES] = getHeaderNames(req.rawHeaders);
	reqParams[rtiParams.HOST] = getHeaderByName(req.headers, 'host');
	reqParams[rtiParams.USER_AGENT] = getHeaderByName(req.headers, 'User-Agent');
	reqParams[rtiParams.X_FORWARDED_FOR] = getHeaderByName(req.headers, 'X-Forwarded-For');
	reqParams[rtiParams.REFERER] = getHeaderByName(req.headers, 'Referer');
	reqParams[rtiParams.ACCEPT] = getHeaderByName(req.headers, 'Accept');
	reqParams[rtiParams.ACCEPT_ENCODING] = getHeaderByName(req.headers, 'Accept-Encoding');
	reqParams[rtiParams.ACCEPT_LANGUAGE] = getHeaderByName(req.headers, 'Accept-Language');
	reqParams[rtiParams.ACCEPT_CHARSET] = getHeaderByName(req.headers, 'Accept-Charset');
	reqParams[rtiParams.ORIGIN] = getHeaderByName(req.headers, 'Origin');
	reqParams[rtiParams.X_REQUESTED_WHIT] = getHeaderByName(req.headers, 'X-Requested-With');
	reqParams[rtiParams.CONNECTION] = getHeaderByName(req.headers, 'Connection');
	reqParams[rtiParams.PRAGMA] = getHeaderByName(req.headers, 'Pragma');
	reqParams[rtiParams.CACHE_CONTROL] = getHeaderByName(req.headers, 'Cache-Control');
	reqParams[rtiParams.CONTENT_TYPE] = getHeaderByName(req.headers, 'Content-Type', '');
	reqParams[rtiParams.TRUE_CLIENT_IP] = getHeaderByName(req.headers, 'True-Client-IP');
	reqParams[rtiParams.X_REAL_IP] = getHeaderByName(req.headers, 'X-Real-IP');
	reqParams[rtiParams.REMOTE_ADDRESS] = getHeaderByName(req.headers, 'Remote-Addr');
	reqParams[rtiParams.FORWARDED] = getHeaderByName(req.headers, 'Forwarded');
	reqParams[rtiParams.JA3] = typeof getJa3 === 'function' ? getJa3(req) : undefined;
	reqParams[rtiParams.CHANNEL] = typeof getChannel === 'function' ? getChannel(req) : undefined;
	reqParams[rtiParams.MIDDLEWARE_VERSION] = pJson.version;

	return reqParams;
}

function slpRequestBuilder(req, eventType, params) {
	const { apiKey, tagHash, mode } = params;
	const { RequestId, email, phone } = req.body;
	const reqParams = {};
	
	reqParams[slpParams.REQUEST_ID] = RequestId;
	reqParams[slpParams.EMAIL] = email;
	reqParams[slpParams.PHONE] = phone;
	reqParams[slpParams.MODE] = mode;
	reqParams[slpParams.API_KEY] = apiKey;
	reqParams[slpParams.TAG_HASH] = tagHash;
	reqParams[slpParams.EVENT_TYPE] = eventType;
	reqParams[slpParams.CHANNEL] = typeof getChannel === 'function' ? getChannel(req) : undefined;
	reqParams[slpParams.JA3] = typeof getJa3 === 'function' ? getJa3(req) : undefined;
	reqParams[slpParams.REMOTE_ADDRESS] = getHeaderByName(req.headers, 'Remote-Addr');
	reqParams[slpParams.X_REAL_IP] = getHeaderByName(req.headers, 'X-Real-IP');
	reqParams[slpParams.TRUE_CLIENT_IP] = getHeaderByName(req.headers, 'True-Client-IP');
	reqParams[slpParams.CONTENT_TYPE] = getHeaderByName(req.headers, 'Content-Type', '');
	reqParams[slpParams.CACHE_CONTROL] = getHeaderByName(req.headers, 'Cache-Control');
	reqParams[slpParams.PRAGMA] = getHeaderByName(req.headers, 'Pragma');
	reqParams[slpParams.CONNECTION] = getHeaderByName(req.headers, 'Connection');
	reqParams[slpParams.X_REQUESTED_WHIT] = getHeaderByName(req.headers, 'X-Requested-With');
	reqParams[slpParams.ORIGIN] = getHeaderByName(req.headers, 'Origin');
	reqParams[slpParams.ACCEPT_CHARSET] = getHeaderByName(req.headers, 'Accept-Charset');
	reqParams[slpParams.ACCEPT_LANGUAGE] = getHeaderByName(req.headers, 'Accept-Language');
	reqParams[slpParams.ACCEPT_ENCODING] = getHeaderByName(req.headers, 'Accept-Encoding');
	reqParams[slpParams.ACCEPT] = getHeaderByName(req.headers, 'Accept');
	reqParams[slpParams.REFERER] = getHeaderByName(req.headers, 'Referer');
	reqParams[slpParams.X_FORWARDED_FOR] = getHeaderByName(req.headers, 'X-Forwarded-For');
	reqParams[slpParams.USER_AGENT] = getHeaderByName(req.headers, 'User-Agent');
	reqParams[slpParams.HOST] = getHeaderByName(req.headers, 'host');
	reqParams[slpParams.HEADER_NAMES] = getHeaderNames(req.rawHeaders);
	reqParams[slpParams.CLIENT_IP] = getHeaderByName(req.headers, 'X-Forwarded-For');
	reqParams[slpParams.REQUEST_URL] = getReqUrl(req);
	reqParams[slpParams.REQUEST_TIME] = new Date().getTime();
	reqParams[slpParams.METHOD] = req.method;
	reqParams[slpParams.RESOURCE_TYPE] = typeof getResourceType === 'function' ? getResourceType(req) : 'text/html';
	reqParams[slpParams.FORWARDED] = getHeaderByName(req.headers, 'Forwarded');
	reqParams[slpParams.MIDDLEWARE_VERSION] = pJson.version;

	return reqParams;
}

function getHeaderByName(headers, name = '', defaultValue) {
	return headers[name.toLowerCase()] || headers[capitalize(name, '-')] || defaultValue;
}

function getIp(req) {
	return req.connection.remoteAddress || req.socket.remoteAddress || (req.connection.socket && req.connection.socket.remoteAddress) || (req.info && req.info.remoteAddress);
}

function getReqUrl(req) {
	return new URL(req.url, `${req.protocol}://${req.get('host')}`).href;
}

function getHeaderNames(rawHeaders = []) {
	return rawHeaders.filter((val, i) => i%2 === 0).join(',');
}

function capitalize(str = '', splitter = ' ') {
	return str.split(splitter).map(s => `${s.charAt(0).toUpperCase()}${s.substring(1)}`).join(splitter);
}

function getCheqCookie(cookie) {
	return !cookie
		? undefined
		: cookie.split(';').map(c => c.trim()).find(c => c.includes(rtiParams.CHEQ_COOKIE_NAME));
}

module.exports = { rtiRequestBuilder, slpRequestBuilder, getReqUrl };


