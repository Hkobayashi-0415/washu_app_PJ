
# 銘柄詳細取得API `/sake/{id}` 仕様書

## 1. エンドポイント概要
- **Method**: `GET`
- **Auth**: 任意（未ログインでも使用可能）
- **Rate Limit**:  
  - 無料ユーザー：制限なし  
  - 課金ユーザー：制限なし
- **概要**: 銘柄IDを指定して、詳細情報を取得する。

---

## 2. リクエストパラメータ

| パラメータ名 | 型 | 必須 | 説明 | 例 |
|-------------|----|------|------|----|
| `id` | int | 必須 | 銘柄のユニークID | `101` |

---

## 3. レスポンス構造

```json
{
  "status": "success",
  "data": {
    "id": 101,
    "name": "久保田 千寿",
    "brewery": "朝日酒造",
    "prefecture": "新潟県",
    "taste": "辛口",
    "aroma": "すっきり",
    "abv": 15.0,
    "rice_type": "五百万石",
    "polish_rate": 55,
    "award_history": ["2023全国新酒鑑評会 金賞"],
    "description": "端麗辛口の代表格で、すっきりとした味わいが特徴。",
    "official_url": "https://www.asahi-shuzo.co.jp/",
    "image_url": "https://example.com/images/kubota.jpg"
  }
}
```

---

## 4. バリデーションルール
- `id` は整数のみ受け付ける。
- 存在しないIDは `4041` を返す。

---

## 5. エラーコード

| Code  | Message | 説明 |
|-------|---------|------|
| 4001  | Invalid parameter | 不正なパラメータ |
| 4041  | Sake not found | 指定されたIDの銘柄が存在しない |
| 5001  | Internal server error | サーバー側エラー |
