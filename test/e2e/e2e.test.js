const { spawn } = require('child_process');
const c = require('centra');
const superagent = require('superagent');
const inject = require('light-my-request')
const eventsTypes = require('../../lib/constans/eventsTypes')
jest.setTimeout(100000);



describe('e2e tests', () =>{

    let server;

    beforeAll(done => {

        server = spawn('node', ['./test/utils/expressServer.js']);
        server.stdout.setEncoding('utf8');
        server.stderr.setEncoding('utf8');

        server.stdout.on('data', function (msg) {
            if (msg.indexOf('test server listening') != -1) {
                done();
            }
        });
        server.stdout.pipe(process.stdout)
        server.stderr.pipe(process.stderr);
    })

    afterAll(done => {
        server.kill()
        done()
    })

    it(eventsTypes.PAGE_LOAD, async () => {
        const message = "suspicious"
        const expectedResponse = {
            message,
            statusCode: 302
        }

        const res = await c(`http://127.0.0.1:${process.env.TEST_SERVER_PORT}/${eventsTypes.PAGE_LOAD}`, 'GET')
            .header({'User-Agent': 'Mozilla/5.0 (platform; rv:geckoversion) Gecko/geckotrail Firefox/firefoxversion'})
            .send()
            .then(res => {
                expect(res.statusCode).toEqual(expectedResponse.statusCode);
                expect(res.body.toString()).toEqual(expectedResponse.message);
            })


    })

    it(`${eventsTypes.CUSTOM} - no callback`,  () => {
        const expectedResponse = {
            message: 'Visitor is invalid, session blocked!',
            status: 403
        };
        return  c(`http://127.0.0.1:${process.env.TEST_SERVER_PORT}/${eventsTypes.PAGE_LOAD}`, 'GET')
            .header({'User-Agent': 'Mozilla/5.0 (platform; rv:geckoversion) Gecko/geckotrail Firefox/firefoxversion'})
            .send()
            .then(res => {
                expect(res.statusCode).toEqual(expectedResponse.status);
                expect(res.body.toString()).toEqual(expectedResponse.message);
            })


    })

})