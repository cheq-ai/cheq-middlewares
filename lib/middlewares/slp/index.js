const request = require('../../utils/request');
const RtiLogger = require('../../utils/RtiLogger');
const { slpConfig, slpConfigV4 } = require('../../../config');
const { slpRequestBuilder, slpRequestBuilderV4, getReqUrl } = require('../../utils/requestBuilder');
const { slpMode } = require('../../constants/slp');
const errorsCodes = require('../../constants/errorsCodes');
const { isEmptyObject } = require('../../utils/validation');
let logger;

function slp(options) {
	console.log('[SLP Middleware] Invoked: slp(options)');
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

	if (!apiEndpoint) {
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
		console.log('[SLP Middleware] Invoked: slp(eventType handler)');
		if (options.apiVersion === 'v4') {
			return handlerV4(eventType, options);
		} else {
			return handler(eventType, options);
		}
	};
}

function handler(eventType, options) {
	console.log('[SLP Middleware] Invoked: handler(eventType, options)');
	return async function (req, res, next) {
		console.log('[SLP Middleware] Invoked: handler middleware (req, res, next)');
		if (shouldSkip(req, options.URIExclusion)) {
			next();

			return;
		}

		const slpReq = slpRequestBuilder(req, eventType, options);

		return request({
			url: `${options.apiEndpoint}/${options.apiVersion}/${slpConfig.slpPath}`,
			method: 'POST',
			timeout: options.timeout || slpConfig.slpTimeout,
			body: slpReq,
			type: 'form'
		})
			.then(slpRes => {
				handleSLPResponse(req, res, next, slpReq, slpRes); 
			})
			.catch(error => {
				console.log(`${errorsCodes.errApiRequest}: ${error.data || error.message}`);
				logger.warn(JSON.stringify({error, expMiddlewareVersion: slpConfig.middlewareVersion}), eventType);
				next();
			});
	};
}

function handlerV4(eventType, options) {
	console.log('[SLP Middleware] Invoked: handlerV4(eventType, options)');
	return async function (req, res, next) {
		console.log('[SLP Middleware] Invoked: handlerV4 middleware (req, res, next)');
		if (shouldSkip(req, options.URIExclusion)) {
			next();

			return;
		}

		const slpReq = slpRequestBuilderV4(req, eventType, options);

		return request({
			url: `${options.apiEndpoint}/${slpConfigV4.slpPath}`,
			method: 'POST',
			timeout: options.timeout || slpConfig.slpTimeout,
			body: slpReq,
			type: 'application/json'
		})
			.then(slpRes => {
				handleSLPResponse(req, res, next, slpReq, slpRes); 
			})
			.catch(error => {
				logger.warn(JSON.stringify({error, expMiddlewareVersion: slpConfig.middlewareVersion}), eventType);
				next();
			});
	};
}

function handleSLPResponse(req, res, next, slpReq, slpRes) {
	console.log('[SLP Middleware] Invoked: handleSLPResponse');
	if (!slpRes) {
		next();
	} else {
		res.locals.slpReq = slpReq;
		res.locals.slpRes = slpRes;
		next();	
	}
}

function shouldSkip(req, URIExclusion) {
	console.log('[SLP Middleware] Invoked: shouldSkip');
	if (!URIExclusion.length) {
		return false;
	} else {
		const url = getReqUrl(req);

		return URIExclusion.some(uri => uri instanceof RegExp ? uri.test(url) : url.includes(uri));
	}
}

module.exports = slp;
