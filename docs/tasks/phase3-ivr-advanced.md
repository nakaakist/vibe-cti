# Phase 3: IVR・高度機能実装

**前提**: Phase 2完了（ユーザー管理・基本通話機能動作中）
**目標**: IVRシステム、SIPトランク管理、録音機能、キュー管理を実装

## 🎯 Phase 3 達成条件
- [ ] IVRフロー作成・実行可能
- [ ] SIPトランク設定・接続可能
- [ ] 通話録音・再生機能動作
- [ ] キュー管理・ACD基本機能
- [ ] 営業時間管理動作

---

## 1. IVR基盤実装

### TASK-P3-001: IVR DSLパーサー実装
**作業量**: L（5-8日）
**テスト戦略**:
- **Unit Test**: パーサーロジック、エラー検出
- **Integration Test**: FreeSWITCH連携

**実装内容**:
```go
// ivr/parser.go
type IVRFlow struct {
    ID    string           `json:"id"`
    Name  string           `json:"name"`
    Entry string           `json:"entry"`
    Nodes map[string]*Node `json:"nodes"`
}

type Node struct {
    Type   string                 `json:"type"`
    Data   map[string]interface{} `json:"data"`
    Next   string                 `json:"next,omitempty"`
}

func ParseIVRFlow(jsonData []byte) (*IVRFlow, error) {
    var flow IVRFlow
    if err := json.Unmarshal(jsonData, &flow); err != nil {
        return nil, err
    }
    
    // バリデーション
    if err := flow.Validate(); err != nil {
        return nil, err
    }
    
    return &flow, nil
}
```

**テストコード**:
```go
// ivr/parser_test.go
func TestParseIVRFlow(t *testing.T) {
    jsonFlow := `{
        "id": "test-flow",
        "entry": "welcome",
        "nodes": {
            "welcome": {
                "type": "play",
                "data": {"file": "welcome.wav"},
                "next": "menu"
            },
            "menu": {
                "type": "gather",
                "data": {"timeout": 5, "maxDigits": 1}
            }
        }
    }`
    
    flow, err := ParseIVRFlow([]byte(jsonFlow))
    assert.NoError(t, err)
    assert.Equal(t, "test-flow", flow.ID)
    assert.Equal(t, "welcome", flow.Entry)
}
```

---

### TASK-P3-002: IVR実行エンジン実装
**作業量**: XL（8-13日）
**テスト戦略**:
- **Unit Test**: 各ノードタイプの実行
- **Integration Test**: 完全なフロー実行
- **E2E Test依頼**: 実際の通話でのIVR動作

**実装内容**:
```go
// ivr/engine.go
type IVREngine struct {
    flow     *IVRFlow
    eslConn  *esl.Connection
    context  *ExecutionContext
}

type ExecutionContext struct {
    CallID    string
    Variables map[string]interface{}
    History   []string
}

func (e *IVREngine) Execute() error {
    currentNode := e.flow.Entry
    
    for currentNode != "" {
        node, exists := e.flow.Nodes[currentNode]
        if !exists {
            return fmt.Errorf("node not found: %s", currentNode)
        }
        
        nextNode, err := e.executeNode(node)
        if err != nil {
            return err
        }
        
        currentNode = nextNode
    }
    
    return nil
}

func (e *IVREngine) executeNode(node *Node) (string, error) {
    switch node.Type {
    case "play":
        return e.executePlay(node)
    case "gather":
        return e.executeGather(node)
    case "branch":
        return e.executeBranch(node)
    case "transfer":
        return e.executeTransfer(node)
    default:
        return "", fmt.Errorf("unknown node type: %s", node.Type)
    }
}
```

**テストコード**:
```go
// ivr/engine_test.go
func TestIVREngine_Execute(t *testing.T) {
    // Mock ESL connection
    mockESL := &MockESLConnection{}
    
    flow := &IVRFlow{
        Entry: "start",
        Nodes: map[string]*Node{
            "start": {Type: "play", Data: map[string]interface{}{"file": "test.wav"}},
        },
    }
    
    engine := NewIVREngine(flow, mockESL)
    err := engine.Execute()
    
    assert.NoError(t, err)
    assert.True(t, mockESL.PlaybackCalled)
}
```

---

### TASK-P3-003: IVRノード実装（Play/Gather/Branch）
**作業量**: L（5-8日）
**テスト戦略**:
- **Unit Test**: 各ノードの動作
- **Integration Test**: ESLコマンド実行

**実装内容**:
```go
// ivr/nodes.go
func (e *IVREngine) executePlay(node *Node) (string, error) {
    file := node.Data["file"].(string)
    
    // FreeSWITCH playback
    cmd := fmt.Sprintf("uuid_broadcast %s %s", e.context.CallID, file)
    _, err := e.eslConn.Api(cmd)
    
    return node.Next, err
}

func (e *IVREngine) executeGather(node *Node) (string, error) {
    timeout := node.Data["timeout"].(float64)
    maxDigits := node.Data["maxDigits"].(float64)
    
    // FreeSWITCH play_and_get_digits
    cmd := fmt.Sprintf("play_and_get_digits 1 %d %d %d # %s silence_stream://250 dtmf \\d+",
        int(maxDigits), 1, int(timeout*1000), e.context.CallID)
    
    result, err := e.eslConn.Api(cmd)
    if err != nil {
        return "", err
    }
    
    // 結果を変数に保存
    e.context.Variables["last_dtmf"] = result
    
    return node.Next, nil
}

func (e *IVREngine) executeBranch(node *Node) (string, error) {
    conditions := node.Data["conditions"].(map[string]interface{})
    variable := node.Data["variable"].(string)
    
    value := e.context.Variables[variable]
    
    // 条件マッチング
    for condition, target := range conditions {
        if condition == value {
            return target.(string), nil
        }
    }
    
    // デフォルト分岐
    if defaultTarget, ok := conditions["default"]; ok {
        return defaultTarget.(string), nil
    }
    
    return "", nil
}
```

---

## 2. SIPトランク管理

### TASK-P3-004: トランク設定管理API
**作業量**: M（3-5日）
**テスト戦略**:
- **Unit Test**: CRUD操作
- **Integration Test**: FreeSWITCH設定反映

**実装内容**:
```go
// models/sip_trunk.go
type SIPTrunk struct {
    ID          string `json:"id" db:"id"`
    Name        string `json:"name" db:"name"`
    Server      string `json:"server" db:"server"`
    Port        int    `json:"port" db:"port"`
    Transport   string `json:"transport" db:"transport"`
    AuthMethod  string `json:"auth_method" db:"auth_method"`
    Username    string `json:"username" db:"username"`
    Password    string `json:"-" db:"password"`
    Enabled     bool   `json:"enabled" db:"enabled"`
}

// services/trunk_service.go
func (s *TrunkService) CreateTrunk(trunk *SIPTrunk) error {
    // DBに保存
    if err := s.repo.Create(trunk); err != nil {
        return err
    }
    
    // FreeSWITCHプロファイル生成
    profile := s.generateProfile(trunk)
    if err := s.applyProfile(profile); err != nil {
        return err
    }
    
    return nil
}

func (s *TrunkService) generateProfile(trunk *SIPTrunk) string {
    return fmt.Sprintf(`
        <gateway name="%s">
            <param name="realm" value="%s"/>
            <param name="proxy" value="%s"/>
            <param name="register" value="false"/>
            <param name="username" value="%s"/>
            <param name="password" value="%s"/>
        </gateway>
    `, trunk.Name, trunk.Server, trunk.Server, trunk.Username, trunk.Password)
}
```

---

### TASK-P3-005: トランク接続テスト機能
**作業量**: M（3-5日）
**テスト戦略**:
- **Unit Test**: テストロジック
- **Integration Test**: 実際のSIP OPTIONS
- **E2E Test依頼**: 実トランクへの接続

**実装内容**:
```go
// services/trunk_test_service.go
func (s *TrunkTestService) TestConnection(trunkID string) (*TestResult, error) {
    trunk, err := s.repo.FindByID(trunkID)
    if err != nil {
        return nil, err
    }
    
    // SIP OPTIONS送信
    result := &TestResult{
        TrunkID:   trunkID,
        Timestamp: time.Now(),
    }
    
    // FreeSWITCH経由でOPTIONS送信
    cmd := fmt.Sprintf("sofia profile external ping %s", trunk.Server)
    response, err := s.eslConn.Api(cmd)
    
    if err != nil {
        result.Status = "failed"
        result.Error = err.Error()
    } else {
        result.Status = "success"
        result.Latency = s.parseLatency(response)
    }
    
    return result, nil
}
```

---

## 3. 録音機能

### TASK-P3-006: 通話録音実装
**作業量**: M（3-5日）
**テスト戦略**:
- **Unit Test**: 録音制御ロジック
- **Integration Test**: ファイル生成確認
- **E2E Test依頼**: 実通話録音

**実装内容**:
```go
// services/recording.go
type RecordingService struct {
    eslConn *esl.Connection
    storage StorageService
}

func (s *RecordingService) StartRecording(callID string) (*Recording, error) {
    recording := &Recording{
        ID:        uuid.New().String(),
        CallID:    callID,
        StartTime: time.Now(),
        Filename:  fmt.Sprintf("%s_%d.wav", callID, time.Now().Unix()),
    }
    
    // FreeSWITCH録音開始
    cmd := fmt.Sprintf("uuid_record %s start /recordings/%s", callID, recording.Filename)
    _, err := s.eslConn.Api(cmd)
    if err != nil {
        return nil, err
    }
    
    // DB記録
    s.repo.Create(recording)
    
    return recording, nil
}

func (s *RecordingService) StopRecording(callID string) error {
    cmd := fmt.Sprintf("uuid_record %s stop all", callID)
    _, err := s.eslConn.Api(cmd)
    
    // ファイルをCloud Storageにアップロード
    go s.uploadRecording(callID)
    
    return err
}
```

---

### TASK-P3-007: 録音再生・管理API
**作業量**: M（3-5日）
**テスト戦略**:
- **Unit Test**: APIハンドラー
- **Integration Test**: ストリーミング再生

**実装内容**:
```go
// handlers/recording.go
func StreamRecording(c echo.Context) error {
    recordingID := c.Param("id")
    
    recording, err := recordingService.GetByID(recordingID)
    if err != nil {
        return c.JSON(404, "Recording not found")
    }
    
    // 権限チェック
    userID := c.Get("user_id").(string)
    if !hasAccess(userID, recording) {
        return c.JSON(403, "Access denied")
    }
    
    // ストリーミング
    file, err := storageService.GetFile(recording.Filename)
    if err != nil {
        return c.JSON(500, "File not found")
    }
    
    c.Response().Header().Set("Content-Type", "audio/wav")
    return c.Stream(200, "audio/wav", file)
}
```

---

## 4. キュー管理・ACD

### TASK-P3-008: キュー管理実装
**作業量**: L（5-8日）
**テスト戦略**:
- **Unit Test**: キューロジック
- **Integration Test**: 分配アルゴリズム

**実装内容**:
```go
// models/queue.go
type Queue struct {
    ID           string `json:"id"`
    Name         string `json:"name"`
    Strategy     string `json:"strategy"` // round-robin, least-busy, skill-based
    MaxWaitTime  int    `json:"max_wait_time"`
    MaxSize      int    `json:"max_size"`
}

type QueuedCall struct {
    CallID      string    `json:"call_id"`
    QueueID     string    `json:"queue_id"`
    EnterTime   time.Time `json:"enter_time"`
    Priority    int       `json:"priority"`
    WaitingTime int       `json:"waiting_time"`
}

// services/queue_service.go
func (s *QueueService) AddToQueue(callID string, queueID string) error {
    queue, err := s.repo.GetQueue(queueID)
    if err != nil {
        return err
    }
    
    // キューに追加
    queuedCall := &QueuedCall{
        CallID:    callID,
        QueueID:   queueID,
        EnterTime: time.Now(),
    }
    
    s.redis.RPush(fmt.Sprintf("queue:%s", queueID), callID)
    
    // 分配開始
    go s.distributeCall(queue, queuedCall)
    
    return nil
}
```

---

### TASK-P3-009: ACD（自動着信分配）実装
**作業量**: L（5-8日）
**テスト戦略**:
- **Unit Test**: 分配アルゴリズム
- **Integration Test**: エージェント割り当て

**実装内容**:
```go
// services/acd.go
type ACDService struct {
    queueService  *QueueService
    agentService  *AgentService
}

func (s *ACDService) DistributeCall(queue *Queue, call *QueuedCall) error {
    // 利用可能エージェント取得
    agents := s.agentService.GetAvailableAgents(queue.ID)
    if len(agents) == 0 {
        return ErrNoAvailableAgent
    }
    
    // 戦略に基づいて選択
    var selectedAgent *Agent
    switch queue.Strategy {
    case "round-robin":
        selectedAgent = s.selectRoundRobin(agents)
    case "least-busy":
        selectedAgent = s.selectLeastBusy(agents)
    case "skill-based":
        selectedAgent = s.selectBySkill(agents, call)
    }
    
    // 通話を転送
    return s.transferToAgent(call.CallID, selectedAgent.Extension)
}

func (s *ACDService) selectRoundRobin(agents []*Agent) *Agent {
    // ラウンドロビン実装
    lastIndex := s.redis.Get("acd:last_index").Val()
    nextIndex := (lastIndex + 1) % len(agents)
    s.redis.Set("acd:last_index", nextIndex, 0)
    
    return agents[nextIndex]
}
```

---

## 5. 営業時間管理

### TASK-P3-010: スケジュール管理実装
**作業量**: M（3-5日）
**テスト戦略**:
- **Unit Test**: 営業時間判定ロジック
- **Integration Test**: タイムゾーン処理

**実装内容**:
```go
// models/schedule.go
type Schedule struct {
    ID        string      `json:"id"`
    Name      string      `json:"name"`
    Timezone  string      `json:"timezone"`
    WeekHours WeeklyHours `json:"week_hours"`
    Holidays  []Holiday   `json:"holidays"`
}

type WeeklyHours struct {
    Monday    []TimeSlot `json:"monday"`
    Tuesday   []TimeSlot `json:"tuesday"`
    Wednesday []TimeSlot `json:"wednesday"`
    Thursday  []TimeSlot `json:"thursday"`
    Friday    []TimeSlot `json:"friday"`
    Saturday  []TimeSlot `json:"saturday"`
    Sunday    []TimeSlot `json:"sunday"`
}

type TimeSlot struct {
    Start string `json:"start"` // "09:00"
    End   string `json:"end"`   // "18:00"
}

// services/schedule_service.go
func (s *ScheduleService) IsOpen(scheduleID string, checkTime time.Time) (bool, error) {
    schedule, err := s.repo.GetByID(scheduleID)
    if err != nil {
        return false, err
    }
    
    // タイムゾーン変換
    loc, _ := time.LoadLocation(schedule.Timezone)
    localTime := checkTime.In(loc)
    
    // 祝日チェック
    if s.isHoliday(schedule, localTime) {
        return false, nil
    }
    
    // 曜日と時間チェック
    weekday := localTime.Weekday()
    currentTime := localTime.Format("15:04")
    
    slots := s.getWeekdaySlots(schedule.WeekHours, weekday)
    for _, slot := range slots {
        if currentTime >= slot.Start && currentTime <= slot.End {
            return true, nil
        }
    }
    
    return false, nil
}
```

**テストコード**:
```go
// services/schedule_service_test.go
func TestIsOpen(t *testing.T) {
    service := NewScheduleService()
    
    schedule := &Schedule{
        Timezone: "Asia/Tokyo",
        WeekHours: WeeklyHours{
            Monday: []TimeSlot{{Start: "09:00", End: "18:00"}},
        },
    }
    
    // 月曜日 10:00 JST
    checkTime := time.Date(2024, 1, 15, 10, 0, 0, 0, time.UTC)
    isOpen, err := service.IsOpen(schedule.ID, checkTime)
    
    assert.NoError(t, err)
    assert.True(t, isOpen)
}
```

---

## 📊 Phase 3 完了基準

### 技術的完了条件
- [ ] IVRフロー実行エンジン動作
- [ ] SIPトランク接続成功
- [ ] 録音ファイル生成・再生
- [ ] キュー・ACD動作
- [ ] 全テストパス（カバレッジ75%以上）

### 機能的完了条件
- [ ] IVRメニュー作成・実行可能
- [ ] トランク経由での発着信
- [ ] 通話録音・再生可能
- [ ] キューイング・自動分配動作
- [ ] 営業時間に応じた処理切替

### E2Eテストシナリオ（ユーザー実施）
```markdown
## IVRテスト
1. IVRフロー作成（Welcome → Menu → Transfer）
2. 着信時にIVR動作確認
3. DTMFで選択 → 適切な転送先へ
4. タイムアウト時のデフォルト動作確認

## 録音テスト
1. 通話開始
2. 録音開始ボタンクリック
3. 1分程度会話
4. 録音停止
5. 録音一覧から再生確認

## キューテスト
1. 全エージェントをビジー状態に
2. 新規着信 → キューイング確認
3. エージェントが利用可能に → 自動分配確認
4. 最大待機時間超過 → オーバーフロー確認
```