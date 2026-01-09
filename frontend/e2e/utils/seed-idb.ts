type FavoriteSeed = {
  id: number;
  name: string;
  brewery: string;
  region: string;
  imageUrl?: string;
  favoritedAt?: number;
};

type SeedPayload = {
  favorites: FavoriteSeed[];
};

type SeedApi = {
  seedFavorites: (records: FavoriteSeed[]) => Promise<void>;
};

type SeedPayloadWithRecords = {
  records: FavoriteSeed[];
};

declare global {
  interface Window {
    __seedFavorites?: SeedApi['seedFavorites'];
  }
}

export const seedFavoritesInitScript = ({ favorites }: SeedPayload) => {
  const root = globalThis as typeof window & {
    __seedFavorites?: SeedApi['seedFavorites'];
  };

  const openDb = (version?: number) =>
    new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('washu-app', version);
      request.onerror = () => reject(request.error);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('favorite_sake')) {
          db.createObjectStore('favorite_sake');
        }
      };
      request.onsuccess = () => resolve(request.result);
    });

  const ensureDb = async () => {
    let db = await openDb();
    if (!db.objectStoreNames.contains('favorite_sake')) {
      const nextVersion = db.version + 1;
      db.close();
      db = await openDb(nextVersion);
    }
    return db;
  };

  const seedFavorites: SeedApi['seedFavorites'] = async (records) => {
    if (!records.length) {
      return;
    }
    const db = await ensureDb();
    await Promise.all(
      records.map(
        (record) =>
          new Promise<void>((resolve, reject) => {
            const tx = db.transaction('favorite_sake', 'readwrite');
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
            tx.onabort = () => reject(tx.error);
            tx.objectStore('favorite_sake').put(
              {
                ...record,
                favoritedAt: record.favoritedAt ?? Date.now(),
              },
              `favorite:${record.id}`,
            );
          }),
      ),
    );
    db.close();
  };

  root.__seedFavorites = seedFavorites;

  if (favorites.length > 0) {
    void seedFavorites(favorites);
  }
};

export const seedFavoritesInPage = async (
  page: import('@playwright/test').Page,
  records: FavoriteSeed[],
) => {
  await page.waitForFunction(() => typeof window.__seedFavorites === 'function');
  await page.evaluate(async (payload: SeedPayloadWithRecords) => {
    if (!window.__seedFavorites) {
      throw new Error('seed helper is not available');
    }
    await window.__seedFavorites(payload.records);
  }, { records });
};

export const waitForFavoriteInIdb = async (
  page: import('@playwright/test').Page,
  id: number,
) => {
  await page.waitForFunction(
    async (targetId: number) => {
      const key = `favorite:${targetId}`;
      const open = indexedDB.open('washu-app');
      return await new Promise<boolean>((resolve) => {
        open.onerror = () => resolve(false);
        open.onsuccess = () => {
          const db = open.result;
          if (!db.objectStoreNames.contains('favorite_sake')) {
            db.close();
            resolve(false);
            return;
          }
          const tx = db.transaction('favorite_sake', 'readonly');
          const store = tx.objectStore('favorite_sake');
          const req = store.get(key);
          req.onsuccess = () => {
            const record = req.result as FavoriteSeed | undefined;
            db.close();
            resolve(Boolean(record && record.name));
          };
          req.onerror = () => {
            db.close();
            resolve(false);
          };
        };
      });
    },
    id,
    { timeout: 15000 },
  );
};
