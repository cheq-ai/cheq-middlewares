const rtiMode = {
	MONITORING: 'monitoring',
	BLOCKING: 'blocking'
};
const rtiActions = {
	blockRedirect: [2, 3, 6, 7, 10, 11, 16, 18],
	captcha: [4, 5, 13, 14, 15, 17]
};

const eventsTypes = {
	PAGE_LOAD: 'page_load',
	ADD_PAYMENT: 'add_payment',
	ADD_TO_CART: 'add_to_cart',
	ADD_TO_WISHLIST: 'add_to_wishlist',
	REGISTRATION: 'registration',
	PURCHASE: 'purchase',
	SEARCH: 'search',
	START_TRAIL: 'start_trail',
	SUBSCRIBE: 'subscribe',
	FORM_SUBMISSION: 'form_submission',
	CUSTOM: 'custom',
	TOKEN_VALIDATION: 'token_validation'
};

const rtiParams = {
	API_KEY: 'ApiKey',
	TAG_HASH: 'TagHash',
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
	
};

module.exports = {
	rtiMode,
	rtiActions,
	eventsTypes,
	rtiParams
};
