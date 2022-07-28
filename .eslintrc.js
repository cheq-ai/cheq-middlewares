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
		],
		'no-multiple-empty-lines': [
			'error',
			{
				'max': 2,
				'maxEOF': 2,
				'maxBOF': 0
			}
		]
	}
};
