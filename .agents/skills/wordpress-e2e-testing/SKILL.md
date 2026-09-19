---
name: wordpress-e2e-testing
description: >-
  Use this skill when writing or running End-to-End (E2E) tests for the WordPress plugin.
  It provides instructions on using @wordpress/env and @wordpress/scripts test-e2e (Playwright).
---

# WordPress End-to-End (E2E) Testing

We use the official WordPress tooling for E2E testing to ensure the plugin's SPA and API function correctly in a real environment.

## 1. The Environment (`@wordpress/env`)

`@wordpress/env` spins up a local Dockerized WordPress instance.
- **Start**: `npx wp-env start` (or `npm run wp-env start` if configured).
- **Stop**: `npx wp-env stop`
- **Config**: The `.wp-env.json` file in the plugin directory configures the environment (e.g., PHP version, mapped plugins).

*Note: Ensure Docker is running before starting the environment.*

## 2. Running Tests (`@wordpress/scripts`)

The `@wordpress/scripts` package provides the `test-e2e` script, which internally runs Playwright.

- **Command**: `npm run test:e2e` (maps to `wp-scripts test-e2e`).
- **Location**: Test files should be placed in `plugin/tests/e2e/` and named `*.spec.js` or `*.spec.ts`.

## 3. Writing Tests (Playwright)

Since `@wordpress/scripts` uses Playwright under the hood for E2E tests, write tests using the standard Playwright API. `@wordpress/e2e-test-utils-playwright` provides helpful WordPress-specific utilities.

### Example Test Structure
```javascript
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe( 'Plugin SPA Navigation', () => {
    test.beforeAll( async ( { requestUtils } ) => {
        // Setup: e.g., create dummy data via REST API
    } );

    test( 'should load the FSE UI and hide default WP menus', async ( { admin, page } ) => {
        // 1. Visit the custom plugin admin page
        await admin.visitAdminPage( 'admin.php?page=wp-erp-app' );
        
        // 2. Verify default menus are hidden (CSS check)
        const adminMenu = page.locator( '#adminmenuwrap' );
        await expect( adminMenu ).toBeHidden();

        // 3. Verify our React SPA is mounted
        const appRoot = page.locator( '#wp-erp-root' );
        await expect( appRoot ).toBeVisible();
        
        // 4. Verify sidebar navigation works
        await page.getByRole('link', { name: 'Accounting' }).click();
        await expect( page.getByRole('heading', { name: 'Accounting Dashboard' }) ).toBeVisible();
    } );
} );
```

## 4. Best Practices
- **Data Setup**: Use `requestUtils` (REST API) to set up test data (posts, options) rather than clicking through the UI to create data, keeping tests fast and focused.
- **Isolation**: Each test should be independent. Clean up data if necessary, though `wp-env` provides a clean slate.
- **Selectors**: Prefer user-facing selectors like `getByRole`, `getByText`, or `getByLabel` over CSS selectors or test IDs, ensuring the UI is accessible.
