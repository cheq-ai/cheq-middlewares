const pJson = require('./package.json');

const rtiConfig = {
	apiEndpoints: {
		US: 'https://rti-us-east-1.cheqzone.com',
		EU: 'https://rti-eu-west-1.cheqzone.com',
		global: 'https://rti-global.cheqzone.com',
		DEV: 'https://obs.dev.cheqzone.com',
	},
	rtiPath: 'realtime-interception',
	rtiLoggerEndpoint: 'https://rtilogger.production.cheq-platform.com',
	rtiTimeout: 100,
	middlewareVersion: pJson.version
};

const slpConfig = {
	apiEndpoints: {
		PROD: 'https://obs.cheqzone.com',
		DEV: 'https://obs.dev.cheqzone.com',
	},
	slpPath: 'user-validation',
	slpLoggerEndpoint: 'https://slplogger.production.cheq-platform.com',
	slpTimeout: 100,
	middlewareVersion: pJson.version
};

module.exports = { rtiConfig, slpConfig };

