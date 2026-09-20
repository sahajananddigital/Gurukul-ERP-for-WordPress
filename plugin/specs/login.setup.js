import { test as setup, expect } from '@playwright/test';

setup('authenticate', async ({ page }) => {
  await page.goto(process.env.WP_BASE_URL + '/wp-login.php');
  await page.fill('#user_login', 'admin');
  await page.fill('#user_pass', 'password');
  await page.click('#wp-submit');
  await expect(page.locator('#wpadminbar')).toBeVisible({ timeout: 10000 });
  
  await page.context().storageState({ path: process.env.STORAGE_STATE_PATH });
});
