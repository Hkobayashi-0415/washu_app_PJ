import { useEffect, useState } from 'react';

const INSTALL_HELP_LINK = 'https://developer.mozilla.org/docs/Web/Progressive_web_apps/Guides/Installing';

const formatTimestamp = (timestamp: number) =>
  new Date(timestamp).toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

const Home = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const onStatusChange = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', onStatusChange);
    window.addEventListener('offline', onStatusChange);

    return () => {
      window.removeEventListener('online', onStatusChange);
      window.removeEventListener('offline', onStatusChange);
    };
  }, []);

  return (
    <main>
      <div className="container">
        <header>
          <p style={{ fontWeight: 600, letterSpacing: '0.08em', color: '#1e293b' }}>Washu App</p>
          <h1>日本酒との出会いを、いつでもどこでも。</h1>
          <p>
            フェーズ1では、後続の機能開発をすぐに始められるよう PWA 対応のフロントエンド土台を整えています。
          </p>
        </header>

        <section>
          <h2>現在の接続状況</h2>
          <p>
            {isOnline ? 'オンラインで利用中です。' : 'オフラインです。接続が復旧したら自動で再同期します。'}
          </p>
          <p>最終更新: {formatTimestamp(Date.now())}</p>
        </section>

        <section>
          <h2>次のステップ</h2>
          <ul>
            <li>ホーム画面に追加すると、スタンドアロンアプリとして起動できます。</li>
            <li>オフライン時はキャッシュされたデータと <code>offline.html</code> が表示されます。</li>
            <li>今後のフェーズで API 連携や検索 UI を拡張予定です。</li>
          </ul>
          <div className="button-row">
            <a className="install" href="#install">インストール手順を見る</a>
            <a href={INSTALL_HELP_LINK} target="_blank" rel="noreferrer">
              PWAガイド (MDN)
            </a>
          </div>
        </section>

        <section id="install">
          <h2>ホーム画面への追加方法</h2>
          <p>端末別の手順は README を参照してください。概略は以下の通りです。</p>
          <ul>
            <li>iOS Safari: 共有メニューから「ホーム画面に追加」。</li>
            <li>Android Chrome: 「インストール」バナー、またはメニューから「アプリをインストール」。</li>
            <li>Desktop Chrome/Edge: アドレスバーの「インストール」ボタン。</li>
          </ul>
        </section>
      </div>
    </main>
  );
};

export default Home;
