import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const STUDENT_EMAIL = process.env.STUDENT_EMAIL as string;
const STUDENT_PASSWORD = process.env.STUDENT_PASSWORD as string;
const TUTOR_EMAIL = process.env.TUTOR_EMAIL as string;
const TUTOR_PASSWORD = process.env.TUTOR_PASSWORD as string;

// Helpers
async function goto(page, hashPath: string) {
  await page.goto(BASE + '/' + (hashPath.startsWith('#') ? '' : '#') + hashPath);
}

test.describe('Round 1 - Auth gating and feeds (read-only)', () => {
  test('Student login blocked on wrong role; allowed on correct role', async ({ page }) => {
    test.setTimeout(90_000);
    // Wrong role: set role to tutor but use student creds
    await page.addInitScript(() => localStorage.setItem('pendingRole', 'tutor'));
    await goto(page, '#/login');
    await page.getByLabel('Email address *').fill(STUDENT_EMAIL);
    await page.getByLabel('Password *').fill(STUDENT_PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click();
    // Expect error message about selecting current role
    await expect(page.locator('text=Select your current role')).toBeVisible();

    // Correct role: set role to student
    await page.addInitScript(() => localStorage.setItem('pendingRole', 'student'));
    await goto(page, '#/login');
    await page.getByLabel('Email address *').fill(STUDENT_EMAIL);
    await page.getByLabel('Password *').fill(STUDENT_PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Should land on student feed without flicker
    await expect(page).toHaveURL(/.*#\/feed\/student/);
    await expect(page.locator('h1:text("Find tutors near you")')).toBeVisible();
  });

  test('Tutor login routes to tutor feed and Home redirect is stable', async ({ page, context }) => {
    test.setTimeout(90_000);
    await page.addInitScript(() => localStorage.setItem('pendingRole', 'tutor'));
    await goto(page, '#/login');
    await page.getByLabel('Email address *').fill(TUTOR_EMAIL);
    await page.getByLabel('Password *').fill(TUTOR_PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL(/.*#\/feed\/(tutor|onboarding\/tutor)/);
    // If onboarding, skip the rest of feed assertions
    if ((await page.url()).includes('/#/feed/tutor')) {
      await expect(page.locator('h1:text("Find student requirements near you")')).toBeVisible();
    }

    // Home should stay on tutor feed
    await goto(page, '#/');
    await expect(page).toHaveURL(/.*#\/feed\/tutor/);

    // Public tutors page should redirect back for tutor
    await goto(page, '#/tutors');
    await expect(page).toHaveURL(/.*#\/feed\/tutor/);
  });

  test('Messages deep-link opens header with peer name (student)', async ({ page }) => {
    test.setTimeout(60_000);
    await page.addInitScript(() => localStorage.setItem('pendingRole', 'student'));
    await goto(page, '#/login');
    await page.getByLabel('Email address *').fill(STUDENT_EMAIL);
    await page.getByLabel('Password *').fill(STUDENT_PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/.*#\/feed\/student/);

    // Use legacy numeric peer deep link (resolver supports numeric fallback)
    await goto(page, '#/feed/messages?peer=6&name=tutlabs');
    // Header should show provided name even while resolving
    await expect(page.locator('text=tutlabs')).toBeVisible();
  });
});
