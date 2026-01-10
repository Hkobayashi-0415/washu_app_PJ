# Release Guide (Dev / Preview / Prod)

> 詳細なコマンドや設定は `README.md` の「Release Guide (Preview → Prod)」セクションも参照してください。

## 共通
- Frontend: `VITE_API_BASE_URL` を API の公開 URL に合わせる。
- Backend: `.env.example` の `DATABASE_URL`, `CORS_ORIGINS`, `CORS_ALLOWED_ORIGINS` を環境に合わせる。
- PWA: `start_url` と `scope` が配信ドメインに合っていることを確認する。
- Health check: `GET /health` が 200 で返ることを確認する。

## 環境変数一覧

### Frontend
| 変数名 | 説明 | 例 |
|--------|------|-----|
| `VITE_API_BASE_URL` | バックエンド API の URL | `https://api.washu.example.com` |

### Backend
| 変数名 | 説明 | 例 |
|--------|------|-----|
| `DATABASE_URL` | PostgreSQL 接続文字列 | `postgresql+psycopg2://user:pass@host:5432/db` |
| `CORS_ORIGINS` | CORS 許可オリジン | `https://washu.example.com` |
| `CORS_ALLOWED_ORIGINS` | CORS 許可オリジン (代替) | `https://washu.example.com` |
| `APP_PORT` | API サーバーポート | `8000` |

## Dev
1) DB/Redis/Backend を Compose で起動
2) Frontend は dev/preview を必要に応じて起動

```bash
docker compose up -d db redis backend
cd frontend
pnpm run dev -- --host 0.0.0.0 --port 5173
```

## Preview（例: Cloudflare Pages / Vercel + Render / Fly.io）

### Frontend
1. `pnpm run build` で `frontend/dist` を生成
2. 静的ホスティングにデプロイ
3. `VITE_API_BASE_URL=https://<backend-domain>` を設定
4. 404 → `index.html` リダイレクト設定（SPA 対応）

### Backend
1. Render/Fly.io などで API を公開
2. 環境変数を設定:
   ```
   DATABASE_URL=postgresql+psycopg2://...
   CORS_ORIGINS=https://<frontend-domain>
   ```
3. デプロイ後にマイグレーション実行:
   ```bash
   alembic -c backend/alembic.ini upgrade head
   python -m app.scripts.load_seed --dir backend/seed
   ```
4. `/health` 確認: `curl https://<backend-domain>/health`

## Prod
Preview と同一構成で本番用ドメインを割り当てる。
- TLS（HTTPS）必須。
- PWA の `start_url` / `scope` と配信ドメインが一致していることを確認。

## リリース前チェック
- [ ] `pnpm run build` が成功
- [ ] `pnpm run lh:ci` で Lighthouse のしきい値を満たす
- [ ] `pnpm run e2e` で Playwright スモークとスクショが生成される
- [ ] `docs/screenshots/` と `docs/lh/` の成果物が揃っている
- [ ] `/health` が 200 を返す

## タグ付け

```bash
git tag -a v0.1.0-mvp -m "MVP release: Phase 1-6 complete"
git push origin v0.1.0-mvp
```

リリースノートは `docs/release-notes/` を参照。
