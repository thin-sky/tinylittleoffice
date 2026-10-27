/** Focused checks against the local dev preview or a built/deployed copy. */
import { defineConfig } from '@playwright/test';
import base from './playwright.config.ts';
export default defineConfig({
  ...base,
  testMatch: 'thin-sky.spec.ts',
  webServer: undefined,
  use: { ...base.use, baseURL: process.env.SKY_BASE_URL || 'http://127.0.0.1:4178' },
});
