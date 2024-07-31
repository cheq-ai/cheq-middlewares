const request = require('../../utils/request');
const RtiLogger = require('../../utils/RtiLogger');
const config = require('../../../config');
const {rtiRequestBuilder, getReqUrl} = require('../../utils/requestBuilder');
const {rtiMode, rtiActions} = require('../../constans/rti');
const errorsCodes = require('../../constans/errorsCodes');
const {isEmptyObject} = require('../../utils/validation');
let logger;

function rti(options) {
	if (typeof options != 'object' || !options || isEmptyObject(options)) {
		throw new Error(errorsCodes.errInvalidParams);
	}

	const {apiKey, tagHash, mode, URIExclusion, apiEndpoint, threatTypesCodes} = options;

	if (!apiKey) {
		throw new Error(errorsCodes.errInvalidApiKey);
	}

	if (!tagHash) {
		throw new Error(errorsCodes.errInvalidTagHash);
	}

	if (!apiEndpoint || !Object.values(config.apiEndpoints).includes(apiEndpoint)) {
		throw new Error(errorsCodes.errInvalidApiEndpoint);
	}

	if (!mode) {
		options.mode = rtiMode.MONITORING;
	}

	if (!URIExclusion) {
		options.URIExclusion = [];
	} else if (!Array.isArray(URIExclusion) || !URIExclusion.every(uri => uri instanceof RegExp || typeof uri === 'string')) {
		throw new Error(errorsCodes.errInvalidURIExclusionArray);
	}

	if (threatTypesCodes) {
		const {blockRedirect, captcha} = threatTypesCodes;
		if ((blockRedirect && !Array.isArray(blockRedirect)) || (captcha && !Array.isArray(captcha))) {
			throw new Error(errorsCodes.errThreatTypesCodes);
		} else if(blockRedirect.some(b => captcha.includes(b))) {
			throw new Error(errorsCodes.errSameThreatTypesCodes);
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
			url: `${options.apiEndpoint}/${config.defaultApiVersionV1}/${config.rtiPath}`,
			method: 'POST',
			timeout: options.timeout || config.rtiTimeout,
			body: rtiRequestBuilder(req, eventType, options),
			type: 'form'
		})
		.then(rtiRes => {
			handleRTIResponse(rtiRes, req, res, next, options) 
		})
			.catch(error => {
				console.log(`${errorsCodes.errRTIApiRequest}: ${error.data || error.message}`);
				logger.warn(JSON.stringify({error, expMiddlewareVersion: config.middlewareVersion}), eventType);
				next();
			});

	};
}


function handleRTIResponse(rtiRes, req, res, next, options) {
	res.locals.rtiRes = rtiRes;
	
	const {statusCode, data} = rtiRes || {};
	if (statusCode === 200 && data && data.setCookie) {
		res.setHeader('Set-Cookie', data.setCookie);
	}

	const blockRedirectCodes = options.threatTypesCodes.blockRedirect || rtiActions.blockRedirect;
	const captchaCodes = options.threatTypesCodes.captcha || rtiActions.captcha;

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
