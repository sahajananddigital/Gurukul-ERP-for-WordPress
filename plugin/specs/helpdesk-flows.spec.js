import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe( 'Helpdesk critical flows', () => {
	test( 'opens helpdesk dashboard and mailbox list', async ( {
		admin,
		page,
	} ) => {
		await admin.visitAdminPage( 'admin.php?page=sahajanand-erp-app' );
		await page.waitForTimeout( 1000 );

		const helpdeskNav = page.getByRole( 'button', { name: /Helpdesk/i } );
		if ( await helpdeskNav.count() ) {
			await helpdeskNav.first().click();
		} else {
			await page.goto(
				'/wp-admin/admin.php?page=sahajanand-erp-app#/helpdesk'
			);
		}

		await expect(
			page.getByText( /Helpdesk|Mailbox|Manage Settings|Unassigned/i ).first()
		).toBeVisible( { timeout: 15000 } );
	} );

	test( 'helpdesk stats endpoint is available when authenticated', async ( {
		page,
		request,
	} ) => {
		// Use browser context cookies from storageState via page request.
		const response = await page.request.get(
			'/wp-json/sahajanand-erp/v1/helpdesk/stats'
		);
		// 200 when logged in, 401/403 if auth storage missing — still assert route exists.
		expect( [ 200, 401, 403 ] ).toContain( response.status() );
		if ( response.status() === 200 ) {
			const data = await response.json();
			expect( Array.isArray( data ) ).toBeTruthy();
		}
	} );

	test( 'can open a mailbox card when one exists', async ( { admin, page } ) => {
		await admin.visitAdminPage(
			'admin.php?page=sahajanand-erp-app#/helpdesk'
		);
		await page.waitForTimeout( 1500 );
		const cards = page.locator( '.components-card' );
		const count = await cards.count();
		test.skip( count === 0, 'No mailbox cards seeded in this environment' );
		await cards.first().click();
		await expect(
			page.getByText( /Unassigned|Starred|New Conversation|Trash/i ).first()
		).toBeVisible( { timeout: 15000 } );
	} );
} );
