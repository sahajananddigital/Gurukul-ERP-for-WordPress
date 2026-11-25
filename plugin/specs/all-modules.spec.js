import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe( 'Check all ERP Modules Render Successfully', () => {
    test( 'should navigate to every module without errors', async ( { admin, page } ) => {
        // Start at the SPA root
        await admin.visitAdminPage( 'admin.php?page=sahajanand-erp-app' );
        
        // Wait for the app root to be visible and React to render
        await expect( page.locator( '#sahajanand-erp-root' ) ).toBeVisible();
        await expect( page.getByRole( 'heading', { name: /Dashboard/i } ) ).toBeVisible( { timeout: 15000 } );

        const modules = [
            { btn: 'CRM', expectedH1: 'CRM Management' },
            { btn: 'Accounting', expectedH1: 'Accounting' },
            { btn: 'HR', expectedH1: 'HR Management' },
            { btn: 'Helpdesk', expectedH1: 'Sahajanand Digital Dashboard' },
            { btn: 'Dashboard', expectedH1: 'Dashboard' },
        ];

        for ( const mod of modules ) {
            await page.getByRole('button', { name: mod.btn, }).click();
            
            // Wait for the h1 to appear, proving the module rendered successfully
            const heading = page.locator(`h1:has-text("${mod.expectedH1}")`).first();
            await expect( heading ).toBeVisible();
        }

        // Test Addons if they are active (Gurukul Addon)
        const donationsBtn = page.getByRole('button', { name: 'Donations', });
        if ( await donationsBtn.isVisible() ) {
            await donationsBtn.click();
            await expect( page.locator('h1:has-text("Donations")').first() ).toBeVisible();
        }

        const foodPassBtn = page.getByRole('button', { name: 'Food Pass', });
        if ( await foodPassBtn.isVisible() ) {
            await foodPassBtn.click();
            await expect( page.locator('h1:has-text("Food Pass Management")').first() ).toBeVisible();
        }
        
        const contentBtn = page.getByRole('button', { name: 'Content (Darshan)', });
        if ( await contentBtn.isVisible() ) {
            await contentBtn.click();
            await expect( page.locator('h1:has-text("Content")').first() ).toBeVisible(); // Just use "Content" to be safe
        }
    } );
} );
