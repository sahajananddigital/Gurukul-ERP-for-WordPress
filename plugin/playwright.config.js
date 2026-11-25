const { defineConfig, devices } = require( '@playwright/test' );
const path = require( 'path' );

process.env.WP_ARTIFACTS_PATH ??= path.join( process.cwd(), 'artifacts' );
process.env.STORAGE_STATE_PATH ??= path.join(
	process.env.WP_ARTIFACTS_PATH,
	'storage-states/admin.json'
);

module.exports = defineConfig( {
	testDir: './specs',
	use: {
		baseURL: process.env.WP_BASE_URL || 'http://localhost:8889',
	},
	projects: [
		{
			name: 'setup',
			testMatch: /.*\.setup\.js/,
		},
		{
			name: 'chromium',
			use: {
				...devices[ 'Desktop Chrome' ],
				storageState: process.env.STORAGE_STATE_PATH,
			},
			dependencies: [ 'setup' ],
		},
	],
} );
