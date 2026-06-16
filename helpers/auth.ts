import { Page } from '@playwright/test';
import path from 'path';

export const AUTH_STATE_PATH = path.join(process.cwd(), '.auth/user.json');

export async function login(page: Page): Promise<void> {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  await page.getByRole('textbox', { name: /username|email/i }).fill(process.env.TEST_USER_EMAIL ?? '');
  // Use role=textbox to avoid matching the "Show password" toggle button
  await page.getByRole('textbox', { name: 'Password' }).fill(process.env.TEST_USER_PASSWORD ?? '');
  await page.getByRole('button', { name: /log in|sign in/i }).click();

  // Wait for navigation away from the login page
  await page.waitForURL((url) => !url.href.includes('login') && !url.href.includes('wp-login'));
}
