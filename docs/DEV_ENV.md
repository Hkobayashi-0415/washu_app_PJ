## 開発環境の起動（共通Compose）

以下の簡易ターゲットを追加しました。`.env` が無ければ作成してから起動してください。

```bash
make setup-env
docker compose -f docker-compose.common.yml up -d --build
docker compose -f docker-compose.common.yml logs -f --tail=100
```

- FE: http://localhost:5173
- BE: http://localhost:18000
- DB: postgres://postgres:postgres@localhost:55432/washu

### Quick Checks

- Smoke: `make smoke`（/health が 200 なら OK。必要に応じてエンドポイント名を変更）
- PWA: FE 起動後、スマホでアクセスし「ホーム画面に追加」→ 単独ウィンドウで起動
- オフライン: DevTools でオフラインにして offline ページが表示されること

### CI（最小）

- PR 作成で BE（pytest 最小）/ FE（ビルド）を実行
- パッケージマネージャは pnpm / yarn を Corepack で固定（lock に追従）。lock が無ければ npm を使用
