# Washu App - Docker環境セットアップガイド

## 概要

Washu AppはDockerを使用した開発環境を提供しています。フロントエンド（React + TypeScript + PWA）とバックエンド（Django + DRF）を統合した開発環境を簡単に構築できます。

## 前提条件

- Docker Desktop 4.0以上
- Docker Compose 2.0以上
- 8GB以上のRAM（推奨）

## クイックスタート

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd washu_app_PJ
```

### 2. 環境変数の設定

```bash
# 環境変数ファイルをコピー
cp env.example .env

# 必要に応じて設定を編集
# 特にSECRET_KEYは必ず変更してください
```

### 3. 開発環境の起動

#### フロントエンドのみ（現在の状態）
```bash
# Makefileを使用
make dev

# または直接Docker Composeを使用
docker-compose -f docker-compose.dev.yml up frontend db redis
```

#### 完全な開発環境（フロントエンド + バックエンド）
```bash
# Makefileを使用
make dev-full

# または直接Docker Composeを使用
docker-compose -f docker-compose.dev.yml up
```

### 4. アクセス

- **フロントエンド**: http://localhost:5173
- **バックエンド**: http://localhost:8000 (将来実装)
- **データベース管理**: http://localhost:5050 (pgAdmin)
  - Email: admin@washu.local
  - Password: admin

## 利用可能なコマンド

### 開発コマンド

```bash
# 開発環境を起動（フロントエンドのみ）
make dev

# 完全な開発環境を起動
make dev-full

# 全サービスを停止
make down

# 全サービスを再起動
make restart
```

### データベース操作

```bash
# データベースに接続
make db-shell

# マイグレーション実行
make db-migrate

# 初期データ投入
make db-seed
```

### 開発ツール

```bash
# フロントエンドコンテナのシェル
make shell-frontend

# バックエンドコンテナのシェル
make shell-backend

# ログ表示
make logs
make logs-frontend
make logs-backend
```

### テスト

```bash
# 全テスト実行
make test

# フロントエンドテストのみ
make test-frontend

# バックエンドテストのみ
make test-backend
```

### クリーンアップ

```bash
# 全コンテナ・ボリューム・イメージを削除
make clean

# ボリュームのみ削除
make clean-volumes
```

## プロジェクト構成

```
washu_app_PJ/
├── docker-compose.yml          # 本番用Docker Compose
├── docker-compose.dev.yml      # 開発用Docker Compose
├── Makefile                    # 便利なコマンド集
├── env.example                 # 環境変数テンプレート
├── frontend/                   # フロントエンド（React + TypeScript + PWA）
│   ├── Dockerfile              # 本番用Dockerfile
│   ├── Dockerfile.dev          # 開発用Dockerfile
│   └── ...
├── backend/                    # バックエンド（Django + DRF）
│   ├── Dockerfile.dev          # 開発用Dockerfile
│   ├── requirements.txt        # Python依存関係
│   └── ...
└── database/                   # データベース関連
    └── init/                   # 初期化スクリプト
```

## サービス構成

### フロントエンド (frontend)
- **技術**: Vite + React + TypeScript + PWA
- **ポート**: 5173
- **特徴**: ホットリロード対応、PWA機能

### バックエンド (backend) - 将来実装
- **技術**: Django + Django REST Framework
- **ポート**: 8000
- **特徴**: ホットリロード対応、API提供

### データベース (db)
- **技術**: PostgreSQL 15
- **ポート**: 5432
- **特徴**: 永続化データ保存

### キャッシュ (redis)
- **技術**: Redis 7
- **ポート**: 6379
- **特徴**: セッション管理、キャッシュ

### データベース管理 (pgadmin)
- **技術**: pgAdmin 4
- **ポート**: 5050
- **特徴**: Webベースのデータベース管理

## トラブルシューティング

### ポートが既に使用されている場合

```bash
# 使用中のポートを確認
netstat -tulpn | grep :5173
netstat -tulpn | grep :8000
netstat -tulpn | grep :5432

# プロセスを終了
kill -9 <PID>
```

### コンテナが起動しない場合

```bash
# ログを確認
make logs

# コンテナを再ビルド
docker-compose -f docker-compose.dev.yml build --no-cache

# ボリュームをクリア
make clean-volumes
```

### データベース接続エラーの場合

```bash
# データベースコンテナの状態を確認
docker-compose ps db

# データベースコンテナを再起動
docker-compose restart db

# データベースログを確認
docker-compose logs db
```

## 開発ワークフロー

### 1. 初回セットアップ

```bash
# 1. リポジトリをクローン
git clone <repository-url>
cd washu_app_PJ

# 2. 環境変数を設定
cp env.example .env
# .envファイルを編集してSECRET_KEYを設定

# 3. 開発環境を起動
make dev
```

### 2. 日常の開発

```bash
# 開発環境を起動
make dev

# 別のターミナルでログを確認
make logs

# 開発完了後は停止
make down
```

### 3. バックエンド開発時

```bash
# 完全な開発環境を起動
make dev-full

# バックエンドのシェルに接続
make shell-backend

# マイグレーション実行
make db-migrate
```

## 本番環境への展開

本番環境では `docker-compose.yml` を使用します：

```bash
# 本番用イメージをビルド
docker-compose build

# 本番環境を起動
docker-compose up -d
```

## セキュリティ注意事項

1. **環境変数**: `.env`ファイルは絶対にGitにコミットしないでください
2. **SECRET_KEY**: 本番環境では必ず強力なSECRET_KEYを設定してください
3. **データベース**: 本番環境では強力なパスワードを使用してください
4. **ネットワーク**: 本番環境では適切なファイアウォール設定を行ってください

## サポート

問題が発生した場合は、以下の手順で調査してください：

1. ログを確認: `make logs`
2. コンテナの状態を確認: `docker-compose ps`
3. ボリュームをクリア: `make clean-volumes`
4. イメージを再ビルド: `docker-compose build --no-cache`

詳細な情報が必要な場合は、プロジェクトのREADME.mdまたは技術仕様書を参照してください。

