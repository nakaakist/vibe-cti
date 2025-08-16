# SIP接続設定画面 設計書（MVP版）

（作成日: 2025-08-16）

## 1. 概要

MVP版のSIP接続設定画面は、カスタムSIPトランクとの接続設定を管理するシンプルな画面です。基本的な接続設定のみに絞り、複雑な機能は除外しています。

## 2. 画面一覧

### 2.1 トランク一覧画面

#### 画面構成

```
┌─────────────────────────────────────────────────────────┐
│ SIP接続設定 > トランク管理                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ [+ 新規トランク追加]  [接続テスト]  [更新]              │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ トランク名 | ステータス | 最終確認 | 操作        │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ メイントランク | ● 接続中 | 5分前 | [編集] [削除] │   │
│ │ バックアップ | ○ 切断 | 1時間前 | [編集] [削除]   │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 2.2 トランク追加・編集画面（MVP版）

#### 画面構成

```
┌─────────────────────────────────────────────────────────┐
│ SIP接続設定 > トランク設定                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 基本情報                                         │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ トランク名: *                                    │   │
│ │ [メイントランク                            ]     │   │
│ │                                                   │   │
│ │ 説明:                                            │   │
│ │ [本番環境用のSIPトランク                   ]     │   │
│ │                                                   │   │
│ │ □ 有効                                          │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 接続設定                                         │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ SIPサーバー: *                                   │   │
│ │ [sip.example.com                           ]     │   │
│ │                                                   │   │
│ │ ポート: *                                        │   │
│ │ [5060                                      ]     │   │
│ │                                                   │   │
│ │ 転送プロトコル:                                  │   │
│ │ ● UDP  ○ TCP  ○ TLS                           │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 認証設定                                         │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ 認証方式:                                        │   │
│ │ ● IPアドレス認証                                │   │
│ │ ○ ユーザー/パスワード認証                       │   │
│ │                                                   │   │
│ │ 許可IPアドレス:                                  │   │
│ │ [203.0.113.0/24                            ]     │   │
│ │                                                   │   │
│ │ ユーザー名:                                      │   │
│ │ [                                          ]     │   │
│ │                                                   │   │
│ │ パスワード:                                      │   │
│ │ [                                          ]     │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ [接続テスト] [キャンセル] [保存]                        │
└─────────────────────────────────────────────────────────┘
```

## 3. API仕様（MVP版）

### 3.1 トランク管理API

```typescript
// GET /api/sip/trunks
interface GetTrunksResponse {
  trunks: SimpleSipTrunk[];
}

// POST /api/sip/trunks
interface CreateTrunkRequest {
  name: string;
  description?: string;
  enabled: boolean;
  server: string;
  port: number;
  transport: 'udp' | 'tcp' | 'tls';
  authMethod: 'ip' | 'credentials';
  allowedIp?: string;
  username?: string;
  password?: string;
}

// PUT /api/sip/trunks/{id}
interface UpdateTrunkRequest extends CreateTrunkRequest {
  id: string;
}

// DELETE /api/sip/trunks/{id}

// POST /api/sip/trunks/{id}/test
interface TestTrunkResponse {
  success: boolean;
  message: string;
}
```

## 4. データモデル（MVP版）

### 4.1 トランク設定

```typescript
interface SimpleSipTrunk {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  status: 'connected' | 'disconnected' | 'error';
  lastCheck?: Date;
  
  connection: {
    server: string;
    port: number;
    transport: 'udp' | 'tcp' | 'tls';
  };
  
  authentication: {
    method: 'ip' | 'credentials';
    allowedIp?: string;
    username?: string;
    password?: string; // 暗号化保存
  };
  
  createdAt: Date;
  updatedAt: Date;
}
```

## 5. 固定設定（MVP版）

以下の設定はMVP版では固定値とします：

### 5.1 メディア設定
- **コーデック**: Opus, PCMU, PCMA（固定順序）
- **DTMF方式**: RFC4733
- **RTPポート範囲**: 16384-32768
- **SRTP**: 無効

### 5.2 詳細設定
- **SIP OPTIONS**: 30秒間隔で自動実行
- **Registration**: 不要
- **最大同時通話数**: 100
- **タイムアウト**: 30秒

## 6. バリデーションルール

### 6.1 トランク設定
- トランク名: 必須、一意、最大50文字
- SIPサーバー: 有効なドメイン名またはIPアドレス
- ポート: 1-65535の範囲
- IPアドレス: 有効なIPv4形式またはCIDR記法

## 7. エラーハンドリング

### 7.1 接続エラー

```typescript
enum TrunkErrorCode {
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  TIMEOUT = 'TIMEOUT',
  INVALID_CONFIGURATION = 'INVALID_CONFIGURATION'
}
```

### 7.2 エラーメッセージ例
- `CONNECTION_FAILED`: "SIPサーバーに接続できません"
- `AUTHENTICATION_FAILED`: "認証に失敗しました"
- `TIMEOUT`: "接続がタイムアウトしました"

## 8. パフォーマンス要件
- トランク一覧取得: 1秒以内
- 接続テスト: 5秒以内
- 設定保存: 2秒以内

## 9. セキュリティ考慮事項
- パスワードは暗号化して保存
- IPホワイトリストによるアクセス制御
- 設定変更の監査ログ記録
- HTTPSによる通信暗号化

## 10. 将来の拡張予定

MVP版では実装しないが、将来的に追加予定の機能：

- Twilio/Vonage等のプロバイダー対応
- TLS証明書管理
- レート制限
- 不正利用検知
- プロファイル管理
- 複数トランクの優先順位設定
- 詳細な統計情報

## 11. Twilio/Vonage連携時の考慮事項

### 11.1 ローカル開発環境での接続要件

**発信（Outbound）**:
- localtunnel: **不要**
- 理由: SIP登録とRTP通信はすべてアウトバウンド接続

**着信（Inbound）**:
- localtunnel: **必要（APIサーバーのみ）**
- 理由: Webhookコールバックを受信するため
- 設定例:
  ```bash
  # API用トンネル起動
  lt --port 8080 --subdomain vibe-cti-api
  
  # TwilioコンソールでWebhook URLを設定
  # Voice URL: https://vibe-cti-api.loca.lt/api/webhooks/twilio/voice
  # Status Callback: https://vibe-cti-api.loca.lt/api/webhooks/twilio/status
  ```

### 11.2 Webhook設計

```typescript
// Twilio着信Webhook
POST /api/webhooks/twilio/voice
{
  "From": "+81901234567",
  "To": "+81312345678",
  "CallSid": "CA1234567890abcdef",
  "Direction": "inbound"
}

// レスポンス（TwiML）
<Response>
  <Dial>
    <Sip>sip:1001@freeswitch.local</Sip>
  </Dial>
</Response>
```

### 11.3 ネットワーク要件

| コンポーネント | ポート | プロトコル | 外部公開 | 備考 |
|--------------|--------|----------|---------|------|
| API Webhook | 8080 | HTTPS | 必要* | *localtunnel経由 |
| FreeSWITCH SIP | 5060 | UDP/TCP | 不要 | アウトバウンドのみ |
| RTP Media | 16384-32768 | UDP | 不要 | STUN/TURN利用 |
| WebSocket | 8080 | WSS | 不要 | ローカルのみ |