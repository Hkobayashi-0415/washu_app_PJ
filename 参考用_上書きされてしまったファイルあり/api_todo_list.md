# 日本酒アプリ API実装TODOリスト（Django REST Framework）

## フェーズ1：環境構築
- [ ] Python仮想環境作成（`venv` / `poetry`）
- [ ] Django & DRF & SimpleJWT & CORS インストール
- [ ] `sake_app` プロジェクト作成
- [ ] `users`, `sake`, `favorites`, `search`, `payments` アプリ作成
- [ ] settings.py 設定（INSTALLED_APPS, CORS, JWT設定）
- [ ] ロガークラス作成 & 設定

## フェーズ2：ユーザー管理API
- [ ] ユーザーモデル定義（カスタムUser）
- [ ] 新規登録（POST `/auth/signup/`）
- [ ] ログイン & JWT発行（POST `/auth/login/`）
- [ ] トークン更新（POST `/auth/refresh/`）
- [ ] プロフィール取得・更新（GET/PATCH `/users/me/`）
- [ ] アカウント削除（DELETE `/users/me/`）

## フェーズ3：お酒データAPI
- [ ] 銘柄モデル定義（酒蔵名・銘柄名・タイプ・説明文・受賞歴など）
- [ ] 一覧取得（GET `/sake/list/`、フィルター付き）
- [ ] 詳細取得（GET `/sake/detail/{id}/`）

## フェーズ4：お気に入りAPI
- [ ] モデル定義（UserID・SakeID・登録日時）
- [ ] お気に入り追加（POST `/favorites/add/`、5件制限ロジック）
- [ ] お気に入り一覧取得（GET `/favorites/list/`）
- [ ] お気に入り削除（DELETE `/favorites/remove/{id}/`）

## フェーズ5：検索API
- [ ] クエリパラメータによる検索（GET `/search/sake/`）
- [ ] 名前・味・酒蔵名などを部分一致検索

## フェーズ6：課金API（基本実装）
- [ ] 課金プランモデル定義（名称・価格・説明）
- [ ] プラン一覧取得（GET `/payments/plans/`）
- [ ] 課金ステータス確認（GET `/payments/status/`）

## フェーズ7：販売店検索API（planned）
- [ ] 将来実装のためのルート仮置き

## フェーズ8：共通機能
- [ ] エラーコード共通化 & JSONレスポンス統一
- [ ] 全APIのログ記録（アクセス・エラー）
- [ ] APIドキュメント自動生成（drf-yasg / drf-spectacular）
