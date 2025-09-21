# 📌 シリアライザ設計（項目一覧）

## 1. User（ユーザー）
- **UserSerializer**: 読み取り用（id, username, email, plan, created_at, updated_at）
- **UserCreateSerializer**: 登録用（username, email, password）
- **UserUpdateSerializer**: 更新用（username, email, plan）

---

## 2. Sake（日本酒）
- **SakeSerializer**: 読み取り用（id, name, brewery, type, flavor_profile, alcohol_content, rice_polishing_ratio, description, award_history）
- **SakeCreateSerializer**: 登録用（name, brewery, type, flavor_profile, alcohol_content, rice_polishing_ratio, description, award_history）
- **SakeUpdateSerializer**: 更新用（同上、一部 optional）

---

## 3. Brewery（酒蔵）
- **BrewerySerializer**: 読み取り用（id, name, location, founded_year, website, description）
- **BreweryCreateSerializer**: 登録用（name, location, founded_year, website, description）
- **BreweryUpdateSerializer**: 更新用（同上、一部 optional）

---

## 4. Favorite（お気に入り）
- **FavoriteSerializer**: 読み取り用（id, user, sake, created_at）
- **FavoriteCreateSerializer**: 登録用（sake）※userはログイン情報から自動付与
- **FavoriteDeleteSerializer**: 削除用（id or sake）

---

## 5. Store（販売店）※将来構想
- **StoreSerializer**: 読み取り用（id, name, location, website, contact_info）
- **StoreCreateSerializer**: 登録用（name, location, website, contact_info）
- **StoreUpdateSerializer**: 更新用（同上、一部 optional）

---

## 6. Payment（課金管理）
- **PaymentSerializer**: 読み取り用（id, user, plan, status, start_date, end_date）
- **PaymentCreateSerializer**: 登録用（plan, start_date, end_date）
- **PaymentUpdateSerializer**: 更新用（status, plan, end_date）
