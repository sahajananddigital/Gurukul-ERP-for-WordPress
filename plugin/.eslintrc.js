module.exports = {
	extends: [ 'plugin:@wordpress/eslint-plugin/recommended' ],
	env: {
		browser: true,
		es6: true,
		node: true,
		jest: true,
	},
	parserOptions: {
		ecmaVersion: 2018,
		sourceType: 'module',
		ecmaFeatures: {
			jsx: true,
		},
	},
	globals: {
		sahajanandErp: 'readonly',
	},
	rules: {
		'@wordpress/no-unsafe-wp-apis': 'warn',
	},
};
