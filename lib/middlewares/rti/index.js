const request = require('../../utils/request');
const RtiLogger = require('../../utils/RtiLogger');
const config = require('../../../config');
const {rtiRequestBuilder, getReqUrl} = require('../../utils/requestBuilder');
const {rtiMode, rtiActions} = require('../../constans/rti');
const {isEmptyObject} = require('../../utils/validation');
let logger;

function rti(options) {
	if (typeof options != 'object' || !options || isEmptyObject(options)) {
		throw new Error('invalid params');
	}

	const {apiKey, tagHash, mode, URIExclusion, apiEndpoint, threatTypesCodes} = options;

	if (!apiKey) {
		throw new Error('missing apiKey');
	}

	if (!tagHash) {
		throw new Error('missing tagHash');
	}

	if (!apiEndpoint || !Object.values(config.apiEndpoints).includes(apiEndpoint)) {
		throw new Error('api endpoint is missing or invalid');
	}

	if (!mode) {
		options.mode = rtiMode.MONITORING;
	}

	if (!URIExclusion) {
		options.URIExclusion = [];
	} else if (!Array.isArray(URIExclusion) || !URIExclusion.every(uri => uri instanceof RegExp || typeof uri === 'string')) {
		throw new Error('invalid URIExclusion should be an array regular expressions or strings');
	}

	if (threatTypesCodes) {
		const {blockRedirect, captcha} = threatTypesCodes;
		if ((blockRedirect && !Array.isArray(blockRedirect)) || (captcha && Array.isArray(captcha))) {
			throw new Error('blockRedirect and captcha must be array');
		} else if(blockRedirect.some(b => captcha.includes(b))) {
			throw new Error('threat type in blockRedirect and captcha must be uniq for each array');
		}
	} else {
		options.threatTypesCodes = {};
	}

	logger = new RtiLogger(apiKey, tagHash);

	return function (eventType) {
		return handler(eventType, options);
	};
}


function handler(eventType, options) {
	return async function (req, res, next) {
		if (shouldSkip(req, options.URIExclusion)) {
			next();
			return;
		}
		return request({
			url: `${options.apiEndpoint}/${config.defaultApiVersion}/${config.rtiPath}`,
			method: 'POST',
			timeout: options.timeout || config.rtiTimeout,
			body: rtiRequestBuilder(req, eventType, options),
			type: 'form'
		})
			.then(rtiRes => handleRTIResponse(rtiRes, req, res, next, options))
			.catch(error => {
				console.log(`error while sending RTI api request: ${error.data || error.message}`);
				logger.warn(JSON.stringify({error, expMiddlewareVersion: config.middlewareVersion}), eventType);
				next();
			});

	};
}


function handleRTIResponse(rtiRes, req, res, next, options) {
	const {statusCode, data} = rtiRes || {};
	if (statusCode === 200 && data && data.setCookie) {
		res.setHeader('Set-Cookie', data.setCookie);
	}

	const blockRedirectCodes = options.blockRedirect || rtiActions.blockRedirect;
	const captchaCodes = options.captcha || rtiActions.captcha;

	if (!data || !data.threatTypeCode || typeof data.isInvalid !== 'boolean' || options.mode === rtiMode.MONITORING) {
		next();
	} else if (blockRedirectCodes.includes(data.threatTypeCode) && data.isInvalid && options.mode === rtiMode.BLOCKING) {
		if (options.redirectUrl) {
			res.redirect(options.redirectUrl);
		} else {
			res.status(403).send('Visitor is invalid, session blocked!');
		}
	} else if (captchaCodes.includes(data.threatTypeCode) && data.isInvalid && options.mode === rtiMode.BLOCKING && options.callback instanceof Function) {
		options.callback(req, res, next);
	} else {
		next();
	}

}


function shouldSkip(req, URIExclusion) {
	if (!URIExclusion.length) {
		return false;
	} else {
		const url = getReqUrl(req);
		return URIExclusion.some(uri => uri instanceof RegExp ? uri.test(url) : url.includes(uri));
	}
}

module.exports = rti;
