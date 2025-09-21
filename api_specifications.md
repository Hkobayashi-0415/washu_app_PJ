# 日本酒検索アプリ API仕様書

## 概要
本ドキュメントは、日本酒推薦アプリのRESTful API仕様を示す。JWT認証、エラーハンドリング、レート制限、無料・有料ユーザーの機能差別化を含む包括的なAPI設計である。

## API基本情報

### 基本URL
```
開発環境: http://localhost:8000/api/
本番環境: https://api.sake-app.com/api/
```

### 認証方式
- **JWT (JSON Web Token)**
- アクセストークン: 15分有効
- リフレッシュトークン: 7日有効

### データ形式
- **リクエスト**: JSON
- **レスポンス**: JSON
- **文字エンコーディング**: UTF-8

### エラーレスポンス形式
```json
{
  "status": "error",
  "timestamp": "2024-01-15T10:30:00Z",
  "request_id": "req_123456789",
  "version": "1.0.0",
  "error": {
    "code": "AUTH_INVALID_CREDENTIALS",
    "message": "メールアドレスまたはパスワードが違います",
    "details": null,
    "docs_url": "https://api.sake-app.com/docs/errors/AUTH_INVALID_CREDENTIALS"
  }
}
```

## エラーコード一覧

### 認証エラー (AUTH)
| コード | メッセージ | HTTPステータス | 説明 |
|--------|------------|----------------|------|
| AUTH_TOKEN_MISSING | 認証トークンが提供されていません | 401 | Authorization ヘッダーが存在しない |
| AUTH_TOKEN_INVALID | 認証トークンが無効です | 401 | トークンの形式が不正 |
| AUTH_TOKEN_EXPIRED | 認証トークンが期限切れです | 401 | アクセストークンの有効期限切れ |
| AUTH_REFRESH_EXPIRED | リフレッシュトークンが期限切れです | 401 | リフレッシュトークンの有効期限切れ |
| AUTH_INVALID_CREDENTIALS | メールアドレスまたはパスワードが違います | 401 | ログイン認証失敗 |
| AUTH_PERMISSION_DENIED | この操作を実行する権限がありません | 403 | 権限不足 |
| AUTH_USER_NOT_FOUND | ユーザーが見つかりません | 404 | 指定されたユーザーが存在しない |

### バリデーションエラー (VAL)
| コード | メッセージ | HTTPステータス | 説明 |
|--------|------------|----------------|------|
| VAL_REQUIRED_FIELD | 必須フィールドが不足しています | 400 | 必須フィールドが空 |
| VAL_INVALID_FORMAT | フィールドの形式が正しくありません | 400 | データ形式が不正 |
| VAL_INVALID_VALUE | フィールドの値が正しくありません | 400 | 値が範囲外または制約違反 |
| VAL_DUPLICATE_ENTRY | 重複するエントリが存在します | 409 | 一意制約違反 |
| VAL_BUSINESS_RULE | ビジネスルールに違反しています | 400 | お気に入り上限超過など |

### 検索エラー (SRCH)
| コード | メッセージ | HTTPステータス | 説明 |
|--------|------------|----------------|------|
| SRCH_INVALID_QUERY | 検索クエリが無効です | 400 | 検索パラメータが不正 |
| SRCH_NO_RESULTS | 検索結果が見つかりませんでした | 404 | 条件に合うデータが存在しない |
| SRCH_TOO_MANY_RESULTS | 検索結果が多すぎます | 400 | 結果件数が上限を超過 |

### お気に入りエラー (FAV)
| コード | メッセージ | HTTPステータス | 説明 |
|--------|------------|----------------|------|
| FAV_LIMIT_EXCEEDED | お気に入りの上限に達しています | 400 | 無料プランの5件制限 |
| FAV_ALREADY_EXISTS | 既にお気に入りに登録されています | 409 | 重複登録試行 |
| FAV_NOT_FOUND | お気に入りが見つかりません | 404 | 指定されたお気に入りが存在しない |

### 課金エラー (PAY)
| コード | メッセージ | HTTPステータス | 説明 |
|--------|------------|----------------|------|
| PAY_PLAN_LIMIT | 現在のプランでは利用できません | 403 | 無料プランの制限 |
| PAY_SUBSCRIPTION_EXPIRED | サブスクリプションが期限切れです | 403 | 有料プランの期限切れ |
| PAY_PAYMENT_FAILED | 支払い処理に失敗しました | 400 | 決済エラー |

### サーバーエラー (SRV)
| コード | メッセージ | HTTPステータス | 説明 |
|--------|------------|----------------|------|
| SRV_INTERNAL_ERROR | 内部サーバーエラーが発生しました | 500 | 予期しないエラー |
| SRV_SERVICE_UNAVAILABLE | サービスが一時的に利用できません | 503 | メンテナンス中 |
| SRV_DATABASE_ERROR | データベースエラーが発生しました | 500 | DB接続・クエリエラー |

## 認証API

### ユーザー登録

**エンドポイント**: `POST /api/auth/register/`

**リクエスト**:
```json
{
  "username": "sake_lover",
  "email": "user@example.com",
  "password": "secure_password123",
  "confirm_password": "secure_password123"
}
```

**レスポンス** (成功):
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "username": "sake_lover",
      "email": "user@example.com",
      "plan": "free",
      "created_at": "2024-01-15T10:30:00Z"
    },
    "message": "ユーザー登録が完了しました"
  }
}
```

**レスポンス** (エラー):
```json
{
  "status": "error",
  "error": {
    "code": "VAL_REQUIRED_FIELD",
    "message": "必須フィールドが不足しています",
    "details": {
      "username": ["このフィールドは必須です"],
      "email": ["このフィールドは必須です"]
    }
  }
}
```

### ログイン

**エンドポイント**: `POST /api/auth/jwt/create/`

**リクエスト**:
```json
{
  "username": "sake_lover",
  "password": "secure_password123"
}
```

**レスポンス** (成功):
```json
{
  "status": "success",
  "data": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "user": {
      "id": 1,
      "username": "sake_lover",
      "email": "user@example.com",
      "plan": "free"
    }
  }
}
```

**レスポンス** (エラー):
```json
{
  "status": "error",
  "error": {
    "code": "AUTH_INVALID_CREDENTIALS",
    "message": "メールアドレスまたはパスワードが違います"
  }
}
```

### トークン更新

**エンドポイント**: `POST /api/auth/jwt/refresh/`

**リクエスト**:
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**レスポンス** (成功):
```json
{
  "status": "success",
  "data": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  }
}
```

### ログアウト

**エンドポイント**: `POST /api/auth/jwt/blacklist/`

**リクエスト**:
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**レスポンス** (成功):
```json
{
  "status": "success",
  "message": "ログアウトが完了しました"
}
```

## ユーザー管理API

### ユーザー情報取得

**エンドポイント**: `GET /api/users/me/`

**認証**: 必須

**レスポンス** (成功):
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "username": "sake_lover",
    "email": "user@example.com",
    "plan": "free",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### ユーザー情報更新

**エンドポイント**: `PATCH /api/users/me/`

**認証**: 必須

**リクエスト**:
```json
{
  "username": "new_username",
  "email": "newemail@example.com"
}
```

**レスポンス** (成功):
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "username": "new_username",
    "email": "newemail@example.com",
    "plan": "free",
    "updated_at": "2024-01-15T11:00:00Z"
  }
}
```

## 日本酒検索API

### 日本酒一覧・検索

**エンドポイント**: `GET /api/sakes/`

**認証**: 不要

**クエリパラメータ**:
- `q`: 検索クエリ（銘柄名、酒蔵名、種類等）
- `type`: 種類で絞り込み（純米、吟醸、大吟醸等）
- `brewery`: 酒蔵IDで絞り込み
- `alcohol_min`: アルコール度数下限
- `alcohol_max`: アルコール度数上限
- `polish_min`: 精米歩合下限
- `polish_max`: 精米歩合上限
- `ordering`: ソート順（name, -created_at, alcohol等）
- `page`: ページ番号
- `page_size`: 1ページあたりの件数（最大100）

**レスポンス** (成功):
```json
{
  "status": "success",
  "data": {
    "count": 150,
    "next": "http://localhost:8000/api/sakes/?page=2",
    "previous": null,
    "results": [
      {
        "id": 1,
        "name": "獺祭 純米大吟醸",
        "brewery_name": "旭酒造",
        "type": "純米大吟醸",
        "alcohol": 16.0
      },
      {
        "id": 2,
        "name": "久保田 千寿",
        "brewery_name": "朝日酒造",
        "type": "純米吟醸",
        "alcohol": 15.5
      }
    ]
  }
}
```

**レスポンス** (エラー):
```json
{
  "status": "error",
  "error": {
    "code": "SRCH_INVALID_QUERY",
    "message": "検索クエリが無効です",
    "details": "ページサイズは100以下で指定してください"
  }
}
```

### 日本酒詳細

**エンドポイント**: `GET /api/sakes/{id}/`

**認証**: 不要

**レスポンス** (成功):
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "獺祭 純米大吟醸",
    "brewery": {
      "id": 1,
      "name": "旭酒造",
      "location": "山口県岩国市",
      "founded_year": 1948,
      "website": "https://www.asahishuzo.co.jp/",
      "description": "山口県岩国市に本社を置く酒造メーカー..."
    },
    "type": "純米大吟醸",
    "flavor_profile": "華やかな香りと上品な味わい。米の旨味が際立つ",
    "alcohol_content": 16.0,
    "rice_polishing_ratio": 23,
    "description": "精米歩合23%の純米大吟醸。米の旨味を最大限に引き出した逸品",
    "award_history": "全国新酒鑑評会 金賞（2023年）",
    "official_url": "https://www.asahishuzo.co.jp/products/dassai/",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

**レスポンス** (エラー):
```json
{
  "status": "error",
  "error": {
    "code": "SRCH_NO_RESULTS",
    "message": "検索結果が見つかりませんでした"
  }
}
```

### 酒蔵一覧

**エンドポイント**: `GET /api/breweries/`

**認証**: 不要

**クエリパラメータ**:
- `q`: 検索クエリ（酒蔵名、地域等）
- `location`: 地域で絞り込み
- `founded_min`: 創業年下限
- `founded_max`: 創業年上限
- `ordering`: ソート順（name, -founded_year等）
- `page`: ページ番号
- `page_size`: 1ページあたりの件数

**レスポンス** (成功):
```json
{
  "status": "success",
  "data": {
    "count": 50,
    "next": null,
    "previous": null,
    "results": [
      {
        "id": 1,
        "name": "旭酒造",
        "location": "山口県岩国市",
        "founded_year": 1948,
        "website": "https://www.asahishuzo.co.jp/"
      }
    ]
  }
}
```

### 酒蔵詳細

**エンドポイント**: `GET /api/breweries/{id}/`

**認証**: 不要

**レスポンス** (成功):
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "旭酒造",
    "location": "山口県岩国市",
    "founded_year": 1948,
    "website": "https://www.asahishuzo.co.jp/",
    "description": "山口県岩国市に本社を置く酒造メーカー。1948年創業以来、伝統的な製法と現代的な技術を融合させた日本酒を製造している。",
    "phone": "0827-42-0001",
    "email": "info@asahishuzo.co.jp",
    "sakes": [
      {
        "id": 1,
        "name": "獺祭 純米大吟醸",
        "type": "純米大吟醸"
      }
    ],
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

## お気に入り管理API

### お気に入り一覧

**エンドポイント**: `GET /api/favorites/`

**認証**: 必須

**クエリパラメータ**:
- `page`: ページ番号
- `page_size`: 1ページあたりの件数

**レスポンス** (成功):
```json
{
  "status": "success",
  "data": {
    "count": 3,
    "next": null,
    "previous": null,
    "results": [
      {
        "id": 1,
        "sake": {
          "id": 1,
          "name": "獺祭 純米大吟醸",
          "brewery_name": "旭酒造",
          "type": "純米大吟醸",
          "alcohol": 16.0
        },
        "created_at": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

### お気に入り追加

**エンドポイント**: `POST /api/favorites/`

**認証**: 必須

**リクエスト**:
```json
{
  "sake_id": 1
}
```

**レスポンス** (成功):
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "sake": {
      "id": 1,
      "name": "獺祭 純米大吟醸",
      "brewery_name": "旭酒造"
    },
    "created_at": "2024-01-15T10:30:00Z"
  },
  "message": "お気に入りに追加しました"
}
```

**レスポンス** (エラー - 無料プラン上限):
```json
{
  "status": "error",
  "error": {
    "code": "FAV_LIMIT_EXCEEDED",
    "message": "お気に入りの上限に達しています",
    "details": "無料プランでは最大5件まで登録できます。プレミアムプランにアップグレードすると100件まで登録可能です。"
  }
}
```

**レスポンス** (エラー - 重複登録):
```json
{
  "status": "error",
  "error": {
    "code": "FAV_ALREADY_EXISTS",
    "message": "既にお気に入りに登録されています"
  }
}
```

### お気に入り削除

**エンドポイント**: `DELETE /api/favorites/{id}/`

**認証**: 必須

**レスポンス** (成功):
```json
{
  "status": "success",
  "message": "お気に入りを削除しました"
}
```

**レスポンス** (エラー):
```json
{
  "status": "error",
  "error": {
    "code": "FAV_NOT_FOUND",
    "message": "お気に入りが見つかりません"
  }
}
```

## サブスクリプション管理API

### サブスクリプション状況確認

**エンドポイント**: `GET /api/subscription/`

**認証**: 必須

**レスポンス** (成功):
```json
{
  "status": "success",
  "data": {
    "plan": "free",
    "max_favorites": 5,
    "current_favorites": 3,
    "llm_calls": 0,
    "llm_calls_limit": 0,
    "expires_at": null,
    "can_upgrade": true
  }
}
```

**レスポンス** (プレミアムユーザー):
```json
{
  "status": "success",
  "data": {
    "plan": "premium",
    "max_favorites": 100,
    "current_favorites": 15,
    "llm_calls": 25,
    "llm_calls_limit": 100,
    "expires_at": "2024-12-31T23:59:59Z",
    "can_upgrade": false
  }
}
```

### プラン一覧

**エンドポイント**: `GET /api/plans/`

**認証**: 不要

**レスポンス** (成功):
```json
{
  "status": "success",
  "data": [
    {
      "name": "free",
      "display_name": "無料プラン",
      "price": 0,
      "max_favorites": 5,
      "llm_calls": 0,
      "features": [
        "基本的な検索機能",
        "お気に入り5件まで",
        "広告表示"
      ]
    },
    {
      "name": "premium",
      "display_name": "プレミアムプラン",
      "price": 980,
      "billing_cycle": "monthly",
      "max_favorites": 100,
      "llm_calls": 100,
      "features": [
        "高度な検索機能",
        "お気に入り100件まで",
        "AI推薦機能",
        "広告非表示",
        "優先サポート"
      ]
    }
  ]
}
```

## 推奨API（将来構想）

### AI推薦

**エンドポイント**: `POST /api/recommendations/`

**認証**: 必須（プレミアムプランのみ）

**リクエスト**:
```json
{
  "preferences": {
    "taste": "甘口",
    "aroma": "華やか",
    "price_range": "2000-5000",
    "occasion": "贈答用"
  },
  "exclude_sakes": [1, 5, 10]
}
```

**レスポンス** (成功):
```json
{
  "status": "success",
  "data": {
    "recommendations": [
      {
        "sake": {
          "id": 15,
          "name": "久保田 千寿",
          "brewery_name": "朝日酒造",
          "type": "純米吟醸"
        },
        "score": 0.92,
        "reason": "甘口で華やかな香りが特徴的。贈答用として人気が高く、価格帯も適しています。",
        "confidence": "high"
      }
    ],
    "llm_calls_remaining": 99
  }
}
```

**レスポンス** (エラー - 無料プラン):
```json
{
  "status": "error",
  "error": {
    "code": "PAY_PLAN_LIMIT",
    "message": "現在のプランでは利用できません",
    "details": "AI推薦機能はプレミアムプランでのみ利用可能です。"
  }
}
```

## 販売店検索API（将来構想）

### 販売店検索

**エンドポイント**: `GET /api/stores/search/`

**認証**: 必須（プレミアムプランのみ）

**クエリパラメータ**:
- `sake_id`: 銘柄ID
- `location`: 地域
- `radius`: 検索半径（km）
- `page`: ページ番号
- `page_size`: 1ページあたりの件数

**レスポンス** (成功):
```json
{
  "status": "success",
  "data": {
    "count": 8,
    "next": null,
    "previous": null,
    "results": [
      {
        "id": 1,
        "name": "酒の専門店 さけや",
        "location": "東京都渋谷区",
        "distance": 0.5,
        "price": 3500,
        "stock_status": "in_stock",
        "website": "https://sakeya.example.com/",
        "phone": "03-1234-5678"
      }
    ]
  }
}
```

## レート制限

### 制限値

| エンドポイント | 未認証ユーザー | 認証済みユーザー | プレミアムユーザー |
|----------------|----------------|------------------|-------------------|
| 検索API | 10回/分 | 60回/分 | 100回/分 |
| お気に入りAPI | 利用不可 | 30回/分 | 100回/分 |
| 推奨API | 利用不可 | 利用不可 | 100回/月 |
| 販売店検索API | 利用不可 | 利用不可 | 50回/分 |

### レート制限ヘッダー

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1642233600
```

## 無料・有料ユーザー機能差別化

### 無料プラン制限

| 機能 | 制限 |
|------|------|
| お気に入り登録 | 最大5件 |
| 検索回数 | 60回/分 |
| AI推薦 | 利用不可 |
| 販売店検索 | 利用不可 |
| 広告表示 | あり |

### プレミアムプラン特典

| 機能 | 制限 |
|------|------|
| お気に入り登録 | 最大100件 |
| 検索回数 | 100回/分 |
| AI推薦 | 100回/月 |
| 販売店検索 | 50回/分 |
| 広告表示 | なし |
| 優先サポート | あり |

## セキュリティ要件

### 認証・認可

- JWTトークンの適切な管理
- トークンの有効期限管理
- リフレッシュトークンのローテーション
- 権限に基づくアクセス制御

### データ保護

- HTTPS通信の強制
- 機密情報の暗号化
- SQLインジェクション対策
- XSS対策

### 監査・ログ

- 認証・認可イベントの記録
- APIアクセスの記録
- エラーログの記録
- セキュリティイベントの監視

## パフォーマンス要件

### レスポンス時間

- 検索API: 500ms以下
- 詳細表示API: 200ms以下
- 認証API: 300ms以下

### スループット

- 同時接続数: 1000以上
- 1秒あたりのリクエスト数: 100以上

### キャッシュ戦略

- 検索結果のキャッシュ（5分）
- 銘柄詳細のキャッシュ（1時間）
- 酒蔵情報のキャッシュ（24時間）

## 監視・運用

### ヘルスチェック

**エンドポイント**: `GET /api/health/`

**レスポンス**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "services": {
    "database": "healthy",
    "cache": "healthy",
    "external_apis": "healthy"
  }
}
```

### メトリクス

- API呼び出し数
- レスポンス時間
- エラー率
- アクティブユーザー数
- プラン別利用状況

### アラート

- エラー率が5%を超過
- レスポンス時間が1秒を超過
- データベース接続エラー
- 外部API障害

