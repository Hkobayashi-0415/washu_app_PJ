## テスト実行手順（デモデータ込み）

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

---

## 6. 本番ビルド & プレビュー確認（任意）

```bash
cd frontend
pnpm run build
pnpm run preview -- --host 0.0.0.0 --port 4173
```

ブラウザで `http://localhost:4173/search` を開いて同様に確認。

---

## 7. Lighthouse（任意）

```bash
cd frontend
npx --yes lighthouse http://localhost:4173 --preset=desktop --output=html --output-path=./lighthouse-desktop.html
```

---

## トラブルシュート

- `500` が出る場合: `docker compose logs backend --tail 50` を確認
- `CORS` の場合: `frontend/.env` の `VITE_API_BASE_URL` が `http://localhost:18000` に合っているか確認
- `ERR_CONNECTION_REFUSED` の場合: backend/DB が起動しているか確認
- `No config file 'C:/Program Files/Git/app/alembic.ini'` の場合: Git Bash のパス変換を回避するため `-c //app/alembic.ini` を使う
