# Phase 4: 管理画面・レポート機能実装

**前提**: Phase 3完了（IVR・高度機能動作中）
**目標**: 管理者向けダッシュボード、詳細なレポート機能、システム管理機能を実装

## 🎯 Phase 4 達成条件
- [ ] 管理ダッシュボード表示
- [ ] リアルタイム統計表示
- [ ] レポート生成・エクスポート
- [ ] システム設定管理
- [ ] 監査ログ・セキュリティ機能

---

## 1. 管理ダッシュボード

### TASK-P4-001: ダッシュボードAPI実装
**作業量**: M（3-5日）
**テスト戦略**:
- **Unit Test**: 集計ロジック
- **Integration Test**: リアルタイムデータ取得

**実装内容**:
```go
// services/dashboard.go
type DashboardService struct {
    redis *redis.Client
    db    *sql.DB
}

type DashboardData struct {
    CurrentCalls    int                    `json:"current_calls"`
    QueuedCalls     int                    `json:"queued_calls"`
    AvailableAgents int                    `json:"available_agents"`
    TodayStats      *DailyStatistics       `json:"today_stats"`
    SystemHealth    *SystemHealth          `json:"system_health"`
    Alerts          []Alert                `json:"alerts"`
}

func (s *DashboardService) GetDashboardData() (*DashboardData, error) {
    data := &DashboardData{}
    
    // リアルタイムデータ（Redis）
    data.CurrentCalls = s.getCurrentCallCount()
    data.QueuedCalls = s.getQueuedCallCount()
    data.AvailableAgents = s.getAvailableAgentCount()
    
    // 本日の統計（DB）
    data.TodayStats = s.getTodayStatistics()
    
    // システム状態
    data.SystemHealth = s.checkSystemHealth()
    
    // アラート
    data.Alerts = s.getActiveAlerts()
    
    return data, nil
}

func (s *DashboardService) getCurrentCallCount() int {
    keys, _ := s.redis.Keys("call:active:*").Result()
    return len(keys)
}
```

**テストコード**:
```go
// services/dashboard_test.go
func TestGetDashboardData(t *testing.T) {
    // Setup
    mockRedis := miniredis.NewMiniRedis()
    mockRedis.Start()
    
    service := NewDashboardService(mockRedis.Addr())
    
    // Add test data
    mockRedis.Set("call:active:1", "data")
    mockRedis.Set("call:active:2", "data")
    
    // Test
    data, err := service.GetDashboardData()
    
    assert.NoError(t, err)
    assert.Equal(t, 2, data.CurrentCalls)
}
```

---

### TASK-P4-002: ダッシュボードUI実装
**作業量**: L（5-8日）
**テスト戦略**:
- **Unit Test**: コンポーネントテスト
- **E2E Test依頼**: リアルタイム更新確認

**実装内容**:
```tsx
// components/Dashboard.tsx
import { useQuery } from '@tanstack/react-query';
import { Card, Grid, Chart } from '@/components/ui';

export function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
    refetchInterval: 5000, // 5秒ごと更新
  });

  if (isLoading) return <Loading />;

  return (
    <div className="p-6">
      <Grid cols={3} gap={4}>
        <Card>
          <h3>現在の通話数</h3>
          <div className="text-3xl font-bold">{data.currentCalls}</div>
        </Card>
        <Card>
          <h3>待機中</h3>
          <div className="text-3xl font-bold">{data.queuedCalls}</div>
        </Card>
        <Card>
          <h3>利用可能エージェント</h3>
          <div className="text-3xl font-bold">{data.availableAgents}</div>
        </Card>
      </Grid>
      
      <CallVolumeChart data={data.hourlyVolume} />
      <AgentStatusTable agents={data.agents} />
      <SystemHealthMonitor health={data.systemHealth} />
    </div>
  );
}
```

---

## 2. 統計・レポート機能

### TASK-P4-003: 統計集計バッチ実装
**作業量**: L（5-8日）
**テスト戦略**:
- **Unit Test**: 集計ロジック
- **Integration Test**: バッチ実行

**実装内容**:
```go
// services/statistics_aggregator.go
type StatisticsAggregator struct {
    db    *sql.DB
    redis *redis.Client
}

func (s *StatisticsAggregator) RunHourlyAggregation() error {
    now := time.Now()
    hourStart := now.Truncate(time.Hour)
    hourEnd := hourStart.Add(time.Hour)
    
    stats := &HourlyStatistics{
        Hour:         hourStart,
        TotalCalls:   0,
        AnsweredCalls: 0,
        AbandonedCalls: 0,
        AvgDuration:  0,
        AvgWaitTime:  0,
    }
    
    // 通話記録集計
    query := `
        SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN status = 'answered' THEN 1 END) as answered,
            COUNT(CASE WHEN status = 'abandoned' THEN 1 END) as abandoned,
            AVG(duration) as avg_duration,
            AVG(wait_time) as avg_wait_time
        FROM call_records
        WHERE start_time >= $1 AND start_time < $2
    `
    
    err := s.db.QueryRow(query, hourStart, hourEnd).Scan(
        &stats.TotalCalls,
        &stats.AnsweredCalls,
        &stats.AbandonedCalls,
        &stats.AvgDuration,
        &stats.AvgWaitTime,
    )
    
    // 結果保存
    s.saveStatistics(stats)
    
    return err
}

func (s *StatisticsAggregator) GenerateReport(start, end time.Time) (*Report, error) {
    report := &Report{
        Period: Period{Start: start, End: end},
    }
    
    // 各種メトリクス取得
    report.CallMetrics = s.getCallMetrics(start, end)
    report.AgentPerformance = s.getAgentPerformance(start, end)
    report.QueueMetrics = s.getQueueMetrics(start, end)
    report.IVRMetrics = s.getIVRMetrics(start, end)
    
    return report, nil
}
```

---

### TASK-P4-004: レポート生成・エクスポート機能
**作業量**: M（3-5日）
**テスト戦略**:
- **Unit Test**: レポート生成ロジック
- **Integration Test**: PDF/Excel生成

**実装内容**:
```go
// services/report_generator.go
type ReportGenerator struct {
    aggregator *StatisticsAggregator
}

func (r *ReportGenerator) GeneratePDF(report *Report) ([]byte, error) {
    pdf := gofpdf.New("P", "mm", "A4", "")
    pdf.AddPage()
    
    // ヘッダー
    pdf.SetFont("Arial", "B", 16)
    pdf.Cell(40, 10, fmt.Sprintf("Call Center Report: %s - %s",
        report.Period.Start.Format("2006-01-02"),
        report.Period.End.Format("2006-01-02")))
    
    // サマリー
    pdf.Ln(20)
    pdf.SetFont("Arial", "B", 12)
    pdf.Cell(40, 10, "Summary")
    pdf.Ln(10)
    
    pdf.SetFont("Arial", "", 10)
    pdf.Cell(40, 10, fmt.Sprintf("Total Calls: %d", report.CallMetrics.TotalCalls))
    pdf.Ln(5)
    pdf.Cell(40, 10, fmt.Sprintf("Answer Rate: %.2f%%", report.CallMetrics.AnswerRate))
    
    // グラフ追加
    r.addChartToPDF(pdf, report)
    
    var buf bytes.Buffer
    err := pdf.Output(&buf)
    return buf.Bytes(), err
}

func (r *ReportGenerator) GenerateExcel(report *Report) ([]byte, error) {
    file := excelize.NewFile()
    
    // サマリーシート
    file.SetCellValue("Sheet1", "A1", "Call Center Report")
    file.SetCellValue("Sheet1", "A3", "Total Calls")
    file.SetCellValue("Sheet1", "B3", report.CallMetrics.TotalCalls)
    
    // 詳細データシート
    file.NewSheet("Call Details")
    r.addCallDetailsToExcel(file, report)
    
    var buf bytes.Buffer
    file.Write(&buf)
    return buf.Bytes(), nil
}
```

---

### TASK-P4-005: レポートUI実装
**作業量**: L（5-8日）
**テスト戦略**:
- **Unit Test**: コンポーネントテスト
- **E2E Test依頼**: レポート生成・ダウンロード

**実装内容**:
```tsx
// components/ReportGenerator.tsx
export function ReportGenerator() {
  const [dateRange, setDateRange] = useState<DateRange>({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  });
  
  const [filters, setFilters] = useState<ReportFilters>({});
  
  const generateReport = async (format: 'pdf' | 'excel') => {
    const response = await api.post('/api/reports/generate', {
      start: dateRange.start,
      end: dateRange.end,
      filters,
      format,
    }, {
      responseType: 'blob',
    });
    
    // ダウンロード
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `report.${format}`);
    document.body.appendChild(link);
    link.click();
  };
  
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <h2>レポート生成</h2>
        </CardHeader>
        <CardBody>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          
          <FilterSection>
            <Select label="グループ" {...filters.group} />
            <Select label="エージェント" {...filters.agent} />
            <Select label="キュー" {...filters.queue} />
          </FilterSection>
          
          <div className="flex gap-4 mt-6">
            <Button onClick={() => generateReport('pdf')}>
              PDF生成
            </Button>
            <Button onClick={() => generateReport('excel')}>
              Excel生成
            </Button>
          </div>
        </CardBody>
      </Card>
      
      <ReportPreview dateRange={dateRange} filters={filters} />
    </div>
  );
}
```

---

## 3. システム管理機能

### TASK-P4-006: システム設定管理API
**作業量**: M（3-5日）
**テスト戦略**:
- **Unit Test**: 設定管理ロジック
- **Integration Test**: 設定適用

**実装内容**:
```go
// services/system_config.go
type SystemConfigService struct {
    db    *sql.DB
    cache *redis.Client
}

type SystemConfig struct {
    Organization    OrganizationSettings `json:"organization"`
    Security        SecuritySettings     `json:"security"`
    CallSettings    CallSettings         `json:"call_settings"`
    NotificationSettings NotificationSettings `json:"notifications"`
}

func (s *SystemConfigService) UpdateConfig(config *SystemConfig) error {
    // バリデーション
    if err := config.Validate(); err != nil {
        return err
    }
    
    // DB更新
    tx, _ := s.db.Begin()
    defer tx.Rollback()
    
    if err := s.updateOrganization(tx, config.Organization); err != nil {
        return err
    }
    
    if err := s.updateSecurity(tx, config.Security); err != nil {
        return err
    }
    
    tx.Commit()
    
    // キャッシュ更新
    s.cache.Set("system:config", config, 0)
    
    // 設定適用
    s.applyConfig(config)
    
    return nil
}
```

---

### TASK-P4-007: 監査ログ実装
**作業量**: M（3-5日）
**テスト戦略**:
- **Unit Test**: ログ記録ロジック
- **Integration Test**: ログ検索

**実装内容**:
```go
// services/audit_log.go
type AuditLogger struct {
    db *sql.DB
}

type AuditLog struct {
    ID        string    `json:"id"`
    UserID    string    `json:"user_id"`
    Action    string    `json:"action"`
    Resource  string    `json:"resource"`
    Details   string    `json:"details"`
    IPAddress string    `json:"ip_address"`
    Timestamp time.Time `json:"timestamp"`
}

func (a *AuditLogger) Log(ctx context.Context, action string, resource string, details interface{}) error {
    userID := ctx.Value("user_id").(string)
    ipAddress := ctx.Value("ip_address").(string)
    
    log := &AuditLog{
        ID:        uuid.New().String(),
        UserID:    userID,
        Action:    action,
        Resource:  resource,
        Details:   fmt.Sprintf("%v", details),
        IPAddress: ipAddress,
        Timestamp: time.Now(),
    }
    
    query := `
        INSERT INTO audit_logs (id, user_id, action, resource, details, ip_address, timestamp)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
    `
    
    _, err := a.db.Exec(query, log.ID, log.UserID, log.Action, 
                         log.Resource, log.Details, log.IPAddress, log.Timestamp)
    
    return err
}

// ミドルウェア
func AuditMiddleware(logger *AuditLogger) echo.MiddlewareFunc {
    return func(next echo.HandlerFunc) echo.HandlerFunc {
        return func(c echo.Context) error {
            // リクエスト前
            start := time.Now()
            
            err := next(c)
            
            // レスポンス後（書き込み操作のみログ）
            if c.Request().Method != "GET" {
                logger.Log(c.Request().Context(), 
                    c.Request().Method,
                    c.Request().URL.Path,
                    map[string]interface{}{
                        "status": c.Response().Status,
                        "duration": time.Since(start),
                    })
            }
            
            return err
        }
    }
}
```

---

### TASK-P4-008: バックアップ・リストア機能
**作業量**: M（3-5日）
**テスト戦略**:
- **Unit Test**: バックアップ生成
- **Integration Test**: リストア動作

**実装内容**:
```go
// services/backup.go
type BackupService struct {
    db      *sql.DB
    storage StorageService
}

func (b *BackupService) CreateBackup() (*Backup, error) {
    backup := &Backup{
        ID:        uuid.New().String(),
        Timestamp: time.Now(),
        Type:      "manual",
    }
    
    // DBダンプ
    dbDump, err := b.dumpDatabase()
    if err != nil {
        return nil, err
    }
    
    // 設定ファイルバックアップ
    configs, err := b.backupConfigs()
    if err != nil {
        return nil, err
    }
    
    // アーカイブ作成
    archive := b.createArchive(dbDump, configs)
    
    // Cloud Storageに保存
    url, err := b.storage.Upload(fmt.Sprintf("backups/%s.tar.gz", backup.ID), archive)
    backup.URL = url
    
    // メタデータ保存
    b.saveBackupMetadata(backup)
    
    return backup, nil
}

func (b *BackupService) Restore(backupID string) error {
    backup, err := b.getBackup(backupID)
    if err != nil {
        return err
    }
    
    // アーカイブダウンロード
    archive, err := b.storage.Download(backup.URL)
    if err != nil {
        return err
    }
    
    // 展開
    dbDump, configs := b.extractArchive(archive)
    
    // DB復元
    if err := b.restoreDatabase(dbDump); err != nil {
        return err
    }
    
    // 設定復元
    if err := b.restoreConfigs(configs); err != nil {
        return err
    }
    
    return nil
}
```

---

## 4. パフォーマンス監視

### TASK-P4-009: メトリクス収集実装
**作業量**: M（3-5日）
**テスト戦略**:
- **Unit Test**: メトリクス計算
- **Integration Test**: Prometheus連携

**実装内容**:
```go
// services/metrics.go
import "github.com/prometheus/client_golang/prometheus"

type MetricsCollector struct {
    callsTotal      *prometheus.CounterVec
    callDuration    *prometheus.HistogramVec
    activeCallsGauge prometheus.Gauge
    queueSizeGauge  *prometheus.GaugeVec
}

func NewMetricsCollector() *MetricsCollector {
    m := &MetricsCollector{
        callsTotal: prometheus.NewCounterVec(
            prometheus.CounterOpts{
                Name: "cti_calls_total",
                Help: "Total number of calls",
            },
            []string{"direction", "status"},
        ),
        callDuration: prometheus.NewHistogramVec(
            prometheus.HistogramOpts{
                Name: "cti_call_duration_seconds",
                Help: "Call duration in seconds",
                Buckets: prometheus.DefBuckets,
            },
            []string{"direction"},
        ),
        activeCallsGauge: prometheus.NewGauge(
            prometheus.GaugeOpts{
                Name: "cti_active_calls",
                Help: "Number of active calls",
            },
        ),
    }
    
    prometheus.MustRegister(m.callsTotal, m.callDuration, m.activeCallsGauge)
    
    return m
}

func (m *MetricsCollector) RecordCall(direction, status string, duration float64) {
    m.callsTotal.WithLabelValues(direction, status).Inc()
    m.callDuration.WithLabelValues(direction).Observe(duration)
}
```

---

## 📊 Phase 4 完了基準

### 技術的完了条件
- [ ] ダッシュボードAPI動作
- [ ] レポート生成機能動作
- [ ] 監査ログ記録
- [ ] バックアップ・リストア動作
- [ ] 全テストパス（カバレッジ75%以上）

### 機能的完了条件
- [ ] リアルタイムダッシュボード表示
- [ ] PDF/Excelレポート生成
- [ ] システム設定変更可能
- [ ] 監査ログ検索可能
- [ ] メトリクス監視可能

### E2Eテストシナリオ（ユーザー実施）
```markdown
## ダッシュボードテスト
1. 管理者でログイン
2. ダッシュボード表示確認
3. リアルタイム更新確認（通話開始/終了）
4. 各ウィジェットの動作確認

## レポートテスト
1. レポート生成画面へ
2. 期間選択（先月）
3. PDF生成 → ダウンロード確認
4. Excel生成 → データ確認
5. グラフ・統計値の妥当性確認

## システム管理テスト
1. システム設定変更
2. 変更が適用されることを確認
3. 監査ログに記録確認
4. バックアップ実行
5. テスト環境でリストア確認
```