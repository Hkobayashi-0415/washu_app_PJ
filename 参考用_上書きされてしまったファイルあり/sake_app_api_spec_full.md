
# 日本酒アプリ API仕様書

## API一覧表

| API名               | エンドポイント               | メソッド | 概要 |
|---------------------|-----------------------------|----------|------|
| ユーザー登録        | /api/users/register          | POST     | 新規ユーザーを登録する |
| ユーザーログイン    | /api/users/login             | POST     | ユーザーを認証してトークンを発行 |
| ユーザーログアウト  | /api/users/logout            | POST     | セッションを終了 |
| 日本酒検索          | /api/sake/search             | GET      | キーワードや条件で日本酒を検索 |
| 日本酒詳細取得      | /api/sake/{id}               | GET      | 日本酒の詳細情報を取得 |
| お気に入り追加      | /api/favorites               | POST     | 指定した日本酒をお気に入りに登録 |
| お気に入り一覧      | /api/favorites               | GET      | ユーザーのお気に入りリストを取得 |
| お気に入り削除      | /api/favorites/{id}          | DELETE   | 指定したお気に入りを削除 |
| 課金プラン確認      | /api/subscription/status     | GET      | 現在の課金プラン情報を取得 |
| 課金プラン変更      | /api/subscription/change     | POST     | 無料・有料プランを切り替え |
| 推奨（おすすめ）取得| /api/recommendations         | GET      | ユーザー好みや履歴に基づき日本酒を提案 |

---

## API詳細仕様

### 1. ユーザー登録 API
- **エンドポイント**: `/api/users/register`
- **メソッド**: `POST`
- **リクエスト例**
```json
{
    "username": "sakefan",
    "email": "user@example.com",
    "password": "securepassword"
}
```
- **レスポンス例**
```json
{
    "status": "success",
    "user_id": 123
}
```

### 2. ユーザーログイン API
- **エンドポイント**: `/api/users/login`
- **メソッド**: `POST`
- **リクエスト例**
```json
{
    "email": "user@example.com",
    "password": "securepassword"
}
```
- **レスポンス例**
```json
{
    "status": "success",
    "token": "jwt_token_here"
}
```

### 3. ユーザーログアウト API
- **エンドポイント**: `/api/users/logout`
- **メソッド**: `POST`
- **リクエストヘッダ**
```
Authorization: Bearer jwt_token_here
```
- **レスポンス例**
```json
{
    "status": "success"
}
```

### 4. 日本酒検索 API
- **エンドポイント**: `/api/sake/search`
- **メソッド**: `GET`
- **クエリパラメータ**
  - `q` (任意): 検索キーワード
  - `taste` (任意): 味の傾向（例: "甘口", "辛口"）
  - `type` (任意): 種類（例: "純米大吟醸"）
- **レスポンス例**
```json
[
    {
        "id": 1,
        "name": "獺祭 純米大吟醸45",
        "brewery": "旭酒造",
        "taste": "フルーティ",
        "image_url": "https://example.com/sake.jpg"
    }
]
```

### 5. 日本酒詳細取得 API
- **エンドポイント**: `/api/sake/{id}`
- **メソッド**: `GET`
- **レスポンス例**
```json
{
    "id": 1,
    "name": "獺祭 純米大吟醸45",
    "brewery": "旭酒造",
    "taste": "フルーティ",
    "alcohol": 16,
    "description": "華やかな香りとキレのある味わい",
    "awards": ["全国新酒鑑評会 金賞"]
}
```

### 6. お気に入り管理 API
- **追加**: `/api/favorites` (POST)
- **一覧**: `/api/favorites` (GET)
- **削除**: `/api/favorites/{id}` (DELETE)
- **レスポンス例（一覧）**
```json
[
    {
        "id": 1,
        "name": "獺祭 純米大吟醸45",
        "brewery": "旭酒造"
    }
]
```

### 7. 課金プラン API
- **ステータス確認**: `/api/subscription/status` (GET)
- **変更**: `/api/subscription/change` (POST)
- **レスポンス例**
```json
{
    "status": "active",
    "plan": "premium"
}
```

### 8. 推奨（おすすめ）API
- **エンドポイント**: `/api/recommendations`
- **メソッド**: `GET`
- **クエリパラメータ**
  - `taste` (任意): 味の傾向
  - `limit` (任意): 返す件数
- **レスポンス例**
```json
[
    {
        "id": 2,
        "name": "十四代 本丸",
        "brewery": "高木酒造",
        "reason": "過去のお気に入りと似た味わい"
    }
]
```

---

## 共通エラーレスポンス例
```json
{
    "status": "error",
    "message": "認証に失敗しました",
    "code": "AUTH_FAILED"
}
```
