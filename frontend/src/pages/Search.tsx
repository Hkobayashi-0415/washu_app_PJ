import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';

import {
  getRegions,
  getSakeSearch,
  type SakeSearchResponse,
  type SakeSummary,
} from '../lib/api.ts';
import { useFavorites } from '../hooks/useFavorites.ts';
import { useNetworkStatus } from '../hooks/useNetworkStatus.ts';

const PER_PAGE = 20;
const REGION_FALLBACK = [
  '北海道',
  '東北',
  '関東',
  '北陸・甲信越',
  '東海',
  '近畿',
  '中国',
  '四国',
  '九州・沖縄',
];

type SearchFormState = {
  q: string;
  region: string;
  sweetness: string;
};

type ToastState = 'online' | 'offline' | null;
type SearchQueryKey = readonly ['sakeSearch', { q?: string; region?: string }];

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { isOnline, lastChangedAt } = useNetworkStatus();

  const qParam = (searchParams.get('q') ?? '').trim();
  const regionParam = searchParams.get('region') ?? '';

  const filters = useMemo(
    () => ({ q: qParam || undefined, region: regionParam || undefined }),
    [qParam, regionParam],
  );

  const queryKey = useMemo<SearchQueryKey>(
    () => ['sakeSearch', filters],
    [filters],
  );

  const [formState, setFormState] = useState<SearchFormState>(() => ({
    q: qParam,
    region: regionParam,
    sweetness: '0',
  }));

  useEffect(() => {
    setFormState((prev) => {
      if (prev.q === qParam && prev.region === regionParam) {
        return prev;
      }
      return { ...prev, q: qParam, region: regionParam };
    });
  }, [qParam, regionParam]);

  const {
    data,
    error,
    isPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isFetching,
  } = useInfiniteQuery<SakeSearchResponse, Error, InfiniteData<SakeSearchResponse>, SearchQueryKey, number>({
    queryKey,
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1, signal }) =>
      getSakeSearch(
        {
          ...filters,
          page: pageParam,
          perPage: PER_PAGE,
        },
        { signal },
      ),
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.perPage);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
    enabled: isOnline,
  });

  useEffect(() => {
    if (!isOnline) {
      return;
    }
    queryClient.invalidateQueries({ queryKey, exact: true, refetchType: 'active' });
  }, [isOnline, queryClient, queryKey]);

  const prefetchedRegions = queryClient.getQueryData<string[]>(['meta', 'regions']);

  const regionQuery = useQuery({
    queryKey: ['meta', 'regions'],
    queryFn: ({ signal }) => getRegions({ signal }),
    staleTime: 1000 * 60 * 60 * 12,
    enabled: isOnline || !!prefetchedRegions,
    initialData: prefetchedRegions,
  });

  const regionOptions =
    regionQuery.data && regionQuery.data.length > 0
      ? regionQuery.data
      : REGION_FALLBACK;

  const [toast, setToast] = useState<ToastState>(null);
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    if (lastChangedAt === null) {
      return;
    }
    setToast(isOnline ? 'online' : 'offline');
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [isOnline, lastChangedAt]);

  const items = useMemo(() => {
    if (!data?.pages) {
      return [];
    }
    const seen = new Set<number>();
    const merged: SakeSummary[] = [];
    for (const page of data.pages) {
      for (const item of page.items) {
        if (seen.has(item.id)) {
          continue;
        }
        seen.add(item.id);
        merged.push(item);
      }
    }
    return merged;
  }, [data]);
  const totalResults = data?.pages?.[0]?.total ?? 0;
  const isInitialLoading = isPending;
  const showEmptyState = !isInitialLoading && !error && items.length === 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    const trimmed = formState.q.trim();
    if (trimmed.length > 0) {
      params.set('q', trimmed);
    }
    if (formState.region) {
      params.set('region', formState.region);
    }
    setSearchParams(params, { replace: true });
  };

  const handleReset = () => {
    setFormState((prev) => ({ ...prev, q: '', region: '' }));
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  return (
    <div className="search-page">
      <div className="search-page__inner">
        <header className="page-header">
          <div className="page-title">
            <p className="page-title__brand">Washu App</p>
            <h1>気になる銘柄を探す</h1>
            <p className="page-title__lead">
              フェーズ3では、検索フォームから銘柄一覧を取得し、オンラインでもオフラインでも状況がわかるモバイル最適なUIを目指します。
            </p>
          </div>
          <div className="page-header__actions">
            <Link to="/recent" className="recent-link">
              最近見た
            </Link>
            <Link to="/favorites" className="favorites-link">
              お気に入り
            </Link>
          </div>
        </header>

        <div className="search-form__wrapper">
          {!isOnline && (
            <div className="offline-banner" role="status">
              オフラインのため検索できません。接続を確認してください。
            </div>
          )}
          <form className="search-form" onSubmit={handleSubmit}>
            <div className="search-form__field">
              <label htmlFor="search-q">キーワード</label>
              <input
                id="search-q"
                name="q"
                type="search"
                autoComplete="off"
                placeholder="銘柄名・蔵元など"
                minLength={0}
                value={formState.q}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    q: event.target.value,
                  }))
                }
              />
            </div>

            <div className="search-form__field">
              <label htmlFor="search-region">地域</label>
              <select
                id="search-region"
                name="region"
                value={formState.region}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    region: event.target.value,
                  }))
                }
                disabled={!isOnline && !(regionQuery.data && regionQuery.data.length > 0)}
              >
                <option value="">すべて</option>
                {regionOptions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
              {regionQuery.isFetching && (
                <p className="search-form__note" aria-live="polite">
                  地域データを更新しています…
                </p>
              )}
              {regionQuery.isError && (
                <p className="search-form__helper">
                  地域リストの取得に失敗したため仮のリストを表示しています。
                </p>
              )}
            </div>

            <div className="search-form__field">
              <label htmlFor="search-sweetness">
                甘辛
                <span className="search-form__chip">次フェーズ予定</span>
              </label>
              <div className="sweetness-placeholder">
                <input
                  id="search-sweetness"
                  type="range"
                  min={-2}
                  max={2}
                  step={1}
                  value={formState.sweetness}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      sweetness: event.target.value,
                    }))
                  }
                  aria-label="甘辛度（フェーズ5で有効化予定）"
                  disabled
                />
                <span>準備中</span>
              </div>
            </div>

            <div className="search-form__actions">
              <button
                type="submit"
                className="btn btn--primary"
                disabled={!isOnline}
              >
                検索する
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={handleReset}
                disabled={!formState.q && !formState.region}
              >
                クリア
              </button>
            </div>
          </form>
        </div>

        <section className="results-section" aria-live="polite">
          {data && (
            <p className="results-section__summary">
              合計 {totalResults} 件（{items.length} 件表示中）
            </p>
          )}

          {isInitialLoading && (
            <div className="card-grid">
              {Array.from({ length: 6 }).map((_, index) => (
                <SakeCardSkeleton key={index} />
              ))}
            </div>
          )}

          {error && (
            <div className="results-state results-state--error">
              <p>
                検索結果の取得に失敗しました。時間をおいて再度お試しください。
              </p>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                再試行する
              </button>
            </div>
          )}

          {showEmptyState && (
            <div className="results-state results-state--empty">
              <p>該当する銘柄は見つかりませんでした…</p>
              <p className="results-state__hint">
                キーワードの言い換えや地域を変更して再検索してみてください。
              </p>
            </div>
          )}

          {!isInitialLoading && !error && items.length > 0 && (
            <>
              <div className="card-grid">
                {items.map((item) => (
                  <SakeCard
                    key={item.id}
                    sake={item}
                    isFavorite={isFavorite(item.id)}
                    onToggle={() =>
                      toggleFavorite({
                        id: item.id,
                        name: item.name,
                        brewery: item.brewery,
                        region: item.region,
                        imageUrl: item.imageUrl,
                      })
                    }
                  />
                ))}
              </div>

              <div className="load-more">
                {hasNextPage ? (
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={() => fetchNextPage()}
                    disabled={!isOnline || isFetchingNextPage}
                  >
                    {isFetchingNextPage ? '読み込み中…' : 'さらに表示'}
                  </button>
                ) : (
                  <p className="load-more__end">すべて表示しました</p>
                )}
              </div>
            </>
          )}
        </section>
      </div>

      {toast && (
        <div
          className={`network-toast network-toast--${toast}`}
          role="status"
          aria-live="assertive"
        >
          {toast === 'online'
            ? 'オンラインに復帰しました'
            : '現在オフラインです'}
        </div>
      )}
    </div>
  );
};

type SakeCardProps = {
  sake: SakeSummary;
  isFavorite: boolean;
  onToggle: () => void;
};

const SakeCard = ({ sake, isFavorite, onToggle }: SakeCardProps) => {
  const tags = sake.tags.slice(0, 2);
  return (
    <div className="sake-card">
      <Link className="sake-card__link" to={`/sake/${sake.id}`}>
        <div className="sake-card__media">
          {sake.imageUrl ? (
            <img
              src={sake.imageUrl}
              alt={`${sake.name}のラベル`}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="sake-card__placeholder" aria-hidden="true">
              No Image
            </div>
          )}
        </div>
        <div className="sake-card__body">
          <h3>{sake.name}</h3>
          <p className="sake-card__brewery">{sake.brewery}</p>
          <p className="sake-card__region">{sake.region}</p>
          {tags.length > 0 && (
            <div className="sake-card__tags">
              {tags.map((tag) => (
                <span key={tag} className="sake-card__tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
      <button
        type="button"
        className={`favorite-toggle${isFavorite ? ' is-active' : ''}`}
        aria-pressed={isFavorite}
        aria-label={
          isFavorite
            ? `${sake.name}をお気に入りから削除`
            : `${sake.name}をお気に入りに追加`
        }
        onClick={onToggle}
      >
        ★
      </button>
    </div>
  );
};

const SakeCardSkeleton = () => (
  <div className="sake-card sake-card--skeleton" aria-hidden="true">
    <div className="sake-card__media skeleton-block" />
    <div className="sake-card__body">
      <div className="skeleton-block skeleton-block--line" />
      <div className="skeleton-block skeleton-block--line short" />
      <div className="skeleton-block skeleton-block--chip" />
    </div>
  </div>
);

export default SearchPage;
