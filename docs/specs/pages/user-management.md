# ユーザー管理画面 設計書

（作成日: 2025-08-16）

## 1. 概要

ユーザー管理画面は、CTIシステムを利用するユーザー（エージェント、スーパーバイザー、管理者）のアカウント管理、権限設定、グループ管理を行う画面です。

## 2. 画面一覧

### 2.1 ユーザー一覧画面

#### 画面構成

```
┌─────────────────────────────────────────────────────────┐
│ ユーザー管理 > ユーザー一覧                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ [+ 新規ユーザー] [一括インポート] [エクスポート]        │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 🔍 検索...   [▼ すべて] [▼ 有効] [▼ 全ロール] │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ □ | 名前 | メール | ロール | グループ | 状態 | 操作│   │
│ ├─────────────────────────────────────────────────┤   │
│ │ □ | 田中太郎 | tanaka@... | エージェント | 営業1 | ● | ✏️│   │
│ │ □ | 佐藤花子 | sato@...   | スーパーバイザー | - | ● | ✏️│   │
│ │ □ | 鈴木一郎 | suzuki@... | エージェント | 営業2 | ● | ✏️│   │
│ │ □ | 山田次郎 | yamada@... | 管理者 | - | ● | ✏️│   │
│ │ □ | 高橋三郎 | takahashi@...| エージェント | CS | ○ | ✏️│   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ 選択: 0件  表示 1-5 / 全128件  [前へ] [1] [2] [次へ]    │
│                                                         │
│ 一括操作: [ロール変更] [グループ変更] [無効化] [削除]   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ ユーザー統計                                     │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ 総ユーザー数: 128  アクティブ: 95  無効: 33     │   │
│ │ エージェント: 110  スーパーバイザー: 15  管理者: 3│   │
│ │ オンライン: 42  離席中: 12  オフライン: 74      │   │
│ └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 2.2 ユーザー追加・編集画面

#### 画面構成

```
┌─────────────────────────────────────────────────────────┐
│ ユーザー管理 > 新規ユーザー作成                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 基本情報                                         │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ 姓: *                  名: *                     │   │
│ │ [田中              ]   [太郎              ]      │   │
│ │                                                   │   │
│ │ メールアドレス: *                                │   │
│ │ [tanaka.taro@example.com                   ]     │   │
│ │                                                   │   │
│ │ 社員番号:              部署:                     │   │
│ │ [EMP001            ]   [営業部第一課      ]      │   │
│ │                                                   │   │
│ │ 電話番号（内線）:      携帯電話:                 │   │
│ │ [1234              ]   [090-1234-5678     ]      │   │
│ │                                                   │   │
│ │ プロフィール画像:                                │   │
│ │ [ファイルを選択] または ドラッグ&ドロップ        │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ アカウント設定                                   │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ ユーザー名: *                                    │   │
│ │ [ttanaka                                    ]     │   │
│ │                                                   │   │
│ │ パスワード設定:                                  │   │
│ │ ● 自動生成してメール送信                        │   │
│ │ ○ 手動設定                                      │   │
│ │                                                   │   │
│ │ ロール: *                                        │   │
│ │ [▼ エージェント                           ]     │   │
│ │                                                   │   │
│ │ グループ:                                        │   │
│ │ [▼ 営業部第一グループ                     ]     │   │
│ │                                                   │   │
│ │ ステータス:                                      │   │
│ │ ● 有効  ○ 無効                                 │   │
│ │                                                   │   │
│ │ □ 次回ログイン時にパスワード変更を要求          │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ エージェント設定（エージェントロール選択時）     │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ スキルセット:                                    │   │
│ │ ☑ 一般対応  ☑ 技術サポート  ☐ 英語対応       │   │
│ │ ☐ VIP対応   ☐ クレーム対応                    │   │
│ │                                                   │   │
│ │ 優先度: [▼ 標準                           ]     │   │
│ │                                                   │   │
│ │ 最大同時通話数: [3  ] （0 = 無制限）            │   │
│ │                                                   │   │
│ │ 自動応答設定:                                    │   │
│ │ ○ 手動応答  ● 自動応答（[5] 秒後）            │   │
│ │                                                   │   │
│ │ 後処理時間: [30 ] 秒                            │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 権限設定                                         │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ カスタム権限:                                    │   │
│ │ ☐ ユーザー管理                                  │   │
│ │ ☐ IVR設定編集                                   │   │
│ │ ☐ SIP設定編集                                   │   │
│ │ ☑ 通話履歴閲覧（自分のみ）                      │   │
│ │ ☐ 通話履歴閲覧（全体）                          │   │
│ │ ☐ 録音再生（自分のみ）                          │   │
│ │ ☐ 録音再生（全体）                              │   │
│ │ ☐ レポート作成                                  │   │
│ │ ☐ システム設定                                  │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ [キャンセル] [保存して次へ] [保存]                      │
└─────────────────────────────────────────────────────────┘
```

### 2.3 ロール・権限管理画面

#### 画面構成

```
┌─────────────────────────────────────────────────────────┐
│ ユーザー管理 > ロール・権限管理                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ [+ カスタムロール作成]                                  │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ システムロール                                   │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ ロール名 | 説明 | ユーザー数 | 操作              │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ 管理者 | すべての権限 | 3 | [詳細]              │   │
│ │ スーパーバイザー | 監督権限 | 15 | [詳細]       │   │
│ │ エージェント | 通話対応 | 110 | [詳細]          │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ カスタムロール                                   │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ ロール名 | 説明 | ユーザー数 | 操作              │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ QA担当 | 品質管理 | 5 | [編集] [削除]           │   │
│ │ トレーナー | 研修担当 | 3 | [編集] [削除]       │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 権限マトリックス - エージェント                  │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ カテゴリー | 権限 | 許可                        │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ ダッシュボード | 閲覧 | ✓                       │   │
│ │ 通話 | 発信 | ✓                                 │   │
│ │ 通話 | 受信 | ✓                                 │   │
│ │ 通話 | 転送 | ✓                                 │   │
│ │ 通話 | 保留 | ✓                                 │   │
│ │ 通話履歴 | 自分の履歴閲覧 | ✓                   │   │
│ │ 通話履歴 | 全体履歴閲覧 | ✗                     │   │
│ │ 録音 | 自分の録音再生 | ✓                       │   │
│ │ 録音 | 全体録音再生 | ✗                         │   │
│ │ レポート | 個人レポート閲覧 | ✓                 │   │
│ │ レポート | チームレポート閲覧 | ✗               │   │
│ │ 設定 | プロフィール編集 | ✓                     │   │
│ │ 設定 | システム設定 | ✗                         │   │
│ └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 2.4 エージェントグループ管理画面

#### 画面構成

```
┌─────────────────────────────────────────────────────────┐
│ ユーザー管理 > エージェントグループ                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ [+ 新規グループ作成]                                    │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ グループ一覧                                     │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ グループ名 | メンバー数 | スーパーバイザー | 操作│   │
│ ├─────────────────────────────────────────────────┤   │
│ │ 営業第一グループ | 25 | 佐藤花子 | [編集] [削除] │   │
│ │ 営業第二グループ | 20 | 山田太郎 | [編集] [削除] │   │
│ │ カスタマーサポート | 35 | 鈴木一郎 | [編集] [削除]│   │
│ │ テクニカルサポート | 15 | 田中次郎 | [編集] [削除]│   │
│ │ VIPサポート | 10 | 高橋三郎 | [編集] [削除]      │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 営業第一グループ - 詳細                          │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ 基本情報:                                        │   │
│ │ 説明: 新規顧客開拓チーム                         │   │
│ │ スーパーバイザー: 佐藤花子                       │   │
│ │ サブスーパーバイザー: 山田太郎                   │   │
│ │                                                   │   │
│ │ ルーティング設定:                                │   │
│ │ 優先度: 高                                       │   │
│ │ 分配方式: ラウンドロビン                         │   │
│ │ スキル要件: 一般対応, 営業                       │   │
│ │                                                   │   │
│ │ メンバー一覧:                                    │   │
│ │ ┌───────────────────────────────────────┐       │   │
│ │ │ 名前 | 内線 | スキル | ステータス | 削除 │     │   │
│ │ ├───────────────────────────────────────┤       │   │
│ │ │ 田中太郎 | 1001 | 一般,営業 | オンライン | 🗑️│ │   │
│ │ │ 鈴木花子 | 1002 | 一般,営業,英語 | 通話中 | 🗑️││   │
│ │ │ 山田一郎 | 1003 | 一般,営業 | 離席中 | 🗑️    │ │   │
│ │ └───────────────────────────────────────┘       │   │
│ │                                                   │   │
│ │ [+ メンバー追加]                                 │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ グループパフォーマンス                           │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ 本日の通話数: 342  平均通話時間: 3分25秒         │   │
│ │ 応答率: 95%  放棄率: 5%  平均応答時間: 8秒     │   │
│ │ アクティブエージェント: 18/25                    │   │
│ └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## 3. API仕様

### 3.1 ユーザー管理API

```typescript
// GET /api/users
interface GetUsersRequest {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  group?: string;
  status?: 'active' | 'inactive';
}

interface GetUsersResponse {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
}

// POST /api/users
interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password?: string;
  autoGeneratePassword?: boolean;
  role: string;
  groupId?: string;
  employeeId?: string;
  department?: string;
  extension?: string;
  mobile?: string;
  skills?: string[];
  agentSettings?: AgentSettings;
  customPermissions?: string[];
}

// PUT /api/users/{id}
interface UpdateUserRequest extends Partial<CreateUserRequest> {
  id: string;
}

// DELETE /api/users/{id}

// POST /api/users/bulk-import
interface BulkImportRequest {
  file: File; // CSV/Excel
  mapping: Record<string, string>;
  sendWelcomeEmail: boolean;
}

// GET /api/users/{id}/sessions
interface GetUserSessionsResponse {
  sessions: Array<{
    id: string;
    loginTime: Date;
    lastActivity: Date;
    ipAddress: string;
    userAgent: string;
    status: 'active' | 'idle' | 'expired';
  }>;
}
```

### 3.2 ロール・権限管理API

```typescript
// GET /api/roles
interface GetRolesResponse {
  systemRoles: Role[];
  customRoles: Role[];
}

// POST /api/roles
interface CreateRoleRequest {
  name: string;
  description: string;
  permissions: string[];
  inheritsFrom?: string; // 親ロールID
}

// PUT /api/roles/{id}
interface UpdateRoleRequest extends CreateRoleRequest {
  id: string;
}

// DELETE /api/roles/{id}

// GET /api/permissions
interface GetPermissionsResponse {
  permissions: Array<{
    id: string;
    category: string;
    name: string;
    description: string;
    riskLevel: 'low' | 'medium' | 'high';
  }>;
}
```

### 3.3 グループ管理API

```typescript
// GET /api/groups
interface GetGroupsResponse {
  groups: AgentGroup[];
}

// POST /api/groups
interface CreateGroupRequest {
  name: string;
  description: string;
  supervisorId: string;
  subSupervisorIds?: string[];
  routingSettings: RoutingSettings;
  memberIds?: string[];
}

// PUT /api/groups/{id}
interface UpdateGroupRequest extends CreateGroupRequest {
  id: string;
}

// DELETE /api/groups/{id}

// POST /api/groups/{id}/members
interface AddGroupMembersRequest {
  userIds: string[];
}

// DELETE /api/groups/{id}/members/{userId}

// GET /api/groups/{id}/performance
interface GetGroupPerformanceResponse {
  totalCalls: number;
  avgCallDuration: number;
  answerRate: number;
  abandonRate: number;
  avgAnswerTime: number;
  activeAgents: number;
  totalAgents: number;
  hourlyStats: Array<{
    hour: string;
    calls: number;
    avgDuration: number;
  }>;
}
```

## 4. データモデル

### 4.1 ユーザー

```typescript
interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  employeeId?: string;
  department?: string;
  extension?: string;
  mobile?: string;
  avatar?: string;
  role: Role;
  groups: AgentGroup[];
  status: 'active' | 'inactive' | 'suspended';
  onlineStatus: 'online' | 'offline' | 'away' | 'busy';
  skills?: string[];
  agentSettings?: AgentSettings;
  customPermissions?: string[];
  lastLogin?: Date;
  passwordChangedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface AgentSettings {
  priority: 'low' | 'normal' | 'high';
  maxConcurrentCalls: number;
  autoAnswer: boolean;
  autoAnswerDelay?: number;
  wrapUpTime: number;
  skills: string[];
  preferredCodec?: string;
  sipSettings?: {
    sipUsername?: string;
    sipPassword?: string;
    sipServer?: string;
  };
}
```

### 4.2 ロール・権限

```typescript
interface Role {
  id: string;
  name: string;
  description: string;
  type: 'system' | 'custom';
  permissions: Permission[];
  inheritsFrom?: string;
  userCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Permission {
  id: string;
  category: string;
  name: string;
  action: string;
  resource: string;
  scope?: 'own' | 'group' | 'all';
}

// 権限の例
const permissions = {
  // ダッシュボード
  'dashboard.view': 'ダッシュボード閲覧',
  
  // 通話
  'call.make': '発信',
  'call.receive': '着信',
  'call.transfer': '転送',
  'call.hold': '保留',
  'call.record': '録音',
  
  // 通話履歴
  'history.view.own': '自分の履歴閲覧',
  'history.view.group': 'グループの履歴閲覧',
  'history.view.all': '全体の履歴閲覧',
  'history.export': '履歴エクスポート',
  
  // 録音
  'recording.play.own': '自分の録音再生',
  'recording.play.group': 'グループの録音再生',
  'recording.play.all': '全体の録音再生',
  'recording.download': '録音ダウンロード',
  
  // レポート
  'report.view.own': '個人レポート閲覧',
  'report.view.group': 'グループレポート閲覧',
  'report.view.all': '全体レポート閲覧',
  'report.create': 'レポート作成',
  
  // 管理
  'user.manage': 'ユーザー管理',
  'group.manage': 'グループ管理',
  'role.manage': 'ロール管理',
  'ivr.manage': 'IVR設定',
  'sip.manage': 'SIP設定',
  'system.manage': 'システム設定'
};
```

### 4.3 エージェントグループ

```typescript
interface AgentGroup {
  id: string;
  name: string;
  description: string;
  supervisorId: string;
  supervisor?: User;
  subSupervisorIds?: string[];
  members: User[];
  routingSettings: RoutingSettings;
  performance?: GroupPerformance;
  createdAt: Date;
  updatedAt: Date;
}

interface RoutingSettings {
  priority: 'low' | 'normal' | 'high' | 'critical';
  distribution: 'round-robin' | 'least-busy' | 'skill-based' | 'random';
  skillRequirements?: string[];
  maxQueueSize?: number;
  maxWaitTime?: number;
  overflow?: {
    enabled: boolean;
    targetGroupId?: string;
    afterSeconds?: number;
  };
}

interface GroupPerformance {
  date: Date;
  totalCalls: number;
  answeredCalls: number;
  abandonedCalls: number;
  avgCallDuration: number;
  avgWaitTime: number;
  avgWrapUpTime: number;
  serviceLevel: number; // パーセント
  occupancy: number; // パーセント
}
```

## 5. 認証・認可

### 5.1 認証方式

```typescript
interface AuthenticationMethods {
  local: {
    enabled: boolean;
    passwordPolicy: PasswordPolicy;
  };
  oidc: {
    enabled: boolean;
    provider: string;
    clientId: string;
    issuer: string;
  };
  saml: {
    enabled: boolean;
    entityId: string;
    ssoUrl: string;
  };
  mfa: {
    enabled: boolean;
    required: boolean;
    methods: ('totp' | 'sms' | 'email')[];
  };
}

interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  expirationDays: number;
  historyCount: number;
  maxAttempts: number;
  lockoutDuration: number;
}
```

### 5.2 セッション管理

```typescript
interface SessionSettings {
  maxConcurrentSessions: number;
  sessionTimeout: number; // 分
  idleTimeout: number; // 分
  rememberMeDuration: number; // 日
  requireReauthForSensitive: boolean;
}
```

## 6. バリデーションルール

### 6.1 ユーザー情報

- ユーザー名: 3-50文字、英数字とアンダースコア
- メールアドレス: 有効なメール形式、一意
- パスワード: ポリシーに準拠
- 名前: 1-100文字
- 内線番号: 1-10桁の数字
- 社員番号: 組織のフォーマットに準拠

### 6.2 ロール・権限

- ロール名: 必須、一意、最大50文字
- 権限: 有効な権限IDのリスト
- システムロールは編集不可

### 6.3 グループ

- グループ名: 必須、一意、最大100文字
- スーパーバイザー: 必須、有効なユーザーID
- メンバー数: 1-500人

## 7. エラーハンドリング

### 7.1 ユーザー関連エラー

```typescript
enum UserErrorCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  USERNAME_ALREADY_EXISTS = 'USERNAME_ALREADY_EXISTS',
  INVALID_PASSWORD = 'INVALID_PASSWORD',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS'
}
```

### 7.2 エラーメッセージ例

- `EMAIL_ALREADY_EXISTS`: "このメールアドレスは既に使用されています"
- `INVALID_PASSWORD`: "パスワードがポリシーに準拠していません"
- `ACCOUNT_LOCKED`: "アカウントがロックされています。管理者に連絡してください"

## 8. パフォーマンス要件

- ユーザー一覧取得: 1000件まで2秒以内
- ユーザー検索: 500ms以内
- ユーザー作成: 1秒以内
- 一括インポート: 100件/秒
- グループパフォーマンス取得: 2秒以内

## 9. セキュリティ考慮事項

- パスワードのハッシュ化（bcrypt/argon2）
- セッショントークンの安全な管理
- 権限チェックの厳密な実施
- 監査ログの記録
- 個人情報の暗号化
- APIレート制限
- SQLインジェクション対策
- XSS対策