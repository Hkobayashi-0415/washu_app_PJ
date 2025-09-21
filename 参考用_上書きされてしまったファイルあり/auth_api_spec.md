# ユーザー認証API 詳細設計 (Django REST Framework + SimpleJWT)

## 1. `/auth/register` - 新規ユーザー登録

**Method:** `POST`  
**Auth:** なし（誰でも登録可能）  

**Request (JSON)**
```json
{
  "username": "sake_lover",
  "email": "sake@example.com",
  "password": "StrongPass123!",
  "confirm_password": "StrongPass123!"
}
```

**Validation Rules**
- `username`: 3〜20文字、英数字とアンダースコアのみ
- `email`: RFC準拠、重複不可
- `password`: 8文字以上、英大文字・小文字・数字・記号を含む
- `confirm_password`: passwordと一致必須

**Response (成功時)**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "user_id": 42
}
```

**Error Codes**
| Code | Message | 説明 |
|------|---------|------|
| 4001 | Invalid username format | ユーザー名が規格外 |
| 4002 | Email already exists | メールアドレス重複 |
| 4003 | Password policy violation | パスワードが弱い |
| 4004 | Passwords do not match | 確認用パスワード不一致 |

---

## 2. `/auth/login` - ログイン

**Method:** `POST`  
**Auth:** なし  

**Request (JSON)**
```json
{
  "username": "sake_lover",
  "password": "StrongPass123!"
}
```

**Response (成功時)**
```json
{
  "status": "success",
  "access": "jwt_access_token",
  "refresh": "jwt_refresh_token"
}
```

**Error Codes**
| Code | Message | 説明 |
|------|---------|------|
| 4011 | Invalid credentials | ユーザー名またはパスワード不一致 |
| 4012 | Account disabled | アカウント無効化 |

---

## 3. `/auth/logout` - ログアウト

**Method:** `POST`  
**Auth:** 必須（Bearer Token）  

**Request**
```json
{}
```
※リフレッシュトークンをブラックリストに登録  

**Response**
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

**Error Codes**
| Code | Message |
|------|---------|
| 4013 | Invalid token |

---

## 4. `/auth/refresh` - トークン再発行

**Method:** `POST`  

**Request**
```json
{
  "refresh": "jwt_refresh_token"
}
```

**Response**
```json
{
  "status": "success",
  "access": "new_jwt_access_token"
}
```

**Error Codes**
| Code | Message |
|------|---------|
| 4014 | Refresh token expired |
| 4015 | Invalid refresh token |
