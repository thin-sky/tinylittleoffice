import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { link } from './link.ts';

test('recipe fields update results, survive a fresh link, and remain accessible', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Recipe card', exact: true }).click();
  const flour = page.locator('.sky-field').filter({ has: page.locator('span', { hasText: /^Flour$/ }) });
  await expect(flour.locator('output')).toHaveText('300');
  await page.getByRole('spinbutton', { name: /^Wanted servings/ }).fill('6');
  await expect(flour.locator('output')).toHaveText('450');
  await page.getByRole('spinbutton', { name: /^Wanted servings/ }).blur();
  await page.getByRole('checkbox', { name: 'Mix the batter.' }).check();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const shell = document.querySelector('to-shell') as HTMLElement & { flushLink?: () => void };
        shell?.flushLink?.();
        return location.hash;
      }),
    )
    .toContain('/worksheet/');
  // The shell flushes pending text before the link is read through its public route helper.
  const updated = await link(page);
  await page.goto(updated);
  await page.reload();
  await expect(flour.locator('output')).toHaveText('450');
  await expect(page.getByRole('checkbox', { name: 'Mix the batter.' })).toBeChecked();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).disableRules(['meta-viewport']).analyze()).violations).toEqual([]);
});

test('Toki Pona practice reveals, retries, reverses and keeps progress out of the URL', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Toki Pona · first words', exact: true }).click();
  await expect(page.locator('.sky-study-prompt')).toHaveText('toki');
  const original = page.url();
  await page.getByRole('button', { name: 'Reveal answer', exact: true }).click();
  await expect(page.locator('.sky-study-answer')).toContainText('language');
  await page.getByRole('button', { name: 'Again', exact: true }).click();
  await expect(page.locator('.sky-study-prompt')).toHaveText('pona');
  await page.getByRole('button', { name: 'Reveal answer', exact: true }).click();
  await page.getByRole('button', { name: 'Got it', exact: true }).click();
  await expect(page.locator('progress')).toHaveAttribute('value', '1');
  await page.getByRole('button', { name: 'Reverse cards', exact: true }).click();
  await expect(page.locator('.sky-study-prompt')).toHaveText('I; me; we; us');
  expect(page.url()).toBe(original);
  await page.reload();
  await expect(page.locator('.sky-study-prompt')).toHaveText('toki');
  await expect(page.locator('progress')).toHaveAttribute('value', '0');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).disableRules(['meta-viewport']).analyze()).violations).toEqual([]);
});

test('team paste edits update cards and treat pasted HTML as text', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Team Paste', exact: true }).click();
  await expect(page.locator('.sky-grid .sky-card')).toHaveCount(3);
  await page
    .getByRole('textbox', { name: 'Showdown export text', exact: true })
    .fill('Pikachu @ Light Ball\nAbility: Static\nTera Type: Grass\n- Thunderbolt\n\n<img src=x onerror=alert(1)>\n- Tackle');
  await expect(page.locator('.sky-grid .sky-card')).toHaveCount(2);
  await expect(page.locator('.sky-grid')).toContainText('Tera Type: Grass');
  await expect(page.locator('.sky-grid img')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).disableRules(['meta-viewport']).analyze()).violations).toEqual([]);
});
