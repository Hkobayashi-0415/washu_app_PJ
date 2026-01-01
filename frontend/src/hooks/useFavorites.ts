import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  addFavorite,
  listFavorites,
  removeFavorite,
  type FavoriteSakeDraft,
  type FavoriteSakeRecord,
} from '../lib/db.ts';
import { track } from '../lib/analytics.ts';

type UseFavoritesState = {
  favorites: FavoriteSakeRecord[];
  isLoading: boolean;
  isFavorite: (id: number) => boolean;
  toggleFavorite: (draft: FavoriteSakeDraft) => Promise<void>;
  list: () => FavoriteSakeRecord[];
  refresh: () => Promise<void>;
};

export const useFavorites = (): UseFavoritesState => {
  const [favorites, setFavorites] = useState<FavoriteSakeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const records = await listFavorites();
    setFavorites(records);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const favoriteIds = useMemo(
    () => new Set(favorites.map((record) => record.id)),
    [favorites],
  );

  const isFavorite = useCallback(
    (id: number) => favoriteIds.has(id),
    [favoriteIds],
  );

  const toggleFavorite = useCallback(
    async (draft: FavoriteSakeDraft) => {
      const exists = favorites.some((record) => record.id === draft.id);
      const now = Date.now();
      setFavorites((prev) => {
        if (exists) {
          return prev.filter((record) => record.id !== draft.id);
        }
        const nextRecord: FavoriteSakeRecord = {
          ...draft,
          favoritedAt: now,
        };
        const nextList = prev.filter((record) => record.id !== draft.id);
        return [nextRecord, ...nextList];
      });

      try {
        if (exists) {
          await removeFavorite(draft.id);
          track('fav_remove', { id: draft.id });
        } else {
          await addFavorite({ ...draft, favoritedAt: now });
          track('fav_add', { id: draft.id, name: draft.name });
        }
      } catch (error) {
        console.warn('Failed to update favorite status', error);
        await refresh();
      }
    },
    [favorites, refresh],
  );

  const list = useCallback(() => favorites, [favorites]);

  return {
    favorites,
    isLoading,
    isFavorite,
    toggleFavorite,
    list,
    refresh,
  };
};
