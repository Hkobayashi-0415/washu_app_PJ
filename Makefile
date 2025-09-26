# Washu App Makefile
# Docker環境での開発・運用コマンド

.PHONY: help build up down stop restart logs shell-frontend shell-backend shell-db clean test setup-env smoke pwa-audit

# デフォルトターゲット
help:
	@echo "Washu App - Available Commands:"
	@echo ""
	@echo "Development:"
	@echo "  dev          - 開発環境を起動 (フロントエンド + データベース + Redis)"
	@echo "  dev-full     - 完全な開発環境を起動 (フロントエンド + バックエンド + データベース + Redis)"
	@echo "  build        - 全サービスのイメージをビルド"
	@echo "  up           - 全サービスを起動"
	@echo "  down         - 全サービスを停止"
	@echo "  restart      - 全サービスを再起動"
	@echo ""
	@echo "Database:"
	@echo "  db-shell     - データベースに接続"
	@echo "  db-migrate   - データベースマイグレーション実行"
	@echo "  db-seed      - 初期データ投入"
	@echo ""
	@echo "Development Tools:"
	@echo "  shell-frontend - フロントエンドコンテナのシェル"
	@echo "  shell-backend  - バックエンドコンテナのシェル"
	@echo "  logs          - 全サービスのログ表示"
	@echo "  logs-frontend - フロントエンドのログ表示"
	@echo "  logs-backend  - バックエンドのログ表示"
	@echo ""
	@echo "Testing:"
	@echo "  test          - 全テスト実行"
	@echo "  test-frontend - フロントエンドテスト実行"
	@echo "  test-backend  - バックエンドテスト実行"
	@echo ""
	@echo "Cleanup:"
	@echo "  clean         - コンテナ・ボリューム・イメージを削除"
	@echo "  clean-volumes - ボリュームのみ削除"

# 開発環境 (フロントエンドのみ)
dev:
	docker-compose -f docker-compose.dev.yml up frontend db redis

# 完全な開発環境 (フロントエンド + バックエンド)
dev-full:
	docker-compose -f docker-compose.dev.yml up

# 本番環境
build:
	docker-compose build

up:
	docker compose -f docker-compose.common.yml up -d --build

down:
	docker compose -f docker-compose.common.yml down

stop:
	docker compose -f docker-compose.common.yml down

restart:
	docker-compose restart

# データベース操作
db-shell:
	docker-compose exec db psql -U washu_user -d washu_db

db-migrate:
	docker-compose exec backend python manage.py migrate

db-seed:
	docker-compose exec backend python manage.py loaddata initial_data.json

# 開発ツール
shell-frontend:
	docker-compose -f docker-compose.dev.yml exec frontend sh

shell-backend:
	docker-compose -f docker-compose.dev.yml exec backend bash

logs:
	docker compose -f docker-compose.common.yml logs -f --tail=100

logs-frontend:
	docker-compose -f docker-compose.dev.yml logs -f frontend

logs-backend:
	docker-compose -f docker-compose.dev.yml logs -f backend

# テスト
test:
	docker-compose -f docker-compose.dev.yml exec frontend npm test
	docker-compose -f docker-compose.dev.yml exec backend python manage.py test

test-frontend:
	docker-compose -f docker-compose.dev.yml exec frontend npm test

test-backend:
	docker-compose -f docker-compose.dev.yml exec backend python manage.py test

# クリーンアップ
clean:
	docker-compose down -v --rmi all
	docker system prune -f

clean-volumes:
	docker-compose down -v

# --- Added by Dev Env migration (washu) ---
# Create .env from .env.example if missing
setup-env:
	@[ -f .env ] || cp .env.example .env && echo ".env created"

# Minimal smoke check (adjust endpoint if needed)
smoke: ## APIスモーク
	@bash -c 'sleep 3; curl -fsS http://localhost:18000/health | grep -q "\"ok\"" || (echo "backend not healthy"; exit 1)'

# PWA audit guidance via Lighthouse CI
pwa-audit:
	@echo "Run: npm i -g @lhci/cli && lhci autorun --collect.url=http://localhost:5173 --assert.preset=lighthouse:recommended"

# --- Phase 2: DB & Search API helpers ---
.PHONY: migrate seed

migrate: ## AlembicでDBマイグレーション適用
	docker compose -f docker-compose.common.yml exec backend alembic upgrade head

seed: ## シード投入（マイグレ適用後）
	docker compose -f docker-compose.common.yml exec backend alembic upgrade head
	docker compose -f docker-compose.common.yml exec backend python -m app.scripts.load_seed --dir /app/seed

# --- Security helpers ---
.PHONY: npm-audit scan-workflows

npm-audit: ## frontend の依存確認（代表的なパッケージ）
	cd frontend && npm ls chalk debug @ctrl/tinycolor color error-ex backslash || true

scan-workflows: ## 怪しいワークフロー/記述の簡易grep
	@grep -RniE ".github/workflows|postinstall|curl|wget|base64|webhook|requestcatcher|pastebin" . || true

