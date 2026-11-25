/**
 * Jest configuration for WordPress ERP
 */
module.exports = {
	testEnvironment: 'jsdom',
	setupFilesAfterEnv: [ '<rootDir>/tests/setup.js' ],
	moduleNameMapper: {
		'^@wordpress/components$':
			'<rootDir>/tests/mocks/wordpress-components.js',
		'^@wordpress/dataviews$': '<rootDir>/tests/mocks/wordpress-dataviews.js',
		'^@wordpress/icons$': '<rootDir>/tests/mocks/wordpress-icons.js',
		'^@wordpress/element$': '<rootDir>/node_modules/@wordpress/element',
		'^@wordpress/i18n$': '<rootDir>/node_modules/@wordpress/i18n',
		'^@wordpress/api-fetch$': '<rootDir>/node_modules/@wordpress/api-fetch',
		'^@wordpress/(.*)$': '<rootDir>/node_modules/@wordpress/$1',
		'\\.(css|less|scss)$': '<rootDir>/tests/mocks/styleMock.js',
	},
	transform: {
		'^.+\\.[jt]sx?$': 'babel-jest',
	},
	transformIgnorePatterns: [
		'/node_modules/(?!(@wordpress|@babel/runtime)/)',
	],
	testMatch: [ '**/tests/**/*.test.js', '**/tests/**/*.test.jsx' ],
	testPathIgnorePatterns: [ '/node_modules/', '/build/', '/vendor/' ],
	collectCoverageFrom: [
		'src/modules/helpdesk/**/*.{js,jsx}',
		'!src/**/*.test.{js,jsx}',
	],
	coverageDirectory: 'coverage/js',
	coverageReporters: [ 'text', 'text-summary', 'lcov', 'html' ],
	coverageThreshold: {
		'./src/modules/helpdesk/': {
			branches: 45,
			functions: 45,
			lines: 55,
			statements: 55,
		},
	},
};
