import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';

import { getSakeDetail, type SakeDetail } from '../lib/api.ts';
import { addRecent } from '../lib/db.ts';
import { useFavorites } from '../hooks/useFavorites.ts';
import { useNetworkStatus } from '../hooks/useNetworkStatus.ts';

const numberFormatter = new Intl.NumberFormat('ja-JP', {
  maximumFractionDigits: 1,
});

const SakeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { isOnline } = useNetworkStatus();
  const { isFavorite, toggleFavorite } = useFavorites();
  const sakeId = Number(id);
  const isValidId = Number.isFinite(sakeId) && sakeId > 0;

  const { data, error, isPending, refetch, isFetching } = useQuery<SakeDetail, Error>({
    queryKey: ['sakeDetail', sakeId],
    queryFn: ({ signal }) => getSakeDetail(sakeId, { signal }),
    enabled: isValidId,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!data) {
      return;
    }
    addRecent({
      id: data.id,
      name: data.name,
      brewery: data.brewery,
      region: data.region,
      imageUrl: data.imageUrl,
    }).catch(() => undefined);
  }, [data]);

  useEffect(() => {
    if (!data?.imageUrl) {
      return;
    }
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = data.imageUrl;
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, [data?.imageUrl]);

  const stats = useMemo(() => {
    if (!data) {
      return [];
    }
    return [
      { label: '使用米', value: data.rice },
      {
        label: '精米歩合',
        value: typeof data.seimaibuai === 'number' ? `${data.seimaibuai}%` : undefined,
      },
      {
        label: '日本酒度',
        value: formatNumericStat(data.nihonshudo),
      },
      {
        label: '酸度',
        value: formatNumericStat(data.acid),
      },
      {
        label: '度数',
        value: typeof data.alcohol === 'number' ? `${formatNumericStat(data.alcohol)}%` : undefined,
      },
    ].filter((stat) => !!stat.value);
  }, [data]);

  const favoriteDraft = data
    ? {
        id: data.id,
        name: data.name,
        brewery: data.brewery,
        region: data.region,
        imageUrl: data.imageUrl,
      }
    : null;
  const isFavorited = data ? isFavorite(data.id) : false;

  if (!isValidId) {
    return (
      <div className="detail-page">
        <div className="detail-page__inner">
          <InvalidState />
        </div>
      </div>
    );
  }

  return (
    <div className="detail-page">
      <div className="detail-page__inner">
        <header className="detail-header">
          <div>
            <p className="page-title__brand">Washu Explorer</p>
            <h1 className="detail-title">{data?.name ?? '銘柄詳細'}</h1>
            {data && (
              <p className="detail-meta">
                {data.brewery} / {data.region}
              </p>
            )}
          </div>
          <div className="detail-header__nav">
            <Link to="/search" className="btn btn--ghost">
              検索へ戻る
            </Link>
            <Link to="/recent" className="btn btn--secondary">
              最近見た
            </Link>
            <button
              type="button"
              className={`favorite-toggle favorite-toggle--header${isFavorited ? ' is-active' : ''}`}
              aria-pressed={isFavorited}
              aria-label={
                isFavorited ? 'お気に入りから削除' : 'お気に入りに追加'
              }
              onClick={() => favoriteDraft && toggleFavorite(favoriteDraft)}
              disabled={!favoriteDraft}
            >
              ★
            </button>
          </div>
        </header>

        {!isOnline && (
          <div className="offline-banner detail-offline">
            現在オフラインです。保存済みの情報のみ表示されます。
          </div>
        )}

        {isPending && <SakeDetailSkeleton />}

        {error && (
          <div className="detail-state detail-state--error">
            <p>{error.message}</p>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              再読み込み
            </button>
          </div>
        )}

        {data && !isPending && (
          <>
            <section className="detail-hero">
              <div className="detail-hero__media">
                {data.imageUrl ? (
                  <img
                    src={data.imageUrl}
                    alt={`${data.name}の写真`}
                    loading="eager"
                    decoding="async"
                  />
                ) : (
                  <div className="detail-hero__placeholder" aria-hidden="true">
                    No Image
                  </div>
                )}
              </div>
              <div className="detail-hero__info">
                <p className="detail-brewery">{data.brewery}</p>
                <p className="detail-region">{data.region}</p>
                {data.tasteTags.length > 0 && (
                  <div className="detail-tags">
                    {data.tasteTags.map((tag) => (
                      <span key={tag} className="detail-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {stats.length > 0 && (
              <section className="detail-stats">
                {stats.map((stat) => (
                  <div key={stat.label} className="detail-stat">
                    <p className="detail-stat__label">{stat.label}</p>
                    <p className="detail-stat__value">{stat.value}</p>
                  </div>
                ))}
              </section>
            )}

            {data.description && (
              <section className="detail-description">
                <h2>テイスティングノート</h2>
                <p>{data.description}</p>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const formatNumericStat = (value?: number) =>
  typeof value === 'number' ? numberFormatter.format(value) : undefined;

const InvalidState = () => (
  <div className="detail-state">
    <p>無効な銘柄IDです。検索から選び直してください。</p>
    <Link to="/search" className="btn btn--primary">
      検索に戻る
    </Link>
  </div>
);

const SakeDetailSkeleton = () => (
  <div className="detail-skeleton" aria-hidden="true">
    <div className="detail-skeleton__media skeleton-block" />
    <div className="detail-skeleton__text">
      <div className="skeleton-block skeleton-block--line" />
      <div className="skeleton-block skeleton-block--line short" />
      <div className="skeleton-block skeleton-block--line" />
    </div>
  </div>
);

export default SakeDetailPage;
