const { rtiParams } = require('../constants/rti');
const { slpParams } = require('../constants/slp');
const pJson = require('../../package.json');
const { URL } = require('url');

function rtiRequestBuilder(req, eventType, params) {
	const reqParams = {};
	const { apiKey, tagHash, getResourceType, getJa3, getChannel, apiVersion } = params;

	switch (params.sessionSyncMode) {
	case 'banRti': {
		console.log('[rtiRequestBuilder] sessionSyncMode: banRti');
		reqParams[rtiParams.USER_AGENT] = getHeaderByName(req.headers, 'User-Agent');
		break;
	}
	case 'rtiCookie': {
		console.log('[rtiRequestBuilder] sessionSyncMode: rtiCookie');
		reqParams[rtiParams.CHEQ_COOKIE] = getCheqCookie(req.headers.cookie);
		break;
	}
	case 'requestId': {
		console.log('[rtiRequestBuilder] sessionSyncMode: requestId');
		reqParams[rtiParams.REQUEST_ID] = req.headers['request-id'];
		break;
	}
	default: {
		console.log('[rtiRequestBuilder] sessionSyncMode: default');
		reqParams[rtiParams.USER_AGENT] = getHeaderByName(req.headers, 'User-Agent');
		reqParams[rtiParams.CHEQ_COOKIE] = getCheqCookie(req.headers.cookie);
		reqParams[rtiParams.REQUEST_ID] = req.headers['request-id'];
		break;
	}
	}

	if (apiVersion === 'v3') { // v3 extended response
		console.log('[rtiRequestBuilder] apiVersion is v3, setting IS_EXTENDED');
		reqParams[rtiParams.IS_EXTENDED] = 1;
	}

	reqParams[rtiParams.CLIENT_IP] = getHeaderByName(req.headers, 'X-Forwarded-For') ? getHeaderByName(req.headers, 'X-Forwarded-For') : '196.243.240.5'; // fallback to random IP for local dev
	reqParams[rtiParams.TRUE_CLIENT_IP] = getHeaderByName(req.headers, 'True-Client-IP');
	reqParams[rtiParams.EVENT_TYPE] = eventType;
	reqParams[rtiParams.API_KEY] = apiKey;
	reqParams[rtiParams.TAG_HASH] = tagHash;
	reqParams[rtiParams.RESOURCE_TYPE] = typeof getResourceType === 'function' ? getResourceType(req) : 'text/html';
	reqParams[rtiParams.METHOD] = req.method;
	reqParams[rtiParams.REQUEST_URL] = getReqUrl(req);
	reqParams[rtiParams.REQUEST_TIME] = new Date().getTime();
	reqParams[rtiParams.HEADER_NAMES] = getHeaderNames(req.rawHeaders);
	reqParams[rtiParams.HOST] = getHeaderByName(req.headers, 'host');
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
	reqParams[rtiParams.X_REAL_IP] = getHeaderByName(req.headers, 'X-Real-IP');
	reqParams[rtiParams.REMOTE_ADDRESS] = getHeaderByName(req.headers, 'Remote-Addr');
	reqParams[rtiParams.FORWARDED] = getHeaderByName(req.headers, 'Forwarded');
	reqParams[rtiParams.JA3] = typeof getJa3 === 'function' ? getJa3(req) : undefined;
	reqParams[rtiParams.CHANNEL] = typeof getChannel === 'function' ? getChannel(req) : undefined;
	reqParams[rtiParams.MIDDLEWARE_VERSION] = pJson.version;

	return reqParams;
}

function rtiRequestBuilderV4(req, eventType, params) {
	const { apiKey, tagHash } = params;
	const clientIp = getHeaderByName(req.headers, 'X-Forwarded-For') || '196.243.240.5'; // fallback for local dev
	const userAgent  = req.headers['user-agent'];
	const duid       = req.headers.duid;
	const duidCookie = req.headers.duidcookie;
	const pageViewId = req.headers.pageviewid;
	const pvidCookie = req.headers.pvidCookie;

	console.log(userAgent)
	console.log(userAgent)
	console.log(userAgent)
	console.log(userAgent)
	console.log(userAgent)
	console.log(userAgent)

	// Initialize rti-v4 request object
	const reqParams = {
		[rtiParams.TAG_HASH_V4]: undefined,
		[rtiParams.API_KEY_V4]: undefined,
		isHeaderNamesOrdered: true,
		channel: 'mock-channel',
		endUserParams: {
			method: 'GET',
			headerNames: 'Host,Connection,Accept,Cache-Control,Cookie,User-Agent',
			requestUrl: undefined,
			clientIp: undefined,
			headers: undefined
		},
		duidCookie: undefined,
		pvidCookie: undefined,
		pageViewId: undefined,
		duid: undefined
	};

	// Populate Fields
	reqParams[rtiParams.TAG_HASH_V4] = tagHash;
	reqParams[rtiParams.API_KEY_V4] = apiKey;
	reqParams.endUserParams.requestUrl = getReqUrl(req);

	switch (params.sessionSyncMode) {
	case 'ip_useragent': {
		reqParams.endUserParams.clientIp = clientIp;
		reqParams.endUserParams.headers = req.headers;
		reqParams.endUserParams.headers['user-agent'] = userAgent;
		break;
	}

	case 'cookies': {
		reqParams.duidCookie = duidCookie;
		reqParams.pvidCookie = pvidCookie;
		break;
	}

	case 'pageviewid': {
		reqParams.pageViewId = pageViewId;
		break;
	}

	case 'duid': {
		reqParams.duid = duid;
		break;
	}

	case 'all_identifiers':
	default: {
		reqParams.endUserParams.clientIp = clientIp;
		reqParams.endUserParams.headers['user-agent'] = userAgent;
		reqParams.duidCookie = duidCookie;
		reqParams.pvidCookie = pvidCookie;
		reqParams.pageViewId = pageViewId;
		reqParams.duid = duid;
		break;
	}
	}

	return reqParams;
}


function slpRequestBuilder(req, eventType, params) {
	const reqParams = {};
	const { apiKey, tagHash, mode } = params;
	const { RequestId, email, phone } = req.body;

	switch (params.sessionSyncMode) {
	case 'banRti': {
		console.log('[slpRequestBuilder] sessionSyncMode: banRti');
		reqParams[rtiParams.USER_AGENT] = getHeaderByName(req.headers, 'User-Agent');
		break;
	}
	case 'rtiCookie': {
		console.log('[slpRequestBuilder] sessionSyncMode: rtiCookie');
		reqParams[rtiParams.CHEQ_COOKIE] = getCheqCookie(req.headers.cookie);
		break;
	}
	case 'requestId': {
		console.log('[slpRequestBuilder] sessionSyncMode: requestId');
		reqParams[rtiParams.REQUEST_ID] = RequestId;
		break;
	}
	default: {
		console.log('[slpRequestBuilder] sessionSyncMode: default');
		reqParams[rtiParams.USER_AGENT] = getHeaderByName(req.headers, 'User-Agent');
		reqParams[rtiParams.CHEQ_COOKIE] = getCheqCookie(req.headers.cookie);
		reqParams[rtiParams.REQUEST_ID] = RequestId;
		break;
	}
	}

	reqParams[slpParams.CLIENT_IP] = getHeaderByName(req.headers, 'X-Forwarded-For') ? getHeaderByName(req.headers, 'X-Forwarded-For') : '196.243.240.5'; // fallback to random IP for local dev
	reqParams[slpParams.TRUE_CLIENT_IP] = getHeaderByName(req.headers, 'True-Client-IP');
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
	reqParams[slpParams.HOST] = getHeaderByName(req.headers, 'host');
	reqParams[slpParams.HEADER_NAMES] = getHeaderNames(req.rawHeaders);
	reqParams[slpParams.REQUEST_URL] = getReqUrl(req);
	reqParams[slpParams.REQUEST_TIME] = new Date().getTime();
	reqParams[slpParams.METHOD] = req.method;
	reqParams[slpParams.RESOURCE_TYPE] = typeof getResourceType === 'function' ? getResourceType(req) : 'text/html';
	reqParams[slpParams.FORWARDED] = getHeaderByName(req.headers, 'Forwarded');
	reqParams[slpParams.MIDDLEWARE_VERSION] = pJson.version;

	console.log('[slpRequestBuilder] Built params:', reqParams);
	return reqParams;
}

function slpRequestBuilderV4(req, eventType, params) {
	const { apiKey, tagHash } = params;
	const formData = JSON.parse(JSON.stringify(req.body));

	// Initialze slp-v4 request object
	const reqParams = {
		[rtiParams.TAG_HASH_V4]: undefined,
		[rtiParams.API_KEY_V4]: undefined,
		'isHeaderNamesOrdered': true,
		'channel': 'mock-channel',
		'duidCookie': undefined,
		'pvidCookie': undefined,
		'pageViewId': undefined,
		'duid': undefined,
		'formSubmission': { 
			'mode': 'fast',
			'email': undefined,
			'phone': {
				'number': undefined,
				'country': undefined
			}
		},
		'endUserParams': {
			'method': 'GET',
			'headerNames': 'Host,Connection,Accept,Cache-Control,Cookie,User-Agent',
			'requestUrl': undefined,
			'clientIp': undefined,
			'headers': undefined
		},
	};

	// Populate rti-v4 request object
	reqParams[rtiParams.TAG_HASH_V4] = tagHash;
	reqParams[rtiParams.API_KEY_V4] = apiKey;
	reqParams['formSubmission']['email'] = formData.email;
	reqParams['formSubmission']['phone']['number'] = formData.phone;
	reqParams['formSubmission']['phone']['county'] = formData.country;
	reqParams['endUserParams']['requestUrl'] = getReqUrl(req);
	reqParams['endUserParams']['clientIp'] = getHeaderByName(req.headers, 'X-Forwarded-For') ? getHeaderByName(req.headers, 'X-Forwarded-For') : '196.243.240.5'; // fallback to random IP for local dev;
	reqParams['endUserParams']['headers'] = req.headers;

	switch (params.sessionSyncMode) {
	case 'rtiCookie': {
		console.log('[slpRequestBuilderV4] sessionSyncMode: rtiCookie');
		reqParams['duidCookie'] = req.headers.duidcookie;
		reqParams['pvidCookie'] = req.headers.pvidcookie;
		break;
	}
	case 'requestId': {
		console.log('[slpRequestBuilderV4] sessionSyncMode: requestId');
		reqParams['pageViewId'] = req.headers.pageviewid;
		reqParams['duid'] = req.headers.duid;
		break;
	}
	default: { // none - send all
		console.log('[slpRequestBuilderV4] sessionSyncMode: default');
		reqParams['pageViewId'] = req.headers.pageviewid;
		reqParams['duid'] = req.headers.duid;
		reqParams['duidCookie'] = req.headers.duidcookie;
		reqParams['pvidCookie'] = req.headers.pvidcookie;
		break;
	}
	}

	console.log('[slpRequestBuilderV4] Built params:', reqParams);
	return reqParams;
}

function getHeaderByName(headers, name = '', defaultValue) {
	return headers[name.toLowerCase()] || headers[capitalize(name, '-')] || defaultValue;
}

// function getIp(req) {
// 	return req.connection.remoteAddress || req.socket.remoteAddress || (req.connection.socket && req.connection.socket.remoteAddress) || (req.info && req.info.remoteAddress);
// }

function getResourceType(req) {
	if(req.method === 'POST') {
		return 'application/json';
	} else if(req.url === '/') {
		return 'text/html';
	}
}

function getChannel(req) {
	return req.query.channel;
}

function getJa3(req) {
	return req.query.ja3;
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
	if (!cookie) return undefined;
    
	const cheqCookie = cookie
		.split(';')
		.map(c => c.trim())
		.find(c => c.startsWith(`${rtiParams.CHEQ_COOKIE_NAME}=`));

	return cheqCookie ? cheqCookie.split('=').slice(1).join('=') : undefined;
}

module.exports = { rtiRequestBuilder, rtiRequestBuilderV4, slpRequestBuilder, slpRequestBuilderV4, getReqUrl };

