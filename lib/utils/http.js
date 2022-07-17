const http = require('http');
const https = require('https');
const {URL} = require('url');
const {Buffer} = require('buffer');
const querystring = require('querystring');
const {isObject} = require('../utils/validation');


class Request {
	constructor(url, method = 'GET') {
		if (!url) {
			throw new Error('missing request url');
		}

		this.requestUrl = new URL(url);
		this.method = method.toUpperCase().trim();
		this.headers = {};
	}

	timeout(t) {
		this.reqTimeout = t;
		return this;
	}

	body(data, type = 'json') {
		if (isObject(data) || Array.isArray(data)) {
			switch (type) {
			case 'form':
				this.data = querystring.stringify(data);
				this.headers['Content-Type'] = 'application/x-www-form-urlencoded';
				break;
			case 'json':
			default:
				this.data = JSON.stringify(data);
				this.headers['Content-Type'] = 'application/json';

			}
		} else if(typeof data === 'string'){
			this.data = data;
			this.headers['Content-Type'] = 'text/html';
		}

		return this;
	}

	header(name, value) {
		if (isObject(name)) {
			this.headers = Object.assign(this.headers, name);
		} else if (name && value) {
			this.headers[name] = value;
		}
		return this;
	}

	send() {
		const options = {
			protocol: this.requestUrl.protocol,
			host: this.requestUrl.hostname,
			path: this.requestUrl.pathname,
			method: this.method,
			port: this.requestUrl.port,
			headers: {
				...this.headers,
				...(this.data ? {'Content-Length': Buffer.byteLength(this.data)} : {})
			},
		};

		return this.reqTimeout
			? Promise.race([makeRequest.call(this, options), promiseTimeout(this.reqTimeout)])
			: makeRequest.call(this, options);

	}

}

function makeRequest(options) {
	return new Promise(((resolve, reject) => {
		let rawData = '';
		const reqMethod = options.protocol === 'https:' ? https.request : http.request;

		const req = reqMethod(options, res => {
			res.on('data', data => rawData += data.toString());
			res.on('end', () => handlePromiseResponse(rawData, res, resolve, reject));
		})
			.on('error', reject);

		if (this.data) {
			req.write(this.data);
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
	} else if (res.headers['content-type'].includes('application/json')) {
		response.data = JSON.parse(data);
		resolve(response);
	} else {
		response.data = data;
		resolve(response);
	}
}


function promiseTimeout(timeout) {
	return new Promise((resolve, reject) => setTimeout(() => {
		reject('request timeout');
	}, timeout));
}

module.exports = Request;