import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe('Plugin Activation', () => {
	test('should activate the plugin and show the Gurukul ERP menu', async ({ admin, page }) => {
		// Login and visit plugins page
		await admin.visitAdminPage('plugins.php');
		
		// If the plugin is not active, activate it.
		// Note: wp-env usually activates plugins defined in .wp-env.json automatically,
		// but we can check if the menu item exists first.

		// Visit the dashboard to see if the menu item is present
		await admin.visitAdminPage('index.php');

		// The menu should be visible in the admin sidebar.
		// WordPress usually assigns an ID to top-level menu items based on the menu slug.
		// For Gurukul ERP, the slug is 'wp-erp-crm', but let's just look for the text.
		const erpMenu = page.locator('#adminmenu').getByText('Gurukul ERP');
		
		// Wait for the menu item to be visible, ensuring it loaded successfully.
		await expect(erpMenu).toBeVisible();

		// Click the menu item to ensure it loads without fatal PHP errors
		await erpMenu.click();

		// Expect the page title to contain our plugin name or settings
		const pageTitle = page.locator('h1');
		await expect(pageTitle).toContainText('CRM');
	});
});
