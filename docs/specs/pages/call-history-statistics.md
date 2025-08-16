# 通話履歴・統計画面 設計書

（作成日: 2025-08-16）

## 1. 概要

通話履歴・統計画面は、CTIシステムの通話記録の閲覧、録音再生、統計分析、レポート生成を行う画面です。リアルタイムダッシュボード、詳細な分析機能、カスタムレポート作成機能を提供します。

## 2. 画面一覧

### 2.1 通話履歴一覧画面

#### 画面構成

```
┌─────────────────────────────────────────────────────────┐
│ 通話履歴 > 履歴一覧                                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 期間: [2025/8/1 ] 〜 [2025/8/16]  [今日] [昨日] │   │
│ │      [今週] [先週] [今月] [先月] [カスタム]     │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ フィルター                                       │   │
│ │ 方向: ☑着信 ☑発信  状態: ☑応答 ☑不在 ☑放棄 │   │
│ │ エージェント: [▼ すべて]  グループ: [▼ すべて]│   │
│ │ 電話番号: [              ]  [検索]              │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ [エクスポート] [一括ダウンロード] [レポート作成]        │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ □ | 日時 | 方向 | 発信元 | 着信先 | エージェント | 時間 | 状態 | 操作│
│ ├─────────────────────────────────────────────────┤   │
│ │ □ | 8/16 14:23 | ← | 03-1234-5678 | 1001 | 田中 | 3:45 | 応答 | ▶️📥│
│ │ □ | 8/16 14:18 | → | 1002 | 090-9876-5432 | 佐藤 | 5:12 | 応答 | ▶️📥│
│ │ □ | 8/16 14:15 | ← | 06-6789-0123 | IVR | - | 0:45 | 放棄 | 📊│
│ │ □ | 8/16 14:10 | ← | 092-345-6789 | 1003 | 鈴木 | 2:30 | 応答 | ▶️📥│
│ │ □ | 8/16 14:05 | → | 1001 | 03-9876-5432 | 田中 | - | 不在 | -│
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ 選択: 0件  表示 1-5 / 全3,456件  [前へ] [1] [2] [次へ]  │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ サマリー                                         │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ 総通話数: 3,456  応答: 2,890  不在: 234  放棄: 332│   │
│ │ 平均通話時間: 3:25  総通話時間: 196時間45分      │   │
│ └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 2.2 通話詳細画面

#### 画面構成

```
┌─────────────────────────────────────────────────────────┐
│ 通話履歴 > 通話詳細                                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 基本情報                                         │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ 通話ID: CALL-20250816-142345                     │   │
│ │ 日時: 2025年8月16日 14:23:45                     │   │
│ │ 方向: 着信                                       │   │
│ │ 状態: 応答済み                                   │   │
│ │ 通話時間: 3分45秒                                │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 通話者情報                                       │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ 発信元: 03-1234-5678                             │   │
│ │ 顧客名: 山田太郎                                 │   │
│ │ 会社名: 株式会社サンプル                         │   │
│ │ 着信先: 内線1001                                 │   │
│ │ エージェント: 田中太郎                           │   │
│ │ グループ: 営業第一グループ                       │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 録音                                             │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ ▶️ ━━━━━━━━━━━━━━━━━━━━━ 0:00 / 3:45        │   │
│ │ [⏮️] [⏸️] [⏭️] 速度: [1.0x▼] 音量: ━━━━━━     │   │
│ │                                                   │   │
│ │ [ダウンロード] [文字起こし] [共有]               │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 通話フロー                                       │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ 14:23:45 着信                                    │   │
│ │ 14:23:46 IVR開始                                 │   │
│ │ 14:23:58 メニュー選択: 1（営業）                 │   │
│ │ 14:24:02 キューイング開始                        │   │
│ │ 14:24:05 田中太郎に配分                          │   │
│ │ 14:24:08 応答                                    │   │
│ │ 14:27:53 通話終了                                │   │
│ │ 14:28:00 後処理完了                              │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ メモ・タグ                                       │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ タグ: [見積依頼] [新規顧客] [フォロー要]         │   │
│ │                                                   │   │
│ │ メモ:                                            │   │
│ │ ┌───────────────────────────────────────┐       │   │
│ │ │ 製品Aの見積もり依頼。                  │       │   │
│ │ │ 来週中に見積書送付予定。                │       │   │
│ │ └───────────────────────────────────────┘       │   │
│ │                                                   │   │
│ │ [編集] [保存]                                    │   │
│ └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 2.3 リアルタイムダッシュボード画面

#### 画面構成

```
┌─────────────────────────────────────────────────────────┐
│ 統計 > リアルタイムダッシュボード                        │
├─────────────────────────────────────────────────────────┤
│                                    最終更新: 14:35:30   │
│ ┌─────────────────┬─────────────────┬─────────────┐   │
│ │ 現在の通話数     │ 待機中の通話     │ 利用可能    │   │
│ │      23          │       5          │エージェント │   │
│ │                  │                  │     18      │   │
│ └─────────────────┴─────────────────┴─────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 本日のKPI                                        │   │
│ ├──────────┬──────────┬──────────┬───────────────┤   │
│ │総通話数  │ 応答率   │ 放棄率   │ 平均応答時間  │   │
│ │  1,234   │  92.5%   │  7.5%    │    8.2秒      │   │
│ ├──────────┼──────────┼──────────┼───────────────┤   │
│ │平均通話  │ サービス │ 平均待機 │ 最長待機時間  │   │
│ │  3:45    │ レベル   │  0:45    │    2:30       │   │
│ │          │  85.2%   │          │               │   │
│ └──────────┴──────────┴──────────┴───────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 通話量推移（過去1時間）                          │   │
│ │  60 ┤                                 ╱╲        │   │
│ │  50 ┤                          ╱╲    ╱  ╲       │   │
│ │  40 ┤                    ╱╲  ╱  ╲  ╱    ╲      │   │
│ │  30 ┤              ╱╲  ╱  ╲╱    ╲╱             │   │
│ │  20 ┤        ╱╲  ╱  ╲╱                          │   │
│ │  10 ┤  ╱╲  ╱  ╲╱                                │   │
│ │   0 └────────────────────────────────────────   │   │
│ │     13:35  13:45  13:55  14:05  14:15  14:25   │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ エージェントステータス                           │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ グループ | 利用可能 | 通話中 | 後処理 | 離席 | 計│   │
│ ├─────────────────────────────────────────────────┤   │
│ │ 営業1    |    5    |   8    |   2   |  3  | 18│   │
│ │ 営業2    |    4    |   6    |   1   |  2  | 13│   │
│ │ CS       |    9    |  12    |   3   |  5  | 29│   │
│ │ 技術     |    3    |   4    |   1   |  1  |  9│   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ キュー状態                                       │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ キュー名 | 待機中 | 最長待機 | 平均待機 | SLA  │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ 営業     |   2   | 0:45    | 0:20    | 88% │   │
│ │ サポート |   3   | 1:20    | 0:35    | 82% │   │
│ │ 技術     |   0   | -       | 0:15    | 95% │   │
│ └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 2.4 統計レポート画面

#### 画面構成

```
┌─────────────────────────────────────────────────────────┐
│ 統計 > レポート                                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ レポート期間: [2025/8/1 ] 〜 [2025/8/16]        │   │
│ │ グループ: [▼ 全体]  エージェント: [▼ 全員]    │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ [レポート生成] [PDFエクスポート] [Excelエクスポート]    │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 通話統計サマリー                                 │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ 総通話数: 45,678                                 │   │
│ │ ├─ 着信: 38,456 (84.2%)                         │   │
│ │ ├─ 発信: 7,222 (15.8%)                          │   │
│ │                                                   │   │
│ │ 応答通話: 41,234 (90.3%)                         │   │
│ │ 不在通話: 2,456 (5.4%)                           │   │
│ │ 放棄通話: 1,988 (4.3%)                           │   │
│ │                                                   │   │
│ │ 総通話時間: 2,567時間45分                        │   │
│ │ 平均通話時間: 3分22秒                            │   │
│ │ 最長通話: 45分12秒                               │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 日別通話量                                       │   │
│ │ 3000 ┤                          ╱╲               │   │
│ │ 2500 ┤                    ╱╲  ╱  ╲  ╱╲          │   │
│ │ 2000 ┤              ╱╲  ╱  ╲╱    ╲╱  ╲         │   │
│ │ 1500 ┤        ╱╲  ╱  ╲╱                ╲        │   │
│ │ 1000 ┤  ╱╲  ╱  ╲╱                                │   │
│ │  500 ┤╱  ╲╱                                      │   │
│ │    0 └────────────────────────────────────────   │   │
│ │      8/1  8/3  8/5  8/7  8/9  8/11 8/13 8/15   │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 時間帯別分布                                     │   │
│ │  800 ┤          ████████████                     │   │
│ │  700 ┤      ████████████████████                 │   │
│ │  600 ┤    ██████████████████████████             │   │
│ │  500 ┤  ████████████████████████████████         │   │
│ │  400 ┤  ██████████████████████████████████       │   │
│ │  300 ┤████████████████████████████████████████   │   │
│ │  200 ┤████████████████████████████████████       │   │
│ │  100 ┤██████████████████████                     │   │
│ │    0 └────────────────────────────────────────   │   │
│ │      0  2  4  6  8  10 12 14 16 18 20 22時    │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ エージェント別パフォーマンス（上位10名）        │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ 名前 | 通話数 | 応答率 | 平均通話 | 平均後処理 │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ 田中太郎 | 892 | 96.5% | 3:15 | 0:45          │   │
│ │ 佐藤花子 | 856 | 95.2% | 3:30 | 0:50          │   │
│ │ 鈴木一郎 | 823 | 94.8% | 3:05 | 0:40          │   │
│ │ 山田次郎 | 798 | 93.5% | 3:45 | 1:00          │   │
│ │ 高橋三郎 | 765 | 92.1% | 4:00 | 0:55          │   │
│ └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## 3. API仕様

### 3.1 通話履歴API

```typescript
// GET /api/call-history
interface GetCallHistoryRequest {
  startDate: string;
  endDate: string;
  direction?: 'inbound' | 'outbound' | 'both';
  status?: 'answered' | 'missed' | 'abandoned';
  agentId?: string;
  groupId?: string;
  phoneNumber?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

interface GetCallHistoryResponse {
  calls: CallRecord[];
  total: number;
  page: number;
  pageSize: number;
  summary: {
    totalCalls: number;
    answeredCalls: number;
    missedCalls: number;
    abandonedCalls: number;
    totalDuration: number;
    avgDuration: number;
  };
}

// GET /api/call-history/{id}
interface GetCallDetailResponse {
  call: CallRecord;
  recording?: Recording;
  events: CallEvent[];
  tags: string[];
  notes: string;
}

// PUT /api/call-history/{id}/tags
interface UpdateCallTagsRequest {
  tags: string[];
}

// PUT /api/call-history/{id}/notes
interface UpdateCallNotesRequest {
  notes: string;
}

// POST /api/call-history/export
interface ExportCallHistoryRequest {
  startDate: string;
  endDate: string;
  format: 'csv' | 'excel' | 'pdf';
  filters?: any;
  columns?: string[];
}
```

### 3.2 録音管理API

```typescript
// GET /api/recordings/{id}
interface GetRecordingResponse {
  id: string;
  callId: string;
  url: string;
  duration: number;
  size: number;
  format: string;
  createdAt: Date;
}

// GET /api/recordings/{id}/stream
// Returns: Audio stream

// POST /api/recordings/{id}/transcribe
interface TranscribeRecordingRequest {
  language?: string;
  engine?: 'aws' | 'google' | 'azure';
}

interface TranscribeRecordingResponse {
  transcription: string;
  confidence: number;
  segments: Array<{
    text: string;
    startTime: number;
    endTime: number;
    speaker?: string;
  }>;
}

// POST /api/recordings/{id}/download
interface DownloadRecordingRequest {
  format?: 'wav' | 'mp3' | 'ogg';
}

// DELETE /api/recordings/{id}
```

### 3.3 統計・分析API

```typescript
// GET /api/statistics/realtime
interface GetRealtimeStatsResponse {
  currentCalls: number;
  queuedCalls: number;
  availableAgents: number;
  todayStats: {
    totalCalls: number;
    answerRate: number;
    abandonRate: number;
    avgAnswerTime: number;
    avgCallDuration: number;
    serviceLevel: number;
  };
  agentStatus: Array<{
    groupId: string;
    available: number;
    busy: number;
    wrapUp: number;
    away: number;
  }>;
  queueStatus: Array<{
    queueName: string;
    waiting: number;
    longestWait: number;
    avgWait: number;
    sla: number;
  }>;
}

// GET /api/statistics/historical
interface GetHistoricalStatsRequest {
  startDate: string;
  endDate: string;
  granularity: 'hour' | 'day' | 'week' | 'month';
  groupId?: string;
  agentId?: string;
}

interface GetHistoricalStatsResponse {
  period: {
    start: string;
    end: string;
  };
  summary: StatsSummary;
  timeline: Array<{
    timestamp: string;
    metrics: StatsMetrics;
  }>;
  distribution: {
    hourly: number[];
    daily: number[];
    byDirection: Record<string, number>;
    byStatus: Record<string, number>;
  };
}

// GET /api/statistics/agent-performance
interface GetAgentPerformanceRequest {
  startDate: string;
  endDate: string;
  agentIds?: string[];
  groupId?: string;
  sortBy?: string;
  limit?: number;
}

interface GetAgentPerformanceResponse {
  agents: Array<{
    agentId: string;
    name: string;
    metrics: {
      totalCalls: number;
      answeredCalls: number;
      missedCalls: number;
      avgCallDuration: number;
      avgWrapUpTime: number;
      totalTalkTime: number;
      occupancy: number;
      adherence: number;
    };
    ranking?: number;
  }>;
}

// POST /api/statistics/custom-report
interface CreateCustomReportRequest {
  name: string;
  description?: string;
  period: {
    start: string;
    end: string;
  };
  metrics: string[];
  dimensions: string[];
  filters?: any;
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
  };
}
```

## 4. データモデル

### 4.1 通話記録

```typescript
interface CallRecord {
  id: string;
  direction: 'inbound' | 'outbound';
  status: 'answered' | 'missed' | 'abandoned' | 'blocked';
  startTime: Date;
  answerTime?: Date;
  endTime: Date;
  duration: number; // 秒
  waitTime?: number; // 秒
  
  from: {
    number: string;
    name?: string;
    customerId?: string;
  };
  
  to: {
    number: string;
    name?: string;
    extension?: string;
  };
  
  agent?: {
    id: string;
    name: string;
    groupId: string;
    groupName: string;
  };
  
  queue?: {
    id: string;
    name: string;
    entryTime: Date;
    exitTime: Date;
    exitReason: 'answered' | 'abandoned' | 'timeout' | 'overflow';
  };
  
  ivr?: {
    flowId: string;
    flowName: string;
    path: string[];
    selections: Record<string, string>;
  };
  
  recording?: {
    id: string;
    url: string;
    duration: number;
    size: number;
  };
  
  quality?: {
    mos: number;
    packetLoss: number;
    jitter: number;
    latency: number;
  };
  
  tags: string[];
  notes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

interface CallEvent {
  id: string;
  callId: string;
  timestamp: Date;
  type: CallEventType;
  data: any;
}

type CallEventType = 
  | 'call_started'
  | 'ivr_entered'
  | 'ivr_selection'
  | 'queue_entered'
  | 'agent_assigned'
  | 'call_answered'
  | 'call_held'
  | 'call_resumed'
  | 'call_transferred'
  | 'call_ended'
  | 'recording_started'
  | 'recording_stopped';
```

### 4.2 録音

```typescript
interface Recording {
  id: string;
  callId: string;
  agentId?: string;
  filename: string;
  url: string;
  duration: number; // 秒
  size: number; // bytes
  format: 'wav' | 'mp3' | 'ogg';
  sampleRate: number;
  channels: number;
  
  transcription?: {
    text: string;
    language: string;
    confidence: number;
    segments: TranscriptionSegment[];
    createdAt: Date;
  };
  
  encryption: {
    enabled: boolean;
    algorithm?: string;
  };
  
  retention: {
    policy: string;
    expiresAt: Date;
  };
  
  access: {
    public: boolean;
    allowedUsers?: string[];
    allowedRoles?: string[];
  };
  
  createdAt: Date;
  updatedAt: Date;
}

interface TranscriptionSegment {
  text: string;
  startTime: number;
  endTime: number;
  confidence: number;
  speaker?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  keywords?: string[];
}
```

### 4.3 統計データ

```typescript
interface StatsSummary {
  totalCalls: number;
  inboundCalls: number;
  outboundCalls: number;
  answeredCalls: number;
  missedCalls: number;
  abandonedCalls: number;
  
  answerRate: number; // パーセント
  abandonRate: number;
  serviceLevel: number;
  
  totalDuration: number; // 秒
  avgDuration: number;
  maxDuration: number;
  minDuration: number;
  
  avgWaitTime: number;
  maxWaitTime: number;
  
  avgAnswerSpeed: number;
  avgWrapUpTime: number;
  
  firstCallResolution: number;
  transferRate: number;
}

interface StatsMetrics {
  timestamp: Date;
  calls: number;
  answered: number;
  abandoned: number;
  avgDuration: number;
  avgWaitTime: number;
  serviceLevel: number;
  occupancy: number;
  utilization: number;
}

interface ReportDefinition {
  id: string;
  name: string;
  description?: string;
  type: 'standard' | 'custom';
  metrics: string[];
  dimensions: string[];
  filters: any;
  visualization?: {
    type: 'table' | 'chart' | 'both';
    chartType?: 'line' | 'bar' | 'pie' | 'area';
  };
  schedule?: ReportSchedule;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ReportSchedule {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string; // HH:mm
  dayOfWeek?: number; // 0-6
  dayOfMonth?: number; // 1-31
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv';
}
```

## 5. フィルター・検索機能

### 5.1 検索条件

```typescript
interface SearchFilters {
  // 期間
  dateRange: {
    start: Date;
    end: Date;
    preset?: 'today' | 'yesterday' | 'week' | 'month' | 'custom';
  };
  
  // 基本フィルター
  direction?: ('inbound' | 'outbound')[];
  status?: ('answered' | 'missed' | 'abandoned')[];
  
  // エージェント・グループ
  agentIds?: string[];
  groupIds?: string[];
  
  // 電話番号
  phoneNumber?: {
    value: string;
    matchType: 'exact' | 'contains' | 'starts' | 'ends';
  };
  
  // 通話時間
  duration?: {
    min?: number;
    max?: number;
  };
  
  // 待機時間
  waitTime?: {
    min?: number;
    max?: number;
  };
  
  // タグ
  tags?: {
    values: string[];
    matchType: 'any' | 'all';
  };
  
  // 品質
  quality?: {
    mosMin?: number;
    packetLossMax?: number;
  };
}
```

## 6. エクスポート機能

### 6.1 エクスポート形式

```typescript
interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  
  columns: Array<{
    field: string;
    label: string;
    format?: string;
  }>;
  
  includeHeaders: boolean;
  includeSummary: boolean;
  
  dateFormat: string;
  timeFormat: string;
  timezone: string;
  
  compression?: 'zip' | 'gzip';
  
  delivery: {
    method: 'download' | 'email' | 's3';
    email?: string;
    s3?: {
      bucket: string;
      key: string;
    };
  };
}
```

## 7. リアルタイム更新

### 7.1 WebSocket イベント

```typescript
interface RealtimeEvents {
  // 通話イベント
  'call:started': CallRecord;
  'call:answered': CallRecord;
  'call:ended': CallRecord;
  'call:queued': { queueId: string; position: number };
  
  // エージェントイベント
  'agent:status_changed': {
    agentId: string;
    status: string;
  };
  
  // 統計更新
  'stats:updated': {
    type: 'realtime' | 'summary';
    data: any;
  };
  
  // アラート
  'alert:threshold': {
    metric: string;
    value: number;
    threshold: number;
  };
}
```

## 8. パフォーマンス要件

- 通話履歴検索: 10万件で2秒以内
- リアルタイム更新: 1秒以内
- 録音ストリーミング: 遅延100ms以内
- レポート生成: 1ヶ月分で10秒以内
- エクスポート: 1万件で5秒以内

## 9. セキュリティ考慮事項

- 録音ファイルの暗号化（AES-256）
- アクセス権限の厳密な制御
- 個人情報のマスキング機能
- 監査ログの完全記録
- 録音の自動削除ポリシー
- GDPR/個人情報保護法準拠
- 署名付きURLによる録音アクセス