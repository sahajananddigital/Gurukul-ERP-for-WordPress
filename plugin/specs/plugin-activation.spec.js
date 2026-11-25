import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe('Plugin Activation', () => {
	test('should activate the plugin and show the Sahajanand ERP menu', async ({ admin, page }) => {
		// Login and visit plugins page
		await admin.visitAdminPage('plugins.php');
		
		const activateLink = page.locator('tr[data-plugin*="sahajanand-erp"] .activate a');
		if ( await activateLink.isVisible().catch(() => false) ) {
			await activateLink.click();
		}

		// Visit the dashboard to see if the menu item is present
		await admin.visitAdminPage('index.php');

		// The menu should be visible in the admin sidebar.
		const erpMenu = page.locator('#adminmenu').getByText('Sahajanand ERP');
		
		// Wait for the menu item to be visible, ensuring it loaded successfully.
		await expect(erpMenu).toBeVisible();

		// Click the menu item to ensure it loads without fatal PHP errors
		await erpMenu.click();

		// Expect the page title to contain our plugin name or dashboard
		const pageTitle = page.locator('#sahajanand-erp-root h1, #wpbody-content h1').first();
		await expect(pageTitle).toContainText(/Dashboard|CRM|Sahajanand/);
	});
});
