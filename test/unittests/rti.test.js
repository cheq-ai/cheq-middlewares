const { rti } = require('../../index');
const Request = require('../../lib/utils/http');

describe('rti middleware', () => {

	test('should throw invalid params', () => {
		expect(() => rti()).toThrow('invalid params');
	});

	test('should throw invalid params - pass array ', () => {
		expect(() => rti([])).toThrow('not object');
	});

	test('should throw missing request url', () => {
		expect(() => new Request()).toThrow('missing request url');
	});

	test('should return request object', () => {
		const r = new Request('https://google.com');
		r.body('');
		expect(r.headers['Content-Type']).toEqual('text/html');
		r.body({});
		expect(r.headers['Content-Type']).toEqual('application/json');
		r.body({}, 'form');
		expect(r.headers['Content-Type']).toEqual('application/x-www-form-urlencoded');
		r.header('Content-Type', 'text/html');
		expect(r.headers['Content-Type']).toEqual('text/html');
	});

	test('should throw missing apiKey error', () => {
		const options = {
			tagHash: 'abc'
		};

		expect(() => rti(options)).toThrow('missing apiKey');
	});

	test('should throw missing tagHash error', () => {
		const options = {
			apiKey: 'abc'
		};
		expect(() => rti(options)).toThrow('missing tagHash');
	});

	test('should express handler function', () => {
		const options = {
			apiKey: 'abc',
			tagHash: 'abc'
		};
		expect(rti(options)).toBeInstanceOf(Function);
	});

});