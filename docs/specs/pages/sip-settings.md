# SIP接続設定画面 設計書

（作成日: 2025-08-16）

## 1. 概要

SIP接続設定画面は、Twilio、Vonage などの SIP トランクプロバイダーとの接続設定を管理する画面です。トランクの追加・編集・削除、接続パラメータの設定、セキュリティ設定などを行います。

## 2. 画面一覧

### 2.1 トランク一覧画面

#### 画面構成

```
┌─────────────────────────────────────────────────────────┐
│ SIP接続設定 > トランク管理                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ [+ 新規トランク追加]  [接続テスト一括実行]  [更新]      │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 🔍 検索...               [▼ すべて] [▼ 有効]   │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ □ | トランク名 | プロバイダー | ステータス | 操作│   │
│ ├─────────────────────────────────────────────────┤   │
│ │ □ | Twilio本番 | Twilio      | ● 接続中  | ⚙️📊│   │
│ │ □ | Twilio開発 | Twilio      | ● 接続中  | ⚙️📊│   │
│ │ □ | Vonage東京 | Vonage      | ○ 切断    | ⚙️📊│   │
│ │ □ | テスト環境 | カスタム    | ⚠️ エラー  | ⚙️📊│   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ 表示 1-4 / 全4件  [前へ] [1] [次へ]                    │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 接続状態サマリー                                 │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ 🟢 接続中: 2  🔴 切断: 1  🟡 エラー: 1         │   │
│ │ 本日の通話数: 342  アクティブ通話: 5            │   │
│ └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

#### 機能詳細

**一覧表示**
- トランク名
- プロバイダー（Twilio/Vonage/カスタム）
- 接続ステータス（接続中/切断/エラー）
- 最終接続確認時刻
- アクション（設定編集/統計表示/削除）

**フィルター・検索**
- テキスト検索（トランク名）
- プロバイダー絞り込み
- ステータス絞り込み

**一括操作**
- 接続テスト一括実行
- 選択したトランクの有効/無効切り替え
- 選択したトランクの削除

### 2.2 トランク追加・編集画面

#### 画面構成

```
┌─────────────────────────────────────────────────────────┐
│ SIP接続設定 > 新規トランク追加                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 基本情報                                         │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ トランク名: *                                    │   │
│ │ [Twilio本番環境                            ]     │   │
│ │                                                   │   │
│ │ プロバイダー: *                                  │   │
│ │ [▼ Twilio                                 ]     │   │
│ │                                                   │   │
│ │ 説明:                                            │   │
│ │ [本番環境用のTwilioトランク接続            ]     │   │
│ │                                                   │   │
│ │ □ 有効                                          │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 接続設定                                         │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ SIPドメイン/URI: *                               │   │
│ │ [your-domain.pstn.twilio.com               ]     │   │
│ │                                                   │   │
│ │ 転送プロトコル:                                  │   │
│ │ ○ UDP  ○ TCP  ● TLS（推奨）                   │   │
│ │                                                   │   │
│ │ ポート:                                          │   │
│ │ [5061                                      ]     │   │
│ │                                                   │   │
│ │ Origination URI（着信用）:                       │   │
│ │ [sip:fs.example.com:5061                   ]     │   │
│ │                                                   │   │
│ │ Termination URI（発信用）:                       │   │
│ │ [sip:termination.pstn.twilio.com:5061      ]     │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 認証設定                                         │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ 認証方式:                                        │   │
│ │ ● IP ACL（IPアドレス認証）                      │   │
│ │ ○ Credential List（ユーザー/パスワード）       │   │
│ │ ○ なし                                          │   │
│ │                                                   │   │
│ │ 許可IPアドレス（カンマ区切り）:                  │   │
│ │ [203.0.113.0/24, 198.51.100.0/24           ]     │   │
│ │                                                   │   │
│ │ Egress IP（発信元IP）:                           │   │
│ │ [203.0.113.10                              ]     │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ メディア設定                                     │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ SRTP（メディア暗号化）:                         │   │
│ │ ● 必須  ○ オプション  ○ 無効                  │   │
│ │                                                   │   │
│ │ SRTP暗号化方式:                                  │   │
│ │ ● SDES  ○ DTLS-SRTP                            │   │
│ │                                                   │   │
│ │ コーデック優先順位:                              │   │
│ │ ☑ Opus   [1]                                    │   │
│ │ ☑ PCMU   [2]                                    │   │
│ │ ☑ PCMA   [3]                                    │   │
│ │ ☐ G.729  [-]                                    │   │
│ │                                                   │   │
│ │ DTMF方式:                                        │   │
│ │ ● RFC4733  ○ SIP INFO  ○ インバンド           │   │
│ │                                                   │   │
│ │ RTPポート範囲:                                   │   │
│ │ 開始: [16384]  終了: [32768]                    │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 詳細設定                                         │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ SIP OPTIONS（ヘルスチェック）:                  │   │
│ │ □ 有効（推奨）                                  │   │
│ │ 間隔: [30] 秒  タイムアウト: [5] 秒             │   │
│ │                                                   │   │
│ │ Registration:                                    │   │
│ │ □ 必要（通常は不要）                            │   │
│ │                                                   │   │
│ │ カスタムヘッダー:                                │   │
│ │ ┌───────────────────────────────────────┐       │   │
│ │ │ X-Account-ID: 12345                    │       │   │
│ │ │ X-Custom-Header: value                 │       │   │
│ │ └───────────────────────────────────────┘       │   │
│ │                                                   │   │
│ │ 最大同時通話数:                                  │   │
│ │ [100] （0 = 無制限）                            │   │
│ │                                                   │   │
│ │ 発信番号（Caller ID）:                           │   │
│ │ [+81312345678                              ]     │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ [接続テスト] [キャンセル] [保存]                        │
└─────────────────────────────────────────────────────────┘
```

#### 機能詳細

**基本情報**
- トランク名（必須、一意）
- プロバイダー選択（Twilio/Vonage/カスタム）
- 説明（任意）
- 有効/無効フラグ

**接続設定**
- SIPドメイン/URI
- 転送プロトコル（UDP/TCP/TLS）
- ポート番号
- Origination URI（着信用）
- Termination URI（発信用）

**認証設定**
- 認証方式（IP ACL/Credential List/なし）
- 許可IPアドレス（CIDR形式対応）
- Egress IP（NAT環境用）

**メディア設定**
- SRTP設定（必須/オプション/無効）
- 暗号化方式（SDES/DTLS-SRTP）
- コーデック優先順位
- DTMF方式
- RTPポート範囲

**詳細設定**
- SIP OPTIONSヘルスチェック
- Registration設定
- カスタムヘッダー
- 最大同時通話数制限
- デフォルトCaller ID

### 2.3 プロファイル設定画面

#### 画面構成

```
┌─────────────────────────────────────────────────────────┐
│ SIP接続設定 > プロファイル管理                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ [+ 新規プロファイル作成]                                │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ プロファイル一覧                                 │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ 名前          | 適用トランク数 | 更新日時 | 操作 │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ Twilio標準    | 2             | 2025/8/15| 編集 │   │
│ │ Vonage標準    | 1             | 2025/8/10| 編集 │   │
│ │ 高品質プロファイル | 0         | 2025/8/1 | 編集 │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ プロファイル詳細: Twilio標準                    │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ FreeSWITCH設定:                                  │   │
│ │ ┌───────────────────────────────────────┐       │   │
│ │ │ <profile name="twilio">                │       │   │
│ │ │   <settings>                           │       │   │
│ │ │     <param name="sip-port" value="5061"/>     │   │
│ │ │     <param name="tls" value="true"/>   │       │   │
│ │ │     <param name="rtp-secure-media"     │       │   │
│ │ │            value="mandatory"/>          │       │   │
│ │ │   </settings>                           │       │   │
│ │ │ </profile>                              │       │   │
│ │ └───────────────────────────────────────┘       │   │
│ │                                                   │   │
│ │ ダイヤルプラン:                                  │   │
│ │ ┌───────────────────────────────────────┐       │   │
│ │ │ <extension name="outbound">            │       │   │
│ │ │   <condition field="destination_number" │       │   │
│ │ │              expression="^(\+\d+)$">    │       │   │
│ │ │     <action application="bridge"        │       │   │
│ │ │             data="sofia/gateway/twilio/$1"/>   │   │
│ │ │   </condition>                          │       │   │
│ │ │ </extension>                            │       │   │
│ │ └───────────────────────────────────────┘       │   │
│ │                                                   │   │
│ │ [エクスポート] [インポート] [編集]               │   │
│ └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 2.4 セキュリティ設定画面

#### 画面構成

```
┌─────────────────────────────────────────────────────────┐
│ SIP接続設定 > セキュリティ設定                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ TLS証明書管理                                    │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ 現在の証明書:                                    │   │
│ │ 発行者: Let's Encrypt Authority X3               │   │
│ │ 有効期限: 2025/10/15 23:59:59                    │   │
│ │ サブジェクト: sip.example.com                    │   │
│ │                                                   │   │
│ │ [証明書更新] [証明書アップロード] [詳細表示]     │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ IPアクセス制御                                   │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ ホワイトリスト:                                  │   │
│ │ ┌───────────────────────────────────────┐       │   │
│ │ │ IPアドレス/CIDR | 説明 | プロバイダー | 削除 │ │   │
│ │ ├───────────────────────────────────────┤       │   │
│ │ │ 54.252.254.0/24 | Twilio AP | Twilio | 🗑️  │ │   │
│ │ │ 54.169.127.0/24 | Twilio AP | Twilio | 🗑️  │ │   │
│ │ │ 203.0.113.0/24  | 自社NAT  | -      | 🗑️  │ │   │
│ │ └───────────────────────────────────────┘       │   │
│ │                                                   │   │
│ │ [+ IPアドレス追加] [プロバイダーから自動取得]    │   │
│ │                                                   │   │
│ │ □ ブラックリスト有効                            │   │
│ │ ┌───────────────────────────────────────┐       │   │
│ │ │ （ブラックリストIPアドレス一覧）       │       │   │
│ │ └───────────────────────────────────────┘       │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ レート制限                                       │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ □ レート制限を有効化                            │   │
│ │                                                   │   │
│ │ 発信制限:                                        │   │
│ │   CPS（Call Per Second）: [10]                  │   │
│ │   同時通話数上限: [100]                          │   │
│ │                                                   │   │
│ │ 着信制限:                                        │   │
│ │   CPS（Call Per Second）: [20]                  │   │
│ │   同時通話数上限: [200]                          │   │
│ │                                                   │   │
│ │ IPごとの制限:                                    │   │
│ │   同一IPからの最大CPS: [5]                      │   │
│ │   Registration試行回数: [3] 回/分               │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 不正利用検知                                     │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ □ 不正利用検知を有効化                          │   │
│ │                                                   │   │
│ │ 検知ルール:                                      │   │
│ │ □ 国際電話への大量発信                          │   │
│ │ □ 深夜時間帯の異常な発信パターン                │   │
│ │ □ 高額通話先への発信                            │   │
│ │ □ 短時間での大量発信                            │   │
│ │                                                   │   │
│ │ アクション:                                      │   │
│ │ ● 警告通知のみ                                  │   │
│ │ ○ 自動ブロック                                  │   │
│ │                                                   │   │
│ │ 通知先メール:                                    │   │
│ │ [security@example.com                      ]     │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ [変更を保存]                                            │
└─────────────────────────────────────────────────────────┘
```

## 3. API仕様

### 3.1 トランク管理API

```typescript
// GET /api/sip/trunks
interface GetTrunksResponse {
  trunks: SipTrunk[];
  total: number;
  page: number;
  pageSize: number;
}

// POST /api/sip/trunks
interface CreateTrunkRequest {
  name: string;
  provider: 'twilio' | 'vonage' | 'custom';
  description?: string;
  enabled: boolean;
  connection: TrunkConnection;
  authentication: TrunkAuthentication;
  media: TrunkMedia;
  advanced?: TrunkAdvanced;
}

// PUT /api/sip/trunks/{id}
interface UpdateTrunkRequest extends CreateTrunkRequest {
  id: string;
}

// DELETE /api/sip/trunks/{id}

// POST /api/sip/trunks/{id}/test
interface TestTrunkResponse {
  success: boolean;
  latency: number;
  message: string;
  details?: {
    sipResponse?: string;
    optionsSupported?: boolean;
  };
}
```

### 3.2 プロファイル管理API

```typescript
// GET /api/sip/profiles
interface GetProfilesResponse {
  profiles: SipProfile[];
}

// POST /api/sip/profiles
interface CreateProfileRequest {
  name: string;
  freeswitchConfig: string; // XML設定
  dialplan: string; // XML ダイヤルプラン
  variables?: Record<string, string>;
}

// PUT /api/sip/profiles/{id}
interface UpdateProfileRequest extends CreateProfileRequest {
  id: string;
}

// POST /api/sip/profiles/{id}/apply
interface ApplyProfileRequest {
  trunkIds: string[];
}

// POST /api/sip/profiles/import
interface ImportProfileRequest {
  file: File; // XML ファイル
  name: string;
}
```

### 3.3 セキュリティ設定API

```typescript
// GET /api/sip/security/certificates
interface GetCertificatesResponse {
  certificates: Array<{
    id: string;
    subject: string;
    issuer: string;
    validFrom: Date;
    validTo: Date;
    thumbprint: string;
    active: boolean;
  }>;
}

// POST /api/sip/security/certificates
interface UploadCertificateRequest {
  certificate: string; // PEM形式
  privateKey: string; // PEM形式
  chain?: string; // 中間証明書
}

// GET /api/sip/security/acl
interface GetAclResponse {
  whitelist: Array<{
    id: string;
    address: string; // IP or CIDR
    description: string;
    provider?: string;
    createdAt: Date;
  }>;
  blacklist: Array<{
    id: string;
    address: string;
    reason: string;
    createdAt: Date;
  }>;
  blacklistEnabled: boolean;
}

// POST /api/sip/security/acl/whitelist
interface AddWhitelistRequest {
  address: string;
  description: string;
  provider?: string;
}

// DELETE /api/sip/security/acl/whitelist/{id}

// PUT /api/sip/security/rate-limits
interface UpdateRateLimitsRequest {
  enabled: boolean;
  outbound: {
    cps: number;
    concurrent: number;
  };
  inbound: {
    cps: number;
    concurrent: number;
  };
  perIp: {
    cps: number;
    registrationAttempts: number;
  };
}

// PUT /api/sip/security/fraud-detection
interface UpdateFraudDetectionRequest {
  enabled: boolean;
  rules: {
    internationalCalls: boolean;
    nightTimePatterns: boolean;
    premiumNumbers: boolean;
    rapidDialing: boolean;
  };
  action: 'alert' | 'block';
  notificationEmail: string;
}
```

## 4. データモデル

### 4.1 トランク設定

```typescript
interface SipTrunk {
  id: string;
  name: string;
  provider: 'twilio' | 'vonage' | 'custom';
  description?: string;
  enabled: boolean;
  status: 'connected' | 'disconnected' | 'error';
  lastHealthCheck?: Date;
  connection: TrunkConnection;
  authentication: TrunkAuthentication;
  media: TrunkMedia;
  advanced?: TrunkAdvanced;
  statistics?: TrunkStatistics;
  createdAt: Date;
  updatedAt: Date;
}

interface TrunkConnection {
  sipDomain: string;
  transport: 'udp' | 'tcp' | 'tls';
  port: number;
  originationUri?: string;
  terminationUri?: string;
}

interface TrunkAuthentication {
  method: 'ip_acl' | 'credentials' | 'none';
  ipWhitelist?: string[];
  egressIp?: string;
  username?: string;
  password?: string; // 暗号化保存
}

interface TrunkMedia {
  srtp: 'mandatory' | 'optional' | 'disabled';
  srtpMode?: 'sdes' | 'dtls';
  codecs: Array<{
    type: string;
    priority: number;
    enabled: boolean;
  }>;
  dtmfMode: 'rfc4733' | 'info' | 'inband';
  rtpPortRange: {
    start: number;
    end: number;
  };
}

interface TrunkAdvanced {
  optionsInterval?: number;
  optionsTimeout?: number;
  registration?: boolean;
  customHeaders?: Record<string, string>;
  maxConcurrentCalls?: number;
  defaultCallerId?: string;
}

interface TrunkStatistics {
  totalCalls: number;
  activeCalls: number;
  successRate: number;
  avgCallDuration: number;
  lastCallAt?: Date;
}
```

### 4.2 プロファイル設定

```typescript
interface SipProfile {
  id: string;
  name: string;
  freeswitchConfig: string; // XML
  dialplan: string; // XML
  variables?: Record<string, string>;
  appliedTrunks: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.3 セキュリティ設定

```typescript
interface SecuritySettings {
  id: string;
  certificates: TlsCertificate[];
  acl: {
    whitelist: IpAclEntry[];
    blacklist: IpAclEntry[];
    blacklistEnabled: boolean;
  };
  rateLimits: RateLimitSettings;
  fraudDetection: FraudDetectionSettings;
  updatedAt: Date;
}

interface TlsCertificate {
  id: string;
  subject: string;
  issuer: string;
  validFrom: Date;
  validTo: Date;
  thumbprint: string;
  certificate: string; // 暗号化保存
  privateKey: string; // 暗号化保存
  chain?: string;
  active: boolean;
}

interface IpAclEntry {
  id: string;
  address: string; // IP or CIDR
  description?: string;
  provider?: string;
  createdAt: Date;
}

interface RateLimitSettings {
  enabled: boolean;
  outbound: {
    cps: number;
    concurrent: number;
  };
  inbound: {
    cps: number;
    concurrent: number;
  };
  perIp: {
    cps: number;
    registrationAttempts: number;
  };
}

interface FraudDetectionSettings {
  enabled: boolean;
  rules: {
    internationalCalls: boolean;
    nightTimePatterns: boolean;
    premiumNumbers: boolean;
    rapidDialing: boolean;
  };
  action: 'alert' | 'block';
  notificationEmail: string;
}
```

## 5. バリデーションルール

### 5.1 トランク設定

- トランク名: 必須、一意、最大50文字
- SIPドメイン: 有効なドメイン名またはIPアドレス
- ポート: 1-65535の範囲
- IPアドレス: 有効なIPv4/IPv6形式
- CIDR: 有効なCIDR記法
- 最大同時通話数: 0以上（0は無制限）

### 5.2 セキュリティ設定

- 証明書: 有効なPEM形式
- 証明書と秘密鍵の整合性チェック
- レート制限: 1以上の整数
- メールアドレス: 有効なメール形式

## 6. エラーハンドリング

### 6.1 接続エラー

```typescript
enum TrunkErrorCode {
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  TLS_HANDSHAKE_FAILED = 'TLS_HANDSHAKE_FAILED',
  TIMEOUT = 'TIMEOUT',
  INVALID_CONFIGURATION = 'INVALID_CONFIGURATION'
}

interface TrunkError {
  code: TrunkErrorCode;
  message: string;
  trunkId: string;
  timestamp: Date;
  details?: any;
}
```

### 6.2 エラーメッセージ例

- `CONNECTION_FAILED`: "SIPサーバーに接続できません"
- `AUTHENTICATION_FAILED`: "認証に失敗しました。認証情報を確認してください"
- `TLS_HANDSHAKE_FAILED`: "TLS接続の確立に失敗しました"
- `TIMEOUT`: "接続がタイムアウトしました"

## 7. パフォーマンス要件

- トランク一覧取得: 1秒以内
- 接続テスト: 5秒以内（タイムアウト）
- 設定保存: 2秒以内
- ヘルスチェック: 30秒間隔

## 8. セキュリティ考慮事項

- パスワード、秘密鍵は暗号化して保存（KMS使用）
- TLS証明書の有効期限監視（30日前に警告）
- IPホワイトリストによるアクセス制御
- レート制限による DoS 攻撃対策
- 設定変更の監査ログ記録
- 不正利用パターンの自動検知