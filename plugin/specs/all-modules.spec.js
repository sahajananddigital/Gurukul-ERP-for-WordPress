import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe( 'Check all ERP Modules Render Successfully', () => {
    test.beforeAll( async ( { requestUtils } ) => {
        // Any setup if needed
    } );

    test( 'should navigate to every module without errors', async ( { admin, page } ) => {
        // Start at the SPA root
        await admin.visitAdminPage( 'admin.php?page=sahajanand-erp-app' );
        
        // Wait for the app root to be visible
        await expect( page.locator( '#sahajanand-erp-root' ) ).toBeVisible();

        const modules = [
            { btn: 'Dashboard', expectedH1: 'Dashboard' },
            { btn: 'CRM', expectedH1: 'CRM Management' },
            { btn: 'Accounting', expectedH1: 'Accounting' },
            { btn: 'HR', expectedH1: 'HR Management' },
            { btn: 'Helpdesk', expectedH1: 'Helpdesk Management' },
            { btn: 'Vouchers', expectedH1: 'Voucher Management' },
            { btn: 'Invoices', expectedH1: 'Invoice Management' },
            { btn: 'Expenses', expectedH1: 'Expense Management' },
        ];

        for ( const mod of modules ) {
            console.log(`Testing ${mod.btn} module...`);
            await page.getByRole('button', { name: mod.btn, }).click();
            
            // Wait for the h1 to appear, proving the module rendered successfully
            const heading = page.locator(`h1:has-text("${mod.expectedH1}")`);
            await expect( heading ).toBeVisible();
        }

        // Test Addons if they are active (Gurukul Addon)
        const donationsBtn = page.getByRole('button', { name: 'Donations', });
        if ( await donationsBtn.isVisible() ) {
            await donationsBtn.click();
            await expect( page.locator('h1:has-text("Donations")') ).toBeVisible();
        }

        const foodPassBtn = page.getByRole('button', { name: 'Food Pass', });
        if ( await foodPassBtn.isVisible() ) {
            await foodPassBtn.click();
            await expect( page.locator('h1:has-text("Food Pass Management")') ).toBeVisible();
        }
        
        const contentBtn = page.getByRole('button', { name: 'Content (Darshan)', });
        if ( await contentBtn.isVisible() ) {
            await contentBtn.click();
            await expect( page.locator('h1:has-text("Content")') ).toBeVisible(); // Just use "Content" to be safe
        }
    } );
} );
