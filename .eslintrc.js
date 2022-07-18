module.exports = {
	'env': {
		'node': true,
		'commonjs': true,
		'es2021': true,
		'jest/globals': true
	},
	'plugins': ['jest'],
	'extends': 'eslint:recommended',
	'parserOptions': {
		'ecmaVersion': 12
	},
	'rules': {
		'indent': [
			'error',
			'tab',
		],
		'linebreak-style': [
			'error',
			'unix'
		],
		'quotes': [
			'error',
			'single'
		],
		'semi': [
			'error',
			'always'
		]
	}
};