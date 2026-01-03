# Washu App (PWA) - Phase 6 MVP

日本酒との出会いをサポートする Washu App の PWA フロントエンドです。Vite + React + TypeScript をベースに、検索 / 詳細 / 最近見た / お気に入りをオフラインでも扱えるよう IndexedDB を併用しています。

## セットアップ
- Node.js 20 / Corepack 有効化（pnpm 9 以降推奨）
- Docker Desktop（backend/db/redis 用）
- clone 後、環境変数を設定
  - `frontend/.env` 例: `VITE_API_BASE_URL=http://localhost:18000`
  - backend の例は `.env.example` を参照

### 初回
```bash
# フロントエンド依存取得（初回のみ）
cd frontend
pnpm install
```

### コンテナ起動（データ投入込み）
```bash
docker compose down
docker compose up -d db redis
docker compose run --rm backend alembic -c //app/alembic.ini upgrade head
docker compose run --rm seed
docker compose up -d backend
```

- PowerShell なら `-c /app/alembic.ini` でも可。Git Bash のパス変換を避けるなら `//app/alembic.ini`。
- 詳細な手順・確認コマンドは `docs/TEST_PROCEDURE.md` を参照（相互リンク）。

## 起動とスモーク
- Dev: `pnpm run dev -- --host 0.0.0.0 --port 5173`
- Preview: `pnpm run build && pnpm run preview -- --host 0.0.0.0 --port 4173`
- Backend 健康確認: `curl http://localhost:18000/health`
- 主要動線: `/search → /sake/:id → /recent → /favorites`（★トグルは即時反映＋IndexedDB 永続）

## 機能ガイド
- **検索 /search**: キーワード・地域で検索。オフライン時はボタン無効＋バナー表示。React Query で再試行とキャッシュ。
- **詳細 /sake/:id**: 蔵元・地域・味わいタグ等を表示し、閲覧すると「最近見た」に保存。画像を preload して LCP を抑制。
- **最近見た /recent**: 最大 50 件を新しい順に保持。オフラインでも閲覧可能。
- **お気に入り /favorites**: 一覧/詳細の★トグルで登録・削除。重複なし、最新順。オフラインでも閲覧・削除可。
- **PWA**: `vite-plugin-pwa` により manifest / Service Worker を生成。`public/offline.html` をナビゲーションフォールバックに使用。

### インストール（A2HS）
- iOS Safari: 共有シート → ホーム画面に追加
- Android Chrome / Desktop Chrome: アドレスバーの「インストール」アイコンまたはメニュー → インストール
- iOS 用の `apple-touch-icon` は `frontend/index.html` で定義済み

### トラブルシュート
- バックエンド未起動: `ERR_CONNECTION_REFUSED` → `docker compose ps` で確認
- CORS: `frontend/.env` の `VITE_API_BASE_URL` と backend 側 CORS 設定を合わせる
- `ERR_NAME_NOT_RESOLVED` で `backend:8000` が見える場合: `docker-compose.dev.yml` の `VITE_API_BASE_URL` を `http://localhost:18000` に合わせるか、起動時に `-e VITE_API_BASE_URL=http://localhost:18000` を渡す
- SW/キャッシュ更新: DevTools の Application → Service Workers で「Update」または `pnpm run build` し直して `pnpm run preview`
- 依存の取り直し（node_modules ボリューム利用時は初回のみ）:
  - Docker: `docker compose -f docker-compose.dev.yml run --rm frontend pnpm install --frozen-lockfile`
  - ローカル: `rm -rf node_modules` 後に `pnpm install --frozen-lockfile`

## 計測（MVP no-op）
`frontend/src/lib/analytics.ts` に `track(event, params)` を用意。現在は DEV で `console.debug` のみ（実送信なし）。主要導線で screen_view / search_exec / detail_view / fav_add / fav_remove / offline_banner_show / error を発火。

## テスト / チェック
- Backend: `docker compose run --rm backend sh -c "pip install -r /app/requirements-dev.txt && pytest -q"`
- Frontend: `docker compose -f docker-compose.dev.yml run --rm frontend pnpm run lint` / `pnpm run typecheck`
- E2E: `pnpm run e2e`（スモーク＋スクショ）または `pnpm run e2e:smoke` / `pnpm run e2e:screenshots`
- 詳細手順とコマンドは `docs/TEST_PROCEDURE.md` を参照。

  Node をローカルに入れず Docker で実行する場合（API はモックするため backend 起動は不要）:
  ```bash
  # frontend_node_modules の実体は docker volume ls で確認（例: washu_app_pj_frontend_node_modules）
  docker run --rm -v ${PWD}/frontend:/app \
    -v washu_app_pj_frontend_node_modules:/app/node_modules \
    -w /app mcr.microsoft.com/playwright:v1.57.0-jammy \
    bash -lc "corepack enable && corepack prepare pnpm@9.0.0 --activate && PNPM_CONFIG_PRODUCTION=false pnpm install --frozen-lockfile && pnpm run build && pnpm run e2e"
  ```

## Lighthouse
本番ビルドを対象にモバイル計測。`frontend/lighthouserc.cjs` でしきい値を管理します。

```bash
cd frontend
pnpm run build
pnpm run lh:ci
```

レポートは `docs/lh/` に保存されます（Performance >= 75, Installable Pass, Accessibility/Best Practices/SEO >= 90 を目標）。

## スクリーンショット
Playwright で /search /sake/:id /favorites を自動保存します。

```bash
cd frontend
pnpm run e2e:screenshots
```

`docs/screenshots/` に以下を保存してください（実ファイルはコミット推奨）:
- /search
- /sake/:id
- /favorites
- A2HS プロンプト（手動）
- Standalone 起動（手動）

## リリース導線（例）
詳細は `docs/RELEASE_GUIDE.md` を参照。

- Dev: `docker compose up -d db redis backend frontend`（backend は 18000、frontend は preview/5173）
- Preview: フロントを静的ホスティング（Cloudflare Pages/Vercel など）。API は Render/Fly.io 等で公開し `VITE_API_BASE_URL` と CORS を一致させる。
- Prod: Preview と同一構成で本番用ドメインを割り当て。TLS 必須。PWA の `scope` と `start_url` が配信ドメインに合っていることを確認。

## 参考リンク
- テスト手順・環境メモ: `docs/TEST_PROCEDURE.md`
- リリースガイド: `docs/RELEASE_GUIDE.md`
- 仕様書・設計: `project_overview.md`, `technical_specifications.md`, `ui_ux_design.md`


