# 日本酒アプリ - モデル設計仕様書

## 📌 ER図（更新版）
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

---

## 📌 モデル詳細設計一覧

### 1. User（ユーザー）
| フィールド名 | 型 | 制約 | 説明 |
|--------------|----|------|------|
| id | AutoField (PK) | 主キー | ユーザーID |
| username | CharField(max_length=150) | unique, not null | ユーザー名 |
| email | EmailField | unique, not null | メールアドレス |
| password | CharField(max_length=255) | not null | ハッシュ済パスワード |
| plan | CharField(choices=["free","premium"]) | default="free" | プラン種別 |
| created_at | DateTimeField | auto_now_add | 登録日時 |
| updated_at | DateTimeField | auto_now | 更新日時 |

---

### 2. Sake（日本酒）
| フィールド名 | 型 | 制約 | 説明 |
|--------------|----|------|------|
| id | AutoField (PK) | 主キー | 銘柄ID |
| name | CharField(max_length=200) | unique, not null | 銘柄名 |
| brewery | ForeignKey(Brewery) | on_delete=CASCADE | 酒蔵 |
| type | CharField(max_length=50) | nullable | 種類（純米/吟醸/大吟醸） |
| flavor_profile | TextField | nullable | 味わい |
| alcohol_content | DecimalField(max_digits=4, decimal_places=1) | nullable | アルコール度数 |
| rice_polishing_ratio | IntegerField | nullable | 精米歩合 |
| description | TextField | nullable | 説明文 |
| award_history | TextField | nullable | 受賞歴 |
| created_at | DateTimeField | auto_now_add | 作成日 |
| updated_at | DateTimeField | auto_now | 更新日 |

---

### 3. Brewery（酒蔵）
| フィールド名 | 型 | 制約 | 説明 |
|--------------|----|------|------|
| id | AutoField (PK) | 主キー | 酒蔵ID |
| name | CharField(max_length=200) | unique, not null | 酒蔵名 |
| location | CharField(max_length=255) | nullable | 所在地 |
| founded_year | IntegerField | nullable | 創業年 |
| website | URLField | nullable | 公式サイトURL |
| description | TextField | nullable | 酒蔵説明 |
| created_at | DateTimeField | auto_now_add | 作成日 |
| updated_at | DateTimeField | auto_now | 更新日 |

---

### 4. Favorite（お気に入り）
| フィールド名 | 型 | 制約 | 説明 |
|--------------|----|------|------|
| id | AutoField (PK) | 主キー | お気に入りID |
| user | ForeignKey(User) | on_delete=CASCADE | ユーザー |
| sake | ForeignKey(Sake) | on_delete=CASCADE | 日本酒 |
| created_at | DateTimeField | auto_now_add | 登録日 |

🔒 制約: `UniqueConstraint(fields=['user','sake'])`  

---

### 5. Store（販売店, 将来構想）
| フィールド名 | 型 | 制約 | 説明 |
|--------------|----|------|------|
| id | AutoField (PK) | 主キー | 店舗ID |
| name | CharField(max_length=200) | not null | 店舗名 |
| location | CharField(max_length=255) | nullable | 所在地 |
| website | URLField | nullable | 店舗サイトURL |
| contact_info | CharField(max_length=255) | nullable | 連絡先 |
| created_at | DateTimeField | auto_now_add | 作成日 |
| updated_at | DateTimeField | auto_now | 更新日 |

---

### 6. Payment（課金管理）
| フィールド名 | 型 | 制約 | 説明 |
|--------------|----|------|------|
| id | AutoField (PK) | 主キー | 課金ID |
| user | ForeignKey(User) | on_delete=CASCADE | ユーザー |
| plan | CharField(choices=["free","premium"]) | not null | 契約プラン |
| status | CharField(choices=["active","expired","pending"]) | default="pending" | ステータス |
| start_date | DateField | nullable | 開始日 |
| end_date | DateField | nullable | 終了日 |
| created_at | DateTimeField | auto_now_add | 作成日 |
| updated_at | DateTimeField | auto_now | 更新日 |
