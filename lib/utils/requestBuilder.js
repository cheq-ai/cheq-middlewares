const {rtiParams} = require('../constans/rti');
const {mimeTypes} = require('../constans/common');


function rtiRequestBuilder(req, eventType, params) {

	const reqParams = {};
	const contentTypeProperties = getContentTypeProperties(req.headers);

	reqParams[rtiParams.EVENT_TYPE] = eventType;
	reqParams[rtiParams.API_KEY] = params.apiKey;
	reqParams[rtiParams.TAG_HASH] = params.tagHash;
	reqParams[rtiParams.RESOURCE_TYPE] = getResourceType(req); /// TODO get from response somehow
	reqParams[rtiParams.CHEQ_COOKIE] = req.cookies[rtiParams.CHEQ_COOKIE_NAME];
	reqParams[rtiParams.METHOD] = req.method;
	reqParams[rtiParams.CLIENT_IP] = getIp(req);
	reqParams[rtiParams.REQUEST_URL] = getReqUrl(req);
	reqParams[rtiParams.REQUEST_TIME] = new Date().getTime();
	reqParams[rtiParams.HEADER_NAMES] = getHeaderNames(req.headers);
	reqParams[rtiParams.HOST] = getHeaderByName(req.headers, 'host');
	reqParams[rtiParams.USER_AGENT] = getHeaderByName(req.headers, 'User-Agent');
	reqParams[rtiParams.X_FORWARDED_FOR] = getHeaderByName(req.headers, 'X-Forwarded-For');
	reqParams[rtiParams.REFERER] = getHeaderByName(req.headers, 'Referer');
	reqParams[rtiParams.ACCEPT] = getHeaderByName(req.headers, 'Accept');
	reqParams[rtiParams.ACCEPT_ENCODING] = getHeaderByName(req.headers, 'Accept-Encoding');
	reqParams[rtiParams.ACCEPT_LANGUAGE] = getHeaderByName(req.headers, 'Accept-Language');
	reqParams[rtiParams.ACCEPT_CHARSET] = contentTypeProperties.charset;
	reqParams[rtiParams.ORIGIN] = getHeaderByName(req.headers, 'Origin');
	reqParams[rtiParams.X_REQUESTED_WHIT] = getHeaderByName(req.headers, 'X-Requested-With');
	reqParams[rtiParams.CONNECTION] = getHeaderByName(req.headers, 'Connection');
	reqParams[rtiParams.PRAGMA] = getHeaderByName(req.headers, 'Pragma');
	reqParams[rtiParams.CACHE_CONTROL] = getHeaderByName(req.headers, 'Cache-Control');
	reqParams[rtiParams.CONTENT_TYPE] = contentTypeProperties.mimeType;
	reqParams[rtiParams.TRUE_CLIENT_IP] = getHeaderByName(req.headers, 'True-Client-IP');
	reqParams[rtiParams.X_REAL_IP] = getHeaderByName(req.headers, 'X-Real-IP');
	reqParams[rtiParams.REMOTE_ADDRESS] = getHeaderByName(req.headers, 'Remote-Addr');
	reqParams[rtiParams.FORWARDED] = getHeaderByName(req.headers, 'Forwarded');
	reqParams[rtiParams.JA3] = params.ja3;
	reqParams[rtiParams.CHANNEL] = params.channel;

	return reqParams;
}

function getHeaderByName(headers, name = '', defaultValue) {
	return headers[name.toLowerCase()] || headers[capitalize(name, '-')] || defaultValue;
}

function getContentTypeProperties(headers) {
	const contentTypeHeader = getHeaderByName(headers, 'Content-Type', '');
	return contentTypeHeader.split(';').reduce((acc, current) => {
		const prop = current.trim().split('=');
		let val = {};
		if (mimeTypes.includes(prop[0])) val = {mimeType: prop[0]};
		else if (prop.length === 2) val = {[prop[0].toLowerCase()]: prop[1]};
		else val = {[prop[0]]: prop[0]};
		return Object.assign(acc, val);
	}, {});
}

function getIp(req) {
	const remoteAddress = req.connection.remoteAddress;
	const xForwardedFor = (req.headers['X-Forwarded-For'] || req.headers['x-forwarded-for'] || '').split(',')[0];
	return remoteAddress || xForwardedFor;
}

function getReqUrl(req) {
	return new URL(req.url, `${req.protocol}://${req.get('host')}`).href;
}

function getResourceType(req) {
	return req.headers['content-type'] || req.headers['Content-Type'];
}


function getHeaderNames(headers) {
	return Object.keys(headers).join(',');
}

function capitalize(str = '', splitter = ' ') {
	return str.split(splitter).map(s => `${s.charAt(0).toUpperCase()}${s.substring(1)}`).join(splitter);
}


module.exports = {rtiRequestBuilder};


