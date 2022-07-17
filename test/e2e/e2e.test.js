const { spawn } = require('child_process');
const Request = require('../../lib/utils/http');
const { eventsTypes, rtiMode } = require('../../lib/constans/rti');
jest.setTimeout(100000);
jest.useFakeTimers();


describe('e2e tests', () =>{

	let server, request;

	beforeAll(done => {

		server = spawn('node', ['./test/utils/expressServer.js', rtiMode.BLOCKING]);
		server.stdout.setEncoding('utf8');
		server.stderr.setEncoding('utf8');

		server.stdout.on('data', function (msg) {
			if (msg.indexOf('test server listening') !== -1) {
				done();
			}
		});
		server.stdout.pipe(process.stdout);
		server.stderr.pipe(process.stderr);
	});

	beforeEach(done => {
		request = new Request(`http://127.0.0.1:${process.env.TEST_SERVER_PORT}/${eventsTypes.PAGE_LOAD}`, 'GET');
		done();
	});

	afterAll(done => {
		server.kill();
		done();
	});

	test(eventsTypes.PAGE_LOAD, () => {
		const message = 'suspicious';
		const expectedResponse = {
			message,
			statusCode: 302
		};

		return request
			.header({'User-Agent': 'Mozilla/5.0 (iPod; CPU iPhone OS 15_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/103.0.5060.63 Mobile/15E148 Safari/604.1'})
			.send()
			.then(res => {
				expect(res.statusCode).toEqual(expectedResponse.statusCode);
				expect(res.data.toString()).toEqual(expectedResponse.message);
			});
	});

	test(`${eventsTypes.PAGE_LOAD} - datacenter ip`,  () => {
		const expectedResponse = {
			// message: 'Visitor is invalid, session blocked!',
			message: 'suspicious',
			status: 302
		};
		return request
			.header({
				'User-Agent': 'Mozilla/5.0 (platform; rv:geckoversion) Gecko/geckotrail Firefox/firefoxversion',
				'Remote-Addr': '64.233.161.18'
			})
			.timeout(3000)
			.send()
			.then(res => {
				expect(res.statusCode).toEqual(expectedResponse.status);
				expect(res.data.toString()).toEqual(expectedResponse.message);
			});
	});

	test(`${eventsTypes.PAGE_LOAD} - valid request`,  () => {
		const expectedResponse = {
			message: 'Hello from CHEQ',
			status: 200
		};
		return request
			.send()
			.then(res => {
				expect(res.statusCode).toEqual(expectedResponse.status);
				expect(res.data.message.toString()).toEqual(expectedResponse.message);
			});
	});

});