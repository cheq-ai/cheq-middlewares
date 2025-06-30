const request = require('../../utils/request');
const RtiLogger = require('../../utils/RtiLogger');
const { rtiConfig, rtiConfigV4 } = require('../../../config');
const { rtiRequestBuilder, rtiRequestBuilderV4, getReqUrl } = require('../../utils/requestBuilder');
const { rtiMode, rtiActions } = require('../../constants/rti');
const errorsCodes = require('../../constants/errorsCodes');
const { isEmptyObject } = require('../../utils/validation');
let logger;

function rti(options) {
	if (typeof options != 'object' || !options || isEmptyObject(options)) {
		console.log('[RTI] Invalid options provided:', options);
		throw new Error(errorsCodes.errInvalidParams);
	}

	const { apiKey, tagHash, mode, URIExclusion, apiEndpoint, threatTypesCodes } = options;

	if (!apiKey) {
		console.log('[RTI] Missing apiKey');
		throw new Error(errorsCodes.errInvalidApiKey);
	}

	if (!tagHash) {
		console.log('[RTI] Missing tagHash');
		throw new Error(errorsCodes.errInvalidTagHash);
	}

	if (!apiEndpoint) {
		console.log('[RTI] Missing apiEndpoint');
		throw new Error(errorsCodes.errInvalidApiEndpoint);
	}

	if (!mode) {
		console.log('[RTI] No mode provided, defaulting to MONITORING');
		options.mode = rtiMode.MONITORING;
	}

	if (!URIExclusion) {
		console.log('[RTI] No URIExclusion provided, defaulting to empty array');
		options.URIExclusion = [];
	} else if (!Array.isArray(URIExclusion) || !URIExclusion.every(uri => uri instanceof RegExp || typeof uri === 'string')) {
		console.log('[RTI] Invalid URIExclusion array:', URIExclusion);
		throw new Error(errorsCodes.errInvalidURIExclusionArray);
	}

	if (threatTypesCodes) {
		const {blockRedirect, captcha} = threatTypesCodes;
		if ((blockRedirect && !Array.isArray(blockRedirect)) || (captcha && !Array.isArray(captcha))) {
			console.log('[RTI] Invalid threatTypesCodes:', threatTypesCodes);
			throw new Error(errorsCodes.errThreatTypesCodes);
		} else if(blockRedirect.some(b => captcha.includes(b))) {
			console.log('[RTI] Same threatTypesCodes in blockRedirect and captcha:', threatTypesCodes);
			throw new Error(errorsCodes.errSameThreatTypesCodes);
		}
	} else {
		console.log('[RTI] No threatTypesCodes provided, defaulting to empty object');
		options.threatTypesCodes = {};
	}

	logger = new RtiLogger(apiKey, tagHash);
	console.log('[RTI] Logger initialized');

	return function(eventType) {
		console.log(`[RTI] Middleware initialized for eventType: ${eventType}, apiVersion: ${options.apiVersion}`);
		if (options.apiVersion === 'v4') {
			console.log('HANDLER V4 if branch');
			return handlerV4(eventType, options);
		} else {
			console.log('HANDLER V1/v3 if branch');
			return handler(eventType, options);
		}
	};
}

function handler(eventType, options) {
	return async function (req, res, next) {
		console.log(`[RTI] handler called for eventType: ${eventType}, url: ${req.originalUrl}`);
		if (shouldSkip(req, options.URIExclusion)) {
			console.log('[RTI] Request skipped due to URIExclusion:', req.originalUrl);
			next();
			return;
		}
		console.log('[RTI] Sending RTI request', {
			url: `${options.apiEndpoint}/${options.apiVersion}/${rtiConfig.rtiPath}`,
			method: 'POST',
			timeout: options.timeout || rtiConfig.rtiTimeout
		});
		return request({
			url: `${options.apiEndpoint}/${options.apiVersion}/${rtiConfig.rtiPath}`,
			method: 'POST',
			timeout: options.timeout || rtiConfig.rtiTimeout,
			body: rtiRequestBuilder(req, eventType, options),
			type: 'form'
		})
			.then(rtiRes => {
				console.log('[RTI] RTI response received', rtiRes);
				handleRTIResponse(rtiRes, req, res, next, options);
			})
			.catch(error => {
				console.log(`${errorsCodes.errApiRequest}: ${error.data || error.message}`);
				logger.warn(JSON.stringify({error, expMiddlewareVersion: rtiConfig.middlewareVersion}), eventType);
				next();
			});

	};
}

function handlerV4(eventType, options) {
	return async function (req, res, next) {
		console.log(`[RTI] handlerV4 called for eventType: ${eventType}, url: ${req.originalUrl}`);
		if (shouldSkip(req, options.URIExclusion)) {
			console.log('[RTI] Request skipped due to URIExclusion:', req.originalUrl);
			next();
			return;
		}

		console.log('[RTI] Sending RTI v4 request', {
			url: `${options.apiEndpoint}/${rtiConfigV4.rtiPath}`,
			method: 'POST',
			timeout: options.timeout || rtiConfig.rtiTimeout
		});
		return request({
			url: `${options.apiEndpoint}/${rtiConfigV4.rtiPath}`,
			method: 'POST',
			timeout: options.timeout || rtiConfig.rtiTimeout,
			body: rtiRequestBuilderV4(req, eventType, options),
			type: 'application/json'
		})
			.then(rtiRes => {
				console.log('[RTI] RTI v4 response received', rtiRes);
				handleRTIResponse(rtiRes, req, res, next, options);
			})
			.catch(error => {
				console.log(`${errorsCodes.errApiRequest}: ${error.data || error.message}`);
				logger.warn(JSON.stringify({error, expMiddlewareVersion: rtiConfig.middlewareVersion}), eventType);
				next();
			});

	};
}

function handleRTIResponse(rtiRes, req, res, next, options) {
	console.log('[RTI] handleRTIResponse called', { rtiRes });
	res.locals.rtiRes = rtiRes;
	
	const {statusCode, data} = rtiRes || {};
	if (statusCode === 200 && data && data.setCookie) {
		console.log('[RTI] Setting cookie header');
		res.setHeader('Set-Cookie', data.setCookie);
	}

	const blockRedirectCodes = options.threatTypesCodes.blockRedirect || rtiActions.blockRedirect;
	const captchaCodes = options.threatTypesCodes.captcha || rtiActions.captcha;

	if (!data || !data.threatTypeCode || typeof data.isInvalid !== 'boolean' || options.mode === rtiMode.MONITORING) {
		console.log('[RTI] Passing to next middleware (no action required)', { data, mode: options.mode });
		next();
	} else if (blockRedirectCodes.includes(data.threatTypeCode) && data.isInvalid && options.mode === rtiMode.BLOCKING) {
		console.log('[RTI] Blocking request due to blockRedirect', { threatTypeCode: data.threatTypeCode });
		if (options.redirectUrl) {
			console.log('[RTI] Redirect URL set, sending RTI response');
			res.send(JSON.stringify(rtiRes, null, 2));
		} else {
			console.log('[RTI] No redirect URL, sending 403');
			res.status(403).send('Visitor is invalid, session blocked!');
		}
	} else if (captchaCodes.includes(data.threatTypeCode) && data.isInvalid && options.mode === rtiMode.BLOCKING && options.callback instanceof Function) {
		console.log('[RTI] Captcha required, invoking callback');
		options.callback(req, res, next);
	} else {
		console.log('[RTI] No blocking or captcha action, passing to next middleware');
		next();
	}
}

function shouldSkip(req, URIExclusion) {
	if (!URIExclusion.length) {
		return false;
	} else {
		const url = getReqUrl(req);
		const skip = URIExclusion.some(uri => uri instanceof RegExp ? uri.test(url) : url.includes(uri));
		if (skip) {
			console.log('[RTI] shouldSkip: skipping request for url', url);
		}
		return skip;
	}
}

module.exports = rti;
