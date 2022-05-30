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
    const {apiKey, tagHash, mode} = options;
    if(typeof options != 'object'  || !options) {
        throw new Error('invalid params');
    }

    if(!apiKey) {
        throw new Error('missing apiKey');
    }

    if(tagHash) {
        throw new Error('missing tagHash');
    }

    if (mode) {
        options.mode = rtiMode.BLOCKING;
    }

    return function (eventType) {
        return handler(eventType, options)
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
            next();
        }
    }
}



function handleRTIResponse(data, res, next, prams, callback) {
    if(!data || !data.threatTypeCode || typeof data.isInvalid !== 'boolean' || prams.mode === rtiMode.MONITOR) {
        next();
    }
    else if(rtiActions.blockRedirects.includes(data.threatTypeCode) && prams.mode === rtiMode.BLOCKING) {
        if(prams.redirectUrl) {
            res.redirect(prams.redirectUrl);
        } else {
            res.status(403).send('Visitor is invalid, session blocked!');
        }
    }
    else if(rtiActions.captcha.includes(data.threatTypeCode) && prams.mode === rtiMode.BLOCKING) {
        callback(data);
    }
    else {
        next();
    }

}



module.exports = rti;