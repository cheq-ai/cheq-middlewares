const http = require('../../utils/http')
const config = require('../../../config');
const eventsTypes = require('../../constans/eventsTypes')
const {rtiRequestBuilder} = require('../../utils/requestBuilder')
const rtiMode = {
    MONITOR: 'monitor',
    BLOCKING: 'blocking'
}
const rtiActions = {
    blockRedirect: [2,3,6,7,10,11,16,18],
    captcha: [4, 5, 13, 14, 15, 17]
}

function rti(options) {
    if(typeof options != 'object'  || !options) {
        throw new Error('invalid params');
    }

    const {apiKey, tagHash, mode} = options;

    if(!apiKey) {
        throw new Error('missing apiKey');
    }

    if(!tagHash) {
        throw new Error('missing tagHash');
    }

    if (!mode) {
        options.mode = rtiMode.MONITOR;
    }

    return function (eventType) {
        return handler(eventType, options)
    }
}



function handler(eventType, params) {
    return async function (req, res, next) {

        try {
            const timeoutPromise = promiseRace(params.timeout || config.rtiTimeout)
            const rtiPromise = http({
                url:config.baseApi,
                method: 'POST',
                path: `/${params.version || config.defaultApiVersion}/${config.rtiPath}`,
                body: rtiRequestBuilder(req, eventType, params),
                type: 'form'})

            const rtiRes =  await Promise.race([rtiPromise, timeoutPromise])
            handleRTIResponse(rtiRes.data, req, res, next, params);
        } catch(e) {
            console.error(e)
            next();
        }
    }
}



function handleRTIResponse(data, req, res, next, params) {
    res.locals.reason = JSON.stringify(data)
    if(!data || !data.threatTypeCode || typeof data.isInvalid !== 'boolean' || params.mode === rtiMode.MONITOR) {
        next();
    }
    else if(rtiActions.blockRedirect.includes(data.threatTypeCode) && data.isInvalid && params.mode === rtiMode.BLOCKING) {
        if(params.redirectUrl) {
            res.redirect(params.redirectUrl);
        } else {
            res.status(403).send('Visitor is invalid, session blocked!');
        }
    }
    else if(rtiActions.captcha.includes(data.threatTypeCode) && data.isInvalid && params.mode === rtiMode.BLOCKING && params.callback instanceof Function) {
        params.callback(req, res, next);
    }
    else {
        next();
    }

}

function promiseRace(timeout){
    return new Promise((resolve, reject) => setTimeout(() => {reject(`timeout from ${config.baseApi}`);}, timeout))
}

module.exports = rti;
