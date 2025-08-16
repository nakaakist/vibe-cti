# ソフトフォン設定画面 設計書（MVP版）

（作成日: 2025-08-16）

## 1. 概要

MVP版のソフトフォン設定画面は、WebRTCベースのソフトフォンの基本的な動作設定のみを管理します。コーデックや音声品質は固定設定とし、エージェントが変更できるのはデバイス選択のみです。

## 2. 画面構成

### 2.1 デバイス設定画面（MVP版）

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
│ [接続テスト] [デフォルトに戻す] [保存]                 │
└─────────────────────────────────────────────────────────┘
```

#### 機能詳細

**音声入力デバイス設定**
- マイクデバイス選択（ドロップダウン）
- 入力レベル調整（スライダー 0-100%）
- テスト録音機能（5秒間録音→再生）

**音声出力デバイス設定**
- スピーカーデバイス選択（ドロップダウン）
- 出力レベル調整（スライダー 0-100%）
- 着信音選択（プリセット3種類）
- テスト再生機能

## 3. 固定設定（MVP版）

以下の設定はMVP版では固定値となり、ユーザーは変更できません：

### 3.1 音声処理設定
- **AGC（自動ゲイン調整）**: 有効
- **ノイズキャンセリング**: 有効
- **エコーキャンセリング**: 有効

### 3.2 ネットワーク設定
- **STUN/TURN**: 自動設定
- **ICE収集ポリシー**: all
- **TCPフォールバック**: 有効

### 3.3 コーデック設定
- **音声コーデック優先順位**:
  1. Opus (48kHz)
  2. PCMU (G.711 μ-law)
  3. PCMA (G.711 A-law)
- **DTMF方式**: RFC4733
- **最大ビットレート**: 64 kbps
- **FEC**: 有効
- **DTX**: 無効

### 3.4 音声品質設定
- **品質プロファイル**: 標準品質
- **ジッターバッファ**: 
  - 最小: 50ms
  - 最大: 200ms
  - 適応的バッファリング: 有効
- **パケットロス補償**:
  - NACK: 有効
  - RED: 無効
- **帯域幅制限**: 無制限

### 3.5 品質監視設定
- **リアルタイム監視**: 有効
- **警告閾値**:
  - パケットロス率: 5%
  - ジッター: 150ms
  - 遅延: 300ms
  - MOS値: 3.5
- **自動品質調整**: 有効

## 4. API仕様（MVP版）

### 4.1 デバイス設定API

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
  };
}

// PUT /api/softphone/devices
interface UpdateDevicesRequest {
  inputDeviceId?: string;
  outputDeviceId?: string;
  inputLevel?: number;
  outputLevel?: number;
  ringtone?: string;
}

// POST /api/softphone/devices/test
interface TestDeviceRequest {
  type: 'input' | 'output';
  deviceId: string;
  duration?: number; // 録音時間（秒）
}
```

### 4.2 設定取得API

```typescript
// GET /api/softphone/config
interface GetConfigResponse {
  audio: {
    agc: true;
    noiseSuppression: true;
    echoCancellation: true;
  };
  network: {
    stunServers: string[];
    turnServers: string[];
    iceGatheringPolicy: 'all';
    tcpFallback: true;
  };
  codecs: {
    audio: ['opus/48000', 'PCMU/8000', 'PCMA/8000'];
    dtmf: 'rfc4733';
  };
  quality: {
    profile: 'standard';
    jitterBuffer: {
      min: 50;
      max: 200;
      adaptive: true;
    };
  };
}
```

## 5. データモデル（MVP版）

### 5.1 デバイス設定

```typescript
interface SimpleDeviceSettings {
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
  ringtone: 'default' | 'classic' | 'modern';
  createdAt: Date;
  updatedAt: Date;
}
```

## 6. バリデーションルール

### 6.1 デバイス設定
- 音声レベル: 0-100の範囲
- デバイスID: 利用可能なデバイスリストに存在すること

## 7. エラーハンドリング

### 7.1 デバイスアクセスエラー

```typescript
enum DeviceErrorCode {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  DEVICE_NOT_FOUND = 'DEVICE_NOT_FOUND',
  DEVICE_IN_USE = 'DEVICE_IN_USE'
}
```

### 7.2 エラーメッセージ例
- `PERMISSION_DENIED`: "マイクまたはスピーカーへのアクセス許可が必要です"
- `DEVICE_NOT_FOUND`: "選択されたデバイスが見つかりません"
- `DEVICE_IN_USE`: "デバイスは他のアプリケーションで使用中です"

## 8. パフォーマンス要件
- デバイス一覧取得: 500ms以内
- 設定保存: 1秒以内
- テスト録音/再生: 即座に開始

## 9. セキュリティ考慮事項
- デバイスアクセス権限はブラウザレベルで管理
- 設定変更は認証されたユーザーのみ
- 監査ログへの設定変更記録

## 10. 将来の拡張予定

MVP版では実装しないが、将来的に追加予定の機能：

- コーデックのカスタマイズ
- 音声品質プロファイルの選択
- 詳細な音声処理設定
- カスタムSTUN/TURNサーバー設定
- 帯域幅制限設定
- 品質監視閾値のカスタマイズ
- SIP設定（エージェント個別）