# 日本酒検索アプリ データベース設計書

## 概要
本ドキュメントは、日本酒推薦アプリのデータベース設計を示す。PostgreSQLを想定し、正規化された設計と適切なインデックス設計により、高速な検索とデータ整合性を実現する。

## ER図（最新版）

```mermaid
erDiagram
    User ||--o{ Favorite : has
    User ||--o{ Payment : makes
    Sake ||--o{ Favorite : marked
    Brewery ||--o{ Sake : produces
    Store ||--o{ Sake : sells (planned)

    User {
        int id PK
        string username
        string email
        string password
        string plan
        datetime created_at
        datetime updated_at
    }

    Sake {
        int id PK
        string name
        int brewery_id FK
        string type
        text flavor_profile
        decimal alcohol_content
        int rice_polishing_ratio
        text description
        text award_history
        string official_url
        datetime created_at
        datetime updated_at
    }

    Brewery {
        int id PK
        string name
        string location
        int founded_year
        string website
        text description
        datetime created_at
        datetime updated_at
    }

    Favorite {
        int id PK
        int user_id FK
        int sake_id FK
        datetime created_at
    }

    Store {
        int id PK
        string name
        string location
        string website
        string contact_info
        datetime created_at
        datetime updated_at
    }

    Payment {
        int id PK
        int user_id FK
        string plan
        string status
        date start_date
        date end_date
        datetime created_at
        datetime updated_at
    }
```

## テーブル詳細仕様

### 1. USERS テーブル

| カラム名 | データ型 | NULL | デフォルト | 制約 | 説明 |
|----------|----------|------|------------|------|------|
| id | SERIAL | NO | auto_increment | PRIMARY KEY | ユーザーID（自動採番） |
| username | VARCHAR(150) | NO | - | UNIQUE, NOT NULL | ユーザー名（3-20文字） |
| email | VARCHAR(254) | NO | - | UNIQUE, NOT NULL | メールアドレス |
| password | VARCHAR(255) | NO | - | NOT NULL | ハッシュ済みパスワード |
| plan | VARCHAR(10) | NO | 'free' | CHECK (plan IN ('free', 'premium')) | プラン種別 |
| is_active | BOOLEAN | NO | true | NOT NULL | アカウント有効フラグ |
| is_staff | BOOLEAN | NO | false | NOT NULL | 管理者フラグ |
| date_joined | TIMESTAMP | NO | CURRENT_TIMESTAMP | NOT NULL | 登録日時 |
| last_login | TIMESTAMP | YES | NULL | - | 最終ログイン日時 |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | NOT NULL | 作成日時 |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | NOT NULL | 更新日時 |

**インデックス:**
- `idx_users_username` (username)
- `idx_users_email` (email)
- `idx_users_plan` (plan)
- `idx_users_created_at` (created_at)

---

### 2. SAKE テーブル

| カラム名 | データ型 | NULL | デフォルト | 制約 | 説明 |
|----------|----------|------|------------|------|------|
| id | SERIAL | NO | auto_increment | PRIMARY KEY | 銘柄ID（自動採番） |
| name | VARCHAR(200) | NO | - | UNIQUE, NOT NULL | 銘柄名 |
| brewery_id | INTEGER | NO | - | FOREIGN KEY, NOT NULL | 酒蔵ID（breweries.id） |
| type | VARCHAR(50) | YES | NULL | - | 種類（純米/吟醸/大吟醸等） |
| flavor_profile | TEXT | YES | NULL | - | 味わい・香りの説明 |
| alcohol_content | DECIMAL(4,1) | YES | NULL | CHECK (0.0 <= alcohol <= 30.0) | アルコール度数（%） |
| rice_polishing_ratio | INTEGER | YES | NULL | CHECK (0 <= ratio <= 100) | 精米歩合（%） |
| description | TEXT | YES | NULL | - | 銘柄の詳細説明 |
| award_history | TEXT | YES | NULL | - | 受賞歴・評価 |
| official_url | VARCHAR(500) | YES | NULL | - | 公式サイトURL |
| availability_status | VARCHAR(20) | NO | 'available' | CHECK (status IN ('available', 'limited', 'discontinued')) | 販売状況 |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | NOT NULL | 作成日時 |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | NOT NULL | 更新日時 |

**インデックス:**
- `idx_sake_name` (name)
- `idx_sake_brewery_id` (brewery_id)
- `idx_sake_type` (type)
- `idx_sake_alcohol_content` (alcohol_content)
- `idx_sake_rice_polishing_ratio` (rice_polishing_ratio)
- `idx_sake_availability_status` (availability_status)
- `idx_sake_created_at` (created_at)
- `idx_sake_name_brewery` (name, brewery_id) - 複合インデックス

**全文検索インデックス:**
- `idx_sake_search` (name, description, flavor_profile) - GIN

---

### 3. BREWERIES テーブル

| カラム名 | データ型 | NULL | デフォルト | 制約 | 説明 |
|----------|----------|------|------------|------|------|
| id | SERIAL | NO | auto_increment | PRIMARY KEY | 酒蔵ID（自動採番） |
| name | VARCHAR(200) | NO | - | UNIQUE, NOT NULL | 酒蔵名 |
| location | VARCHAR(255) | YES | NULL | - | 所在地（都道府県・市区町村） |
| founded_year | INTEGER | YES | NULL | CHECK (founded_year > 1800) | 創業年 |
| website | VARCHAR(500) | YES | NULL | - | 公式サイトURL |
| description | TEXT | YES | NULL | - | 酒蔵の歴史・特徴 |
| phone | VARCHAR(20) | YES | NULL | - | 電話番号 |
| email | VARCHAR(254) | YES | NULL | - | メールアドレス |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | NOT NULL | 作成日時 |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | NOT NULL | 更新日時 |

**インデックス:**
- `idx_breweries_name` (name)
- `idx_breweries_location` (location)
- `idx_breweries_founded_year` (founded_year)
- `idx_breweries_created_at` (created_at)

---

### 4. FAVORITES テーブル

| カラム名 | データ型 | NULL | デフォルト | 制約 | 説明 |
|----------|----------|------|------------|------|------|
| id | SERIAL | NO | auto_increment | PRIMARY KEY | お気に入りID（自動採番） |
| user_id | INTEGER | NO | - | FOREIGN KEY, NOT NULL | ユーザーID（users.id） |
| sake_id | INTEGER | NO | - | FOREIGN KEY, NOT NULL | 銘柄ID（sake.id） |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | NOT NULL | 登録日時 |

**制約:**
- `UNIQUE(user_id, sake_id)` - 同一ユーザーの同一銘柄重複登録防止

**インデックス:**
- `idx_favorites_user_id` (user_id)
- `idx_favorites_sake_id` (sake_id)
- `idx_favorites_user_sake` (user_id, sake_id) - 複合インデックス
- `idx_favorites_created_at` (created_at)

---

### 5. PAYMENTS テーブル

| カラム名 | データ型 | NULL | デフォルト | 制約 | 説明 |
|----------|----------|------|------------|------|------|
| id | SERIAL | NO | auto_increment | PRIMARY KEY | 課金ID（自動採番） |
| user_id | INTEGER | NO | - | FOREIGN KEY, NOT NULL | ユーザーID（users.id） |
| plan | VARCHAR(10) | NO | - | CHECK (plan IN ('free', 'premium')) | 契約プラン |
| status | VARCHAR(20) | NO | 'pending' | CHECK (status IN ('active', 'expired', 'canceled', 'pending')) | ステータス |
| start_date | DATE | YES | NULL | - | 開始日 |
| end_date | DATE | YES | NULL | - | 終了日 |
| amount | DECIMAL(10,2) | YES | NULL | CHECK (amount >= 0) | 課金額 |
| payment_method | VARCHAR(50) | YES | NULL | - | 支払い方法 |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | NOT NULL | 作成日時 |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | NOT NULL | 更新日時 |

**インデックス:**
- `idx_payments_user_id` (user_id)
- `idx_payments_plan` (plan)
- `idx_payments_status` (status)
- `idx_payments_start_date` (start_date)
- `idx_payments_end_date` (end_date)
- `idx_payments_user_status` (user_id, status) - 複合インデックス

---

### 6. STORES テーブル（将来構想）

| カラム名 | データ型 | NULL | デフォルト | 制約 | 説明 |
|----------|----------|------|------------|------|------|
| id | SERIAL | NO | auto_increment | PRIMARY KEY | 店舗ID（自動採番） |
| name | VARCHAR(200) | NO | - | NOT NULL | 店舗名 |
| location | VARCHAR(255) | YES | NULL | - | 所在地 |
| website | VARCHAR(500) | YES | NULL | - | 店舗サイトURL |
| contact_info | VARCHAR(255) | YES | NULL | - | 連絡先情報 |
| phone | VARCHAR(20) | YES | NULL | - | 電話番号 |
| email | VARCHAR(254) | YES | NULL | - | メールアドレス |
| business_hours | TEXT | YES | NULL | - | 営業時間 |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | NOT NULL | 作成日時 |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | NOT NULL | 更新日時 |

**インデックス:**
- `idx_stores_name` (name)
- `idx_stores_location` (location)
- `idx_stores_created_at` (created_at)

---

### 7. SAKE_STORES テーブル（将来構想）

| カラム名 | データ型 | NULL | デフォルト | 制約 | 説明 |
|----------|----------|------|------------|------|------|
| id | SERIAL | NO | auto_increment | PRIMARY KEY | 関連ID（自動採番） |
| sake_id | INTEGER | NO | - | FOREIGN KEY, NOT NULL | 銘柄ID（sake.id） |
| store_id | INTEGER | NO | - | FOREIGN KEY, NOT NULL | 店舗ID（stores.id） |
| price | DECIMAL(10,2) | YES | NULL | CHECK (price >= 0) | 価格 |
| stock_status | VARCHAR(20) | NO | 'unknown' | CHECK (status IN ('in_stock', 'out_of_stock', 'limited', 'unknown')) | 在庫状況 |
| last_updated | TIMESTAMP | NO | CURRENT_TIMESTAMP | NOT NULL | 最終更新日時 |

**制約:**
- `UNIQUE(sake_id, store_id)` - 同一銘柄・店舗の重複防止

**インデックス:**
- `idx_sake_stores_sake_id` (sake_id)
- `idx_sake_stores_store_id` (store_id)
- `idx_sake_stores_price` (price)
- `idx_sake_stores_stock_status` (stock_status)

## 外部キー制約

```sql
-- SAKE テーブルの外部キー
ALTER TABLE sake ADD CONSTRAINT fk_sake_brewery 
    FOREIGN KEY (brewery_id) REFERENCES breweries(id) 
    ON DELETE CASCADE;

-- FAVORITES テーブルの外部キー
ALTER TABLE favorites ADD CONSTRAINT fk_favorites_user 
    FOREIGN KEY (user_id) REFERENCES users(id) 
    ON DELETE CASCADE;
ALTER TABLE favorites ADD CONSTRAINT fk_favorites_sake 
    FOREIGN KEY (sake_id) REFERENCES sake(id) 
    ON DELETE CASCADE;

-- PAYMENTS テーブルの外部キー
ALTER TABLE payments ADD CONSTRAINT fk_payments_user 
    FOREIGN KEY (user_id) REFERENCES users(id) 
    ON DELETE CASCADE;

-- SAKE_STORES テーブルの外部キー（将来構想）
ALTER TABLE sake_stores ADD CONSTRAINT fk_sake_stores_sake 
    FOREIGN KEY (sake_id) REFERENCES sake(id) 
    ON DELETE CASCADE;
ALTER TABLE sake_stores ADD CONSTRAINT fk_sake_stores_store 
    FOREIGN KEY (store_id) REFERENCES stores(id) 
    ON DELETE CASCADE;
```

## インデックス戦略

### パフォーマンス最適化

1. **検索最適化**
   - 銘柄名・酒蔵名の全文検索
   - 種類・精米歩合・アルコール度数での絞り込み
   - 地域・創業年での酒蔵検索

2. **結合最適化**
   - 外部キーへのインデックス
   - 複合インデックスによる効率化

3. **ソート最適化**
   - 作成日時・更新日時でのソート
   - 価格・評価でのソート

### 全文検索インデックス

```sql
-- 銘柄名・説明・味わいでの全文検索
CREATE INDEX idx_sake_search ON sake 
    USING gin(to_tsvector('japanese', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(flavor_profile, '')));

-- 酒蔵名・説明での全文検索
CREATE INDEX idx_breweries_search ON breweries 
    USING gin(to_tsvector('japanese', name || ' ' || COALESCE(description, '')));
```

## データ整合性・制約

### チェック制約

```sql
-- プラン制限
ALTER TABLE users ADD CONSTRAINT chk_users_plan 
    CHECK (plan IN ('free', 'premium'));

-- アルコール度数制限
ALTER TABLE sake ADD CONSTRAINT chk_sake_alcohol 
    CHECK (alcohol_content >= 0.0 AND alcohol_content <= 30.0);

-- 精米歩合制限
ALTER TABLE sake ADD CONSTRAINT chk_sake_polish_ratio 
    CHECK (rice_polishing_ratio >= 0 AND rice_polishing_ratio <= 100);

-- 価格制限
ALTER TABLE payments ADD CONSTRAINT chk_payments_amount 
    CHECK (amount >= 0);

-- 創業年制限
ALTER TABLE breweries ADD CONSTRAINT chk_breweries_founded_year 
    CHECK (founded_year > 1800);
```

### ビジネスルール制約

1. **お気に入り制限**
   - 無料ユーザー: 最大5件
   - プレミアムユーザー: 最大100件

2. **重複登録防止**
   - 同一ユーザーの同一銘柄お気に入り重複不可
   - ユーザー名・メールアドレスの一意性

3. **データ整合性**
   - 酒蔵削除時の銘柄連動削除
   - ユーザー削除時の関連データ連動削除

## パーティショニング戦略

### 時系列パーティショニング

```sql
-- お気に入りテーブルの月別パーティショニング
CREATE TABLE favorites_2024_01 PARTITION OF favorites
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE favorites_2024_02 PARTITION OF favorites
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
```

### ハッシュパーティショニング

```sql
-- ユーザーテーブルのハッシュパーティショニング
CREATE TABLE users_0 PARTITION OF users
    FOR VALUES WITH (modulus 4, remainder 0);
```

## バックアップ・復旧戦略

### バックアップ方式

1. **フルバックアップ**: 日次実行
2. **増分バックアップ**: 1時間ごと
3. **WAL（Write-Ahead Log）**: 継続的

### 復旧目標

- **RPO（Recovery Point Objective）**: 1時間
- **RTO（Recovery Time Objective）**: 4時間

## 監視・メンテナンス

### パフォーマンス監視

- クエリ実行時間の監視
- インデックス使用率の監視
- テーブルサイズ・行数の監視

### 定期メンテナンス

- 統計情報の更新（ANALYZE）
- 不要インデックスの削除
- テーブル最適化（VACUUM）

## 将来拡張予定

### 機能拡張

1. **地理情報対応**
   - PostGIS拡張による位置情報
   - 近隣店舗検索

2. **時系列データ**
   - 価格変動履歴
   - 在庫状況履歴

3. **分析・レポート**
   - 売上分析
   - 人気銘柄ランキング

### 技術拡張

1. **シャーディング**
   - ユーザー別データ分散
   - 地域別データ分散

2. **マルチテナント**
   - 酒蔵別データ分離
   - 店舗別データ分離

