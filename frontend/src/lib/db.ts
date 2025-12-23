import localforage from 'localforage';

export type RecentSakeRecord = {
  id: number;
  name: string;
  brewery: string;
  region: string;
  imageUrl?: string;
  viewedAt: number;
};

export type FavoriteSakeRecord = {
  id: number;
  name: string;
  brewery: string;
  region: string;
  imageUrl?: string;
  favoritedAt: number;
};

type RecentSakeDraft = Omit<RecentSakeRecord, 'viewedAt'> & {
  viewedAt?: number;
};

export type FavoriteSakeDraft = Omit<FavoriteSakeRecord, 'favoritedAt'> & {
  favoritedAt?: number;
};

const STORAGE_KEY = 'recent_sake';
const FAVORITES_LIST_KEY = 'favorite_sake';
const FAVORITE_ITEM_PREFIX = 'favorite:';
const MAX_RECENT_ITEMS = 50;
const isBrowser = typeof window !== 'undefined';

const recentStore = isBrowser
  ? localforage.createInstance({
      name: 'washu-app',
      storeName: 'recent_sake',
      description: 'recent sake history',
    })
  : null;

const favoritesStore = isBrowser
  ? localforage.createInstance({
      name: 'washu-app',
      storeName: 'favorite_sake',
      description: 'favorite sake list',
    })
  : null;

const loadRecords = async (): Promise<RecentSakeRecord[]> => {
  if (!recentStore) {
    return [];
  }
  const records = await recentStore.getItem<RecentSakeRecord[]>(STORAGE_KEY);
  if (!records || !Array.isArray(records)) {
    return [];
  }
  return records.filter(
    (record): record is RecentSakeRecord =>
      typeof record === 'object' &&
      record !== null &&
      typeof record.id === 'number' &&
      typeof record.name === 'string' &&
      typeof record.brewery === 'string' &&
      typeof record.region === 'string' &&
      typeof record.viewedAt === 'number',
  );
};

const saveRecords = async (records: RecentSakeRecord[]) => {
  if (!recentStore) {
    return;
  }
  await recentStore.setItem(STORAGE_KEY, records);
};

const isFavoriteRecord = (record: unknown): record is FavoriteSakeRecord =>
  typeof record === 'object' &&
  record !== null &&
  typeof (record as FavoriteSakeRecord).id === 'number' &&
  typeof (record as FavoriteSakeRecord).name === 'string' &&
  typeof (record as FavoriteSakeRecord).brewery === 'string' &&
  typeof (record as FavoriteSakeRecord).region === 'string' &&
  typeof (record as FavoriteSakeRecord).favoritedAt === 'number';

const loadLegacyFavorites = async (): Promise<FavoriteSakeRecord[] | null> => {
  if (!favoritesStore) {
    return null;
  }
  const records = await favoritesStore.getItem<FavoriteSakeRecord[]>(
    FAVORITES_LIST_KEY,
  );
  if (!records || !Array.isArray(records)) {
    return null;
  }
  return records.filter(isFavoriteRecord);
};

const migrateLegacyFavorites = async (): Promise<FavoriteSakeRecord[] | null> => {
  if (!favoritesStore) {
    return null;
  }
  const legacyRecords = await loadLegacyFavorites();
  if (!legacyRecords) {
    return null;
  }
  await Promise.all(
    legacyRecords.map((record) =>
      favoritesStore.setItem(`${FAVORITE_ITEM_PREFIX}${record.id}`, record),
    ),
  );
  await favoritesStore.removeItem(FAVORITES_LIST_KEY);
  return legacyRecords;
};

const loadFavoritesFromItems = async (): Promise<FavoriteSakeRecord[]> => {
  if (!favoritesStore) {
    return [];
  }
  const keys = await favoritesStore.keys();
  const itemKeys = keys.filter((key) => key.startsWith(FAVORITE_ITEM_PREFIX));
  const records = await Promise.all(
    itemKeys.map((key) =>
      favoritesStore.getItem<FavoriteSakeRecord>(key),
    ),
  );
  return records.filter(isFavoriteRecord);
};

const loadFavorites = async (): Promise<FavoriteSakeRecord[]> => {
  if (!favoritesStore) {
    return [];
  }
  const migrated = await migrateLegacyFavorites();
  if (migrated) {
    return migrated;
  }
  return loadFavoritesFromItems();
};

export const addRecent = async (draft: RecentSakeDraft) => {
  if (!recentStore) {
    return;
  }

  try {
    const existing = await loadRecords();
    const filtered = existing.filter((record) => record.id !== draft.id);
    const record: RecentSakeRecord = {
      ...draft,
      viewedAt: draft.viewedAt ?? Date.now(),
    };
    const nextRecords = [record, ...filtered].slice(0, MAX_RECENT_ITEMS);
    await saveRecords(nextRecords);
  } catch (error) {
    console.warn('Failed to save recent sake list', error);
  }
};

export const listRecent = async (limit = MAX_RECENT_ITEMS): Promise<RecentSakeRecord[]> => {
  if (!recentStore) {
    return [];
  }

  try {
    const records = await loadRecords();
    return records
      .slice()
      .sort((a, b) => b.viewedAt - a.viewedAt)
      .slice(0, limit);
  } catch (error) {
    console.warn('Failed to read recent sake list', error);
    return [];
  }
};

export const addFavorite = async (draft: FavoriteSakeDraft) => {
  if (!favoritesStore) {
    return;
  }

  try {
    const record: FavoriteSakeRecord = {
      ...draft,
      favoritedAt: draft.favoritedAt ?? Date.now(),
    };
    await migrateLegacyFavorites();
    await favoritesStore.setItem(
      `${FAVORITE_ITEM_PREFIX}${record.id}`,
      record,
    );
  } catch (error) {
    console.warn('Failed to save favorite sake list', error);
  }
};

export const removeFavorite = async (id: number) => {
  if (!favoritesStore) {
    return;
  }

  try {
    await migrateLegacyFavorites();
    await favoritesStore.removeItem(`${FAVORITE_ITEM_PREFIX}${id}`);
  } catch (error) {
    console.warn('Failed to remove favorite sake item', error);
  }
};

export const listFavorites = async (): Promise<FavoriteSakeRecord[]> => {
  if (!favoritesStore) {
    return [];
  }

  try {
    const records = await loadFavorites();
    return records.slice().sort((a, b) => b.favoritedAt - a.favoritedAt);
  } catch (error) {
    console.warn('Failed to read favorite sake list', error);
    return [];
  }
};
