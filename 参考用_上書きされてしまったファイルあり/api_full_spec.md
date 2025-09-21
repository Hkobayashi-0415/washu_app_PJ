# 日本酒推薦アプリ API仕様書 (統合版)

---
## 1. ユーザー登録 API

**エンドポイント**
```
POST /users/register
```

**概要**
新規ユーザーを登録します。無料プランがデフォルト。

**リクエスト**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "username": "sake_lover"
}
```

**レスポンス**
```json
{
  "status": "success",
  "user_id": "12345"
}
```

---
## 2. ログイン API

**エンドポイント**
```
POST /users/login
```

**概要**
ユーザー認証を行い、JWTを返却します。

**リクエスト**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**レスポンス**
```json
{
  "status": "success",
  "token": "jwt.token.string"
}
```

---
## 3. お気に入り登録 API

**エンドポイント**
```
POST /favorites
```

**概要**
ユーザーのお気に入りリストに銘柄を追加します。無料ユーザーは最大5件まで。

**リクエスト**
```json
{
  "sake_id": "SAKE123"
}
```

**レスポンス**
```json
{
  "status": "success",
  "favorites": [
    {"id": "SAKE123", "name": "獺祭 純米大吟醸45"}
  ]
}
```

---
## 4. お気に入り取得 API

**エンドポイント**
```
GET /favorites
```

**概要**
ユーザーのお気に入りリストを取得。

**レスポンス**
```json
{
  "status": "success",
  "favorites": [
    {"id": "SAKE123", "name": "獺祭 純米大吟醸45"},
    {"id": "SAKE456", "name": "十四代 本丸"}
  ]
}
```

---
## 5. お気に入り削除 API

**エンドポイント**
```
DELETE /favorites/{id}
```

**概要**
お気に入りから指定銘柄を削除。

**レスポンス**
```json
{
  "status": "success",
  "message": "お気に入りから削除しました"
}
```

---
## 6. 課金プラン取得 API

**エンドポイント**
```
GET /plans
```

**概要**
利用可能な課金プランを取得。

**レスポンス**
```json
{
  "status": "success",
  "plans": [
    {"name": "Free", "max_favorites": 5, "llm_calls": 10},
    {"name": "Premium", "max_favorites": 50, "llm_calls": 1000}
  ]
}
```

---
## 7. 課金状態確認 API

**エンドポイント**
```
GET /subscription
```

**概要**
ユーザーの課金状態を取得。

**レスポンス**
```json
{
  "status": "success",
  "plan": "Premium",
  "expires_at": "2025-12-31T23:59:59Z"
}
```

---
## 8. 販売店検索 API（仮仕様／今回実装なし／将来構想）

**エンドポイント**
```
GET /shops
```

**概要**
銘柄を販売している酒屋を検索。

**備考**
- 今回は実装対象外
- 将来的に位置情報やECサイト連携を想定

---
## 9. 推奨 API（仮仕様／今回実装なし／将来構想）

**エンドポイント**
```
POST /recommendations
```

**概要**
自然言語または味のイメージからおすすめ銘柄を提示。

**リクエスト**
```json
{
  "query": "フルーティーで甘口、日本酒初心者向け"
}
```

**レスポンス**
```json
{
  "status": "success",
  "recommendations": [
    {"id": "SAKE789", "name": "久保田 千寿"},
    {"id": "SAKE456", "name": "十四代 本丸"}
  ]
}
```

**備考**
- 今回は実装対象外
- 将来的にLLMを利用予定
