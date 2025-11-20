const { rtiParams } = require('../constants/rti');
const { slpParams } = require('../constants/slp');
const pJson = require('../../package.json');
const { URL } = require('url');

function rtiRequestBuilder(req, eventType, params) {
	console.log('[RequestBuilder] Invoked: rtiRequestBuilder');
	const reqParams = {};
	const { apiKey, tagHash, getResourceType, getJa3, getChannel, apiVersion } = params;

	switch (params.sessionSyncMode) {
	case 'banRti': {
		console.log('DEBUG req.headers for banRti:', req.headers);
		console.log('DEBUG body for banRti:', req.body);

		reqParams[rtiParams.USER_AGENT] = getHeaderByName(req.headers, 'User-Agent');
		break;
	}
	case 'rtiCookie': {
		console.log('DEBUG req.headers for rtiCookie:', req.headers);
		console.log('DEBUG body for rtiCookie:', req.body);

		reqParams[rtiParams.CHEQ_COOKIE] = getCheqCookie(req.headers.cookie);
		break;
	}
	case 'requestId': {
		console.log('DEBUG req.headers for RequestId:', req.headers);
		console.log('DEBUG body for RequestId:', req.body);

		reqParams[rtiParams.USER_AGENT] = getHeaderByName(req.headers, 'User-Agent');
		reqParams[rtiParams.REQUEST_ID] = req.headers['request-id'];
		break;
	}
	default: {
		console.log('DEBUG req.headers for default:', req.headers);
		console.log('DEBUG body for default:', req.body);

		reqParams[rtiParams.USER_AGENT] = getHeaderByName(req.headers, 'User-Agent');
		reqParams[rtiParams.CHEQ_COOKIE] = getCheqCookie(req.headers.cookie);
		reqParams[rtiParams.REQUEST_ID] = req.headers['request-id'];
		break;
	}
	}

	if (apiVersion === 'v3') { // v3 extended response
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
	console.log('[RequestBuilder] Invoked: rtiRequestBuilderV4');
	// Setup
	const { apiKey, tagHash } = params;
	const clientIp = getHeaderByName(req.headers, 'X-Forwarded-For') || '196.243.240.5'; // fallback for local development
	const duid       = req.body.duid;
	const duidCookie = req.body.duidCookie;
	const pageViewId = req.body.pageViewId;
	const pvidCookie = req.body.pvidCookie;

	// Initialize rti-v4 request object
	const reqParams = {
		[rtiParams.TAG_HASH_V4]: tagHash,
		[rtiParams.API_KEY_V4]: apiKey,
		// endUserParams: { } // Populated on ip_useragent case only
		duidCookie: undefined,
		pvidCookie: undefined,
		duid: undefined,
		pageViewId: undefined
	};

	// Populate Fields
	switch (params.sessionSyncMode) {
	case 'ip_useragent': {
		reqParams.endUserParams = {};
		reqParams.endUserParams.method = 'GET';
		reqParams.endUserParams.headerNames = 'Host,Connection,Accept,Cache-Control,Cookie,User-Agent';
		reqParams.endUserParams.requestUrl = getReqUrl(req);
		reqParams.endUserParams.clientIp = clientIp;
		reqParams.endUserParams.headers = req.headers;
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
	console.log('[RequestBuilder] Invoked: slpRequestBuilder');
	const reqParams = {};
	const { apiKey, tagHash, mode } = params;
	const { email, phone } = req.body;
	const RequestId = req.headers['request-id'];

	switch (params.sessionSyncMode) {
	case 'banRti': {
		reqParams[rtiParams.USER_AGENT] = getHeaderByName(req.headers, 'User-Agent');
		break;
	}
	case 'rtiCookie': {
		reqParams[rtiParams.CHEQ_COOKIE] = getCheqCookie(req.headers.cookie);
		break;
	}
	case 'requestId': {
		reqParams[rtiParams.REQUEST_ID] = RequestId;
		break;
	}
	default: {
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

	return reqParams;
}

function slpRequestBuilderV4(req, eventType, params) {
	console.log('[RequestBuilder] Invoked: slpRequestBuilderV4');
	const formData = JSON.parse(JSON.stringify(req.body));

	// Initialze slp-v4 request object
	const reqParams = {
		[rtiParams.TAG_HASH_V4]: params.tagHash,
		[rtiParams.API_KEY_V4]: params.apiKey,
		'duidCookie': undefined,
		'pvidCookie': undefined,
		'pageViewId': undefined,
		'duid': undefined,
		'formSubmission': { 
			'mode': params.mode,
			'email': formData.email,
			'phone': {
				'number': formData.phone,
				'country': formData.country
			}
		},
		// 'endUserParams': {
		// 	'method': 'GET',
		// 	'headerNames': 'Host,Connection,Accept,Cache-Control,Cookie,User-Agent',
		// 	'requestUrl': undefined,
		// 	'clientIp': undefined,
		// 	'headers': undefined
		// },
	};

	// Populate fields
	switch (params.sessionSyncMode) {
	case 'ip_useragent': {
		reqParams.endUserParams = {};
		reqParams.endUserParams.method = 'GET';
		reqParams.endUserParams.headerNames = 'Host,Connection,Accept,Cache-Control,Cookie,User-Agent';
		reqParams.endUserParams.requestUrl = getReqUrl(req);
		reqParams.endUserParams.clientIp = getHeaderByName(req.headers, 'X-Forwarded-For') ? getHeaderByName(req.headers, 'X-Forwarded-For') : '196.243.240.5'; // fallback to random IP for local dev;
		reqParams.endUserParams.headers = req.headers;

		break;
	}

	case 'cookies': {
		reqParams.duidCookie = formData.duidCookie;
		reqParams.pvidCookie = formData.pvidCookie;

		break;
	}

	case 'pageviewid': {
		reqParams.pageViewId = formData.pageViewId;

		break;
	}

	case 'duid': {
		reqParams.duid = formData.duid;

		break;
	}

	case 'all_identifiers':
	default: {
		reqParams.duidCookie = formData.duidCookie;
		reqParams.pvidCookie = formData.pvidCookie;
		reqParams.pageViewId = formData.pageViewId;
		reqParams.duid = formData.duid;

		break;
	}
	}

	return reqParams;
}

function getHeaderByName(headers, name = '', defaultValue) {
	// [RequestBuilder] getHeaderByName invoked
	return headers[name.toLowerCase()] || headers[capitalize(name, '-')] || defaultValue;
}

// function getIp(req) {
// 	return req.connection.remoteAddress || req.socket.remoteAddress || (req.connection.socket && req.connection.socket.remoteAddress) || (req.info && req.info.remoteAddress);
// }

function getResourceType(req) {
	// [RequestBuilder] getResourceType invoked
	if(req.method === 'POST') {
		return 'application/json';
	} else if(req.url === '/') {
		return 'text/html';
	}
}

function getChannel(req) {
	// [RequestBuilder] getChannel invoked
	return req.query.channel;
}

function getJa3(req) {
	// [RequestBuilder] getJa3 invoked
	return req.query.ja3;
}

function getReqUrl(req) {
	// [RequestBuilder] getReqUrl invoked
	return new URL(req.url, `${req.protocol}://${req.get('host')}`).href;
}

function getHeaderNames(rawHeaders = []) {
	// [RequestBuilder] getHeaderNames invoked
	return rawHeaders.filter((val, i) => i%2 === 0).join(',');
}

function capitalize(str = '', splitter = ' ') {
	// [RequestBuilder] capitalize invoked
	return str.split(splitter).map(s => `${s.charAt(0).toUpperCase()}${s.substring(1)}`).join(splitter);
}

function getCheqCookie(cookie) {
	// [RequestBuilder] getCheqCookie invoked
	if (!cookie) return undefined;
    
	const cheqCookie = cookie
		.split(';')
		.map(c => c.trim())
		.find(c => c.startsWith(`${rtiParams.CHEQ_COOKIE_NAME}=`));

	return cheqCookie ? cheqCookie.split('=').slice(1).join('=') : undefined;
}

module.exports = { rtiRequestBuilder, rtiRequestBuilderV4, slpRequestBuilder, slpRequestBuilderV4, getReqUrl };

