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
  expect(await page.locator('.sky-document').evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
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
  expect(await page.locator('.sky-document').evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
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
  expect(await page.locator('.sky-document').evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).disableRules(['meta-viewport']).analyze()).violations).toEqual([]);
});

test('tier cards move, reorder and survive their updated link', async ({ page }, info) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Tier List Maker', exact: true }).click();
  const cheese = page.locator('.sky-tier-item').filter({ has: page.locator('span', { hasText: '🧀 Cheese' }) });
  await cheese.getByText('Edit', { exact: true }).click();
  await cheese.getByRole('combobox', { name: 'Move 🧀 Cheese to tier', exact: true }).selectOption({ label: 'S' });
  const s = page.locator('.sky-tier-row').filter({ has: page.getByRole('textbox', { name: 'Tier name: S', exact: true }) });
  await expect(s).toContainText('🧀 Cheese');
  if (info.project.name === 'desktop') {
    const pretzel = page.locator('.sky-tier-item').filter({ has: page.locator('span', { hasText: '🥨 Pretzels' }) });
    await pretzel.dragTo(s);
    await expect(s).toContainText('🥨 Pretzels');
  }
  await page.getByRole('textbox', { name: 'Items, one per line', exact: true }).fill('🌿 Fresh herbs\nA | B');
  await page.getByRole('textbox', { name: 'Items, one per line', exact: true }).blur();
  await page.getByRole('button', { name: 'Add cards', exact: true }).click();
  await expect(page.locator('.sky-tier-item')).toContainText(['🌿 Fresh herbs', 'A | B']);
  const updated = await link(page);
  await page.goto(updated);
  await page.reload();
  await expect(s).toContainText('🧀 Cheese');
  await expect(page.locator('.sky-tier-item')).toContainText(['🌿 Fresh herbs', 'A | B']);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.locator('.sky-document').evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).disableRules(['meta-viewport']).analyze()).violations).toEqual([]);
});

test('date groups remain independent, date ranges and settings survive a shared link', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Pocket Calendar', exact: true }).click();
  const jan16 = page.getByRole('button', { name: /^2027-01-16 ·/ });
  await expect(jan16).toHaveAttribute('aria-pressed', 'true');
  await jan16.click();
  await expect(jan16).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('radio', { name: 'Study together', exact: true }).check();
  await expect(jan16).toHaveAttribute('aria-pressed', 'true');
  await page.getByLabel('Range start', { exact: true }).fill('2027-01-30');
  await page.getByLabel('Range end', { exact: true }).fill('2027-02-02');
  await page.getByLabel('Range end', { exact: true }).blur();
  await expect(page.getByLabel('Range end', { exact: true })).toHaveValue('2027-02-02');
  await page.getByRole('button', { name: 'Add date range', exact: true }).click();
  await expect(page.getByRole('button', { name: /^2027-02-02 ·/ })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('combobox', { name: 'Week starts on', exact: true }).selectOption('sunday');
  await page.getByRole('checkbox', { name: 'Show weekends', exact: true }).uncheck();
  await expect(page.getByRole('button', { name: /^2027-01-30 ·/ })).toHaveCount(0);
  await expect(page.locator('.sky-month').first().locator('th')).toHaveCount(5);
  const updated = await link(page);
  await page.goto(updated);
  await page.reload();
  await expect(page.getByRole('checkbox', { name: 'Show weekends', exact: true })).not.toBeChecked();
  await expect(page.getByRole('combobox', { name: 'Week starts on', exact: true })).toHaveValue('sunday');
  await expect(page.getByRole('button', { name: /^2027-02-02 ·/ })).toContainText('2');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.locator('.sky-document').evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).disableRules(['meta-viewport']).analyze()).violations).toEqual([]);
});
