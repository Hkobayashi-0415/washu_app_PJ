# 個別シリアライザ設計（詳細版）

本書は **API仕様に合わせた個別シリアライザ**（ネスト、軽量化、カスタムバリデーション含む）の設計をまとめる。  
ベースは `basic_serializers_design.md`。

---

## 1) Sake 検索・詳細表示系

### 1-1. SakeListSerializer（/sake/search 用：軽量）
- 検索結果一覧のパフォーマンス最適化のため、最小限の項目のみ返す。

```python
class SakeListSerializer(serializers.ModelSerializer):
    brewery_name = serializers.CharField(source="brewery.name", read_only=True)

    class Meta:
        model = Sake
        fields = [
            "id", "name", "brewery_name", "type", "alcohol"
        ]
```

**備考**  
- JOINコストを抑えるため `select_related("brewery")` 推奨。  
- 並び替え（rating, popularity 等）はView側で対応。


### 1-2. SakeDetailSerializer（/sake/{id} 用：詳細 & ネスト）
- 銘柄詳細ページ向けに、`Brewery` をネストして返却。

```python
class BreweryNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brewery
        fields = ["id", "name", "location", "established", "url"]

class SakeDetailSerializer(serializers.ModelSerializer):
    brewery = BreweryNestedSerializer(read_only=True)

    class Meta:
        model = Sake
        fields = [
            "id", "name", "brewery", "type", "rice",
            "polish_ratio", "alcohol", "taste_profile",
            "awards", "official_url"
        ]
```

**バリデーション（入力系APIが将来入る場合）**  
- `polish_ratio` は 0〜100  
- `alcohol` は 0.0〜30.0  


---

## 2) お気に入り系

### 2-1. FavoriteCreateSerializer（POST /favorites 用：5件上限&重複防止）
- 無料ユーザーの上限5件チェックを行う。  
- 既に同一銘柄が登録済みならエラー。

```python
class FavoriteCreateSerializer(serializers.ModelSerializer):
    sake_id = serializers.PrimaryKeyRelatedField(
        queryset=Sake.objects.all(),
        source="sake",
        write_only=True
    )

    class Meta:
        model = Favorite
        fields = ["sake_id"]

    def validate(self, attrs):
        user = self.context["request"].user
        sake = attrs["sake"]

        # すでに登録済み？
        if Favorite.objects.filter(user=user, sake=sake).exists():
            raise serializers.ValidationError({"detail": "既にお気に入りに登録されています。"})

        # 無料ユーザーは5件まで
        if user.plan == "free":
            count = Favorite.objects.filter(user=user).count()
            if count >= 5:
                raise serializers.ValidationError({"detail": "無料プランではお気に入りは5件までです。"})
        return attrs

    def create(self, validated_data):
        user = self.context["request"].user
        return Favorite.objects.create(user=user, **validated_data)
```

### 2-2. FavoriteListSerializer（GET /favorites 用：ネスト名付き）
- 一覧表示で銘柄名などを合わせて返却。

```python
class FavoriteListSerializer(serializers.ModelSerializer):
    sake = SakeListSerializer(read_only=True)

    class Meta:
        model = Favorite
        fields = ["id", "sake", "created_at"]
```

**備考**  
- View側で `select_related("sake", "sake__brewery")` によりN+1回避。


---

## 3) 課金系

### 3-1. PlanSerializer（GET /plans 用）
- 公開情報のみ。上限数やLLMコール数などを返却。

```python
class PlanSerializer(serializers.Serializer):
    name = serializers.CharField()
    max_favorites = serializers.IntegerField()
    llm_calls = serializers.IntegerField()
```

**備考**  
- 動的に設定ファイル/DBから取得する想定。

### 3-2. SubscriptionStatusSerializer（GET /subscription 用）
- ユーザーの現在プランと期限。

```python
class SubscriptionStatusSerializer(serializers.Serializer):
    plan = serializers.CharField()
    expires_at = serializers.DateTimeField(allow_null=True)
```


---

## 4) 認証系（補助：登録・ログイン時の専用シリアライザ）

### 4-1. RegisterSerializer（/auth/register 用）
- パスワードポリシーと確認一致の検証。

```python
class RegisterSerializer(serializers.Serializer):
    username = serializers.RegexField(r"^[a-zA-Z0-9_]{3,20}$")
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "パスワードが一致しません。"})
        # 追加: 大文字/小文字/数字/記号のバランスチェックを必要なら実装
        return attrs
```

### 4-2. LoginSerializer（/auth/login 用）
- トークン払い出しはView側(SimpleJWT)で実施。

```python
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
```


---

## 5) 共通設計メモ

- **N+1対策**：Viewで `select_related`, `prefetch_related` を徹底。  
- **部分更新**：PATCH対応時は `partial=True` を積極活用。  
- **エラーフォーマット**：`{"code": <int>, "message": <str>, "detail": <dict|str>}` を基本形に合わせる。  
- **i18n**：ユーザー向けエラーメッセージは `gettext_lazy` で多言語化可能に。  
- **ロギング**：`create/update/validate` など重要メソッドでロガー呼出し（INFO/ERROR）。

---

## 6) 今後の拡張（planned）
- **ShopSerializer**：`Store` の検索・地理情報対応（GeoDjangoを視野）  
- **RecommendationSerializer**：LLM出力の正規化（スコア、根拠、候補理由など）
