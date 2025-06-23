const pJson = require('./package.json');

const rtiConfig = {
	rtiPath: 'realtime-interception',
	rtiLoggerEndpoint: 'https://rtilogger.production.cheq-platform.com',
	rtiTimeout: 100,
	middlewareVersion: pJson.version,
};

const rtiConfigV4 = {
	rtiPath: 'defend/4.0/traffic',
	rtiLoggerEndpoint: 'https://rtilogger.production.cheq-platform.com',
	rtiTimeout: 100,
	middlewareVersion: pJson.version,
};

const slpConfig = {
	slpPath: 'user-validation',
	slpLoggerEndpoint: 'https://slplogger.production.cheq-platform.com',
	slpTimeout: 100,
	middlewareVersion: pJson.version,
};

const slpConfigV4 = {
	slpPath: 'form-guard/4.0',
	slpLoggerEndpoint: 'https://slplogger.production.cheq-platform.com',
	slpTimeout: 100,
	middlewareVersion: pJson.version,
};

module.exports = { rtiConfig, rtiConfigV4, slpConfig, slpConfigV4 };
