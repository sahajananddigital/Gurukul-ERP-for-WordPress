import { test as setup, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

setup( 'authenticate', async ( { page } ) => {
	const baseURL = process.env.WP_BASE_URL || 'http://localhost:8889';
	await page.goto( baseURL + '/wp-login.php' );
	await page.fill( '#user_login', 'admin' );
	await page.fill( '#user_pass', 'password' );
	await page.click( '#wp-submit' );
	await expect( page.locator( '#wpadminbar' ) ).toBeVisible( { timeout: 15000 } );

	const storageStatePath =
		process.env.STORAGE_STATE_PATH ||
		path.join( process.cwd(), 'artifacts', 'storage-states', 'admin.json' );
	fs.mkdirSync( path.dirname( storageStatePath ), { recursive: true } );
	await page.context().storageState( { path: storageStatePath } );
} );
