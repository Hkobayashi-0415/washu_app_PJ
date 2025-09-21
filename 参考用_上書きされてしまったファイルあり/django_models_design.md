# 🍶 日本酒アプリ Django モデル設計書

## 概要
本ドキュメントは、日本酒推薦アプリのバックエンドにおける **Djangoモデル設計** を示す。  
各モデルは ER 図および API 仕様に基づき設計され、将来の拡張性（販売店情報など）も考慮している。

---

## モデル一覧
- User（ユーザー）
- Brewery（酒蔵）
- Sake（日本酒銘柄）
- Favorite（お気に入り）
- Payment（課金管理）
- Store（販売店・将来構想）

---

## モデル定義

```python
from django.db import models
from django.contrib.auth.models import AbstractUser


# ユーザー（拡張認証モデル）
class User(AbstractUser):
    PLAN_CHOICES = [
        ('free', 'Free'),
        ('premium', 'Premium'),
    ]
    email = models.EmailField(unique=True)
    plan = models.CharField(max_length=10, choices=PLAN_CHOICES, default='free')
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username


# 酒蔵
class Brewery(models.Model):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=255, null=True, blank=True)
    established = models.PositiveIntegerField(null=True, blank=True)
    url = models.URLField(null=True, blank=True)

    def __str__(self):
        return self.name


# 日本酒銘柄
class Sake(models.Model):
    name = models.CharField(max_length=100)
    brewery = models.ForeignKey(Brewery, on_delete=models.CASCADE, related_name="sakes")
    type = models.CharField(max_length=50, null=True, blank=True)
    rice = models.CharField(max_length=100, null=True, blank=True)
    polish_ratio = models.PositiveIntegerField(null=True, blank=True)
    alcohol = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    taste_profile = models.TextField(null=True, blank=True)
    awards = models.TextField(null=True, blank=True)
    official_url = models.URLField(null=True, blank=True)

    def __str__(self):
        return self.name


# お気に入り
class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="favorites")
    sake = models.ForeignKey(Sake, on_delete=models.CASCADE, related_name="favorited_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'sake')

    def __str__(self):
        return f"{self.user.username} - {self.sake.name}"


# 課金管理
class Payment(models.Model):
    PLAN_CHOICES = [
        ('free', 'Free'),
        ('premium', 'Premium'),
    ]
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('canceled', 'Canceled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="payments")
    plan = models.CharField(max_length=10, choices=PLAN_CHOICES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.plan} ({self.status})"


# 販売店（将来構想）
class Store(models.Model):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=255, null=True, blank=True)
    url = models.URLField(null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)

    def __str__(self):
        return self.name
```

---

## 制約・仕様メモ
- User  
  - Djangoの `AbstractUser` を継承し拡張。  
  - `plan` フィールドで無料/有料を判定。  

- Favorite  
  - ユーザーごとにお気に入り最大5件（バリデーションで制御）。  
  - `unique_together(user, sake)` で重複登録を防止。  

- Payment  
  - 課金履歴を保存し、ステータス管理可能。  

- Store  
  - 将来の拡張を考慮（現時点では未使用）。  

---
