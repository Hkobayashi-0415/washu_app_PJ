# 基本シリアライザ設計書

## 1. UserSerializer
ユーザー情報の基本変換。  
APIレスポンスでは **パスワードは含めない**。

```python
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'subscription_type', 'created_at']
        read_only_fields = ['id', 'created_at']
```

---

## 2. SakeSerializer
日本酒情報。検索結果や詳細表示で使用。

```python
class SakeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sake
        fields = [
            'id', 'name', 'brewery', 'type', 'rice', 
            'polish_ratio', 'alcohol', 'taste_profile', 
            'awards', 'official_url'
        ]
```

---

## 3. BrewerySerializer
酒蔵情報。SakeSerializer の中でも参照される。

```python
class BrewerySerializer(serializers.ModelSerializer):
    class Meta:
        model = Brewery
        fields = ['id', 'name', 'location', 'founded_year', 'website']
```

---

## 4. FavoriteSerializer
お気に入り管理用。ユーザーとお酒の関連。

```python
class FavoriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favorite
        fields = ['id', 'user', 'sake', 'created_at']
        read_only_fields = ['id', 'created_at']
```

---

## 5. SubscriptionSerializer
課金プラン情報。

```python
class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = ['id', 'user', 'subscription_type', 'start_date', 'end_date']
```

---

## 6. LogSerializer（optional）
運用用のエラーログやアクセスログ（必要に応じてAPI内部で利用）。

```python
class LogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Log
        fields = ['id', 'user', 'action', 'status_code', 'timestamp']
```

---

## 🔮 将来予定（planned）
- **ShopSerializer**（販売店検索API用）  
- **RecommendationSerializer**（AI推薦API用）  
