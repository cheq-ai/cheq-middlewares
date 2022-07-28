const { rti } = require('../../index');
const request = require('../../lib/utils/request');

describe('rti middleware', () => {

	test('should throw invalid params', () => {
		expect(() => rti()).toThrow('invalid params');
	});

	test('should throw invalid params - pass array ', () => {
		expect(() => rti([])).toThrow('not object');
	});

	test('should throw missing request url', () => {
		expect(() => request({})).toThrow('missing request url');
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