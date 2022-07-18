const request = require('./request');
const config = require('../../config');

class RtiLogger{
	constructor(apiKey, tagHas) {
		this.apiKey = apiKey;
		this.tagHash = tagHas;
	}

	audit(message, action) {
		log.call(this, 'audit', message, action);
	}

	info(message, action) {
		log.call(this, 'info', message, action);
	}

	warn(message, action) {
		log.call(this, 'warn', message, action);
	}

	error(message, action) {
		log.call(this, 'error', message, action);
	}


}


function log(level, message, action) {
	const body = {
		level,
		apiKey: this.apiKey,
		tagHas: this.tagHas,
		action,
		application: 'rti-express-middleware',
		message
	};
	debugger;
	request({url: config.rtiLoggerEndpoint, type: 'json', method: 'POST', body})
		.catch(console.warn);
}



module.exports = RtiLogger;