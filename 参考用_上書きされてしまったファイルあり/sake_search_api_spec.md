
# 基本銘柄検索API `/sake/search` 仕様書

## 1. エンドポイント概要
- **Method**: `GET`
- **Auth**: 任意（未ログインでも使用可能だが回数制限は厳しめ）
- **Rate Limit**:  
  - 無料ユーザー：1日5回  
  - 課金ユーザー：無制限

---

## 2. リクエストパラメータ

| パラメータ名 | 型 | 必須 | 説明 | 例 |
|-------------|----|------|------|----|
| `q` | string | 任意 | キーワードまたは自然言語検索 | `"フルーティーで甘口"` |
| `taste` | string | 任意 | 甘口・辛口などの味わい分類 | `"甘口"` |
| `aroma` | string | 任意 | 香りの特徴 | `"フルーティー"` |
| `prefecture` | string | 任意 | 産地（都道府県） | `"新潟県"` |
| `min_abv` | float | 任意 | アルコール度数下限 | `12.0` |
| `max_abv` | float | 任意 | アルコール度数上限 | `16.0` |
| `sort` | string | 任意 | ソート条件（`name`, `popularity`, `rating`） | `"rating"` |
| `limit` | int | 任意 | 取得件数（最大50） | `10` |
| `offset` | int | 任意 | ページング用開始位置 | `0` |

---

## 3. レスポンス構造

```json
{
  "status": "success",
  "total_results": 120,
  "results": [
    {
      "id": 101,
      "name": "久保田 千寿",
      "brewery": "朝日酒造",
      "prefecture": "新潟県",
      "taste": "辛口",
      "aroma": "すっきり",
      "abv": 15.0,
      "award_history": ["2023全国新酒鑑評会 金賞"],
      "official_url": "https://www.asahi-shuzo.co.jp/",
      "image_url": "https://example.com/images/kubota.jpg"
    }
  ]
}
```

---

## 4. バリデーションルール
- `min_abv` は 0〜30 の範囲  
- `max_abv` は 0〜30 の範囲  
- `limit` は 1〜50  
- `sort` は定義済みキーのみ  
- 無料ユーザーは 1日5回を超えるとエラー `4291`

---

## 5. エラーコード

| Code  | Message | 説明 |
|-------|---------|------|
| 4001  | Invalid parameter | 不正なパラメータ |
| 4291  | Search limit exceeded | 無料ユーザーの検索回数超過 |
| 5001  | Internal server error | サーバー側エラー |
