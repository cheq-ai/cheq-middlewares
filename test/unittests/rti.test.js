const { rti } = require('../../index');
const request = require('../../lib/utils/request');
const rtiConfig = require('../../config');
const errorsCodes = require('../../lib/constants/errorsCodes');

describe('rti middleware', () => {

	test(`should throw ${errorsCodes.errInvalidParams}`, () => {
		expect(() => rti()).toThrow(errorsCodes.errInvalidParams);
	});

	test(`should throw ${errorsCodes.errInvalidParams}`, () => {
		expect(() => rti([])).toThrow('not object');
	});

	test(`should throw ${errorsCodes.errInvalidApiKey}`, () => {
		const options = {
			tagHash: 'abc'
		};

		expect(() => rti(options)).toThrow(errorsCodes.errInvalidApiKey);
	});

	test(`should throw ${errorsCodes.errInvalidTagHash}`, () => {
		const options = {
			apiKey: 'abc'
		};
		expect(() => rti(options)).toThrow(errorsCodes.errInvalidTagHash);
	});

	test(`should throw ${errorsCodes.errInvalidApiEndpoint}`, () => {
		const options = {
			apiKey: 'abc',
			tagHash: 'abc'
		};
		expect(() => rti(options)).toThrow(errorsCodes.errInvalidApiEndpoint);
	});

	test(`should throw ${errorsCodes.errInvalidURIExclusionArray}`, () => {
		const options = {
			apiKey: 'abc',
			tagHash: 'abc',
			apiEndpoint: rtiConfig.apiEndpoints.US,
			URIExclusion: 'abc'
		};
		expect(() => rti(options)).toThrow(errorsCodes.errInvalidURIExclusionArray);
		options.URIExclusion = ['/about',2];
		expect(() => rti(options)).toThrow(errorsCodes.errInvalidURIExclusionArray);
	});


	test('should get express handler function', () => {
		const options = {
			apiKey: 'abc',
			tagHash: 'abc',
			apiEndpoint: rtiConfig.apiEndpoints.US,
			URIExclusion: []
		};
		expect(rti(options)).toBeInstanceOf(Function);
	});

});