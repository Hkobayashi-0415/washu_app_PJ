
# 日本酒アプリ データベース詳細設計

## USERS
| カラム名             | データ型      | NULL可否 | デフォルト値 | 制約                              | 説明 |
|----------------------|--------------|----------|--------------|-----------------------------------|------|
| user_id              | UUID         | NOT NULL |              | PK                                | ユーザーID（UUIDv4） |
| username             | VARCHAR(50)  | NOT NULL |              | UNIQUE                            | ユーザー名 |
| email                | VARCHAR(255) | NOT NULL |              | UNIQUE                            | メールアドレス |
| password_hash        | VARCHAR(255) | NOT NULL |              |                                   | パスワードのハッシュ値 |
| subscription_status  | ENUM('free','premium') | NOT NULL | 'free'       |                                   | 課金状態 |
| created_at           | TIMESTAMP    | NOT NULL | CURRENT_TIMESTAMP |                                   | 登録日時 |
| updated_at           | TIMESTAMP    | NOT NULL | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | | 更新日時 |

---

## SAKE
| カラム名             | データ型      | NULL可否 | デフォルト値 | 制約 | 説明 |
|----------------------|--------------|----------|--------------|------|------|
| sake_id              | UUID         | NOT NULL |              | PK   | 日本酒ID（UUIDv4） |
| name                 | VARCHAR(100) | NOT NULL |              |      | 銘柄名 |
| brewery_name         | VARCHAR(100) | NOT NULL |              |      | 酒造名 |
| region               | VARCHAR(50)  | NOT NULL |              |      | 産地（都道府県） |
| flavor_profile       | TEXT         | NULL     |              |      | 味わいプロファイル |
| rice_polishing_ratio | INT          | NULL     |              |      | 精米歩合（％） |
| alcohol_content      | DECIMAL(4,1) | NULL     |              |      | アルコール度数 |
| tasting_notes        | TEXT         | NULL     |              |      | テイスティングコメント |
| awards               | TEXT         | NULL     |              |      | 受賞歴など |
| image_url            | VARCHAR(255) | NULL     |              |      | 画像URL |
| official_url         | VARCHAR(255) | NULL     |              |      | 公式サイトURL |
| availability_status  | ENUM('available','unavailable') | NOT NULL | 'available' | | 販売状況 |

---

## FAVORITES
| カラム名    | データ型 | NULL可否 | デフォルト値 | 制約 | 説明 |
|-------------|---------|----------|--------------|------|------|
| favorite_id | UUID    | NOT NULL |              | PK   | お気に入りID（UUIDv4） |
| user_id     | UUID    | NOT NULL |              | FK → USERS.user_id | ユーザーID |
| sake_id     | UUID    | NOT NULL |              | FK → SAKE.sake_id | 日本酒ID |
| added_at    | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | | 登録日時 |

---

## STORES
| カラム名        | データ型      | NULL可否 | デフォルト値 | 制約 | 説明 |
|-----------------|--------------|----------|--------------|------|------|
| store_id        | UUID         | NOT NULL |              | PK   | 店舗ID（UUIDv4） |
| store_name      | VARCHAR(100) | NOT NULL |              |      | 店舗名 |
| address         | TEXT         | NULL     |              |      | 住所 |
| phone_number    | VARCHAR(20)  | NULL     |              |      | 電話番号 |
| website_url     | VARCHAR(255) | NULL     |              |      | ウェブサイトURL |
| inventory_status| ENUM('in_stock','out_of_stock') | NOT NULL | 'in_stock' | | 在庫状況 |
