# ソフトフォン設定画面 設計書

（作成日: 2025-08-16）

## 1. 概要

ソフトフォン設定画面は、WebRTC ベースのソフトフォンの動作設定を管理する画面です。エージェントの音声デバイス設定、通話品質設定、コーデック優先順位などを設定できます。

## 2. 画面一覧

### 2.1 デバイス設定画面

#### 画面構成

```
┌─────────────────────────────────────────────────────────┐
│ ソフトフォン設定 > デバイス設定                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 音声入力デバイス                                 │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ マイク選択:                                      │   │
│ │ [▼ デフォルト - MacBook Pro マイク        ]     │   │
│ │                                                   │   │
│ │ 入力レベル: ━━━━━━━━━━━━━━━ 75%             │   │
│ │                                                   │   │
│ │ □ 自動ゲイン調整（AGC）                         │   │
│ │ □ ノイズキャンセリング（NS）                    │   │
│ │ □ エコーキャンセリング（AEC）                   │   │
│ │                                                   │   │
│ │ [テスト録音] [再生]                              │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 音声出力デバイス                                 │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ スピーカー選択:                                  │   │
│ │ [▼ デフォルト - MacBook Pro スピーカー    ]     │   │
│ │                                                   │   │
│ │ 出力レベル: ━━━━━━━━━━━━━━━ 80%             │   │
│ │                                                   │   │
│ │ 着信音:                                          │   │
│ │ [▼ デフォルト着信音                       ]     │   │
│ │                                                   │   │
│ │ [テスト再生]                                     │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ ネットワーク設定                                 │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ STUN/TURN設定:                                   │   │
│ │ ● 自動設定（推奨）                              │   │
│ │ ○ カスタム設定                                  │   │
│ │                                                   │   │
│ │ ICE収集ポリシー:                                 │   │
│ │ [▼ all                                    ]     │   │
│ │                                                   │   │
│ │ □ TCPフォールバック有効                         │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ [接続テスト] [デフォルトに戻す] [保存]                 │
└─────────────────────────────────────────────────────────┘
```

#### 機能詳細

**音声入力デバイス設定**
- マイクデバイス選択（ドロップダウン）
- 入力レベル調整（スライダー 0-100%）
- 音声処理オプション:
  - AGC（自動ゲイン調整）
  - NS（ノイズサプレッション）
  - AEC（アコースティックエコーキャンセラー）
- テスト録音機能（5秒間録音→再生）

**音声出力デバイス設定**
- スピーカーデバイス選択（ドロップダウン）
- 出力レベル調整（スライダー 0-100%）
- 着信音選択（プリセット選択）
- テスト再生機能

**ネットワーク設定**
- STUN/TURN サーバー設定
  - 自動設定（システムデフォルト使用）
  - カスタム設定（URL入力）
- ICE収集ポリシー（all/relay/no-host）
- TCPフォールバック設定

### 2.2 コーデック設定画面

#### 画面構成

```
┌─────────────────────────────────────────────────────────┐
│ ソフトフォン設定 > コーデック設定                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 音声コーデック優先順位                           │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ ドラッグして優先順位を変更してください           │   │
│ │                                                   │   │
│ │ 1. ☰ Opus (48kHz) ........................ [有効] │   │
│ │ 2. ☰ Opus (24kHz) ........................ [有効] │   │
│ │ 3. ☰ Opus (16kHz) ........................ [有効] │   │
│ │ 4. ☰ PCMU (G.711 μ-law) .................. [有効] │   │
│ │ 5. ☰ PCMA (G.711 A-law) .................. [有効] │   │
│ │ 6. ☰ G.729 ............................... [無効] │   │
│ │ 7. ☰ G.722 ............................... [無効] │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ コーデック詳細設定                               │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ Opus設定:                                        │   │
│ │   最大ビットレート: [▼ 64 kbps           ]     │   │
│ │   □ インバンドFEC有効                           │   │
│ │   □ DTX（不連続送信）有効                       │   │
│ │   パケットロス耐性: ━━━━━━━━━ 20%           │   │
│ │                                                   │   │
│ │ DTMF設定:                                        │   │
│ │   ● RFC4733 (telephone-event)                   │   │
│ │   ○ SIP INFO                                    │   │
│ │   ○ インバンド                                  │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ [デフォルトに戻す] [保存]                              │
└─────────────────────────────────────────────────────────┘
```

#### 機能詳細

**コーデック優先順位**
- ドラッグ&ドロップで順位変更
- 各コーデックの有効/無効切り替え
- 対応コーデック:
  - Opus（48/24/16 kHz）
  - PCMU（G.711 μ-law）
  - PCMA（G.711 A-law）
  - G.729（オプション）
  - G.722（オプション）

**Opus詳細設定**
- 最大ビットレート選択（24/32/48/64 kbps）
- FEC（Forward Error Correction）設定
- DTX（Discontinuous Transmission）設定
- パケットロス耐性レベル（0-100%）

**DTMF設定**
- RFC4733（推奨）
- SIP INFO
- インバンド

### 2.3 音声品質設定画面

#### 画面構成

```
┌─────────────────────────────────────────────────────────┐
│ ソフトフォン設定 > 音声品質設定                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 品質プロファイル                                 │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ ● 高品質（ブロードバンド）                      │   │
│ │   - 高帯域幅環境向け                             │   │
│ │   - Opus 48kHz優先                               │   │
│ │                                                   │   │
│ │ ○ 標準品質（推奨）                              │   │
│ │   - 一般的な環境向け                             │   │
│ │   - Opus 24kHz優先                               │   │
│ │                                                   │   │
│ │ ○ 低帯域幅                                      │   │
│ │   - 低速回線向け                                 │   │
│ │   - G.711優先                                    │   │
│ │                                                   │   │
│ │ ○ カスタム                                      │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 詳細設定                                         │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ ジッターバッファ:                                │   │
│ │   最小: [50  ] ms  最大: [200 ] ms              │   │
│ │   □ 適応的バッファリング                        │   │
│ │                                                   │   │
│ │ パケットロス補償:                                │   │
│ │   □ パケット再送要求（NACK）                    │   │
│ │   □ 冗長エンコーディング（RED）                 │   │
│ │                                                   │   │
│ │ 帯域幅制限:                                      │   │
│ │   上り: [▼ 無制限                         ]     │   │
│ │   下り: [▼ 無制限                         ]     │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 品質監視設定                                     │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ □ リアルタイム品質監視を有効化                  │   │
│ │                                                   │   │
│ │ 警告閾値:                                        │   │
│ │   パケットロス率: [5   ] %                      │   │
│ │   ジッター:       [150 ] ms                     │   │
│ │   遅延:           [300 ] ms                     │   │
│ │   MOS値:          [3.5 ]                        │   │
│ │                                                   │   │
│ │ □ 品質低下時に自動でコーデック切り替え          │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ [デフォルトに戻す] [保存]                              │
└─────────────────────────────────────────────────────────┘
```

#### 機能詳細

**品質プロファイル**
- 高品質（ブロードバンド）
- 標準品質（推奨）
- 低帯域幅
- カスタム設定

**詳細設定**
- ジッターバッファ設定（最小/最大値）
- パケットロス補償機能
- 帯域幅制限（上り/下り）

**品質監視設定**
- リアルタイム監視の有効/無効
- 警告閾値設定
  - パケットロス率
  - ジッター
  - 遅延
  - MOS値
- 自動品質調整機能

## 3. API仕様

### 3.1 デバイス設定API

```typescript
// GET /api/softphone/devices
interface GetDevicesResponse {
  input: MediaDeviceInfo[];
  output: MediaDeviceInfo[];
  current: {
    inputDeviceId: string;
    outputDeviceId: string;
    inputLevel: number;
    outputLevel: number;
    agc: boolean;
    noiseSuppression: boolean;
    echoCancellation: boolean;
  };
}

// PUT /api/softphone/devices
interface UpdateDevicesRequest {
  inputDeviceId?: string;
  outputDeviceId?: string;
  inputLevel?: number;
  outputLevel?: number;
  agc?: boolean;
  noiseSuppression?: boolean;
  echoCancellation?: boolean;
  ringtone?: string;
}

// POST /api/softphone/devices/test
interface TestDeviceRequest {
  type: 'input' | 'output';
  deviceId: string;
  duration?: number; // 録音時間（秒）
}
```

### 3.2 コーデック設定API

```typescript
// GET /api/softphone/codecs
interface GetCodecsResponse {
  codecs: Array<{
    id: string;
    name: string;
    priority: number;
    enabled: boolean;
    settings: Record<string, any>;
  }>;
  dtmfMode: 'rfc4733' | 'info' | 'inband';
}

// PUT /api/softphone/codecs
interface UpdateCodecsRequest {
  codecs: Array<{
    id: string;
    priority: number;
    enabled: boolean;
    settings?: Record<string, any>;
  }>;
  dtmfMode?: 'rfc4733' | 'info' | 'inband';
}
```

### 3.3 品質設定API

```typescript
// GET /api/softphone/quality
interface GetQualitySettingsResponse {
  profile: 'high' | 'standard' | 'low' | 'custom';
  jitterBuffer: {
    min: number;
    max: number;
    adaptive: boolean;
  };
  packetLoss: {
    nack: boolean;
    red: boolean;
  };
  bandwidth: {
    upstream: number | null;
    downstream: number | null;
  };
  monitoring: {
    enabled: boolean;
    thresholds: {
      packetLoss: number;
      jitter: number;
      latency: number;
      mos: number;
    };
    autoSwitch: boolean;
  };
}

// PUT /api/softphone/quality
interface UpdateQualitySettingsRequest {
  profile?: 'high' | 'standard' | 'low' | 'custom';
  jitterBuffer?: {
    min?: number;
    max?: number;
    adaptive?: boolean;
  };
  // ... 他のフィールド
}
```

## 4. データモデル

### 4.1 デバイス設定

```typescript
interface DeviceSettings {
  id: string;
  userId: string;
  inputDevice: {
    deviceId: string;
    label: string;
    level: number; // 0-100
  };
  outputDevice: {
    deviceId: string;
    label: string;
    level: number; // 0-100
  };
  audioProcessing: {
    agc: boolean;
    noiseSuppression: boolean;
    echoCancellation: boolean;
  };
  network: {
    stunTurnMode: 'auto' | 'custom';
    customServers?: string[];
    iceGatheringPolicy: 'all' | 'relay' | 'no-host';
    tcpFallback: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.2 コーデック設定

```typescript
interface CodecSettings {
  id: string;
  profileId: string;
  codecs: Array<{
    type: 'opus' | 'pcmu' | 'pcma' | 'g729' | 'g722';
    priority: number;
    enabled: boolean;
    parameters: {
      sampleRate?: number;
      maxBitrate?: number;
      fec?: boolean;
      dtx?: boolean;
      packetLossResilience?: number;
    };
  }>;
  dtmfMode: 'rfc4733' | 'info' | 'inband';
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.3 品質設定

```typescript
interface QualitySettings {
  id: string;
  profileId: string;
  profileType: 'high' | 'standard' | 'low' | 'custom';
  jitterBuffer: {
    minMs: number;
    maxMs: number;
    adaptive: boolean;
  };
  errorCorrection: {
    nack: boolean;
    red: boolean;
    fec: boolean;
  };
  bandwidth: {
    upstreamKbps: number | null;
    downstreamKbps: number | null;
  };
  monitoring: {
    enabled: boolean;
    thresholds: QualityThresholds;
    autoAdjust: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface QualityThresholds {
  packetLossPercent: number;
  jitterMs: number;
  latencyMs: number;
  mosScore: number;
}
```

## 5. バリデーションルール

### 5.1 デバイス設定

- 音声レベル: 0-100の範囲
- デバイスID: 利用可能なデバイスリストに存在すること
- STUN/TURNサーバーURL: 有効なURL形式

### 5.2 コーデック設定

- 優先順位: 1から連番で重複なし
- 最低1つのコーデックが有効
- Opusビットレート: 6-510 kbps
- パケットロス耐性: 0-100%

### 5.3 品質設定

- ジッターバッファ: 最小 < 最大
- 最小値: 10ms以上
- 最大値: 1000ms以下
- 警告閾値: 各項目で妥当な範囲内

## 6. エラーハンドリング

### 6.1 デバイスアクセスエラー

```typescript
enum DeviceErrorCode {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  DEVICE_NOT_FOUND = 'DEVICE_NOT_FOUND',
  DEVICE_IN_USE = 'DEVICE_IN_USE',
  CONSTRAINT_NOT_SATISFIED = 'CONSTRAINT_NOT_SATISFIED'
}

interface DeviceError {
  code: DeviceErrorCode;
  message: string;
  detail?: string;
}
```

### 6.2 エラーメッセージ例

- `PERMISSION_DENIED`: "マイクまたはスピーカーへのアクセス許可が必要です"
- `DEVICE_NOT_FOUND`: "選択されたデバイスが見つかりません"
- `DEVICE_IN_USE`: "デバイスは他のアプリケーションで使用中です"

## 7. パフォーマンス要件

- デバイス一覧取得: 500ms以内
- 設定保存: 1秒以内
- テスト録音/再生: 即座に開始
- 品質監視更新: 1秒間隔

## 8. セキュリティ考慮事項

- デバイスアクセス権限はブラウザレベルで管理
- 設定変更は認証されたユーザーのみ
- 管理者によるデフォルト設定の強制適用
- 監査ログへの設定変更記録