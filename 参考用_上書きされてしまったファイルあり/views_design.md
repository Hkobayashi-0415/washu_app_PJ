# View 層 設計書 (Django REST Framework)

## 役割
- Serializer と DB モデルを API に接続
- Router でエンドポイントを整理
- 認証 / 課金チェック / ビジネスロジックを集約

---

## 設計方針
1. ModelViewSet を基本に採用
2. カスタムAPIView で特殊処理（認証・課金・レコメンド）
3. Router 設定で `/api/` 以下に整理

---

## Router 設定
- `/api/users/`
- `/api/sakes/`
- `/api/favorites/`
- `/api/auth/`
- `/api/subscription/`
- `/api/recommendations/ (planned)`
- `/api/shops/ (planned)`

---

## ViewSet & API設計

### UserViewSet
```python
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        # 登録時にパスワードをハッシュ化
        password = self.request.data.get("password")
        user = serializer.save()
        if password:
            user.set_password(password)
            user.save()
```

---

### FavoriteViewSet（お気に入り5件制限）
```python
class FavoriteViewSet(viewsets.ModelViewSet):
    queryset = Favorite.objects.all()
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        if Favorite.objects.filter(user=user).count() >= 5:
            raise ValidationError("お気に入りは最大5件までです。")
        serializer.save(user=user)
```

---

### RecommendationAPIView（planned）
```python
class RecommendationAPIView(APIView):
    '''
    planned: 将来的にLLMベースの推薦を行うAPI
    '''
    def post(self, request):
        return Response({
            "message": "レコメンド機能は現在開発予定です。"
        }, status=200)
```

---

## 注意点
- 全 ViewSet に logger クラスを適用予定
- 認証系は `djangorestframework-simplejwt` を採用予定
- 将来拡張（shops, recommendations）は planned として明記済み
