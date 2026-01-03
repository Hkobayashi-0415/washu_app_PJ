# Release Guide (Dev / Preview / Prod)

## 共通
- Frontend: `VITE_API_BASE_URL` を API の公開 URL に合わせる。
- Backend: `.env.example` の `DATABASE_URL`, `CORS_ORIGINS`, `CORS_ALLOWED_ORIGINS` を環境に合わせる。
- PWA: `start_url` と `scope` が配信ドメインに合っていることを確認する。
- Health check: `GET /health` が 200 で返ることを確認する。

## Dev
1) DB/Redis/Backend を Compose で起動
2) Frontend は dev/preview を必要に応じて起動

```bash
docker compose up -d db redis backend
cd frontend
pnpm run dev -- --host 0.0.0.0 --port 5173
```

## Preview（例: Cloudflare Pages / Vercel + Render / Fly.io）
Frontend:
- `pnpm run build` で `frontend/dist` を生成して静的ホスティングにデプロイ。
- `VITE_API_BASE_URL=https://<backend-domain>` を設定。

Backend:
- Render/Fly.io などで API を公開。
- `CORS_ORIGINS` と `CORS_ALLOWED_ORIGINS` に Preview のフロント URL を登録。

## Prod
Preview と同一構成で本番用ドメインを割り当てる。
- TLS（HTTPS）必須。
- PWA の `start_url` / `scope` と配信ドメインが一致していることを確認。

## リリース前チェック
- `pnpm run build` + `pnpm run lh:ci` で Lighthouse のしきい値を満たす
- `pnpm run e2e` で Playwright スモークとスクショが生成される
- `docs/screenshots/` と `docs/lh/` の成果物が揃っている
