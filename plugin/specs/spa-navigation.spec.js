import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe( 'FSE SPA Navigation and Layout', () => {
	test( 'should load the FSE UI and hide default WP menus', async ( { admin, page } ) => {
		// 1. Visit the custom plugin admin page
		await admin.visitAdminPage( 'admin.php?page=sahajanand-erp-app' );
		
		// 2. Verify default menus are hidden (we check if it's hidden by CSS)
		const adminMenuWrap = page.locator( '#adminmenuwrap' );
		await expect( adminMenuWrap ).toBeHidden();

		const wpAdminBar = page.locator( '#wpadminbar' );
		await expect( wpAdminBar ).toBeHidden();

		// 3. Verify our React SPA is mounted
		const appRoot = page.locator( '#sahajanand-erp-root' );
		await expect( appRoot ).toBeVisible();
		
		// 4. Verify sidebar navigation works and content renders
		// By default it should redirect to dashboard
		await expect( page.getByRole('heading', { name: 'Dashboard' }) ).toBeVisible();

		// Navigate to CRM
		await page.getByRole('button', { name: 'CRM' }).click();
		await expect( page.getByRole('heading', { name: 'CRM Management' }) ).toBeVisible();

		// Navigate to Accounting
		await page.getByRole('button', { name: 'Accounting' }).click();
		// We expect the URL to change
		await expect( page ).toHaveURL( /#\/accounting/ );
	} );
} );
