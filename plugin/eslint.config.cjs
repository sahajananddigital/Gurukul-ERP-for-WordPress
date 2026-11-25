const wpPlugin = require( '@wordpress/eslint-plugin' );
const globals = require( 'globals' );

module.exports = [
	{
		ignores: [
			'**/build/**',
			'**/node_modules/**',
			'**/vendor/**',
			'**/coverage/**',
			'**/artifacts/**',
		],
	},
	{
		files: [ '**/*.{js,jsx,ts,tsx,cjs,mjs}' ],
	},
	...wpPlugin.configs.recommended,
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
				sahajanandErp: 'readonly',
			},
		},
		rules: {
			'prettier/prettier': 'off',
			'no-console': 'warn',
			'no-alert': 'warn',
			'no-redeclare': 'off',
			'import/no-extraneous-dependencies': 'off',
			'no-unused-vars': [
				'warn',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
			],
			'@wordpress/no-unsafe-wp-apis': 'warn',
			'@wordpress/i18n-ellipsis': 'off',
			'jsx-a11y/label-has-associated-control': 'off',
			'no-nested-ternary': 'off',
			curly: 'warn',
		},
	},
	{
		files: [
			'**/tests/**/*.{js,jsx,ts,tsx}',
			'**/*.test.{js,jsx,ts,tsx}',
			'**/specs/**/*.{js,jsx,ts,tsx}',
			'**/*.spec.{js,jsx,ts,tsx}',
		],
		languageOptions: {
			globals: {
				...globals.jest,
			},
		},
		rules: {
			'no-undef': 'off',
			'no-unused-vars': 'off',
		},
	},
];
