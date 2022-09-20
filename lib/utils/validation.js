function isObject(obj) {
	return obj instanceof Object && !Array.isArray(obj);
}

function isEmptyObject(obj) {
	if(!isObject(obj)) throwError('not object');
	return Object.keys(obj).length === 0;
}


function throwError(message) {
	throw new Error(message);
}

module.exports = {
	isObject,
	isEmptyObject
};