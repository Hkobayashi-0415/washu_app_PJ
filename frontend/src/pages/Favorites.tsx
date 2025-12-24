import { useCallback } from 'react';
import { Link } from 'react-router-dom';

import { useFavorites } from '../hooks/useFavorites.ts';
import { useNetworkStatus } from '../hooks/useNetworkStatus.ts';
import type { FavoriteSakeRecord } from '../lib/db.ts';

const FavoritesPage = () => {
  const { isOnline } = useNetworkStatus();
  const { favorites, isLoading, toggleFavorite, refresh } = useFavorites();

  const handleRemove = useCallback(
    async (record: FavoriteSakeRecord) => {
      await toggleFavorite(record);
    },
    [toggleFavorite],
  );

  const hasItems = favorites.length > 0;

  return (
    <div className="favorites-page">
      <div className="favorites-page__inner">
        <header className="favorites-header">
          <div>
            <p className="page-title__brand">Washu Explorer</p>
            <h1>お気に入り</h1>
            <p className="favorites-header__lead">
              気になる銘柄を★で保存します。最新順に並び、オフラインでも閲覧できます。
            </p>
          </div>
          <div className="favorites-header__nav">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => refresh()}
              disabled={isLoading}
            >
              {isLoading ? '更新中…' : '再読み込み'}
            </button>
            <Link to="/search" className="btn btn--secondary">
              検索へ
            </Link>
          </div>
        </header>

        {!isOnline && (
          <div className="offline-banner">
            オフラインでも保存済みのお気に入りは閲覧・削除できます。
          </div>
        )}

        {isLoading && <FavoritesSkeleton />}

        {!isLoading && !hasItems && (
          <div className="favorites-state">
            <p>まだお気に入りがありません。</p>
            <p className="favorites-state__hint">
              一覧や詳細ページで★を押して保存してみましょう。
            </p>
            <Link to="/search" className="btn btn--primary">
              一覧へ
            </Link>
          </div>
        )}

        {!isLoading && hasItems && (
          <div className="favorites-list">
            {favorites.map((item) => (
              <FavoriteCard key={item.id} record={item} onRemove={handleRemove} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

type FavoriteCardProps = {
  record: FavoriteSakeRecord;
  onRemove: (record: FavoriteSakeRecord) => void;
};

const FavoriteCard = ({ record, onRemove }: FavoriteCardProps) => (
  <div className="favorite-card">
    <Link to={`/sake/${record.id}`} className="favorite-card__link">
      <div className="favorite-card__media">
        {record.imageUrl ? (
          <img src={record.imageUrl} alt={`${record.name}の写真`} loading="lazy" decoding="async" />
        ) : (
          <div className="favorite-card__placeholder" aria-hidden="true">
            No Image
          </div>
        )}
      </div>
      <div className="favorite-card__body">
        <h2>{record.name}</h2>
        <p className="favorite-card__brewery">{record.brewery}</p>
        <p className="favorite-card__region">{record.region}</p>
      </div>
    </Link>
    <button
      type="button"
      className="favorite-toggle favorite-toggle--list is-active"
      aria-label={`${record.name}をお気に入りから削除`}
      onClick={() => onRemove(record)}
    >
      ★
    </button>
  </div>
);

const FavoritesSkeleton = () => (
  <div className="favorites-list">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="favorite-card favorite-card--skeleton" aria-hidden="true">
        <div className="favorite-card__media skeleton-block" />
        <div className="favorite-card__body">
          <div className="skeleton-block skeleton-block--line" />
          <div className="skeleton-block skeleton-block--line short" />
          <div className="skeleton-block skeleton-block--line" />
        </div>
      </div>
    ))}
  </div>
);

export default FavoritesPage;
