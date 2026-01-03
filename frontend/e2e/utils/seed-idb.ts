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
