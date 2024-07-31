const express = require('express');
const {rti: rtiExpressMiddleware} = require('../../lib/middlewares');
const {eventsTypes} = require('../../lib/constans/rti');

const app = express();

const rtiMiddleware = rtiExpressMiddleware({
	apiKey: process.env.CHEQ_API_KEY,
	tagHash: process.env.CHEQ_TAG_HASH,
	apiEndpoint: process.env.CHEQ_API_ENDPOINT,
	mode: process.argv[process.argv.length - 1],
	trustedIPHeader: 'Trusted-IP-Header',
	callback: (req, res) => {
		res.status(302).send('suspicious');
	}
});

app.use((req, res, next) => {
	next();
});

app.get('/', (req, res) => {
	res.send('test');
});

app.get(`/${eventsTypes.PAGE_LOAD}`, rtiMiddleware(eventsTypes.PAGE_LOAD), (req, res) => {
	res.send({message: 'Hello from CHEQ'});
});

app.get(`/${eventsTypes.FORM_SUBMISSION}`, rtiMiddleware(eventsTypes.FORM_SUBMISSION), (req, res) => {
	res.send('Successfully submitted');
});

app.listen(process.env.TEST_SERVER_PORT, '0.0.0.0', () => {
	process.stdout.write(`test server listening on port ${process.env.TEST_SERVER_PORT}`);
});

