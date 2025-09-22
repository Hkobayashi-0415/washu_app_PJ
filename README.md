# Washu App PWA フロントエンド（フェーズ1）

日本酒との新しい出会いをサポートする Washu App のフロントエンド土台です。Vite + React + TypeScript をベースに、Progressive Web App (PWA) としてインストール・オフライン利用できるよう構成しています。

## プロジェクト構成

```
washu_app_PJ/
├── frontend/              # Vite + React + TS プロジェクト
│   ├── src/               # アプリケーションソース
│   ├── public/            # PWA アイコン・オフラインページなどの静的アセット
│   ├── index.html         # エントリ HTML
│   ├── vite.config.ts     # Vite & PWA 設定
│   └── package.json       # 依存関係と npm scripts
└── .github/workflows/     # フロントエンド CI（lint/typecheck/build）
```

## 必要環境

- Node.js 20 系（LTS）
- npm 10 以上
- 推奨ブラウザ: Chrome 120+ / Safari 17+

## 初期セットアップ

```bash
cd frontend
npm install
```

> ネットワークポリシーで npm registry へアクセスできない場合は、利用可能なミラーを `npm config set registry <url>` で指定してください。

## 開発コマンド

| コマンド | 説明 |
| --- | --- |
| `npm run dev` | 開発サーバーを起動（`http://localhost:5173`）。Service Worker はデバッグモードで更新されます。 |
| `npm run build` | 本番ビルドを `dist/` に出力。 |
| `npm run preview` | 本番ビルドをローカルで配信し動作確認。 |
| `npm run lint` | ESLint + Prettier ルールで静的解析。 |
| `npm run typecheck` | TypeScript 型チェック。 |

## PWA 構成のポイント

- `vite-plugin-pwa` により manifest / Service Worker / オフラインキャッシュを自動生成。
- `public/icons/` 配下に 192px・512px・maskable の PNG アイコンを配置。
- `public/offline.html` をナビゲーションフォールバックとして配信。オフライン時は自動でこのページへ切り替わります。
- Runtime caching 戦略
  - ドキュメント: `NetworkFirst`
  - スクリプト・スタイル: `StaleWhileRevalidate`
  - 画像: `CacheFirst`（最大 100 件・30 日）

## PWA インストール手順

### iOS Safari
1. `https://<デプロイURL>` を開き、共有シートを開く。
2. 「ホーム画面に追加」を選択し、名称を確認して追加。
3. ホーム画面から起動するとスタンドアロン表示になります。

### Android Chrome
1. 対象ページを開くと画面下部/右上に「インストール」バナーが表示されます。
2. バナーをタップ、または Chrome メニューから「アプリをインストール」。
3. インストール完了後はアプリ一覧やホーム画面から起動可能です。

### デスクトップ (Chrome / Edge)
1. アドレスバー右端の「インストール」アイコンをクリック。
2. ダイアログで「インストール」を選択。
3. 以降は独立ウィンドウとして利用できます。

## オフライン動作の確認手順

1. `npm run build` と `npm run preview` で本番プレビューを起動。
2. ブラウザの DevTools で「Offline」を有効化。
3. ページをリロードし、`offline.html` のメッセージが表示されることを確認。
4. オンラインに戻して再読み込みすると通常画面が復帰します。

## QA / Lighthouse

- 本番ビルド (`npm run build && npm run preview`) を対象に Lighthouse (モバイル) を実行してください。
- PWA カテゴリの「Installable」が Pass になる構成です。

## CI について

`.github/workflows/fe-ci.yml` は Docker を用いてフロントエンドをビルドします。

- `frontend/Dockerfile` を `docker build` し、コンテナ内で `typecheck`/`lint`/`build` を実行。
- 成果物 `dist/` はコンテナから取り出してアーティファクトとして保存します。

必要に応じて後続フェーズでテストや E2E を追加してください。

## Docker でのビルド（任意）

ローカルでも Docker を使って依存関係を隔離したビルドが可能です。

```bash
# ルート（washu_app_PJ）で実行
docker build -t washu-frontend:build ./frontend

# dist を取り出す（Windows PowerShell の例）
$id = docker create washu-frontend:build; `
docker cp $id:/app/dist ./frontend/dist; `
docker rm $id
```

## ライセンス

本リポジトリのライセンスに従います。
