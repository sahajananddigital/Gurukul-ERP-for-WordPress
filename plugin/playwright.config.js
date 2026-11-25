const path = require( 'path' );
const { defineConfig, devices } = require( '@playwright/test' );

process.env.WP_ARTIFACTS_PATH ??= path.join( process.cwd(), 'artifacts' );
process.env.STORAGE_STATE_PATH ??= path.join(
	process.env.WP_ARTIFACTS_PATH,
	'storage-states/admin.json'
);

const baseUrl = process.env.WP_BASE_URL || 'http://127.0.0.1:9400';

module.exports = defineConfig( {
	testDir: './specs',
	timeout: 100_000,
	workers: 1,
	globalSetup: require.resolve( './specs/global-setup.js' ),
	use: {
		baseURL: baseUrl,
		headless: true,
		storageState: process.env.STORAGE_STATE_PATH,
		actionTimeout: 15_000,
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure',
		video: 'on-first-retry',
	},
	webServer: {
		command:
			'node ./node_modules/@wp-playground/cli/cli.js server --port 9400 --login --blueprint blueprint.json --mount .:/wordpress/wp-content/plugins/plugin --mount ../addons/gurukul-addon:/wordpress/wp-content/plugins/gurukul-addon',
		url: 'http://127.0.0.1:9400',
		timeout: 120_000,
		reuseExistingServer: ! process.env.CI,
		stdout: 'pipe',
		stderr: 'pipe',
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
