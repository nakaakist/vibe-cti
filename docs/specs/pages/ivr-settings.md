# IVR設定画面 設計書

（作成日: 2025-08-16）

## 1. 概要

IVR（Interactive Voice Response）設定画面は、自動音声応答システムのフロー作成・管理を行う画面です。ビジュアルフローエディタによる直感的な操作で、複雑なコールフローを構築できます。

## 2. 画面一覧

### 2.1 IVRフロー一覧画面

#### 画面構成

```
┌─────────────────────────────────────────────────────────┐
│ IVR設定 > フロー一覧                                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ [+ 新規フロー作成] [テンプレートから作成] [インポート]  │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 🔍 検索...               [▼ すべて] [▼ 有効]   │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ フロー名     | 状態 | 電話番号 | 更新日時 | 操作 │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ メインIVR    | ● 有効 | +81312345678 | 8/15 | ✏️📊│   │
│ │ 営業時間外   | ● 有効 | -           | 8/14 | ✏️📊│   │
│ │ 休日対応     | ● 有効 | -           | 8/10 | ✏️📊│   │
│ │ テスト環境   | ○ 無効 | +81398765432 | 8/1  | ✏️📊│   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 利用統計サマリー                                 │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ 本日の通話数: 1,234  平均通話時間: 2分35秒      │   │
│ │ 完了率: 87%  転送率: 45%  切断率: 13%          │   │
│ └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 2.2 IVRフローエディタ画面

#### 画面構成

```
┌─────────────────────────────────────────────────────────┐
│ IVR設定 > フローエディタ > メインIVR                    │
├─────────────────────────────────────────────────────────┤
│ [保存] [プレビュー] [テスト実行] [公開] [設定] [終了]   │
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│ ノード   │              キャンバスエリア                │
│ パレット │                                              │
│          │     [開始]                                   │
│ 基本     │        ↓                                     │
│ ├─再生   │    [音声再生]                               │
│ ├─入力   │    "お電話ありがとう..."                     │
│ ├─分岐   │        ↓                                     │
│ └─転送   │    [メニュー]                               │
│          │    1: 営業 2: サポート                       │
│ 条件     │      ／  ＼                                  │
│ ├─時間   │  [転送]  [転送]                             │
│ ├─曜日   │  営業部  サポート                           │
│ └─変数   │                                              │
│          │                                              │
│ データ   │                                              │
│ ├─DB照会 │                                              │
│ ├─API    │                                              │
│ └─録音   │                                              │
│          │                                              │
│ 終了     │                                              │
│ ├─切断   │                                              │
│ └─留守電 │                                              │
│          │                                              │
└──────────┴──────────────────────────────────────────────┘

プロパティパネル（右側）
┌─────────────────────────────────┐
│ メニューノード設定              │
├─────────────────────────────────┤
│ ノード名:                       │
│ [メインメニュー            ]    │
│                                 │
│ プロンプト:                     │
│ [▼ main_menu.wav          ]    │
│ [アップロード] [録音]          │
│                                 │
│ タイムアウト: [10] 秒          │
│ 最大試行回数: [3] 回           │
│                                 │
│ オプション設定:                │
│ ├─ 1: 営業部門                 │
│ ├─ 2: サポート                 │
│ ├─ 3: その他                   │
│ └─ [+ オプション追加]          │
│                                 │
│ 無効な入力時:                  │
│ [▼ エラーメッセージ再生   ]    │
│                                 │
│ タイムアウト時:                │
│ [▼ オペレーター転送       ]    │
└─────────────────────────────────┘
```

#### ノードタイプ詳細

**基本ノード**
- 音声再生: 音声ファイルまたはTTS再生
- DTMF入力: 番号入力待ち受け
- メニュー分岐: 複数選択肢の提示
- 転送: エージェント/外線転送

**条件ノード**
- 営業時間判定: 時間帯による分岐
- 曜日判定: 曜日/祝日による分岐
- 変数判定: システム変数による分岐

**データノード**
- DB照会: 顧客情報等の参照
- API呼び出し: 外部システム連携
- 録音: 通話録音/留守電録音

**終了ノード**
- 通話終了: 正常終了
- 留守電: ボイスメール転送

### 2.3 プロンプト管理画面

#### 画面構成

```
┌─────────────────────────────────────────────────────────┐
│ IVR設定 > プロンプト管理                                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ [+ 音声アップロード] [録音] [TTS生成] [一括インポート]  │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ カテゴリー: [▼ すべて]  言語: [▼ 日本語]      │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ □ | ファイル名 | カテゴリー | 長さ | 使用中 | 操作│   │
│ ├─────────────────────────────────────────────────┤   │
│ │ □ | welcome.wav | 挨拶      | 5秒  | 3箇所 | ▶️✏️│   │
│ │ □ | main_menu.wav | メニュー | 12秒 | 1箇所 | ▶️✏️│   │
│ │ □ | hold_music.mp3 | 保留音  | 3分  | 5箇所 | ▶️✏️│   │
│ │ □ | goodbye.wav | 終了      | 3秒  | 2箇所 | ▶️✏️│   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ TTS（Text-to-Speech）設定                       │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ エンジン: [▼ Amazon Polly               ]      │   │
│ │ 音声: [▼ Mizuki（女性）                 ]      │   │
│ │ 速度: ━━━━━━━━━━━━ 1.0x                    │   │
│ │ ピッチ: ━━━━━━━━━━━━ 0                     │   │
│ │                                                   │   │
│ │ テキスト:                                        │   │
│ │ ┌───────────────────────────────────────┐       │   │
│ │ │ お電話ありがとうございます。            │       │   │
│ │ │ 株式会社サンプルです。                  │       │   │
│ │ └───────────────────────────────────────┘       │   │
│ │                                                   │   │
│ │ [プレビュー] [生成して保存]                      │   │
│ └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 2.4 営業時間設定画面

#### 画面構成

```
┌─────────────────────────────────────────────────────────┐
│ IVR設定 > 営業時間設定                                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ スケジュールプロファイル                         │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ [+ 新規プロファイル]                             │   │
│ │                                                   │   │
│ │ ● 標準営業時間（デフォルト）                     │   │
│ │ ○ 24時間対応                                    │   │
│ │ ○ カスタマーサポート                            │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 標準営業時間 - 週間スケジュール                  │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ 月曜日: ☑ 09:00 - 18:00  [+ 時間帯追加]        │   │
│ │ 火曜日: ☑ 09:00 - 18:00                        │   │
│ │ 水曜日: ☑ 09:00 - 18:00                        │   │
│ │ 木曜日: ☑ 09:00 - 18:00                        │   │
│ │ 金曜日: ☑ 09:00 - 18:00                        │   │
│ │ 土曜日: ☐ 休業                                  │   │
│ │ 日曜日: ☐ 休業                                  │   │
│ │                                                   │   │
│ │ タイムゾーン: [▼ Asia/Tokyo (JST)        ]     │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 祝日・特別日設定                                 │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ [+ 特別日追加] [祝日カレンダーインポート]        │   │
│ │                                                   │   │
│ │ 日付       | 名称         | 営業時間 | 削除     │   │
│ │ 2025/1/1   | 元日         | 休業     | 🗑️      │   │
│ │ 2025/1/2   | 年始休業     | 休業     | 🗑️      │   │
│ │ 2025/1/3   | 年始休業     | 休業     | 🗑️      │   │
│ │ 2025/5/3   | 憲法記念日   | 休業     | 🗑️      │   │
│ │ 2025/12/31 | 年末営業     | 09:00-15:00 | 🗑️   │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 営業時間外設定                                   │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ 営業時間外メッセージ:                            │   │
│ │ [▼ after_hours.wav                        ]     │   │
│ │                                                   │   │
│ │ 営業時間外アクション:                            │   │
│ │ ● 留守電に転送                                  │   │
│ │ ○ 緊急番号を案内                                │   │
│ │ ○ カスタムフローに転送                          │   │
│ │                                                   │   │
│ │ 次回営業日の自動案内:                            │   │
│ │ ☑ 有効（"次の営業日は○月○日です"）             │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ [プレビュー] [保存]                                     │
└─────────────────────────────────────────────────────────┘
```

## 3. API仕様

### 3.1 IVRフロー管理API

```typescript
// GET /api/ivr/flows
interface GetFlowsResponse {
  flows: IvrFlow[];
  total: number;
}

// POST /api/ivr/flows
interface CreateFlowRequest {
  name: string;
  description?: string;
  enabled: boolean;
  phoneNumbers?: string[];
  nodes: FlowNode[];
  edges: FlowEdge[];
}

// PUT /api/ivr/flows/{id}
interface UpdateFlowRequest extends CreateFlowRequest {
  id: string;
}

// POST /api/ivr/flows/{id}/test
interface TestFlowRequest {
  phoneNumber?: string; // テスト用電話番号
  variables?: Record<string, any>;
}

// POST /api/ivr/flows/{id}/publish
interface PublishFlowRequest {
  version?: string;
  comment?: string;
}

// GET /api/ivr/flows/{id}/statistics
interface GetFlowStatisticsResponse {
  totalCalls: number;
  completionRate: number;
  avgDuration: number;
  nodeStatistics: Array<{
    nodeId: string;
    visits: number;
    avgTime: number;
    exitRate: number;
  }>;
}
```

### 3.2 プロンプト管理API

```typescript
// GET /api/ivr/prompts
interface GetPromptsResponse {
  prompts: Prompt[];
  categories: string[];
}

// POST /api/ivr/prompts/upload
interface UploadPromptRequest {
  file: File;
  name: string;
  category: string;
  language: string;
  description?: string;
}

// POST /api/ivr/prompts/tts
interface GenerateTtsRequest {
  text: string;
  engine: 'polly' | 'google' | 'azure';
  voice: string;
  speed?: number; // 0.5 - 2.0
  pitch?: number; // -20 - 20
  language: string;
}

// POST /api/ivr/prompts/record
interface RecordPromptRequest {
  name: string;
  category: string;
  maxDuration: number; // 秒
}

// DELETE /api/ivr/prompts/{id}
```

### 3.3 営業時間設定API

```typescript
// GET /api/ivr/schedules
interface GetSchedulesResponse {
  schedules: Schedule[];
}

// POST /api/ivr/schedules
interface CreateScheduleRequest {
  name: string;
  timezone: string;
  weeklyHours: WeeklyHours;
  holidays: Holiday[];
  afterHoursAction: AfterHoursAction;
}

// PUT /api/ivr/schedules/{id}
interface UpdateScheduleRequest extends CreateScheduleRequest {
  id: string;
}

// GET /api/ivr/schedules/{id}/check
interface CheckScheduleRequest {
  datetime?: string; // ISO 8601
}

interface CheckScheduleResponse {
  isOpen: boolean;
  currentPeriod?: {
    start: string;
    end: string;
  };
  nextOpen?: string;
  reason?: 'holiday' | 'weekend' | 'after_hours';
}
```

## 4. データモデル

### 4.1 IVRフロー

```typescript
interface IvrFlow {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  version: number;
  phoneNumbers: string[];
  nodes: FlowNode[];
  edges: FlowEdge[];
  variables: FlowVariable[];
  statistics?: FlowStatistics;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

interface FlowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: NodeData;
}

type NodeType = 
  | 'start' | 'play' | 'menu' | 'input' 
  | 'transfer' | 'condition' | 'api' 
  | 'database' | 'record' | 'hangup' | 'voicemail';

interface NodeData {
  label: string;
  // Type-specific properties
  promptId?: string;
  timeout?: number;
  maxAttempts?: number;
  options?: MenuOption[];
  transferTarget?: string;
  condition?: ConditionExpression;
  apiEndpoint?: string;
  query?: string;
}

interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
}

interface MenuOption {
  digit: string;
  label: string;
  targetNodeId: string;
}

interface FlowVariable {
  name: string;
  type: 'string' | 'number' | 'boolean';
  value?: any;
  source?: 'input' | 'api' | 'database' | 'system';
}
```

### 4.2 プロンプト

```typescript
interface Prompt {
  id: string;
  name: string;
  filename: string;
  category: string;
  language: string;
  duration: number; // 秒
  format: 'wav' | 'mp3' | 'ogg';
  size: number; // bytes
  transcription?: string;
  ttsSettings?: {
    engine: string;
    voice: string;
    text: string;
  };
  usage: Array<{
    flowId: string;
    nodeId: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.3 営業時間

```typescript
interface Schedule {
  id: string;
  name: string;
  timezone: string;
  isDefault: boolean;
  weeklyHours: WeeklyHours;
  holidays: Holiday[];
  specialDays: SpecialDay[];
  afterHoursAction: AfterHoursAction;
  createdAt: Date;
  updatedAt: Date;
}

interface WeeklyHours {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

interface TimeSlot {
  start: string; // "HH:mm"
  end: string; // "HH:mm"
}

interface Holiday {
  date: string; // "YYYY-MM-DD"
  name: string;
  recurring: boolean;
}

interface SpecialDay {
  date: string;
  name: string;
  hours?: TimeSlot[];
  closed: boolean;
}

interface AfterHoursAction {
  type: 'voicemail' | 'emergency' | 'custom_flow';
  promptId?: string;
  targetFlowId?: string;
  emergencyNumber?: string;
  announceNextOpen: boolean;
}
```

## 5. フローエディタ機能詳細

### 5.1 ドラッグ&ドロップ操作

- ノードパレットからキャンバスへドラッグで追加
- ノード間の接続線をドラッグで作成
- ノードの移動・削除
- 複数ノード選択・グループ化
- コピー&ペースト
- Undo/Redo機能

### 5.2 ノード接続ルール

```typescript
interface ConnectionRules {
  start: {
    maxOutgoing: 1,
    allowedTargets: ['play', 'menu', 'condition']
  },
  play: {
    maxOutgoing: 1,
    allowedTargets: ['play', 'menu', 'input', 'transfer', 'condition', 'hangup']
  },
  menu: {
    maxOutgoing: 10, // 0-9の選択肢
    allowedTargets: ['play', 'menu', 'transfer', 'condition', 'api', 'hangup']
  },
  condition: {
    maxOutgoing: 'unlimited',
    allowedTargets: 'any'
  },
  transfer: {
    maxOutgoing: 0 // 終端ノード
  },
  hangup: {
    maxOutgoing: 0 // 終端ノード
  }
}
```

### 5.3 バリデーション

- 開始ノードが1つ存在すること
- すべてのパスが終端ノードに到達すること
- 循環参照の検出と警告
- 未接続ノードの検出
- 必須プロパティの入力チェック

### 5.4 プレビュー・テスト機能

- フローの視覚的なプレビュー
- ステップ実行シミュレーション
- 変数値の確認・変更
- 実際の電話番号へのテストコール
- デバッグログの表示

## 6. バリデーションルール

### 6.1 フロー設定

- フロー名: 必須、一意、最大100文字
- ノードID: フロー内で一意
- タイムアウト: 1-60秒
- 最大試行回数: 1-10回
- 電話番号: E.164形式

### 6.2 プロンプト

- ファイル形式: WAV, MP3, OGG
- 最大ファイルサイズ: 10MB
- 推奨フォーマット: 8kHz, 16bit, モノラル
- 最大録音時間: 5分

### 6.3 営業時間

- 時間形式: HH:mm（24時間表記）
- 開始時間 < 終了時間
- タイムゾーン: 有効なIANAタイムゾーン

## 7. エラーハンドリング

### 7.1 フローエラー

```typescript
enum FlowErrorCode {
  INVALID_STRUCTURE = 'INVALID_STRUCTURE',
  MISSING_NODE = 'MISSING_NODE',
  CIRCULAR_REFERENCE = 'CIRCULAR_REFERENCE',
  INVALID_CONNECTION = 'INVALID_CONNECTION',
  MISSING_PROMPT = 'MISSING_PROMPT'
}

interface FlowError {
  code: FlowErrorCode;
  message: string;
  nodeId?: string;
  details?: any;
}
```

### 7.2 実行時エラー

```typescript
enum RuntimeErrorCode {
  PROMPT_NOT_FOUND = 'PROMPT_NOT_FOUND',
  API_TIMEOUT = 'API_TIMEOUT',
  DATABASE_ERROR = 'DATABASE_ERROR',
  TRANSFER_FAILED = 'TRANSFER_FAILED',
  MAX_ATTEMPTS_EXCEEDED = 'MAX_ATTEMPTS_EXCEEDED'
}
```

## 8. パフォーマンス要件

- フロー読み込み: 2秒以内
- ノード追加/削除: 即座に反映
- フロー保存: 1秒以内
- プロンプトアップロード: 10MB/秒以上
- TTS生成: 5秒以内（1分のテキスト）

## 9. セキュリティ考慮事項

- フロー編集権限の管理
- プロンプトファイルのウイルススキャン
- APIエンドポイントのホワイトリスト
- 機密情報のマスキング（ログ出力時）
- 音声ファイルの暗号化保存
- 編集履歴の監査ログ