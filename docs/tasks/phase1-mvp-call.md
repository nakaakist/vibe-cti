# Phase 1: 最小限の通話機能実現（MVP）

**目標**: ローカル環境でソフトフォンから架電し、通話が可能な状態を実現する

## 🎯 マイルストーン達成条件
- [ ] Docker Composeで全サービス起動
- [ ] ブラウザからソフトフォンUIアクセス可能
- [ ] WebRTC経由で発信可能
- [ ] 音声の双方向通信確立
- [ ] localtunnelでリモートからアクセス可能

---

## 1. 開発環境構築

### TASK-P1-001: Docker Compose環境構築
**作業量**: S（1-2日）
**テスト戦略**: 
- **Integration Test**: docker-compose up でサービス起動確認
- **E2E Test依頼**: 全サービスの疎通確認

**実装内容**:
```yaml
# docker-compose.yml
version: '3.8'
services:
  freeswitch:
    build: ./docker/freeswitch
    ports:
      - "5060:5060/udp"
      - "5060:5060/tcp"
      - "5080:5080/udp"
      - "5080:5080/tcp"
      - "16384-16484:16384-16484/udp"
  
  janus:
    build: ./docker/janus
    ports:
      - "8088:8088"
      - "8089:8089"
      - "10000-10100:10000-10100/udp"
  
  coturn:
    image: coturn/coturn
    ports:
      - "3478:3478/udp"
      - "3478:3478/tcp"
  
  api:
    build: ./backend
    ports:
      - "8080:8080"
    depends_on:
      - postgres
      - redis
  
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
  
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: vibe_cti
      POSTGRES_USER: vibe
      POSTGRES_PASSWORD: vibe123
  
  redis:
    image: redis:7
```

**受け入れテスト**:
```bash
# test_docker_compose.sh
#!/bin/bash
docker-compose up -d
sleep 10
curl -f http://localhost:8080/health || exit 1
curl -f http://localhost:3000 || exit 1
curl -f http://localhost:8088/janus/info || exit 1
echo "All services are running!"
```

---

### TASK-P1-002: FreeSWITCH最小設定
**作業量**: M（3-5日）
**テスト戦略**:
- **Unit Test**: XML設定の妥当性確認
- **Integration Test**: SIP REGISTER/INVITE処理確認

**実装内容**:
```xml
<!-- freeswitch/conf/sip_profiles/internal.xml -->
<profile name="internal">
  <settings>
    <param name="sip-port" value="5060"/>
    <param name="rtp-start-port" value="16384"/>
    <param name="rtp-end-port" value="16484"/>
    <param name="codec-prefs" value="OPUS,PCMU,PCMA"/>
  </settings>
</profile>
```

**テストコード**:
```go
// freeswitch_test.go
func TestFreeSwitchESL(t *testing.T) {
    conn, err := esl.Connect("localhost:8021", "ClueCon")
    assert.NoError(t, err)
    
    response, err := conn.Api("status")
    assert.NoError(t, err)
    assert.Contains(t, response, "UP")
}
```

---

### TASK-P1-003: Janus WebRTC Gateway最小設定
**作業量**: M（3-5日）
**テスト戦略**:
- **Unit Test**: 設定ファイル検証
- **Integration Test**: WebRTC接続確立テスト

**実装内容**:
```json
// janus.jcfg
{
  "general": {
    "configs_folder": "/etc/janus",
    "plugins_folder": "/usr/lib/janus/plugins",
    "debug_level": 4
  },
  "nat": {
    "stun_server": "stun.l.google.com",
    "stun_port": 19302,
    "ice_lite": false
  }
}
```

**テストコード**:
```javascript
// janus_connection_test.js
describe('Janus Connection', () => {
  it('should connect to Janus server', async () => {
    const janus = new Janus({
      server: 'ws://localhost:8188',
      success: () => {
        expect(janus.isConnected()).toBe(true);
      }
    });
  });
});
```

---

## 2. 最小バックエンドAPI

### TASK-P1-004: Goプロジェクト初期設定
**作業量**: S（1日）
**テスト戦略**:
- **Unit Test**: 基本的なHTTPハンドラーテスト

**実装内容**:
```go
// main.go
package main

import (
    "github.com/labstack/echo/v4"
    "github.com/labstack/echo/v4/middleware"
)

func main() {
    e := echo.New()
    e.Use(middleware.Logger())
    e.Use(middleware.CORS())
    
    e.GET("/health", healthCheck)
    e.POST("/api/calls", makeCall)
    e.POST("/api/calls/:id/answer", answerCall)
    e.POST("/api/calls/:id/hangup", hangupCall)
    
    e.Logger.Fatal(e.Start(":8080"))
}
```

**テストコード**:
```go
// main_test.go
func TestHealthEndpoint(t *testing.T) {
    e := echo.New()
    req := httptest.NewRequest(http.MethodGet, "/health", nil)
    rec := httptest.NewRecorder()
    
    c := e.NewContext(req, rec)
    err := healthCheck(c)
    
    assert.NoError(t, err)
    assert.Equal(t, http.StatusOK, rec.Code)
}
```

---

### TASK-P1-005: Janus制御層実装（最小版）
**作業量**: M（3-5日）
**テスト戦略**:
- **Unit Test**: Janusクライアントのモックテスト
- **Integration Test**: 実際のJanusサーバーとの通信テスト

**実装内容**:
```go
// janus_client.go
type JanusClient struct {
    url    string
    client *http.Client
}

func (j *JanusClient) CreateSession() (*Session, error) {
    // セッション作成
}

func (j *JanusClient) AttachPlugin(sessionID int64, plugin string) (*Handle, error) {
    // SIP pluginアタッチ
}

func (j *JanusClient) MakeCall(handle *Handle, sipURI string) error {
    // 発信処理
}
```

**テストコード**:
```go
// janus_client_test.go
func TestCreateSession(t *testing.T) {
    client := NewJanusClient("http://localhost:8088/janus")
    session, err := client.CreateSession()
    
    assert.NoError(t, err)
    assert.NotZero(t, session.ID)
}
```

---

### TASK-P1-006: WebSocket通知実装（最小版）
**作業量**: S（1-2日）
**テスト戦略**:
- **Unit Test**: WebSocketハンドラーテスト
- **Integration Test**: クライアント接続テスト

**実装内容**:
```go
// websocket.go
func HandleWebSocket(c echo.Context) error {
    ws, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
    if err != nil {
        return err
    }
    defer ws.Close()
    
    // イベント配信ループ
    for {
        select {
        case event := <-eventChannel:
            ws.WriteJSON(event)
        }
    }
}
```

---

## 3. 最小フロントエンド

### TASK-P1-007: React基本セットアップ
**作業量**: S（1日）
**テスト戦略**:
- **Unit Test**: コンポーネントレンダリングテスト

**実装内容**:
```tsx
// App.tsx
import { Softphone } from './components/Softphone';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Softphone />
    </div>
  );
}
```

**テストコード**:
```tsx
// App.test.tsx
describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
```

---

### TASK-P1-008: 最小ソフトフォンUI実装
**作業量**: M（3-5日）
**テスト戦略**:
- **Unit Test**: コンポーネント動作テスト
- **E2E Test依頼**: ダイヤルパッド操作確認

**実装内容**:
```tsx
// Softphone.tsx
export function Softphone() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callState, setCallState] = useState<'idle' | 'calling' | 'connected'>('idle');
  
  const handleDial = (digit: string) => {
    setPhoneNumber(prev => prev + digit);
  };
  
  const handleCall = async () => {
    await makeCall(phoneNumber);
    setCallState('calling');
  };
  
  return (
    <div className="w-80 p-4 bg-white rounded-lg shadow">
      <input value={phoneNumber} readOnly className="w-full p-2 border" />
      <Dialpad onDial={handleDial} />
      <button onClick={handleCall} className="w-full bg-green-500 text-white p-2">
        Call
      </button>
    </div>
  );
}
```

---

### TASK-P1-009: WebRTC接続管理実装
**作業量**: M（3-5日）
**テスト戦略**:
- **Unit Test**: PeerConnection状態管理テスト
- **Integration Test**: Janusとの接続テスト

**実装内容**:
```typescript
// webrtc.ts
export class WebRTCManager {
  private pc: RTCPeerConnection;
  private janus: any;
  
  async initialize() {
    this.pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    
    // Janus接続
    this.janus = await this.connectToJanus();
  }
  
  async makeCall(number: string) {
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    
    // Janusに送信
    await this.janus.sendMessage({
      request: 'call',
      uri: `sip:${number}@localhost`
    });
  }
}
```

**テストコード**:
```typescript
// webrtc.test.ts
describe('WebRTCManager', () => {
  it('should create peer connection', () => {
    const manager = new WebRTCManager();
    manager.initialize();
    expect(manager.pc).toBeDefined();
  });
});
```

---

## 4. 統合・疎通確認

### TASK-P1-010: localtunnel設定
**作業量**: S（1日）
**テスト戦略**:
- **E2E Test依頼**: 外部からのアクセス確認

**実装内容**:
```bash
# start_tunnel.sh
#!/bin/bash
npx localtunnel --port 3000 --subdomain vibe-cti-frontend &
npx localtunnel --port 8080 --subdomain vibe-cti-api &
npx localtunnel --port 8088 --subdomain vibe-cti-janus &
```

---

### TASK-P1-011: E2E通話テスト
**作業量**: M（3-5日）
**テスト戦略**:
- **E2E Test依頼**: 完全な通話フロー確認

**E2Eテストシナリオ（ユーザー実施）**:
```markdown
## 通話テストシナリオ

1. ブラウザでhttp://localhost:3000を開く
2. ダイヤルパッドで番号入力
3. Callボタンをクリック
4. 音声が聞こえることを確認
5. Hangupボタンで切断
6. 通話履歴に記録されることを確認

## 確認項目
- [ ] マイク許可ダイアログ表示
- [ ] 発信音が聞こえる
- [ ] 相手の音声が聞こえる
- [ ] 自分の音声が相手に届く
- [ ] 切断が正常に動作
```

---

## 📊 Phase 1 完了基準

### 技術的完了条件
- [ ] 全Unit Testがパス（カバレッジ70%以上）
- [ ] 全Integration Testがパス
- [ ] メモリリークなし
- [ ] エラーレート1%未満

### 機能的完了条件
- [ ] ローカル環境で通話可能
- [ ] 5分以上の安定通話
- [ ] 音声品質に問題なし
- [ ] localtunnelで外部アクセス可能

### ドキュメント
- [ ] README.md作成
- [ ] API仕様書作成
- [ ] 環境構築手順書作成
- [ ] トラブルシューティングガイド作成