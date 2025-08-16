# Phase 5: 本番環境デプロイ

**前提**: Phase 4完了（全機能実装・テスト完了）
**目標**: Google Cloud Platform上に本番環境を構築し、安全にデプロイ

## 🎯 Phase 5 達成条件
- [ ] GCP環境構築完了
- [ ] 本番デプロイ成功
- [ ] 監視・アラート設定
- [ ] バックアップ・DR対策
- [ ] セキュリティ強化完了

---

## 1. GCP基盤構築

### TASK-P5-001: GCPプロジェクト・ネットワーク設定
**作業量**: M（3-5日）
**テスト戦略**:
- **Infrastructure Test**: Terraform plan/apply
- **E2E Test依頼**: ネットワーク疎通確認

**実装内容**:
```hcl
# terraform/main.tf
provider "google" {
  project = var.project_id
  region  = "asia-northeast1"
}

# VPCネットワーク
resource "google_compute_network" "main" {
  name                    = "vibe-cti-network"
  auto_create_subnetworks = false
}

# サブネット
resource "google_compute_subnetwork" "main" {
  name          = "vibe-cti-subnet"
  network       = google_compute_network.main.id
  ip_cidr_range = "10.0.0.0/16"
  region        = "asia-northeast1"
  
  private_ip_google_access = true
}

# Cloud NAT
resource "google_compute_router" "nat_router" {
  name    = "vibe-cti-router"
  network = google_compute_network.main.id
  region  = "asia-northeast1"
}

resource "google_compute_router_nat" "nat" {
  name                               = "vibe-cti-nat"
  router                            = google_compute_router.nat_router.name
  region                            = "asia-northeast1"
  nat_ip_allocate_option            = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"
}

# ファイアウォールルール
resource "google_compute_firewall" "sip" {
  name    = "allow-sip"
  network = google_compute_network.main.name
  
  allow {
    protocol = "udp"
    ports    = ["5060", "5061"]
  }
  
  allow {
    protocol = "tcp"
    ports    = ["5060", "5061"]
  }
  
  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["media-server"]
}

resource "google_compute_firewall" "rtp" {
  name    = "allow-rtp"
  network = google_compute_network.main.name
  
  allow {
    protocol = "udp"
    ports    = ["16384-32768"]
  }
  
  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["media-server"]
}
```

**テスト**:
```bash
# terraform/test.sh
#!/bin/bash
terraform init
terraform plan -out=plan.tfplan
terraform apply plan.tfplan

# 疎通確認
gcloud compute ssh media-server-01 --command="ping -c 3 google.com"
```

---

### TASK-P5-002: GCEインスタンス構築
**作業量**: M（3-5日）
**テスト戦略**:
- **Infrastructure Test**: インスタンス起動確認
- **Integration Test**: サービス起動確認

**実装内容**:
```hcl
# terraform/compute.tf
# メディアサーバー
resource "google_compute_instance" "media_server" {
  name         = "vibe-cti-media-01"
  machine_type = "e2-standard-4"
  zone         = "asia-northeast1-a"
  
  boot_disk {
    initialize_params {
      image = "ubuntu-2204-lts"
      size  = 100
    }
  }
  
  network_interface {
    subnetwork = google_compute_subnetwork.main.id
    
    access_config {
      // 外部IPを割り当て
    }
  }
  
  metadata_startup_script = file("scripts/media-server-startup.sh")
  
  tags = ["media-server"]
}

# アプリケーションサーバー
resource "google_compute_instance" "app_server" {
  name         = "vibe-cti-app-01"
  machine_type = "e2-standard-2"
  zone         = "asia-northeast1-a"
  
  boot_disk {
    initialize_params {
      image = "ubuntu-2204-lts"
      size  = 50
    }
  }
  
  network_interface {
    subnetwork = google_compute_subnetwork.main.id
    
    access_config {
      // 外部IPを割り当て
    }
  }
  
  metadata_startup_script = file("scripts/app-server-startup.sh")
  
  tags = ["app-server"]
}
```

**起動スクリプト**:
```bash
# scripts/media-server-startup.sh
#!/bin/bash
apt-get update
apt-get install -y docker.io docker-compose

# FreeSWITCH, Janus, coturnをDockerで起動
cd /opt/vibe-cti
docker-compose -f docker-compose.media.yml up -d

# ヘルスチェック
while ! nc -z localhost 5060; do
  sleep 1
done
```

---

### TASK-P5-003: マネージドサービス設定
**作業量**: M（3-5日）
**テスト戦略**:
- **Infrastructure Test**: 各サービス起動確認
- **Integration Test**: 接続確認

**実装内容**:
```hcl
# terraform/managed.tf
# Cloud SQL (PostgreSQL)
resource "google_sql_database_instance" "main" {
  name             = "vibe-cti-db"
  database_version = "POSTGRES_15"
  region           = "asia-northeast1"
  
  settings {
    tier = "db-f1-micro"
    
    ip_configuration {
      ipv4_enabled    = true
      private_network = google_compute_network.main.id
    }
    
    backup_configuration {
      enabled                        = true
      start_time                     = "03:00"
      point_in_time_recovery_enabled = true
    }
  }
}

resource "google_sql_database" "main" {
  name     = "vibe_cti"
  instance = google_sql_database_instance.main.name
}

resource "google_sql_user" "app" {
  name     = "vibe_app"
  instance = google_sql_database_instance.main.name
  password = var.db_password
}

# Memorystore (Redis)
resource "google_redis_instance" "main" {
  name           = "vibe-cti-redis"
  tier           = "BASIC"
  memory_size_gb = 1
  region         = "asia-northeast1"
  
  redis_version = "REDIS_7_0"
  
  authorized_network = google_compute_network.main.id
}

# Cloud Storage
resource "google_storage_bucket" "recordings" {
  name          = "vibe-cti-recordings"
  location      = "ASIA-NORTHEAST1"
  force_destroy = false
  
  lifecycle_rule {
    condition {
      age = 90
    }
    action {
      type = "Delete"
    }
  }
  
  encryption {
    default_kms_key_name = google_kms_crypto_key.storage.id
  }
}
```

---

## 2. アプリケーションデプロイ

### TASK-P5-004: CI/CDパイプライン構築
**作業量**: M（3-5日）
**テスト戦略**:
- **Integration Test**: パイプライン実行
- **E2E Test依頼**: デプロイ確認

**実装内容**:
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run tests
        run: |
          make test
          make lint
      
      - name: Security scan
        run: |
          trivy fs --severity HIGH,CRITICAL .

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker images
        run: |
          docker build -t gcr.io/${{ secrets.GCP_PROJECT }}/api:${{ github.sha }} ./backend
          docker build -t gcr.io/${{ secrets.GCP_PROJECT }}/frontend:${{ github.sha }} ./frontend
      
      - name: Push to GCR
        run: |
          echo ${{ secrets.GCP_SA_KEY }} | docker login -u _json_key --password-stdin gcr.io
          docker push gcr.io/${{ secrets.GCP_PROJECT }}/api:${{ github.sha }}
          docker push gcr.io/${{ secrets.GCP_PROJECT }}/frontend:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to GCE
        run: |
          gcloud compute ssh app-server-01 --command="
            docker pull gcr.io/${{ secrets.GCP_PROJECT }}/api:${{ github.sha }}
            docker stop api || true
            docker run -d --name api \
              -e DB_HOST=${{ secrets.DB_HOST }} \
              -e REDIS_HOST=${{ secrets.REDIS_HOST }} \
              -p 8080:8080 \
              gcr.io/${{ secrets.GCP_PROJECT }}/api:${{ github.sha }}
          "
      
      - name: Health check
        run: |
          sleep 30
          curl -f https://api.vibe-cti.example.com/health || exit 1
```

---

### TASK-P5-005: ロードバランサー・SSL設定
**作業量**: M（3-5日）
**テスト戦略**:
- **Infrastructure Test**: LB動作確認
- **E2E Test依頼**: HTTPS接続確認

**実装内容**:
```hcl
# terraform/loadbalancer.tf
# External HTTPS Load Balancer
resource "google_compute_global_address" "main" {
  name = "vibe-cti-ip"
}

resource "google_compute_managed_ssl_certificate" "main" {
  name = "vibe-cti-cert"
  
  managed {
    domains = ["app.vibe-cti.example.com", "api.vibe-cti.example.com"]
  }
}

resource "google_compute_backend_service" "api" {
  name        = "vibe-cti-api-backend"
  port_name   = "http"
  protocol    = "HTTP"
  timeout_sec = 30
  
  backend {
    group = google_compute_instance_group.app.id
  }
  
  health_checks = [google_compute_health_check.api.id]
}

resource "google_compute_url_map" "main" {
  name            = "vibe-cti-urlmap"
  default_service = google_compute_backend_service.api.id
  
  host_rule {
    hosts        = ["api.vibe-cti.example.com"]
    path_matcher = "api"
  }
  
  path_matcher {
    name            = "api"
    default_service = google_compute_backend_service.api.id
  }
}

resource "google_compute_target_https_proxy" "main" {
  name             = "vibe-cti-https-proxy"
  url_map          = google_compute_url_map.main.id
  ssl_certificates = [google_compute_managed_ssl_certificate.main.id]
}

resource "google_compute_global_forwarding_rule" "main" {
  name       = "vibe-cti-forwarding-rule"
  target     = google_compute_target_https_proxy.main.id
  port_range = "443"
  ip_address = google_compute_global_address.main.address
}
```

---

## 3. 監視・運用設定

### TASK-P5-006: 監視・アラート設定
**作業量**: M（3-5日）
**テスト戦略**:
- **Integration Test**: メトリクス収集確認
- **E2E Test依頼**: アラート動作確認

**実装内容**:
```hcl
# terraform/monitoring.tf
# Uptime checks
resource "google_monitoring_uptime_check_config" "api" {
  display_name = "API Health Check"
  timeout      = "10s"
  period       = "60s"
  
  http_check {
    path         = "/health"
    port         = "443"
    use_ssl      = true
    validate_ssl = true
  }
  
  monitored_resource {
    type = "uptime_url"
    labels = {
      host       = "api.vibe-cti.example.com"
      project_id = var.project_id
    }
  }
}

# Alert Policy
resource "google_monitoring_alert_policy" "high_error_rate" {
  display_name = "High Error Rate"
  combiner     = "OR"
  
  conditions {
    display_name = "Error rate > 5%"
    
    condition_threshold {
      filter          = "resource.type=\"gce_instance\" AND metric.type=\"logging.googleapis.com/user/error_rate\""
      duration        = "60s"
      comparison      = "COMPARISON_GT"
      threshold_value = 0.05
    }
  }
  
  notification_channels = [google_monitoring_notification_channel.email.id]
}

# Notification Channel
resource "google_monitoring_notification_channel" "email" {
  display_name = "Email Notification"
  type         = "email"
  
  labels = {
    email_address = "ops@vibe-cti.example.com"
  }
}

# Custom Dashboard
resource "google_monitoring_dashboard" "main" {
  dashboard_json = jsonencode({
    displayName = "Vibe CTI Dashboard"
    widgets = [
      {
        title = "Active Calls"
        xyChart = {
          dataSets = [{
            timeSeriesQuery = {
              timeSeriesFilter = {
                filter = "metric.type=\"custom.googleapis.com/cti/active_calls\""
              }
            }
          }]
        }
      }
    ]
  })
}
```

---

### TASK-P5-007: バックアップ・DR設定
**作業量**: M（3-5日）
**テスト戦略**:
- **Integration Test**: バックアップ実行
- **E2E Test依頼**: リストア確認

**実装内容**:
```bash
# scripts/backup.sh
#!/bin/bash
set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/${TIMESTAMP}"

# Database backup
pg_dump -h ${DB_HOST} -U ${DB_USER} -d vibe_cti > ${BACKUP_DIR}/database.sql

# Configuration backup
tar czf ${BACKUP_DIR}/configs.tar.gz /etc/vibe-cti/

# Upload to GCS
gsutil -m cp -r ${BACKUP_DIR} gs://vibe-cti-backups/

# Cleanup old backups (keep 30 days)
gsutil -m rm -r gs://vibe-cti-backups/$(date -d '30 days ago' +%Y%m%d)*

# Verify backup
gsutil ls gs://vibe-cti-backups/${TIMESTAMP}/
```

**DR手順書**:
```markdown
# Disaster Recovery Procedure

## RTO: 4時間 / RPO: 1時間

### 1. 障害検知
- Cloud Monitoringアラート
- ヘルスチェック失敗

### 2. 初期対応
1. 障害範囲特定
2. ステークホルダー通知
3. DR発動判断

### 3. リストア手順
1. 新規インスタンス起動
2. 最新バックアップ取得
3. データベースリストア
4. アプリケーションデプロイ
5. DNS切り替え

### 4. 動作確認
1. ヘルスチェック
2. 基本機能テスト
3. ユーザー通知
```

---

## 4. セキュリティ強化

### TASK-P5-008: セキュリティ設定
**作業量**: M（3-5日）
**テスト戦略**:
- **Security Test**: 脆弱性スキャン
- **E2E Test依頼**: セキュリティ機能確認

**実装内容**:
```hcl
# terraform/security.tf
# Cloud Armor
resource "google_compute_security_policy" "main" {
  name = "vibe-cti-security-policy"
  
  rule {
    action   = "deny(403)"
    priority = "1000"
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["9.9.9.0/24"] # Block list
      }
    }
  }
  
  rule {
    action   = "rate_based_ban"
    priority = "2000"
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["0.0.0.0/0"]
      }
    }
    rate_limit_options {
      conform_action = "allow"
      exceed_action  = "deny(429)"
      rate_limit_threshold {
        count        = 100
        interval_sec = 60
      }
    }
  }
}

# KMS for encryption
resource "google_kms_key_ring" "main" {
  name     = "vibe-cti-keyring"
  location = "asia-northeast1"
}

resource "google_kms_crypto_key" "database" {
  name     = "database-key"
  key_ring = google_kms_key_ring.main.id
  
  rotation_period = "7776000s" # 90 days
}

# IAM
resource "google_project_iam_member" "app_service_account" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.app.email}"
}
```

---

## 📊 Phase 5 完了基準

### 技術的完了条件
- [ ] インフラ構築完了（Terraform適用）
- [ ] 全サービス起動確認
- [ ] SSL証明書有効
- [ ] 監視・アラート動作
- [ ] バックアップ実行成功

### 運用準備完了条件
- [ ] 運用手順書作成
- [ ] DR手順書作成・テスト
- [ ] 監視ダッシュボード設定
- [ ] オンコール体制確立
- [ ] SLA定義

### セキュリティ完了条件
- [ ] 脆弱性スキャンパス
- [ ] ペネトレーションテスト完了
- [ ] WAF設定完了
- [ ] 暗号化設定完了
- [ ] 最小権限の原則適用

### 本番移行チェックリスト
```markdown
## Go-Live Checklist

### 事前準備（T-7日）
- [ ] 全機能テスト完了
- [ ] 負荷テスト完了
- [ ] セキュリティ監査完了
- [ ] ユーザートレーニング完了

### 移行前日（T-1日）
- [ ] 最終バックアップ取得
- [ ] DNS TTL短縮
- [ ] 関係者への通知
- [ ] ロールバック計画確認

### 移行当日（T-0）
- [ ] メンテナンス画面表示
- [ ] データ移行実行
- [ ] アプリケーションデプロイ
- [ ] DNS切り替え
- [ ] 動作確認テスト
- [ ] Go-Live宣言

### 移行後（T+1日）
- [ ] 監視強化
- [ ] ユーザーフィードバック収集
- [ ] パフォーマンス確認
- [ ] 問題対応
```