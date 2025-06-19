const rtiMode = {
	MONITORING: 'monitoring',
	BLOCKING: 'blocking',
};

const rtiActions = {
	blockRedirect: [2, 3, 6, 7, 10, 11, 16, 18],
	captcha: [4, 5, 13, 14, 15, 17],
};

const rtiParams = {
	API_KEY: 'apiKey',
	TAG_HASH: 'tagHash',
	EVENT_TYPE: 'EventType',
	CLIENT_IP: 'ClientIP',
	TRUSTED_IP_HEADER: 'trustedIPHeader',
	REQUEST_URL: 'RequestURL',
	RESOURCE_TYPE: 'ResourceType',
	METHOD: 'Method',
	HOST: 'Host',
	USER_AGENT: 'UserAgent',
	ACCEPT: 'Accept',
	ACCEPT_LANGUAGE: 'AcceptLanguage',
	ACCEPT_ENCODING: 'AcceptEncoding',
	ACCEPT_CHARSET: 'AcceptCharset',
	HEADER_NAMES: 'HeaderNames',
	CHEQ_COOKIE: 'CheqCookie',
	CHEQ_COOKIE_NAME: '_cheq_rti',
	REQUEST_TIME: 'RequestTime',
	X_FORWARDED_FOR: 'XForwardedFor',
	REFERER: 'Referer',
	ORIGIN: 'Origin',
	X_REQUESTED_WHIT: 'XRequestedWith',
	CONNECTION: 'Connection',
	PRAGMA: 'Pragma',
	CACHE_CONTROL: 'CacheControl',
	CONTENT_TYPE: 'ContentType',
	TRUE_CLIENT_IP: 'TrueClientIP',
	X_REAL_IP: 'XRealIP',
	REMOTE_ADDRESS: 'RemoteAddr',
	FORWARDED: 'Forwarded',
	JA3: 'JA3',
	CHANNEL: 'Channel',
	MIDDLEWARE_VERSION: 'MiddlewareVersion',
	REQUEST_ID: 'RequestId',
	IS_EXTENDED: 'IsExtended',
};

module.exports = {
	rtiMode,
	rtiActions,
	rtiParams,
};
