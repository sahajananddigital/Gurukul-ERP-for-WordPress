const path = require( 'path' );
const { defineConfig, devices } = require( '@playwright/test' );

process.env.WP_ARTIFACTS_PATH ??= path.join( process.cwd(), 'artifacts' );
process.env.STORAGE_STATE_PATH ??= path.join(
	process.env.WP_ARTIFACTS_PATH,
	'storage-states/admin.json'
);

const baseUrl = process.env.WP_BASE_URL || 'http://localhost:8889';

module.exports = defineConfig( {
	testDir: './specs',
	timeout: 100_000,
	globalSetup: require.resolve(
		'@wordpress/scripts/config/playwright/global-setup.js'
	),
	use: {
		baseURL: baseUrl,
		headless: true,
		storageState: process.env.STORAGE_STATE_PATH,
		actionTimeout: 15_000,
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure',
		video: 'on-first-retry',
	},
	projects: [
		{
			name: 'chromium',
			use: {
				...devices[ 'Desktop Chrome' ],
				baseURL: baseUrl,
				storageState: process.env.STORAGE_STATE_PATH,
			},
		},
	],
} );
