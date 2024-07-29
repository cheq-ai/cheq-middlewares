const pJson = require('./package.json');

module.exports = {
	apiEndpoints: {
		US: 'https://rti-us-east-1.cheqzone.com',
		EU: 'https://rti-eu-west-1.cheqzone.com',
		global: 'https://rti-global.cheqzone.com',
		DEV: 'https://obs.dev.cheqzone.com',
	},
	rtiPath: 'realtime-interception',
	rtiLoggerEndpoint: 'https://rtilogger.production.cheq-platform.com',
	rtiTimeout: 100,
	defaultApiVersionV1:'v1',
	defaultApiVersionV3:'v3',
	middlewareVersion: pJson.version
};
