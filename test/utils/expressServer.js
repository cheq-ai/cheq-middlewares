const express = require('express');
const cookieParser = require('cookie-parser');
const {rti: rtiExpressMiddleware} = require('../../lib/middlewares');
const eventsTypes = require('../../lib/constans/eventsTypes')


// function server(options = {}) {
    const options = {};
    const app = express();
    // console.log(options.message)
    const rtiMiddleware  = rtiExpressMiddleware({apiKey: process.env.CHEQ_API_KEY, tagHash: process.env.CHEQ_TAG_HASH, callback: (req, res, next) => res.status(302).send('suspicious'), ...options });

    app.use(cookieParser())

    app.get('/', (req, res) => {
        res.send('test')
    })

    app.get(`/${eventsTypes.PAGE_LOAD}`, rtiMiddleware(eventsTypes.PAGE_LOAD), (req, res) => {
        res.send('Hello from CHEQ')
    })

    app.get(`/${eventsTypes.FORM_SUBMISSION}`, rtiMiddleware(eventsTypes.FORM_SUBMISSION), (req, res) => {
        res.send('Successfully submitted')
    })

    app.listen(process.env.TEST_SERVER_PORT, () => {
        process.stdout.write(`test server listening on port ${process.env.TEST_SERVER_PORT}`)
    })
// }





