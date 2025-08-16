# エージェント受電画面（ソフトフォン）設計書

（作成日: 2025-08-16）

## 1. 概要

エージェント受電画面は、CTIシステムのメインインターフェースとして、エージェントが通話の発信・受信・制御を行うWebベースのソフトフォン画面です。WebRTC技術を使用し、ブラウザ上で完結する通話機能を提供します。

## 2. 画面構成

### 2.1 メイン画面レイアウト

```
┌─────────────────────────────────────────────────────────┐
│ Vibe CTI - エージェントコンソール     田中太郎 [ログアウト]│
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌───────────────────┬─────────────────────────────────┐ │
│ │                   │                                 │ │
│ │   ソフトフォン     │         ワークスペース          │ │
│ │   ウィジェット     │                                 │ │
│ │                   │    ┌─────────────────────────┐  │ │
│ │  ┌─────────────┐  │    │                       │  │ │
│ │  │ ステータス   │  │    │    顧客情報パネル      │  │ │
│ │  │  利用可能    │  │    │                       │  │ │
│ │  └─────────────┘  │    └─────────────────────────┘  │ │
│ │                   │                                 │ │
│ │  ┌─────────────┐  │    ┌─────────────────────────┐  │ │
│ │  │             │  │    │                       │  │ │
│ │  │  ダイヤル    │  │    │    通話履歴          │  │ │
│ │  │   パッド     │  │    │                       │  │ │
│ │  │             │  │    └─────────────────────────┘  │ │
│ │  └─────────────┘  │                                 │ │
│ │                   │    ┌─────────────────────────┐  │ │
│ │  ┌─────────────┐  │    │                       │  │ │
│ │  │  通話制御   │  │    │    メモ・タスク        │  │ │
│ │  └─────────────┘  │    │                       │  │ │
│ │                   │    └─────────────────────────┘  │ │
│ │                   │                                 │ │
│ └───────────────────┴─────────────────────────────────┘ │
│                                                         │
│ ステータスバー: 00:03:45 通話中 | 本日: 23件 | 平均: 3:15 │
└─────────────────────────────────────────────────────────┘
```

### 2.2 ソフトフォンウィジェット詳細

#### 2.2.1 ステータスコントロール

```
┌─────────────────────────────────┐
│ エージェントステータス           │
├─────────────────────────────────┤
│                                 │
│  ┌───────────────────────────┐  │
│  │      🟢 利用可能           │  │
│  └───────────────────────────┘  │
│                                 │
│  ステータス変更:                │
│  [▼ 利用可能              ]    │
│    ・利用可能                   │
│    ・離席中                     │
│    ・休憩                       │
│    ・会議                       │
│    ・トレーニング               │
│    ・後処理                     │
│    ・オフライン                 │
│                                 │
│  自動ステータス:                │
│  □ 通話後自動で後処理           │
│  後処理時間: [30] 秒            │
│                                 │
└─────────────────────────────────┘
```

#### 2.2.2 ダイヤルパッド

```
┌─────────────────────────────────┐
│ ダイヤルパッド                   │
├─────────────────────────────────┤
│                                 │
│  ┌───────────────────────────┐  │
│  │ 03-1234-5678_            │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌─────┬─────┬─────┐            │
│  │  1  │  2  │  3  │            │
│  │     │ ABC │ DEF │            │
│  ├─────┼─────┼─────┤            │
│  │  4  │  5  │  6  │            │
│  │ GHI │ JKL │ MNO │            │
│  ├─────┼─────┼─────┤            │
│  │  7  │  8  │  9  │            │
│  │PQRS │ TUV │WXYZ │            │
│  ├─────┼─────┼─────┤            │
│  │  *  │  0  │  #  │            │
│  │     │  +  │     │            │
│  └─────┴─────┴─────┘            │
│                                 │
│  [📞 発信] [⌫ クリア]           │
│                                 │
│  最近の通話:                    │
│  ・03-9876-5432 (10分前)       │
│  ・090-1234-5678 (1時間前)     │
│  ・内線 1002 (2時間前)         │
│                                 │
└─────────────────────────────────┘
```

#### 2.2.3 通話制御パネル

```
┌─────────────────────────────────┐
│ 通話制御                         │
├─────────────────────────────────┤
│                                 │
│  通話中: 03-1234-5678           │
│  山田太郎様                      │
│  ⏱️ 00:03:45                    │
│                                 │
│  ┌──────────────────────────┐   │
│  │ 🔇 ミュート  🔊 音量: ███ │   │
│  └──────────────────────────┘   │
│                                 │
│  [⏸️ 保留] [📞 転送] [🔄 会議]  │
│                                 │
│  [📹 ビデオ] [💬 チャット]      │
│                                 │
│  [📱 DTMF] [🎙️ 録音停止]       │
│                                 │
│  ┌──────────────────────────┐   │
│  │     📞 通話終了           │   │
│  └──────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

### 2.3 着信ポップアップ

```
┌─────────────────────────────────────────┐
│ 🔔 着信中                                │
├─────────────────────────────────────────┤
│                                         │
│  発信元: 03-1234-5678                   │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ 顧客情報:                         │  │
│  │ 名前: 山田太郎                    │  │
│  │ 会社: 株式会社サンプル            │  │
│  │ 前回通話: 2025/8/10 (6日前)       │  │
│  │ ステータス: VIP顧客               │  │
│  └───────────────────────────────────┘  │
│                                         │
│  IVR経路: メインメニュー > 営業         │
│  待機時間: 00:15                        │
│                                         │
│  [✅ 応答] [❌ 拒否] [➡️ 転送]         │
│                                         │
│  自動応答まで: 3秒                      │
│  ━━━━━━━━━━━━━━━━━━                  │
└─────────────────────────────────────────┘
```

### 2.4 顧客情報パネル

```
┌─────────────────────────────────────────┐
│ 顧客情報                   [編集] [更新] │
├─────────────────────────────────────────┤
│                                         │
│ 基本情報:                               │
│ ├─ 名前: 山田太郎                       │
│ ├─ 会社: 株式会社サンプル               │
│ ├─ 電話: 03-1234-5678                   │
│ ├─ メール: yamada@sample.co.jp          │
│ └─ 顧客ID: CUS-2024-0001                │
│                                         │
│ 契約情報:                               │
│ ├─ プラン: エンタープライズ             │
│ ├─ 契約開始: 2024/01/15                 │
│ └─ 月額: ¥150,000                       │
│                                         │
│ 最近の活動:                             │
│ ├─ 8/10: 見積依頼対応                   │
│ ├─ 7/25: サポート問い合わせ             │
│ └─ 7/15: 契約更新完了                   │
│                                         │
│ タグ: [VIP] [要フォロー] [更新予定]     │
│                                         │
│ [CRM詳細を開く] [チケット作成]          │
└─────────────────────────────────────────┘
```

### 2.5 通話履歴タブ

```
┌─────────────────────────────────────────┐
│ 通話履歴              [フィルター] [検索]│
├─────────────────────────────────────────┤
│                                         │
│ 本日の通話:                             │
│                                         │
│ 14:23 📞← 03-1234-5678  3:45  応答     │
│       山田太郎 - 見積依頼               │
│                                         │
│ 14:10 📞→ 090-9876-5432  5:12  応答    │
│       佐藤花子 - フォローアップ         │
│                                         │
│ 13:45 📞← 06-6789-0123  2:30  応答     │
│       鈴木一郎 - サポート               │
│                                         │
│ 13:30 📞→ 03-9876-5432  -  不在        │
│       高橋次郎 - 営業電話               │
│                                         │
│ [もっと見る]                            │
│                                         │
│ 統計:                                   │
│ 本日: 23件 | 応答率: 91% | 平均: 3:15   │
└─────────────────────────────────────────┘
```

### 2.6 メモ・タスクパネル

```
┌─────────────────────────────────────────┐
│ メモ・タスク                    [保存]   │
├─────────────────────────────────────────┤
│                                         │
│ 通話メモ:                               │
│ ┌───────────────────────────────────┐  │
│ │ 製品Aの見積もり依頼。              │  │
│ │ 数量: 100個                        │  │
│ │ 希望納期: 9月末                    │  │
│ │ 来週月曜日までに見積書送付予定     │  │
│ └───────────────────────────────────┘  │
│                                         │
│ 処理区分: [▼ 見積依頼]                 │
│                                         │
│ フォローアップ:                         │
│ □ タスク作成                           │
│   期限: [2025/8/19]                    │
│   担当: [▼ 自分]                       │
│                                         │
│ □ カレンダー登録                       │
│   日時: [2025/8/19 10:00]              │
│                                         │
│ タグ: [見積] [急ぎ] [+追加]            │
│                                         │
└─────────────────────────────────────────┘
```

## 3. 機能詳細

### 3.1 通話機能

#### 3.1.1 発信機能

- **直接ダイヤル**: ダイヤルパッドから番号入力
- **クリックトゥコール**: CRM内の電話番号クリック
- **リダイヤル**: 最近の通話から選択
- **短縮ダイヤル**: 登録済み番号のワンクリック発信
- **内線発信**: 内線番号への発信

#### 3.1.2 着信機能

- **着信ポップアップ**: 顧客情報付き通知
- **自動応答**: 設定秒数後の自動応答
- **選択応答**: 複数着信からの選択
- **着信拒否**: スパム番号の拒否
- **着信転送**: 他エージェントへの即座転送

#### 3.1.3 通話中機能

- **ミュート/ミュート解除**
- **保留/保留解除**
- **音量調整**
- **DTMF送信**
- **録音開始/停止**
- **通話転送**
  - ブラインド転送
  - アテンド転送（相談付き）
- **会議通話**
  - 三者通話
  - 複数参加者追加

### 3.2 ステータス管理

#### 3.2.1 エージェントステータス

```typescript
enum AgentStatus {
  AVAILABLE = '利用可能',
  BUSY = '通話中',
  WRAP_UP = '後処理',
  AWAY = '離席中',
  BREAK = '休憩',
  MEETING = '会議',
  TRAINING = 'トレーニング',
  OFFLINE = 'オフライン'
}
```

#### 3.2.2 自動ステータス変更

- 通話開始時: 自動的に「通話中」
- 通話終了時: 「後処理」へ移行
- 後処理時間経過後: 「利用可能」へ
- 無操作時間経過: 「離席中」へ

### 3.3 顧客情報連携

#### 3.3.1 着信時情報表示

- CRMからの顧客情報自動取得
- 過去の通話履歴表示
- 未解決チケット表示
- VIPステータス表示

#### 3.3.2 スクリーンポップ

- CRM画面の自動表示
- 関連チケットの自動オープン
- 顧客詳細ページへの遷移

### 3.4 統計・レポート

#### 3.4.1 リアルタイム統計

- 本日の通話件数
- 平均通話時間
- 応答率
- 現在のキュー状況

#### 3.4.2 個人パフォーマンス

- 通話数ランキング
- 平均処理時間
- 顧客満足度スコア

## 4. API仕様

### 4.1 通話制御API

```typescript
// POST /api/softphone/call
interface MakeCallRequest {
  to: string;
  from?: string;
  callerId?: string;
  headers?: Record<string, string>;
}

// POST /api/softphone/answer
interface AnswerCallRequest {
  callId: string;
  autoRecord?: boolean;
}

// POST /api/softphone/hangup
interface HangupCallRequest {
  callId: string;
  reason?: string;
}

// POST /api/softphone/hold
interface HoldCallRequest {
  callId: string;
  holdMusic?: string;
}

// POST /api/softphone/transfer
interface TransferCallRequest {
  callId: string;
  to: string;
  type: 'blind' | 'attended';
  consultCallId?: string; // for attended transfer
}

// POST /api/softphone/conference
interface ConferenceCallRequest {
  callIds: string[];
  roomId?: string;
}

// POST /api/softphone/dtmf
interface SendDtmfRequest {
  callId: string;
  digits: string;
  duration?: number;
  interDigitTimeout?: number;
}
```

### 4.2 ステータス管理API

```typescript
// GET /api/agent/status
interface GetAgentStatusResponse {
  status: AgentStatus;
  substatus?: string;
  duration: number;
  lastChange: Date;
  autoWrapUp: boolean;
  wrapUpTime: number;
}

// PUT /api/agent/status
interface UpdateAgentStatusRequest {
  status: AgentStatus;
  substatus?: string;
  reason?: string;
  duration?: number; // for scheduled status
}

// GET /api/agent/presence
interface GetPresenceResponse {
  agents: Array<{
    id: string;
    name: string;
    status: AgentStatus;
    extension: string;
    available: boolean;
  }>;
}
```

### 4.3 顧客情報API

```typescript
// GET /api/customer/lookup
interface LookupCustomerRequest {
  phoneNumber: string;
  includeHistory?: boolean;
  includeTickets?: boolean;
}

interface LookupCustomerResponse {
  customer?: {
    id: string;
    name: string;
    company?: string;
    email?: string;
    phone: string;
    vip: boolean;
    tags: string[];
    customFields?: Record<string, any>;
  };
  history?: CallRecord[];
  tickets?: Ticket[];
}

// POST /api/customer/screen-pop
interface ScreenPopRequest {
  customerId: string;
  callId: string;
  popType: 'new_window' | 'new_tab' | 'iframe';
}
```

### 4.4 WebSocket イベント

```typescript
// WebSocket接続
interface WebSocketEvents {
  // 接続管理
  'connect': { agentId: string; token: string };
  'disconnect': { reason: string };
  'error': { code: string; message: string };
  
  // 通話イベント
  'call.incoming': {
    callId: string;
    from: string;
    to: string;
    customer?: Customer;
    ivrPath?: string;
    waitTime?: number;
  };
  
  'call.started': {
    callId: string;
    direction: 'inbound' | 'outbound';
    remote: string;
  };
  
  'call.answered': {
    callId: string;
    timestamp: Date;
  };
  
  'call.ended': {
    callId: string;
    duration: number;
    reason: string;
  };
  
  'call.held': {
    callId: string;
    held: boolean;
  };
  
  'call.transferred': {
    callId: string;
    transferredTo: string;
    transferType: string;
  };
  
  // ステータスイベント
  'status.changed': {
    previousStatus: AgentStatus;
    newStatus: AgentStatus;
    reason?: string;
  };
  
  // 通知イベント
  'notification': {
    type: 'info' | 'warning' | 'error';
    title: string;
    message: string;
    actions?: Array<{
      label: string;
      action: string;
    }>;
  };
}
```

## 5. UI/UX要件

### 5.1 レスポンシブデザイン

```scss
// ブレークポイント
$mobile: 640px;
$tablet: 1024px;
$desktop: 1280px;

// レイアウト調整
@media (max-width: $tablet) {
  .softphone-widget {
    position: fixed;
    bottom: 0;
    width: 100%;
  }
  
  .workspace {
    display: none; // タブ切り替えで表示
  }
}

@media (min-width: $desktop) {
  .agent-console {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 20px;
  }
}
```

### 5.2 アクセシビリティ

- **キーボードショートカット**
  - `Ctrl+D`: ダイヤルパッド表示
  - `Ctrl+A`: 着信応答
  - `Ctrl+H`: 通話終了
  - `Ctrl+M`: ミュート切り替え
  - `Ctrl+T`: 転送
  - `F1-F6`: ステータス切り替え

- **音声フィードバック**
  - 着信音のカスタマイズ
  - 通話終了音
  - エラー音
  - 通知音

- **視覚フィードバック**
  - 高コントラストモード
  - 色覚異常対応
  - フォントサイズ調整
  - アニメーション無効化オプション

### 5.3 パフォーマンス

- **初期読み込み**: 2秒以内
- **WebRTC接続**: 1秒以内
- **API応答**: 500ms以内
- **UIアップデート**: 16ms以内（60fps）

## 6. データモデル

### 6.1 通話セッション

```typescript
interface CallSession {
  id: string;
  agentId: string;
  direction: 'inbound' | 'outbound';
  state: CallState;
  remoteNumber: string;
  localNumber: string;
  startTime: Date;
  answerTime?: Date;
  endTime?: Date;
  duration?: number;
  
  customer?: {
    id: string;
    name: string;
    company?: string;
    vip: boolean;
  };
  
  media: {
    audio: boolean;
    video: boolean;
    screen: boolean;
  };
  
  recording?: {
    enabled: boolean;
    url?: string;
  };
  
  quality: {
    mos?: number;
    packetLoss?: number;
    jitter?: number;
    latency?: number;
  };
  
  tags: string[];
  notes?: string;
}

enum CallState {
  INITIATING = 'initiating',
  RINGING = 'ringing',
  ANSWERED = 'answered',
  HELD = 'held',
  TRANSFERRING = 'transferring',
  CONFERENCED = 'conferenced',
  ENDED = 'ended'
}
```

### 6.2 エージェントセッション

```typescript
interface AgentSession {
  id: string;
  agentId: string;
  loginTime: Date;
  logoutTime?: Date;
  
  status: AgentStatus;
  statusHistory: Array<{
    status: AgentStatus;
    timestamp: Date;
    duration: number;
    reason?: string;
  }>;
  
  statistics: {
    totalCalls: number;
    answeredCalls: number;
    missedCalls: number;
    totalTalkTime: number;
    totalWrapUpTime: number;
    totalAvailableTime: number;
  };
  
  currentCall?: CallSession;
  callQueue: CallSession[];
  
  settings: {
    autoAnswer: boolean;
    autoWrapUp: boolean;
    wrapUpTime: number;
    ringtone: string;
    microphoneId?: string;
    speakerId?: string;
  };
}
```

## 7. エラーハンドリング

### 7.1 エラーコード

```typescript
enum SoftphoneErrorCode {
  // メディアエラー
  MEDIA_PERMISSION_DENIED = 'MEDIA_001',
  MEDIA_DEVICE_NOT_FOUND = 'MEDIA_002',
  MEDIA_DEVICE_IN_USE = 'MEDIA_003',
  
  // 接続エラー
  CONNECTION_FAILED = 'CONN_001',
  CONNECTION_TIMEOUT = 'CONN_002',
  CONNECTION_LOST = 'CONN_003',
  
  // 通話エラー
  CALL_FAILED = 'CALL_001',
  CALL_REJECTED = 'CALL_002',
  CALL_BUSY = 'CALL_003',
  CALL_NO_ANSWER = 'CALL_004',
  
  // 認証エラー
  AUTH_FAILED = 'AUTH_001',
  AUTH_EXPIRED = 'AUTH_002',
  AUTH_INSUFFICIENT = 'AUTH_003'
}
```

### 7.2 エラー表示

```typescript
interface ErrorDisplay {
  code: SoftphoneErrorCode;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  actions?: Array<{
    label: string;
    handler: () => void;
  }>;
  autoHide?: boolean;
  duration?: number;
}
```

## 8. セキュリティ要件

### 8.1 通信セキュリティ

- **WebRTC暗号化**: DTLS-SRTP必須
- **シグナリング**: WSS（WebSocket Secure）
- **メディア**: SRTP（Secure RTP）
- **STUN/TURN**: TLS暗号化

### 8.2 認証・認可

- **トークンベース認証**: JWT使用
- **セッション管理**: 定期的なトークン更新
- **権限チェック**: API呼び出し時の権限検証
- **IPホワイトリスト**: オプション

### 8.3 データ保護

- **録音暗号化**: AES-256
- **顧客情報マスキング**: PII自動検出
- **ログサニタイジング**: 機密情報除去
- **画面録画防止**: DRM適用

## 9. 統合要件

### 9.1 CRM統合

```typescript
interface CrmIntegration {
  type: 'salesforce' | 'hubspot' | 'dynamics' | 'custom';
  
  config: {
    apiEndpoint: string;
    apiKey: string;
    mapping: {
      customerId: string;
      phoneField: string;
      nameField: string;
      companyField: string;
    };
  };
  
  features: {
    screenPop: boolean;
    clickToCall: boolean;
    autoLog: boolean;
    customFields: boolean;
  };
}
```

### 9.2 ヘルプデスク統合

```typescript
interface HelpdeskIntegration {
  type: 'zendesk' | 'freshdesk' | 'servicenow';
  
  features: {
    ticketCreation: boolean;
    ticketUpdate: boolean;
    customerLookup: boolean;
    autoTicketPop: boolean;
  };
}
```

## 10. 監視・分析

### 10.1 通話品質監視

- **MOS値**: リアルタイム表示
- **パケットロス率**: 警告閾値設定
- **ジッター**: グラフ表示
- **遅延**: 色分け表示

### 10.2 パフォーマンス追跡

- **応答時間**: 目標との比較
- **処理時間**: 平均値表示
- **離席時間**: 累積表示
- **生産性スコア**: KPI達成率