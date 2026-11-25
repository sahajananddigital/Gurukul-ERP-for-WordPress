const { chromium } = require( '@playwright/test' );
const fs = require( 'fs/promises' );
const path = require( 'path' );

/**
 * Global setup for Playwright E2E tests using WP Playground / WordPress.
 *
 * @param {import('@playwright/test').FullConfig} config Full Playwright config.
 */
module.exports = async function globalSetup( config ) {
	const { baseURL, storageState } = config.projects[ 0 ].use;
	const browser = await chromium.launch( { headless: true } );
	const page = await browser.newPage( { baseURL } );

	try {
		await page.goto( '/wp-login.php', { waitUntil: 'domcontentloaded', timeout: 30000 } ).catch( () => {} );
		const isLoginFormVisible = await page
			.locator( '#user_login' )
			.isVisible( { timeout: 3000 } )
			.catch( () => false );

		if ( isLoginFormVisible ) {
			await page.fill( '#user_login', 'admin' );
			await page.fill( '#user_pass', 'password' );
			await page.click( '#wp-submit' );
			await page.waitForURL( /wp-admin/, { timeout: 30000 } ).catch( () => {} );
		}

		if ( storageState ) {
			await fs.mkdir( path.dirname( storageState ), { recursive: true } );
			await page.context().storageState( { path: storageState } );
		}
	} finally {
		await browser.close();
	}
};
