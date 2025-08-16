# Phase 2: ユーザー管理・基本機能実装

**前提**: Phase 1完了（基本通話機能動作中）
**目標**: 認証、ユーザー管理、通話履歴、基本的な通話制御機能を追加

## 🎯 Phase 2 達成条件
- [ ] ログイン/ログアウト機能動作
- [ ] 複数ユーザーでの同時利用可能
- [ ] 通話履歴の記録・表示
- [ ] 保留・転送などの通話制御機能
- [ ] エージェントステータス管理

---

## 1. 認証・認可システム

### TASK-P2-001: JWT認証実装
**作業量**: M（3-5日）
**テスト戦略**:
- **Unit Test**: トークン生成・検証ロジック
- **Integration Test**: API認証フロー

**実装内容**:
```go
// auth/jwt.go
type JWTService struct {
    secret []byte
}

func (j *JWTService) GenerateToken(userID string, role string) (string, error) {
    claims := jwt.MapClaims{
        "user_id": userID,
        "role":    role,
        "exp":     time.Now().Add(24 * time.Hour).Unix(),
    }
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(j.secret)
}
```

**テストコード**:
```go
// auth/jwt_test.go
func TestGenerateAndVerifyToken(t *testing.T) {
    service := NewJWTService("secret")
    token, err := service.GenerateToken("user123", "agent")
    assert.NoError(t, err)
    
    claims, err := service.VerifyToken(token)
    assert.NoError(t, err)
    assert.Equal(t, "user123", claims["user_id"])
}
```

**受け入れテスト**:
- [ ] トークン生成成功
- [ ] トークン検証成功
- [ ] 期限切れトークン拒否
- [ ] 不正トークン拒否

---

### TASK-P2-002: ログイン/ログアウトAPI
**作業量**: M（3-5日）
**テスト戦略**:
- **Unit Test**: ハンドラーロジック
- **Integration Test**: 実際のDB連携テスト

**実装内容**:
```go
// handlers/auth.go
func Login(c echo.Context) error {
    var req LoginRequest
    if err := c.Bind(&req); err != nil {
        return err
    }
    
    user, err := userService.Authenticate(req.Username, req.Password)
    if err != nil {
        return c.JSON(401, map[string]string{"error": "Invalid credentials"})
    }
    
    token, err := jwtService.GenerateToken(user.ID, user.Role)
    return c.JSON(200, map[string]string{"token": token})
}
```

**テストコード**:
```go
// handlers/auth_test.go
func TestLoginSuccess(t *testing.T) {
    e := echo.New()
    body := `{"username":"agent1","password":"pass123"}`
    req := httptest.NewRequest(http.MethodPost, "/api/login", strings.NewReader(body))
    rec := httptest.NewRecorder()
    
    c := e.NewContext(req, rec)
    err := Login(c)
    
    assert.NoError(t, err)
    assert.Equal(t, 200, rec.Code)
    assert.Contains(t, rec.Body.String(), "token")
}
```

---

### TASK-P2-003: 認証ミドルウェア実装
**作業量**: S（1-2日）
**テスト戦略**:
- **Unit Test**: ミドルウェア動作
- **Integration Test**: 保護されたエンドポイントアクセス

**実装内容**:
```go
// middleware/auth.go
func JWTMiddleware(jwtService *JWTService) echo.MiddlewareFunc {
    return func(next echo.HandlerFunc) echo.HandlerFunc {
        return func(c echo.Context) error {
            token := c.Request().Header.Get("Authorization")
            if token == "" {
                return c.JSON(401, "Unauthorized")
            }
            
            claims, err := jwtService.VerifyToken(token)
            if err != nil {
                return c.JSON(401, "Invalid token")
            }
            
            c.Set("user_id", claims["user_id"])
            c.Set("role", claims["role"])
            return next(c)
        }
    }
}
```

---

## 2. ユーザー管理

### TASK-P2-004: ユーザーCRUD API
**作業量**: M（3-5日）
**テスト戦略**:
- **Unit Test**: リポジトリ層テスト
- **Integration Test**: API全体フロー

**実装内容**:
```go
// models/user.go
type User struct {
    ID        string    `json:"id" db:"id"`
    Username  string    `json:"username" db:"username"`
    Email     string    `json:"email" db:"email"`
    Role      string    `json:"role" db:"role"`
    Extension string    `json:"extension" db:"extension"`
    CreatedAt time.Time `json:"created_at" db:"created_at"`
}

// repositories/user.go
func (r *UserRepository) Create(user *User) error {
    query := `INSERT INTO users (id, username, email, role, extension) 
              VALUES ($1, $2, $3, $4, $5)`
    _, err := r.db.Exec(query, user.ID, user.Username, user.Email, user.Role, user.Extension)
    return err
}
```

**テストコード**:
```go
// repositories/user_test.go
func TestUserRepository_Create(t *testing.T) {
    db := setupTestDB()
    repo := NewUserRepository(db)
    
    user := &User{
        ID:       "test-id",
        Username: "testuser",
        Email:    "test@example.com",
        Role:     "agent",
    }
    
    err := repo.Create(user)
    assert.NoError(t, err)
    
    // Verify
    found, err := repo.FindByID("test-id")
    assert.NoError(t, err)
    assert.Equal(t, "testuser", found.Username)
}
```

---

### TASK-P2-005: ロール・権限管理
**作業量**: M（3-5日）
**テスト戦略**:
- **Unit Test**: 権限チェックロジック
- **Integration Test**: RBAC動作確認

**実装内容**:
```go
// auth/rbac.go
type Permission string

const (
    PermMakeCall    Permission = "call.make"
    PermViewHistory Permission = "history.view"
    PermManageUsers Permission = "users.manage"
)

var RolePermissions = map[string][]Permission{
    "agent": {PermMakeCall, PermViewHistory},
    "supervisor": {PermMakeCall, PermViewHistory, PermManageUsers},
    "admin": {PermMakeCall, PermViewHistory, PermManageUsers},
}

func HasPermission(role string, perm Permission) bool {
    perms, ok := RolePermissions[role]
    if !ok {
        return false
    }
    for _, p := range perms {
        if p == perm {
            return true
        }
    }
    return false
}
```

---

## 3. 通話履歴機能

### TASK-P2-006: 通話記録モデル・DB実装
**作業量**: M（3-5日）
**テスト戦略**:
- **Unit Test**: モデル・リポジトリテスト
- **Integration Test**: データ永続化テスト

**実装内容**:
```go
// models/call_record.go
type CallRecord struct {
    ID         string    `json:"id" db:"id"`
    UserID     string    `json:"user_id" db:"user_id"`
    Direction  string    `json:"direction" db:"direction"`
    RemoteNumber string  `json:"remote_number" db:"remote_number"`
    StartTime  time.Time `json:"start_time" db:"start_time"`
    EndTime    *time.Time `json:"end_time" db:"end_time"`
    Duration   int       `json:"duration" db:"duration"`
    Status     string    `json:"status" db:"status"`
}
```

**DBマイグレーション**:
```sql
-- migrations/002_create_call_records.sql
CREATE TABLE call_records (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    direction VARCHAR(10) NOT NULL,
    remote_number VARCHAR(50) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_call_records_user_id ON call_records(user_id);
CREATE INDEX idx_call_records_start_time ON call_records(start_time);
```

---

### TASK-P2-007: 通話履歴API実装
**作業量**: M（3-5日）
**テスト戦略**:
- **Unit Test**: APIハンドラーテスト
- **Integration Test**: フィルター・ページネーション

**実装内容**:
```go
// handlers/call_history.go
func GetCallHistory(c echo.Context) error {
    userID := c.Get("user_id").(string)
    
    filters := CallFilters{
        UserID:    userID,
        StartDate: c.QueryParam("start_date"),
        EndDate:   c.QueryParam("end_date"),
        Page:      c.QueryParam("page"),
        Limit:     c.QueryParam("limit"),
    }
    
    records, total, err := callService.GetHistory(filters)
    if err != nil {
        return c.JSON(500, map[string]string{"error": err.Error()})
    }
    
    return c.JSON(200, map[string]interface{}{
        "records": records,
        "total":   total,
    })
}
```

---

## 4. 高度な通話制御

### TASK-P2-008: 保留機能実装
**作業量**: M（3-5日）
**テスト戦略**:
- **Unit Test**: 保留ロジック
- **Integration Test**: FreeSWITCH連携
- **E2E Test依頼**: 実際の保留動作

**実装内容**:
```go
// services/call_control.go
func (s *CallService) HoldCall(callID string) error {
    // FreeSWITCH ESL経由で保留
    conn := s.eslPool.Get()
    defer conn.Close()
    
    cmd := fmt.Sprintf("uuid_hold on %s", callID)
    _, err := conn.Api(cmd)
    
    // 状態更新
    s.updateCallState(callID, "held")
    
    return err
}
```

**フロントエンド実装**:
```tsx
// components/CallControls.tsx
function CallControls({ callId, isOnHold }) {
  const handleHold = async () => {
    await api.post(`/api/calls/${callId}/hold`);
  };
  
  return (
    <button onClick={handleHold}>
      {isOnHold ? 'Resume' : 'Hold'}
    </button>
  );
}
```

---

### TASK-P2-009: 転送機能実装
**作業量**: L（5-8日）
**テスト戦略**:
- **Unit Test**: 転送ロジック
- **Integration Test**: SIPシグナリング
- **E2E Test依頼**: ブラインド/アテンド転送

**実装内容**:
```go
// services/transfer.go
func (s *CallService) BlindTransfer(callID string, destination string) error {
    conn := s.eslPool.Get()
    defer conn.Close()
    
    cmd := fmt.Sprintf("uuid_transfer %s %s", callID, destination)
    _, err := conn.Api(cmd)
    
    return err
}

func (s *CallService) AttendedTransfer(callID string, consultCallID string) error {
    // アテンド転送のロジック
    // 1. コンサルテーションコール確立
    // 2. ブリッジ
    // 3. 元の通話切断
}
```

---

## 5. エージェントステータス管理

### TASK-P2-010: ステータス管理システム
**作業量**: M（3-5日）
**テスト戦略**:
- **Unit Test**: 状態遷移ロジック
- **Integration Test**: リアルタイム更新

**実装内容**:
```go
// models/agent_status.go
type AgentStatus struct {
    UserID     string    `json:"user_id"`
    Status     string    `json:"status"`
    SubStatus  string    `json:"sub_status"`
    Duration   int       `json:"duration"`
    LastChange time.Time `json:"last_change"`
}

// services/agent_status.go
func (s *AgentStatusService) UpdateStatus(userID string, status string) error {
    // Redis更新
    key := fmt.Sprintf("agent:status:%s", userID)
    data := map[string]interface{}{
        "status":      status,
        "last_change": time.Now(),
    }
    
    err := s.redis.HMSet(key, data).Err()
    
    // WebSocketで通知
    s.notifyStatusChange(userID, status)
    
    return err
}
```

---

### TASK-P2-011: 自動ステータス変更
**作業量**: M（3-5日）
**テスト戦略**:
- **Unit Test**: 自動遷移ロジック
- **Integration Test**: タイマー処理

**実装内容**:
```go
// services/auto_status.go
func (s *AgentStatusService) StartAutoStatusWorker() {
    ticker := time.NewTicker(10 * time.Second)
    
    for range ticker.C {
        agents := s.GetAllAgents()
        for _, agent := range agents {
            // 後処理時間経過チェック
            if agent.Status == "wrap_up" && 
               time.Since(agent.LastChange) > agent.WrapUpTime {
                s.UpdateStatus(agent.UserID, "available")
            }
        }
    }
}
```

---

## 📊 Phase 2 完了基準

### 技術的完了条件
- [ ] 全Unit Testパス（カバレッジ75%以上）
- [ ] 全Integration Testパス
- [ ] 認証/認可が全APIで動作
- [ ] データベーストランザクション正常

### 機能的完了条件
- [ ] ログイン/ログアウト可能
- [ ] 複数ユーザー同時利用可能
- [ ] 通話履歴の記録・表示
- [ ] 保留・転送機能動作
- [ ] ステータス管理動作

### E2Eテストシナリオ（ユーザー実施）
```markdown
## ユーザー管理テスト
1. ログイン画面でユーザー名/パスワード入力
2. ログイン成功後、ソフトフォン表示
3. 別ブラウザで別ユーザーログイン
4. 両ユーザーで同時通話可能確認

## 通話制御テスト
1. 通話を開始
2. 保留ボタンクリック → 音楽再生確認
3. 保留解除 → 通話再開確認
4. 転送ボタンクリック → 転送先入力
5. 転送実行 → 転送成功確認

## 履歴テスト
1. 複数回通話実施
2. 通話履歴画面表示
3. フィルター機能確認
4. 詳細表示確認
```