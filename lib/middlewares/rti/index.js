const request = require('../../utils/request');
const RtiLogger = require('../../utils/RtiLogger');
const config = require('../../../config');
const { rtiRequestBuilder } = require('../../utils/requestBuilder');
const { rtiMode, rtiActions } = require('../../constans/rti');
const { isEmptyObject } = require('../../utils/validation');
let logger;

function rti(options) {
	if (typeof options != 'object' || !options || isEmptyObject(options)) {
		throw new Error('invalid params');
	}

	const {apiKey, tagHash, mode} = options;

	if (!apiKey) {
		throw new Error('missing apiKey');
	}

	if (!tagHash) {
		throw new Error('missing tagHash');
	}

	if (!mode) {
		options.mode = rtiMode.MONITORING;
	}

	logger = new RtiLogger(apiKey, tagHash);

	return function (eventType) {
		return handler(eventType, options);
	};
}


function handler(eventType, params) {
	return async function (req, res, next) {
		//TODO send package version
		return request({
			url: `${config.baseApi}/${config.defaultApiVersion}/${config.rtiPath}`,
			method: 'POST',
			timeout: params.timeout || config.rtiTimeout,
			body: rtiRequestBuilder(req, eventType, params),
			type: 'form'
		})
			.then(rtiRes => handleRTIResponse(rtiRes, req, res, next, params))
			.catch(e => {
				logger.warn(JSON.stringify(e), eventType);
				next();
			});

	};
}


function handleRTIResponse(rtiRes, req, res, next, params) {
	const {statusCode, data} = rtiRes || {};
	if(statusCode === 200 && data && data.setCookie) {
		res.setHeader('Set-Cookie', data.setCookie);
	}
	if (!data || !data.threatTypeCode || typeof data.isInvalid !== 'boolean' || params.mode === rtiMode.MONITORING) {
		next();
	} else if (rtiActions.blockRedirect.includes(data.threatTypeCode) && data.isInvalid && params.mode === rtiMode.BLOCKING) {
		if (params.redirectUrl) {
			res.redirect(params.redirectUrl);
		} else {
			res.status(403).send('Visitor is invalid, session blocked!');
		}
	} else if (rtiActions.captcha.includes(data.threatTypeCode) && data.isInvalid && params.mode === rtiMode.BLOCKING && params.callback instanceof Function) {
		params.callback(req, res, next);
	} else {
		next();
	}

}

module.exports = rti;
