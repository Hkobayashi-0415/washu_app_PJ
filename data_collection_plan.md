# 日本酒検索アプリ データ収集計画書

## 概要
本ドキュメントは、日本酒推薦アプリに必要なデータベース構築のためのデータ収集計画を示す。効率的で正確なデータ収集により、ユーザーにとって価値のある検索・推薦機能を実現する。

## データ収集の目的

### 主要目標
1. **検索精度の向上**: 豊富で正確なデータによる検索結果の改善
2. **推薦精度の向上**: AI推薦機能の精度向上
3. **ユーザー体験の向上**: 詳細で信頼性の高い情報提供
4. **ビジネス価値の創出**: データに基づく新機能開発

### 収集対象データ
- **日本酒銘柄情報**: 基本情報、味わい、特徴
- **酒蔵情報**: 基本情報、歴史、特徴
- **受賞歴・評価**: 品評会結果、ユーザー評価
- **販売情報**: 価格、在庫状況、販売店
- **画像・メディア**: 商品画像、ラベル画像

## データ収集戦略

### 1. 段階的アプローチ

#### フェーズ1: 基盤データ構築（1-2ヶ月）
- **目標**: 100-200銘柄の基本データ収集
- **優先度**: 人気銘柄、代表的な酒蔵
- **データ品質**: 高品質（手動収集・検証）

#### フェーズ2: データ拡充（2-3ヶ月）
- **目標**: 500-1000銘柄への拡充
- **優先度**: 地域別代表銘柄、多様な種類
- **データ品質**: 中〜高品質（半自動収集）

#### フェーズ3: 包括的データ（3-6ヶ月）
- **目標**: 2000銘柄以上の包括的データ
- **優先度**: 全地域・全種類の網羅
- **データ品質**: 標準品質（自動収集・検証）

### 2. データソース戦略

#### 一次ソース（最優先）
- **酒蔵公式サイト**: 最新・正確な情報
- **酒蔵直接連絡**: 電話・メールでの情報収集
- **公式カタログ**: 印刷物・PDF資料

#### 二次ソース（補完）
- **品評会結果**: 全国新酒鑑評会、国際酒類コンクール
- **専門誌・書籍**: 日本酒専門誌、ガイドブック
- **業界団体**: 日本酒造組合中央会、各地域組合

#### 三次ソース（参考）
- **ECサイト**: 楽天、Amazon等の商品情報
- **レビューサイト**: ユーザー投稿・評価
- **SNS**: インスタグラム、Twitter等の投稿

### 3. データ品質管理

#### 品質基準
- **正確性**: 情報の正確性・最新性
- **完全性**: 必須項目の充足率
- **一貫性**: データ形式・単位の統一
- **信頼性**: 情報源の信頼性・検証可能性

#### 品質チェック項目
- [ ] 基本情報の完全性
- [ ] 数値データの妥当性
- [ ] 文字データの正規化
- [ ] 関連データの整合性
- [ ] 重複データの排除

## データベース設計

### 1. データモデル詳細

#### 日本酒テーブル (SAKE)
```sql
CREATE TABLE sake (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL UNIQUE,
    brewery_id INTEGER REFERENCES breweries(id),
    type VARCHAR(50), -- 純米、吟醸、大吟醸等
    rice_variety VARCHAR(100), -- 米の品種
    rice_polishing_ratio INTEGER CHECK (0 <= ratio <= 100),
    alcohol_content DECIMAL(4,1) CHECK (0.0 <= alcohol <= 30.0),
    flavor_profile TEXT, -- 味わいの詳細説明
    aroma_profile TEXT, -- 香りの詳細説明
    sweetness_level VARCHAR(20), -- 甘口、中口、辛口
    acidity_level VARCHAR(20), -- 酸度レベル
    body_level VARCHAR(20), -- ボディの重さ
    award_history TEXT, -- 受賞歴
    description TEXT, -- 詳細説明
    official_url VARCHAR(500), -- 公式サイトURL
    image_url VARCHAR(500), -- 商品画像URL
    price_range VARCHAR(50), -- 価格帯
    availability_status VARCHAR(20) DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 酒蔵テーブル (BREWERIES)
```sql
CREATE TABLE breweries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL UNIQUE,
    location VARCHAR(255), -- 所在地
    prefecture VARCHAR(50), -- 都道府県
    city VARCHAR(100), -- 市区町村
    address TEXT, -- 詳細住所
    founded_year INTEGER CHECK (founded_year > 1800),
    website VARCHAR(500), -- 公式サイト
    phone VARCHAR(20), -- 電話番号
    email VARCHAR(254), -- メールアドレス
    description TEXT, -- 酒蔵の歴史・特徴
    brewing_style TEXT, -- 醸造スタイル・特徴
    annual_production INTEGER, -- 年間生産量（石）
    established_period VARCHAR(100), -- 創業期
    family_business BOOLEAN, -- 家族経営かどうか
    master_brewer VARCHAR(100), -- 杜氏名
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 受賞歴テーブル (AWARDS)
```sql
CREATE TABLE awards (
    id SERIAL PRIMARY KEY,
    sake_id INTEGER REFERENCES sake(id),
    award_name VARCHAR(200) NOT NULL, -- 受賞名
    year INTEGER NOT NULL, -- 受賞年
    category VARCHAR(100), -- 受賞カテゴリ
    rank VARCHAR(50), -- 受賞順位（金賞、銀賞等）
    organization VARCHAR(200), -- 主催団体
    description TEXT, -- 受賞理由・コメント
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 味わいタグテーブル (FLAVOR_TAGS)
```sql
CREATE TABLE flavor_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE, -- タグ名
    category VARCHAR(50), -- カテゴリ（香り、味わい、後味等）
    description TEXT, -- タグの説明
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 日本酒-タグ関連テーブル (SAKE_FLAVOR_TAGS)
```sql
CREATE TABLE sake_flavor_tags (
    id SERIAL PRIMARY KEY,
    sake_id INTEGER REFERENCES sake(id),
    tag_id INTEGER REFERENCES flavor_tags(id),
    intensity INTEGER CHECK (1 <= intensity <= 5), -- 強度（1-5）
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sake_id, tag_id)
);
```

### 2. インデックス設計

#### 検索最適化インデックス
```sql
-- 銘柄名検索
CREATE INDEX idx_sake_name ON sake(name);
CREATE INDEX idx_sake_name_gin ON sake USING gin(to_tsvector('japanese', name));

-- 酒蔵別検索
CREATE INDEX idx_sake_brewery_id ON sake(brewery_id);

-- 種類別検索
CREATE INDEX idx_sake_type ON sake(type);

-- 数値範囲検索
CREATE INDEX idx_sake_alcohol ON sake(alcohol_content);
CREATE INDEX idx_sake_polish_ratio ON sake(rice_polishing_ratio);

-- 複合検索
CREATE INDEX idx_sake_search_composite ON sake(type, alcohol_content, rice_polishing_ratio);

-- 全文検索
CREATE INDEX idx_sake_fulltext ON sake 
    USING gin(to_tsvector('japanese', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(flavor_profile, '')));
```

#### 酒蔵検索最適化インデックス
```sql
-- 酒蔵名検索
CREATE INDEX idx_brewery_name ON breweries(name);
CREATE INDEX idx_brewery_location ON breweries(prefecture, city);

-- 創業年検索
CREATE INDEX idx_brewery_founded_year ON breweries(founded_year);
```

## データ収集手順

### 1. 手動収集フェーズ

#### 1.1 準備作業
- **ツール準備**: Excel、Google Spreadsheet、Obsidian
- **テンプレート作成**: データ入力用テンプレート
- **情報源リスト**: 酒蔵公式サイト一覧
- **スケジュール**: 収集計画・進捗管理

#### 1.2 収集テンプレート
```yaml
# 日本酒データ収集テンプレート
銘柄名: 
酒蔵名: 
種類: 
米の品種: 
精米歩合: %
アルコール度数: %
味わい: 
香り: 
甘口度: (1-5)
酸度: (1-5)
ボディ: (1-5)
受賞歴: 
説明: 
公式サイト: 
価格帯: 
画像URL: 
収集日: 
情報源: 
備考: 
```

#### 1.3 収集優先順位
1. **S級銘柄**: 獺祭、久保田、十四代等の人気銘柄
2. **A級銘柄**: 各地域の代表銘柄
3. **B級銘柄**: 地域特産・特色銘柄
4. **C級銘柄**: その他の銘柄

### 2. 半自動収集フェーズ

#### 2.1 スクレイピングツール
```python
# スクレイピングスクリプト例
import requests
from bs4 import BeautifulSoup
import pandas as pd
from selenium import webdriver
import time

class SakeScraper:
    def __init__(self):
        self.session = requests.Session()
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    
    def scrape_brewery_site(self, url):
        """酒蔵サイトからの情報収集"""
        try:
            response = self.session.get(url, headers=self.headers)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # 銘柄情報の抽出
            sake_list = []
            # 具体的な抽出ロジック
            
            return sake_list
        except Exception as e:
            print(f"Error scraping {url}: {e}")
            return []
    
    def scrape_awards(self, sake_name):
        """受賞歴情報の収集"""
        # 品評会結果サイトからの情報収集
        pass
```

#### 2.2 データ正規化
```python
# データ正規化スクリプト例
import re
import unicodedata

class DataNormalizer:
    @staticmethod
    def normalize_sake_name(name):
        """銘柄名の正規化"""
        # 全角→半角変換
        name = unicodedata.normalize('NFKC', name)
        # 空白の正規化
        name = re.sub(r'\s+', ' ', name).strip()
        return name
    
    @staticmethod
    def normalize_alcohol_content(content):
        """アルコール度数の正規化"""
        if isinstance(content, str):
            # 文字列から数値抽出
            match = re.search(r'(\d+\.?\d*)', content)
            if match:
                return float(match.group(1))
        return content
    
    @staticmethod
    def normalize_price_range(price):
        """価格帯の正規化"""
        # 価格範囲の標準化
        price_mapping = {
            '1000円未満': '0-1000',
            '1000-3000円': '1000-3000',
            '3000-5000円': '3000-5000',
            '5000円以上': '5000+'
        }
        return price_mapping.get(price, price)
```

### 3. 自動収集フェーズ

#### 3.1 API連携
```python
# 外部API連携例
import requests
import json

class ExternalAPIIntegrator:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://api.example.com"
    
    def get_sake_info(self, sake_name):
        """外部APIから銘柄情報取得"""
        headers = {'Authorization': f'Bearer {self.api_key}'}
        params = {'q': sake_name, 'type': 'sake'}
        
        response = requests.get(
            f"{self.base_url}/search",
            headers=headers,
            params=params
        )
        
        if response.status_code == 200:
            return response.json()
        return None
    
    def get_brewery_info(self, brewery_name):
        """外部APIから酒蔵情報取得"""
        # 酒蔵情報取得ロジック
        pass
```

#### 3.2 機械学習による分類
```python
# 機械学習による味わい分類例
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
import numpy as np

class FlavorClassifier:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=1000)
        self.model = KMeans(n_clusters=10)
    
    def classify_flavor(self, description):
        """説明文から味わい分類"""
        # テキストベクトル化
        features = self.vectorizer.transform([description])
        
        # クラスタリング
        cluster = self.model.predict(features)[0]
        
        # クラスタに基づく味わい分類
        flavor_mapping = {
            0: 'フルーティー',
            1: 'スパイシー',
            2: 'ミネラル',
            # 他の分類
        }
        
        return flavor_mapping.get(cluster, 'その他')
```

## データ品質保証

### 1. 検証プロセス

#### 1.1 自動検証
```python
# データ検証スクリプト例
import pandas as pd
from typing import List, Dict

class DataValidator:
    def __init__(self):
        self.validation_rules = self._load_validation_rules()
    
    def validate_sake_data(self, data: Dict) -> List[str]:
        """日本酒データの検証"""
        errors = []
        
        # 必須項目チェック
        required_fields = ['name', 'brewery_id', 'type']
        for field in required_fields:
            if not data.get(field):
                errors.append(f"必須項目 {field} が不足しています")
        
        # 数値範囲チェック
        if data.get('alcohol_content'):
            alc = data['alcohol_content']
            if not (0.0 <= alc <= 30.0):
                errors.append(f"アルコール度数 {alc} が範囲外です")
        
        if data.get('rice_polishing_ratio'):
            ratio = data['rice_polishing_ratio']
            if not (0 <= ratio <= 100):
                errors.append(f"精米歩合 {ratio} が範囲外です")
        
        return errors
    
    def validate_brewery_data(self, data: Dict) -> List[str]:
        """酒蔵データの検証"""
        errors = []
        
        # 必須項目チェック
        if not data.get('name'):
            errors.append("酒蔵名が不足しています")
        
        # 創業年チェック
        if data.get('founded_year'):
            year = data['founded_year']
            if not (1800 <= year <= 2024):
                errors.append(f"創業年 {year} が範囲外です")
        
        return errors
```

#### 1.2 手動検証
- **サンプリング検証**: ランダムサンプルによる品質チェック
- **専門家レビュー**: 日本酒専門家による内容確認
- **ユーザーテスト**: 実際の検索結果による検証

### 2. データ更新・保守

#### 2.1 定期更新
```python
# 定期更新スクリプト例
import schedule
import time
from datetime import datetime

class DataUpdater:
    def __init__(self):
        self.scraper = SakeScraper()
        self.validator = DataValidator()
    
    def update_sake_data(self):
        """日本酒データの定期更新"""
        print(f"データ更新開始: {datetime.now()}")
        
        # 更新対象の特定
        outdated_records = self._get_outdated_records()
        
        for record in outdated_records:
            try:
                # 最新情報の取得
                updated_data = self.scraper.scrape_sake_info(record['name'])
                
                # データ検証
                errors = self.validator.validate_sake_data(updated_data)
                if not errors:
                    # データベース更新
                    self._update_database(record['id'], updated_data)
                    print(f"更新完了: {record['name']}")
                else:
                    print(f"検証エラー: {record['name']} - {errors}")
                    
            except Exception as e:
                print(f"更新エラー: {record['name']} - {e}")
    
    def schedule_updates(self):
        """定期更新のスケジュール設定"""
        schedule.every().day.at("02:00").do(self.update_sake_data)
        schedule.every().week.at("02:00").do(self.update_awards_data)
        
        while True:
            schedule.run_pending()
            time.sleep(60)
```

#### 2.2 変更履歴管理
```sql
-- 変更履歴テーブル
CREATE TABLE data_change_log (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER NOT NULL,
    change_type VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    changed_by VARCHAR(100),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- トリガー関数
CREATE OR REPLACE FUNCTION log_data_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO data_change_log (table_name, record_id, change_type, new_values)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO data_change_log (table_name, record_id, change_type, old_values, new_values)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO data_change_log (table_name, record_id, change_type, old_values)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

## データ収集スケジュール

### 1. 短期計画（1-2ヶ月）

#### 週1: 基盤整備
- [ ] 収集ツール・テンプレート準備
- [ ] 情報源リスト作成
- [ ] データベース設計完了

#### 週2-3: 手動収集開始
- [ ] S級銘柄50件の収集
- [ ] 代表酒蔵20社の情報収集
- [ ] データ品質チェック

#### 週4-8: データ拡充
- [ ] A級銘柄100件の収集
- [ ] 酒蔵情報50社への拡充
- [ ] 受賞歴データの収集

### 2. 中期計画（3-6ヶ月）

#### 月2: 半自動化
- [ ] スクレイピングツール開発
- [ ] データ正規化スクリプト作成
- [ ] 品質検証プロセス確立

#### 月3-4: データ拡充
- [ ] 500銘柄への拡充
- [ ] 地域別データの充実
- [ ] 画像・メディアデータ収集

#### 月5-6: 自動化・最適化
- [ ] 自動更新システム構築
- [ ] 機械学習による分類実装
- [ ] パフォーマンス最適化

### 3. 長期計画（6ヶ月以降）

#### 継続的改善
- [ ] データ品質の継続的向上
- [ ] 新データソースの開拓
- [ ] ユーザーフィードバックに基づく改善

## リスク管理

### 1. 技術リスク

#### 1.1 データ品質リスク
- **リスク**: 不正確・不完全なデータ
- **対策**: 多段階検証、専門家レビュー

#### 1.2 収集効率リスク
- **リスク**: 収集速度の低下
- **対策**: 自動化ツール、並行処理

### 2. 法的リスク

#### 2.1 著作権・利用規約
- **リスク**: 著作権侵害、利用規約違反
- **対策**: 法的確認、適切な利用

#### 2.2 個人情報保護
- **リスク**: 個人情報の不適切な取り扱い
- **対策**: 匿名化、最小限の収集

### 3. 運用リスク

#### 3.1 データ更新の遅れ
- **リスク**: 古いデータによる品質低下
- **対策**: 自動更新、定期監視

#### 3.2 システム障害
- **リスク**: データ収集システムの停止
- **対策**: 冗長化、バックアップ

## 成功指標

### 1. 量的指標

#### 1.1 データ量
- **目標**: 2000銘柄以上のデータ収集
- **測定**: 月次データ件数、カバレッジ率

#### 1.2 データ品質
- **目標**: エラー率5%以下
- **測定**: 検証エラー件数、ユーザーレポート

### 2. 質的指標

#### 2.1 検索精度
- **目標**: 検索結果の関連性向上
- **測定**: ユーザー満足度、検索成功率

#### 2.2 推薦精度
- **目標**: AI推薦の精度向上
- **測定**: 推薦結果の採用率、ユーザーフィードバック

### 3. 運用指標

#### 3.1 更新頻度
- **目標**: 月次データ更新
- **測定**: 更新完了率、更新時間

#### 3.2 コスト効率
- **目標**: 収集コストの最適化
- **測定**: 1件あたりの収集コスト、自動化率

## まとめ

本データ収集計画書では、日本酒推薦アプリに必要な包括的なデータベース構築のための戦略と手順を定義した。段階的なアプローチにより、効率的で質の高いデータ収集を実現し、ユーザーにとって価値のある検索・推薦機能を提供する。

継続的な品質管理と改善により、データの信頼性と有用性を向上させ、アプリケーションの競争優位性を確立することを目指す。技術的な品質とビジネス価値の両立を図り、長期的な成功を実現する。

