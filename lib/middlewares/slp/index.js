const request = require('../../utils/request');
const RtiLogger = require('../../utils/RtiLogger');
const slpConfig = require('../../../config');
const { slpRequestBuilder, getReqUrl } = require('../../utils/requestBuilder');
const { slpMode } = require('../../constants/slp');
const errorsCodes = require('../../constants/errorsCodes');
const { isEmptyObject } = require('../../utils/validation');
let logger;

function slp(options) {
	if (typeof options != 'object' || !options || isEmptyObject(options)) {
		throw new Error(errorsCodes.errInvalidParams);
	}

	const { apiKey, tagHash, mode, URIExclusion, apiEndpoint } = options;

	if (!apiKey) {
		throw new Error(errorsCodes.errInvalidApiKey);
	}

	if (!tagHash) {
		throw new Error(errorsCodes.errInvalidTagHash);
	}

	if (!apiEndpoint || !Object.values(slpConfig.apiEndpoints).includes(apiEndpoint)) {
		throw new Error(errorsCodes.errInvalidApiEndpoint);
	}

	if (!mode) {
		options.mode = slpMode.FAST;
	}

	if (!URIExclusion) {
		options.URIExclusion = [];
	} else if (!Array.isArray(URIExclusion) || !URIExclusion.every(uri => uri instanceof RegExp || typeof uri === 'string')) {
		throw new Error(errorsCodes.errInvalidURIExclusionArray);
	}

	logger = new RtiLogger(apiKey, tagHash);

	return function(eventType) {
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
			url: `${options.apiEndpoint}/${slpConfig.defaultApiVersionV1}/${slpConfig.slpPath}`,
			method: 'POST',
			timeout: options.timeout || slpConfig.slpTimeout,
			body: slpRequestBuilder(req, eventType, options),
			type: 'form'
		})
		.then(slpRes => {
			handleSLPResponse(slpRes, req, res, next, options) 
		})
			.catch(error => {
				console.log(`${errorsCodes.errApiRequest}: ${error.data || error.message}`);
				logger.warn(JSON.stringify({error, expMiddlewareVersion: slpConfig.middlewareVersion}), eventType);
				next();
			});
	};
}

function handleSLPResponse(slpRes, req, res, next, options) {
	const { statusCode, data } = slpRes || {};
	res.locals.slpRes = slpRes;
	
	// THIS IS WHERE THE RESPONSE FROM SLP IS HANDLED - WE CAN MODIFY THIS FROM RTI TO SLP IF WE WILL NEED
	
	// if (statusCode === 200 && data && data.setCookie) {
	// 	res.setHeader('Set-Cookie', data.setCookie);
	// }
	// const blockRedirectCodes = options.threatTypesCodes.blockRedirect || rtiActions.blockRedirect;
	// const captchaCodes = options.threatTypesCodes.captcha || rtiActions.captcha;

	// if (!data || !data.threatTypeCode || typeof data.isInvalid !== 'boolean' || options.mode === rtiMode.MONITORING) {
	// 	next();
	// } else if (blockRedirectCodes.includes(data.threatTypeCode) && data.isInvalid && options.mode === rtiMode.BLOCKING) {
	// 	if (options.redirectUrl) {
	// 		res.redirect(options.redirectUrl);
	// 	} else {
	// 		res.status(403).send('Visitor is invalid, session blocked!');
	// 	}
	// } else if (captchaCodes.includes(data.threatTypeCode) && data.isInvalid && options.mode === rtiMode.BLOCKING && options.callback instanceof Function) {
	// 	options.callback(req, res, next);
	// } else {
	// 	next();
	// }
}

function shouldSkip(req, URIExclusion) {
	if (!URIExclusion.length) {
		return false;
	} else {
		const url = getReqUrl(req);

		return URIExclusion.some(uri => uri instanceof RegExp ? uri.test(url) : url.includes(uri));
	}
}

module.exports = slp;
