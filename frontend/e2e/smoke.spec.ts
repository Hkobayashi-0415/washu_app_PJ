import { expect, test, type Page } from '@playwright/test';

import {
  seedFavoritesInitScript,
  seedFavoritesInPage,
  waitForFavoriteInIdb,
} from './utils/seed-idb';

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
  description: 'テスト用の説明です。',
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

test.beforeEach(async ({ context }) => {
  await context.addInitScript(seedFavoritesInitScript, { favorites: [] });
});

test('search -> detail -> favorites -> offline', async ({ page }) => {
  await mockApi(page);

  await page.goto('/search');

  await page.getByLabel('キーワード').fill('獺祭');
  await page.getByRole('button', { name: '検索する' }).click();
  await expect(page).toHaveURL(/\/search\?q=/);

  await expect(
    page.getByRole('heading', { level: 3, name: '獺祭' }),
  ).toBeVisible();

  await page.getByRole('link', { name: '獺祭' }).first().click();
  await expect(page).toHaveURL(/\/sake\/1$/);
  await expect(
    page.getByRole('heading', { level: 1, name: '獺祭' }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'お気に入りに追加' }).click();
  await expect(
    page.getByRole('button', { name: 'お気に入りから削除' }),
  ).toBeVisible();

  await page.getByRole('link', { name: '検索へ戻る' }).click();
  await expect(page).toHaveURL(/\/search/);
  await page.getByRole('link', { name: 'お気に入り' }).click();
  await expect(page).toHaveURL(/\/favorites/);
  const favoriteSeed = {
    id: sampleSake.id,
    name: sampleSake.name,
    brewery: sampleSake.brewery,
    region: sampleSake.region,
    imageUrl: sampleSake.image_url ?? undefined,
    favoritedAt: Date.now(),
  };
  await seedFavoritesInPage(page, [favoriteSeed]);
  await waitForFavoriteInIdb(page, favoriteSeed.id);
  const refreshButton = page.getByRole('button', { name: '再読み込み' });
  const favoriteHeading = page.getByRole('heading', { level: 2, name: '獺祭' });
  await expect(refreshButton).toBeEnabled();
  await refreshButton.click();
  await expect(favoriteHeading).toBeVisible();

  await page.context().setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event('offline')));

  await expect(
    page.getByText('オフラインでも保存済みのお気に入りは閲覧・削除できます。'),
  ).toBeVisible();

  await page
    .getByRole('button', { name: '獺祭をお気に入りから削除' })
    .click();
  await expect(page.getByText('まだお気に入りがありません。')).toBeVisible();
});
