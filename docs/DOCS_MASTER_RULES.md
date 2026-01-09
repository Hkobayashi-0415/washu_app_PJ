# Documentation Master Rules

複数エージェントでの記述を統一するための共通ルールです。新規ドキュメント作成や既存ドキュメント更新は、本書を参照してください。

## 目的
- ドキュメントの品質・粒度・表記を揃える
- 情報の分散や重複を減らし、参照性を上げる
- 作業ログと更新履歴を追跡可能にする

## 対象と置き場所
- README.md: プロダクト概要 / セットアップ / 主要導線 / 重要リンク
- docs/TEST_PROCEDURE.md: 再現可能なテスト手順
- docs/RELEASE_GUIDE.md: リリース手順と環境変数
- docs/DEV_ENV.md: 開発環境の前提・注意点
- docs/dev_logs/YYYY-MM-DD_<topic>.md: 作業ログ
- docs/lh/: Lighthouse レポート（HTML）
- docs/screenshots/: UI スクリーンショット（PNG）

## 命名規則
- 新規ドキュメントは `docs/` 配下に置く
- 作業ログは `docs/dev_logs/YYYY-MM-DD_<topic>.md` の形式
- ファイル名は英数字 + `_` + `-` を基本にする

## 形式・書式
- Markdown 形式（.md）で作成
- 見出しは H1 → H2 → H3 の順に使用
- コマンドはコードブロック（```bash など）で記載
- リンクは相対パスを優先
- 1項目 = 1行の箇条書きを基本とし、冗長な説明は避ける

## 内容ルール
- 冒頭に「目的」「スコープ」などの前提を明記
- 既存ドキュメントと重複する場合はリンクで参照し、本文は最小化
- 重要な変更は README と TEST_PROCEDURE に必ず反映
- UI文言やAPI名は実装と一致させる

## 作業ログの運用
- 重要な変更・判断・テスト結果を記録
- 事実のみ記載し、未実行のテストは書かない
- 変更内容は `Change:`、テストは `Test:`、課題は `Issue:` の形式で統一

### 作業ログテンプレ
```markdown
# Work Log YYYY-MM-DD (Topic)
- Scope: ...
- Change: ...
- Change: ...
- Test: ...
- Issue: ...
- Pending: ...
```

## 更新フロー（簡易）
1. 変更内容を README / docs に反映
2. `docs/dev_logs/` に作業ログを追加
3. 関連リンクの追加・更新（README 参照）

