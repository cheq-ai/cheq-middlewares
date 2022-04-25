const http = require('../../utils/http')
const config = require('../../../config');
const eventsTypes = require('../../constans/eventsTypes')
const {rtiRequestBuilder} = require('../../utils/requestBuilder')
const rtiMode = {
    MONITOR: 'monitor',
    BLOCKING: 'blocking'
}
const rtiActions = {
    blockRedirects: [2,3,6,7,10,11,16,18],
    captcha: [4, 5, 13, 14, 15, 17]
}

function  rtiExpressMiddleware(params) {
        if(typeof params != 'object'  || !params) {
            throw new Error('invalid params');
        }

        if(!params.hasOwnProperty('apiKey')) {
            throw new Error('missing apiKey');
        }

        if(!params.hasOwnProperty('tagHash')) {
            throw new Error('missing tagHash');
        }

        if(!params.hasOwnProperty('mode')) {
            params.mode = rtiMode.MONITOR;
        }

        if(!params.hasOwnProperty('logger')) {
            params.logger = console;
        }


        return function (eventType) {
            return handler(eventType, params)
        }
    }





function handler(eventType, params) {
    return async function (req, res, next) {
        const callback = params.callback || next
        try {
            const rtiRes =  await http({
                url:config.baseApi,
                method: 'POST',
                path: `/${params.version || config.defaultApiVersion}/${config.rtiPath}`,
                timeout: params.timeout || config.rtiTimeout,
                body: rtiRequestBuilder(req, eventType, params),
                type: 'form'})
            handleRTIResponse(rtiRes.data, res, next, params, callback);
        } catch(e) {
            params.logger.warn(e);
            next();
        }
    }
}



function handleRTIResponse(data, res, next, prams, callback) {
    if(!data || !data.threatTypeCode || typeof data.isInvalid !== 'boolean' || prams.mode === rtiMode.MONITOR) {
        next();
        return;
    }

    if(rtiActions.blockRedirects.includes(data.threatTypeCode)) {
        if(prams.redirectUrl) {
            res.redirect(prams.redirectUrl);
            return;
        } else {
            res.status(403).send('Visitor is invalid, session blocked!')
            return;
        }
    }
    if(rtiActions.captcha.includes(data.threatTypeCode)) {
        callback(data);
    }
    next();


}



module.exports = rtiExpressMiddleware;