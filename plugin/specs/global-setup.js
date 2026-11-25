const { chromium } = require( '@playwright/test' );
const fs = require( 'fs/promises' );
const path = require( 'path' );

/**
 * Global setup for Playwright E2E tests using WP Playground / WordPress.
 *
 * @param {import('@playwright/test').FullConfig} config Full Playwright config.
 */
module.exports = async function globalSetup( config ) {
	let baseURL = process.env.WP_BASE_URL || config.projects?.[ 0 ]?.use?.baseURL || 'http://127.0.0.1:9400';
	if ( baseURL.includes( 'localhost:8889' ) ) {
		baseURL = 'http://127.0.0.1:9400';
		process.env.WP_BASE_URL = baseURL;
	}
	const storageState = config.projects?.[ 0 ]?.use?.storageState || process.env.STORAGE_STATE_PATH;
	const browser = await chromium.launch( { headless: true } );
	const page = await browser.newPage( { baseURL } );

	try {
		let ready = false;
		for ( let attempt = 0; attempt < 30; attempt++ ) {
			try {
				const res = await page.goto( '/wp-login.php', { waitUntil: 'domcontentloaded', timeout: 10000 } );
				if ( res && res.status() < 500 ) {
					ready = true;
					break;
				}
			} catch {
				// Server still booting
			}
			await new Promise( ( resolve ) => setTimeout( resolve, 2000 ) );
		}

		if ( ! ready ) {
			throw new Error( `WordPress Playground at ${ baseURL } did not respond within 60s` );
		}

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
