目的
- 直近の npm サプライチェーン攻撃（debug/chalk 系、Shai-Hulud）に対する実務的な緩和策を導入します。

方針（結論）
- CIでは常にライフサイクルスクリプトを無効化（--ignore-scripts / 環境変数）。
- 代表的な悪性/疑義バージョンを overrides/resolutions で良版へ強制。
- Docker ビルド時の依存解決もスクリプト無効で実行。
- 手動検査用のgrepテンプレと、必要に応じた鍵ローテーションを推奨。

実装済みの変更
1) GitHub Actions（.github/workflows/ci.yml）
- npm/pnpm/yarn いずれでもスクリプト無効で install を実行。
  - npm: npm_config_ignore_scripts=true / --ignore-scripts
  - pnpm: PNPM_IGNORE_SCRIPTS=true / --ignore-scripts
  - yarn: YARN_ENABLE_SCRIPTS=false / --mode=skip-builds

2) フロントエンドのDockerfile
- frontend/Dockerfile, frontend/Dockerfile.dev
  - npm ci / npm install に --ignore-scripts を付与。

3) 依存の健全化（frontend/package.json）
- npm overrides / pnpm.overrides / yarn resolutions で代表的な依存を良版へ固定：
  - debug: 4.3.6
  - color: 4.2.3
  - @ctrl/tinycolor: ">=4.1.2"

手動チェック（任意）
```bash
cd frontend
# 0) node_modules を掃除
rm -rf node_modules

# 1) スクリプト無効でクリーンインストール
export npm_config_ignore_scripts=true
npm ci || npm install --ignore-scripts

# 2) 代表的な依存パッケージの有無確認
npm ls chalk debug @ctrl/tinycolor color error-ex backslash || true

# 3) ワークフロー/怪しい記述の簡易grep（リポジトリルート）
grep -RniE ".github/workflows|postinstall|curl|wget|base64|webhook|requestcatcher|pastebin" . || true
```

Secrets運用（推奨）
- CIのSecretsは最小限にし、OIDC等の短命クレデンシャル利用へ移行。
- 既に影響期間に npm install を行っている場合は、念のためGitHub PAT/Actions secrets/npm token/クラウド鍵のローテーションを検討。

