import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { listRecent, type RecentSakeRecord } from '../lib/db.ts';
import { useNetworkStatus } from '../hooks/useNetworkStatus.ts';

const formatter = new Intl.DateTimeFormat('ja-JP', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const RecentPage = () => {
  const { isOnline } = useNetworkStatus();
  const [items, setItems] = useState<RecentSakeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const records = await listRecent();
    setItems(records);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const hasItems = items.length > 0;

  return (
    <div className="recent-page">
      <div className="recent-page__inner">
        <header className="recent-header">
          <div>
            <p className="page-title__brand">Washu Explorer</p>
            <h1>最近見た銘柄</h1>
            <p className="recent-header__lead">
              詳細ページを開いた銘柄が自動でここに保存されます。最大50件まで遡れます。
            </p>
          </div>
          <div className="recent-header__nav">
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
            オフラインですが、最近見たデータはこの端末に保存されているため閲覧できます。
          </div>
        )}

        {isLoading && <RecentSkeleton />}

        {!isLoading && !hasItems && (
          <div className="recent-state">
            <p>まだ最近見た銘柄がありません。</p>
            <p className="recent-state__hint">一覧から気になる銘柄を開くとここに表示されます。</p>
            <Link to="/search" className="btn btn--primary">
              一覧へ
            </Link>
          </div>
        )}

        {!isLoading && hasItems && (
          <div className="recent-list">
            {items.map((item) => (
              <RecentCard key={item.id} record={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

type RecentCardProps = {
  record: RecentSakeRecord;
};

const RecentCard = ({ record }: RecentCardProps) => (
  <Link to={`/sake/${record.id}`} className="recent-card">
    <div className="recent-card__media">
      {record.imageUrl ? (
        <img src={record.imageUrl} alt={`${record.name}の写真`} loading="lazy" decoding="async" />
      ) : (
        <div className="recent-card__placeholder" aria-hidden="true">
          No Image
        </div>
      )}
    </div>
    <div className="recent-card__body">
      <p className="recent-card__viewed">
        {formatter.format(new Date(record.viewedAt))}
      </p>
      <h2>{record.name}</h2>
      <p className="recent-card__brewery">{record.brewery}</p>
      <p className="recent-card__region">{record.region}</p>
    </div>
  </Link>
);

const RecentSkeleton = () => (
  <div className="recent-list">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="recent-card recent-card--skeleton" aria-hidden="true">
        <div className="recent-card__media skeleton-block" />
        <div className="recent-card__body">
          <div className="skeleton-block skeleton-block--line" />
          <div className="skeleton-block skeleton-block--line short" />
          <div className="skeleton-block skeleton-block--line" />
        </div>
      </div>
    ))}
  </div>
);

export default RecentPage;
