const { defineConfig, devices } = require('@playwright/test');
const path = require('path');

process.env.WP_ARTIFACTS_PATH ??= path.join( process.cwd(), 'artifacts' );
process.env.STORAGE_STATE_PATH ??= path.join(
	process.env.WP_ARTIFACTS_PATH,
	'storage-states/admin.json'
);

module.exports = defineConfig({
  testDir: './specs',
  use: {
    baseURL: process.env.WP_BASE_URL || 'http://127.0.0.1:9400',
    storageState: process.env.STORAGE_STATE_PATH,
  },
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.js/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],
});
