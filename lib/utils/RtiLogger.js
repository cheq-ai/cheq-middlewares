const request = require('./request');
const { rtiConfig } = require('../../config');

class RtiLogger {
	constructor(apiKey, tagHash) {
		this.apiKey = apiKey;
		this.tagHash = tagHash;
	}

	audit(message, action) {
		return log.call(this, 'audit', message, action);
	}

	info(message, action) {
		return log.call(this, 'info', message, action);
	}

	warn(message, action) {
		return log.call(this, 'warn', message, action);
	}

	error(message, action) {
		return log.call(this, 'error', message, action);
	}
}

function log(level, message, action) {
	const body = {
		level,
		apiKey: this.apiKey,
		tagHash: this.tagHash,
		action,
		application: 'rti-express-middleware',
		message,
	};

	return request({
		url: rtiConfig.rtiLoggerEndpoint,
		type: 'json',
		method: 'POST',
		body,
	}).catch(() => {});
}

module.exports = RtiLogger;
