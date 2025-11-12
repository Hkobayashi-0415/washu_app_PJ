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
````

## 必要環境

- Node.js 20 系（LTS）
- npm 10 以上
- 推奨ブラウザ: Chrome 120+ / Safari 17+

## 初期セットアップ

```bash
cd frontend
pnpm install
````

> ネットワークポリシーで npm registry へアクセスできない場合は、利用可能なミラーを `npm config set registry <url>` で指定してください。


## 環境変数

`frontend/.env` または `frontend/.env.local` に以下を設定してください。

```
VITE_API_BASE_URL=http://localhost:8000
```

バックエンドを別ポートで起動する場合は値を調整します。CI や Docker Compose では環境に応じて上書きしてください。

## 開発コマンド

| コマンド | 説明 |
| --- | --- |
| `pnpm run dev` | 開発サーバーを起動（`http://localhost:5173`）。Service Worker はデバッグモードで更新されます。 |
| `pnpm run build` | 本番ビルドを `dist/` に出力。 |
| `pnpm run preview` | 本番ビルドをローカルで配信し動作確認。 |
| `pnpm run lint` | ESLint + Prettier ルールで静的解析。 |
| `pnpm run typecheck` | TypeScript 型チェック。 |


## フェーズ3: 検索ページの使い方

- `/search` ページでキーワードと地域を指定すると、FastAPI の `/api/v1/sake/search` に接続した結果一覧が表示されます。
- `@tanstack/react-query` と `zod` を利用してレスポンスの検証と再試行制御を行います。API 仕様を変更する際は `frontend/src/lib/api.ts` を更新してください。
- オフライン時は `navigator.onLine` と online/offline イベントで検知し、検索ボタンを無効化して案内バナーを表示します。復帰後はキャッシュを基に自動で再取得します。
- 「さらに表示」ボタンでページングし、`page / per_page / total` の値から次ページの有無を判定しています。
- 0件時の空状態、通信エラー時のリトライ導線、ネットワークトーストの表示を確認してください。甘辛スライダーは UI のみで、今回のリクエストには送信しません。
- バックエンド（FastAPI）が起動していない場合は接続不能として検知し、「APIサーバーに接続できません。バックエンドが起動しているか確認してください。」と案内されます。`uvicorn app.main:app --reload --app-dir backend --host 0.0.0.0 --port 8000` などで API を立ち上げてから検索してください。

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

1. `pnpm run build` と `pnpm run preview` で本番プレビューを起動。
2. ブラウザの DevTools で「Offline」を有効化。
3. ページをリロードし、`offline.html` のメッセージが表示されることを確認。
4. オンラインに戻して再読み込みすると通常画面が復帰します。

## QA / Lighthouse

- 本番ビルド (`pnpm run build && pnpm run preview`) を対象に Lighthouse (モバイル) を実行してください。
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
````

## ライセンス

本リポジトリのライセンスに従います。
