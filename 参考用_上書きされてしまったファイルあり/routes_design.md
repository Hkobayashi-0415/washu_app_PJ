
# ルーティング設計 (Django REST Framework)

## 1. 認証関連
```python
from django.urls import path
from .views import RegisterView, LoginView, UserView

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("users/me/", UserView.as_view(), name="user-detail"),
]
```

---

## 2. 日本酒・酒蔵・お気に入り・課金関連
```python
from rest_framework.routers import DefaultRouter
from .views import SakeViewSet, BreweryViewSet, FavoriteViewSet, SubscriptionView

router = DefaultRouter()
router.register(r"sakes", SakeViewSet, basename="sake")
router.register(r"breweries", BreweryViewSet, basename="brewery")
router.register(r"favorites", FavoriteViewSet, basename="favorite")

urlpatterns += [
    path("subscription/", SubscriptionView.as_view(), name="subscription"),
]

urlpatterns += router.urls
```

---

## ルーティング全体図
- `/api/auth/register/` : 新規ユーザー登録
- `/api/auth/login/` : ログイン
- `/api/users/me/` : ユーザー情報
- `/api/sakes/` : 日本酒一覧・検索
- `/api/sakes/{id}/` : 日本酒詳細
- `/api/breweries/` : 酒蔵一覧
- `/api/breweries/{id}/` : 酒蔵詳細
- `/api/favorites/` : お気に入り一覧・登録
- `/api/favorites/{id}/` : お気に入り削除
- `/api/subscription/` : サブスクリプション確認
