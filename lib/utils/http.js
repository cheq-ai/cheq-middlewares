const c = require('centra');

module.exports = async ({method, url, path = '/', body, type, timeout}) => {
    const res = await c(url, method).path(path).body(body, type).timeout(timeout).send();

    return Object.assign(res, {data: res.headers["content-type"].split(';').includes('application/json') ? JSON.parse(res.body) : res.body.toString()})
}