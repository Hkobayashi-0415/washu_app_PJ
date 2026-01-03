import fs from 'node:fs';
import path from 'node:path';

import { expect, test, type Page } from '@playwright/test';

import { seedFavoritesInitScript } from './utils/seed-idb';

const sampleSake = {
  id: 1,
  name: '獺祭',
  brewery: '旭酒造',
  region: '山口',
  tags: ['華やか'],
  image_url: null,
};

const searchResponse = {
  items: [sampleSake],
  page: 1,
  per_page: 20,
  total: 1,
};

const detailResponse = {
  ...sampleSake,
  rice: '山田錦',
  seimaibuai: 50,
  nihonshudo: 3,
  acid: 1.4,
  alcohol: 15,
  taste_tags: ['フルーティ'],
  description: 'スクショ用の説明です。',
};

const regionsResponse = {
  regions: ['北海道', '関東', '近畿'],
};

const mockApi = async (page: Page) => {
  await page.route('**/api/v1/**', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/api/v1/meta/regions')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(regionsResponse),
      });
    }
    if (url.pathname.endsWith('/api/v1/sake/search')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(searchResponse),
      });
    }
    if (url.pathname.endsWith('/api/v1/sake/1')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(detailResponse),
      });
    }
    return route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ detail: 'Not Found' }),
    });
  });
};

const screenshotsDir = path.resolve(process.cwd(), '..', 'docs', 'screenshots');

test('capture screenshots', async ({ context, page }) => {
  fs.mkdirSync(screenshotsDir, { recursive: true });
  await context.addInitScript(seedFavoritesInitScript, { favorites: [] });
  await mockApi(page);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/search');
  await page.getByLabel('キーワード').fill('獺祭');
  await page.getByRole('button', { name: '検索する' }).click();
  await expect(page.getByRole('heading', { level: 3, name: '獺祭' })).toBeVisible();
  await page.screenshot({
    path: path.join(screenshotsDir, 'search.png'),
    fullPage: true,
  });

  await page.getByRole('link', { name: '獺祭' }).first().click();
  await expect(page).toHaveURL(/\/sake\/1$/);
  await page.screenshot({
    path: path.join(screenshotsDir, 'detail.png'),
    fullPage: true,
  });

  await page.evaluate(async (record) => {
    await window.__seedFavorites?.([record]);
  }, {
    id: sampleSake.id,
    name: sampleSake.name,
    brewery: sampleSake.brewery,
    region: sampleSake.region,
    imageUrl: sampleSake.image_url ?? undefined,
    favoritedAt: Date.now(),
  });

  await page.goto('/favorites');
  const refreshButton = page.getByRole('button', { name: '再読み込み' });
  const favoriteHeading = page.getByRole('heading', { level: 2, name: '獺祭' });
  await expect.poll(async () => {
    await refreshButton.click();
    return favoriteHeading.count();
  }).toBeGreaterThan(0);
  await page.screenshot({
    path: path.join(screenshotsDir, 'favorites.png'),
    fullPage: true,
  });
});
