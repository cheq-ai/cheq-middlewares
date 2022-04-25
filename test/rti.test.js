const eventsTypes = require('../lib/constans/eventsTypes')
const { spawn } = require('child_process');
const c = require('centra');
jest.setTimeout(100000)



describe('rti-express middleware', () => {
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

    it(eventsTypes.PAGE_LOAD, done => {
        const message = "Visitor is invalid, session blocked!"
        const expectedResponse = {
            message,
            statusCode: 403
        }

        c(`http://127.0.0.1:${process.env.TEST_SERVER_PORT}/${eventsTypes.PAGE_LOAD}`, 'GET')
            .send()
            .then(res => {
                expect(res.statusCode).toEqual(expectedResponse.statusCode);
                expect(res.body.toString()).toEqual(expectedResponse.message);
                done()
            })
            .catch(e => {
                console.error(e)
            })
    })

    it(`${eventsTypes.CUSTOM} - no callback`, done => {
        const expectedResponse = {
            message: 'Visitor is invalid, session blocked!',
            status: 403
        };
        c(`http://127.0.0.1:${process.env.TEST_SERVER_PORT}/${eventsTypes.PAGE_LOAD}`, 'GET')
            .send()
            .then(res => {
                expect(res.statusCode).toEqual(expectedResponse.status);
                expect(res.body.toString()).toEqual(expectedResponse.message);
                done()
            })
    })
})