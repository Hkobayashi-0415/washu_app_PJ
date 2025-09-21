
# 日本酒アプリ API 仕様書（最終版）

## 0. 共通仕様
- ベースURL: `https://api.sakeapp.jp`
- 認証: `Bearer Token`
- レスポンス形式: JSON
- タイムスタンプ: ISO 8601形式
- バージョン: `1.0`

---

## 1. ユーザー管理API

### 1.1 ユーザー登録
`POST /api/v1/users/register`

#### リクエスト
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "山田太郎"
}
```

#### レスポンス
```json
{
  "status": "success",
  "timestamp": "2025-08-10T12:00:00Z",
  "request_id": "abc123",
  "version": "1.0",
  "data": {
    "user_id": "USER_001"
  },
  "error": null
}
```

---

## 2. 日本酒検索API

### 2.1 銘柄検索
`GET /api/v1/sakes/search`

#### クエリパラメータ
| パラメータ | 型 | 必須 | 説明 |
|------------|----|------|------|
| `keyword` | string | No | 検索キーワード |
| `taste` | string | No | 味（甘口・辛口など） |
| `limit` | integer | No | デフォルト 20 |
| `offset` | integer | No | ページング用 |

#### レスポンス
```json
{
  "status": "success",
  "timestamp": "2025-08-10T12:10:00Z",
  "request_id": "xyz789",
  "version": "1.0",
  "data": [
    {
      "brand_id": "BRAND_1001",
      "name": "獺祭 純米大吟醸 50",
      "brewery": "旭酒造",
      "taste_profile": "やや甘口・華やか・キレのある後味"
    }
  ],
  "error": null
}
```

---

## 3. お気に入り管理API

### 3.1 お気に入り追加
`POST /api/v1/favorites/add`

#### リクエスト
```json
{
  "user_id": "USER_001",
  "brand_id": "BRAND_1001"
}
```

#### レスポンス
```json
{
  "status": "success",
  "timestamp": "2025-08-10T12:20:00Z",
  "request_id": "fav_add_001",
  "version": "1.0",
  "data": {
    "message": "お気に入りに追加しました"
  },
  "error": null
}
```

---

## 4. 販売店検索API（planned）
`GET /api/v1/stores/search`

#### クエリパラメータ
| パラメータ | 型 | 必須 | 説明 |
|------------|----|------|------|
| `brand_id` | string | No | 銘柄ID |
| `region` | string | No | 都道府県コード |
| `limit` | integer | No | デフォルト 20 |
| `offset` | integer | No | ページング用 |

#### レスポンス
```json
{
  "status": "success",
  "timestamp": "2025-08-10T15:20:00Z",
  "request_id": "store_search123",
  "version": "1.0",
  "data": [
    {
      "store_id": "STORE_001",
      "name": "東京日本酒センター",
      "address": "東京都千代田区1-1-1",
      "phone": "03-1234-5678",
      "url": "https://example.com/store001",
      "stocked_brands": ["BRAND_1001", "BRAND_2002"]
    }
  ],
  "error": null
}
```

---

## 5. 推奨API
`POST /api/v1/recommendations`

#### リクエスト
```json
{
  "preferences": {
    "sweetness": "やや甘口",
    "aroma": "華やか",
    "rice_polishing_ratio": "50以下"
  },
  "limit": 5
}
```

#### レスポンス
```json
{
  "status": "success",
  "timestamp": "2025-08-10T15:25:00Z",
  "request_id": "rec12345",
  "version": "1.0",
  "data": [
    {
      "brand_id": "BRAND_1001",
      "name": "獺祭 純米大吟醸 50",
      "brewery": "旭酒造",
      "taste_profile": "やや甘口・華やか・キレのある後味",
      "url": "https://example.com/brand1001"
    }
  ],
  "error": null
}
```

---

## 6. エラーコード一覧
| コード | 意味 |
|--------|------|
| `E001` | 必須パラメータ不足 |
| `E002` | 認証エラー |
| `E003` | データが見つからない |
| `E004` | 内部サーバーエラー |
| `E005` | 無効なパラメータ |
| `E006` | 利用制限超過 |
