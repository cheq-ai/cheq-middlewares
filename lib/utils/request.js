const http = require('http');
const https = require('https');
const {URL} = require('url');
const {Buffer} = require('buffer');
const querystring = require('querystring');
const {isObject} = require('../utils/validation');


function makeRequest(options, data) {
	return new Promise(((resolve, reject) => {
		let rawData = '';
		const reqMethod = options.protocol === 'https:' ? https.request : http.request;

		const req = reqMethod(options, res => {
			res.on('data', data => {
				rawData += data.toString();
			});
			res.on('end', () => handlePromiseResponse(rawData, res, resolve, reject));
		})
			.on('error', reject);

		if (data) {
			req.write(data);
		}
		req.end();

	}));
}

function handlePromiseResponse(data, res, resolve, reject) {
	const response = {
		statusCode: res.statusCode,
		statusMessage: res.statusMessage
	};
	if (res.statusCode >= 400) {
		response.data = data;
		reject(response);
	} else if (res.headers['content-type'].includes('application/json') && data) {
		response.data = JSON.parse(data);
		resolve(response);
	} else {
		response.data = data;
		resolve(response);
	}
}


function getRequestBody(data, type = 'json') {
	if (isObject(data) || Array.isArray(data)) {
		switch (type) {
		case 'form':
			return querystring.stringify(data);
		case 'json':
		default:
			return JSON.stringify(data);
		}
	} else if (typeof data === 'string') {
		return data;
	}

	return '';
}

function getContentType(body, type) {
	if (isObject(body) || Array.isArray(body)) {
		switch (type) {
		case 'form':
			return 'application/x-www-form-urlencoded';
		case 'json':
		default:
			return 'application/json';
		}
	} else {
		return 'text/html';
	}
}

function request({url, method = 'GET', body, type, timeout, headers = {}, keepAlive}) {

	if (!url) {
		throw new Error('missing request url');
	}

	const requestUrl = new URL(url);
	const data = getRequestBody(body, type);
	const contentType = getContentType(body, type);

	const options = {
		protocol: requestUrl.protocol,
		host: requestUrl.hostname,
		path: requestUrl.pathname,
		method: method,
		port: requestUrl.port,
		timeout,
		headers: {
			...headers,
			...(data ? {'Content-Length': Buffer.byteLength(data)} : {}),
			'Content-Type': contentType
		},
	};

	if(keepAlive) {
		options.agent = new http.Agent({ keepAlive: true });
	}

	return makeRequest(options, data);

}


module.exports = request;