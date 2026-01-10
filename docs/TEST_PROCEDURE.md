## テスト実行手順（デモデータ込み）

> 全体概要・トラブルシュートは README を参照。リリース導線は `docs/RELEASE_GUIDE.md` を参照。ここでは実行コマンドを簡潔にまとめます。

### 前提
- Docker Desktop が起動していること
- `pnpm` が利用できること
- 使用ポート: `18000` (BE), `5173` (FE dev), `4173` (FE preview)

---

## 1. コンテナをクリーンに起動

```bash
cd C:\Users\sugar\OneDrive\デスクトップ\washu_app_PJ
docker compose down
docker compose up -d db redis
docker compose run --rm backend alembic -c //app/alembic.ini upgrade head
docker compose run --rm seed
docker compose up -d backend
```

- `seed` は `backend/seed` の CSV を取り込みます。
- `load_seed` は upsert なので複数回実行しても重複しません。
- PowerShell で実行する場合は `-c /app/alembic.ini` でもOKです（Git Bash は `//app` 推奨）。

---

## 2. バックエンド疎通確認

```bash
curl http://localhost:18000/health
curl http://localhost:18000/api/v1/meta/regions
```

デモデータ確認（件数チェック）:

```bash
docker compose exec db psql -U washu_user -d washu_db -c "select count(*) from sake;"
```

---

## 3. バックエンドテスト（pytest）

```bash
docker compose run --rm backend sh -c "pip install -r /app/requirements-dev.txt && pytest -q"
```

---

## 4. フロントエンド（lint/typecheck）

```bash
docker compose -f docker-compose.dev.yml run --rm frontend pnpm install --frozen-lockfile
docker compose -f docker-compose.dev.yml run --rm frontend pnpm run lint
docker compose -f docker-compose.dev.yml run --rm frontend pnpm run typecheck
```

- `docker-compose.dev.yml` は `node_modules` を名前付きボリュームで保持するため、`pnpm install` は初回のみでOKです。

---

## 5. フロントエンド（開発サーバー）

```bash
cd frontend
pnpm install   # 初回のみ
pnpm run dev -- --host 0.0.0.0 --port 5173
```

ブラウザで `http://localhost:5173/search` を開いて確認:
- 一覧が表示される
- 詳細 `/sake/:id` に遷移できる
- 最近見た `/recent` に履歴が残る
- ★トグルでお気に入り登録でき、`/favorites` に反映される
- `/favorites` で削除でき、一覧/詳細の状態が一致する
- オフラインでも `/recent` と `/favorites` が見える
  - DevTools の Network → Offline でバナー表示とキャッシュ描画を確認

---

## 6. 本番ビルド & プレビュー確認（任意）

```bash
cd frontend
pnpm run build
pnpm run preview -- --host 0.0.0.0 --port 4173
```

ブラウザで `http://localhost:4173/search` を開いて同様に確認。

---

## 7. ライト E2E（スモーク）

Playwright を使う場合の例。API はテスト内でモックするため backend 起動は不要です。

```bash
# 別ターミナルで preview: pnpm run build && pnpm run preview -- --host 0.0.0.0 --port 4173
pnpm run e2e
```

  Node を入れず Docker で実行する場合:
  ```bash
  # frontend_node_modules の実体は docker volume ls で確認（例: washu_app_pj_frontend_node_modules）
  docker run --rm -v ${PWD}/frontend:/app \
    -v washu_app_pj_frontend_node_modules:/app/node_modules \
    -w /app mcr.microsoft.com/playwright:v1.57.0-jammy \
    bash -lc "corepack enable && corepack prepare pnpm@9.0.0 --activate && PNPM_CONFIG_PRODUCTION=false pnpm install --frozen-lockfile && pnpm run build && pnpm run e2e"
  ```

期待する導線:
- /search で検索して結果が1件以上表示
- カードをクリックして /sake/:id が開く
- ★トグル後に /favorites へ遷移して反映を確認
- オフライン切替で /favorites が表示される（検索は抑止）

スクリーンショットのみ取得する場合:

```bash
pnpm run e2e:screenshots
```

出力先: `docs/screenshots/`（/search, /sake/:id, /favorites）

---

## 8. Lighthouse（任意）

```bash
cd frontend
pnpm run build
pnpm run lh:ci
```

- 設定は `frontend/lighthouserc.cjs`。
- 出力先は `docs/lh/`。

Docker で実行する場合:

```bash
docker compose -f docker-compose.dev.yml run --rm frontend pnpm run build
docker compose -f docker-compose.dev.yml run --rm frontend pnpm run lh:ci
```

---

## 9. スクリーンショット（任意）
- `docs/screenshots/` に保存: /search、/sake/:id、/favorites は Playwright で自動保存
- A2HS プロンプト、Standalone 起動は手動で追加

---

## トラブルシュート

### 一般的なエラー
- `500` が出る場合: `docker compose logs backend --tail 50` を確認
- `CORS` の場合: `frontend/.env` の `VITE_API_BASE_URL` が `http://localhost:18000` に合っているか確認
- `ERR_CONNECTION_REFUSED` の場合: backend/DB が起動しているか確認
- `No config file 'C:/Program Files/Git/app/alembic.ini'` の場合: Git Bash のパス変換を回避するため `-c //app/alembic.ini` を使う
- `DuplicateTable` が出る場合: `docker compose down -v` でDBを作り直すか `alembic stamp head` で現在の状態を記録する

### Service Worker の更新

開発中に SW が古いキャッシュを返す場合:

1. **DevTools で強制更新**
   - Application → Service Workers → 「Update on reload」をチェック
   - または「Update」ボタンをクリック

2. **キャッシュをクリア**
   - Application → Storage → 「Clear site data」

3. **再ビルド**
   ```bash
   cd frontend
   pnpm run build
   pnpm run preview
   ```

### 依存関係の崩壊時

node_modules が壊れた場合や依存関係のコンフリクト時:

```bash
# ローカル
cd frontend
rm -rf node_modules
rm -f pnpm-lock.yaml  # 必要に応じて
pnpm install

# Docker (node_modules ボリュームを使用している場合)
docker volume rm washu_app_pj_frontend_node_modules
docker compose -f docker-compose.dev.yml run --rm frontend pnpm install --frozen-lockfile
```

### node_modules ボリュームの再生成

Docker の名前付きボリュームを使用している場合:

```bash
# ボリューム名を確認
docker volume ls | grep node_modules

# ボリュームを削除して再作成
docker volume rm washu_app_pj_frontend_node_modules
docker compose -f docker-compose.dev.yml run --rm frontend pnpm install --frozen-lockfile
```

### pnpm store の問題

pnpm のキャッシュが壊れた場合:

```bash
pnpm store prune
rm -rf ~/.pnpm-store  # 完全にクリアする場合
pnpm install
```
