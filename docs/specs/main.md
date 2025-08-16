# Vibe CTI 仕様書

（更新日: 2025-08-16）

## 0. 目的と前提

- 目的: ブラウザのソフトフォンから **受電/発信** を行い、Twilio/Vonage 等の **SIP Trunk** と接続する最小構成の CTI を提供する。
- 前提:
  - バックエンド: Go (Golang) / フロント: TypeScript + React。
  - メディアは WebRTC。**REGISTER は使わず Trunk 前提**（認証は IP ACL または資格情報、SIP/TLS、SRTP）。
  - **IVR は自前実装（ロジック＝ Go、エディタ＝ TS/React）**、メディア実行は **FreeSWITCH** に委譲（ESL 制御）。
  - 国内ユーザ想定、NAT/プロキシ環境でも動作（TURN 必須）。

## 1. 機能要件（MVP）

1. **SIP トランク接続**（REGISTER 無し）: Termination/Origination の相互接続。TLS/SRTP、DTMF（RFC4733/SIP INFO）。
2. **発信**: 番号/URI 指定、応答/切断、再発信、カスタムヘッダ送出。
3. **着信**: 着信ポップ、応答/拒否、通話制御（ミュート/保留/DTMF）。
4. **簡易 IVR**: `Play → Gather → Branch → Transfer`、タイムアウト/リトライ、営業時間分岐、オペレータ/外線/キュー転送。
5. **デバイス制御**: マイク/スピーカー選択、レベル表示。
6. **通話品質**: Opus 優先、PCMU/PCMA フォールバック、RTCP 統計収集。
7. **セキュリティ**: HTTPS/WSS、DTLS-SRTP、SIP/TLS、資格情報は KMS で暗号化保存。

> Nice-to-have（将来）: 転送の高度化、録音、通話ログ検索、CRM 連携、ACD/キュー、ダッシュボード、TTS。

## 2. システム構成（採用）

```
[Browser (React, WebRTC)]
   |  HTTPS/WSS (API, Events)
   v
[Go Backend]
   |  (Janus/FS 制御, 認証, CTI/IVR ロジック, DSL 実行)
   v
[Janus (WebRTC↔SIP GW)]  <—SIP/TLS—>  [FreeSWITCH (IVR/B2BUA)]  <—SIP Trunk—>  [Twilio/Vonage]
   ^
   |  ICE/STUN/TURN
[ coturn ]
```

- **Janus**: WebRTC ↔ SIP(JSEP) 変換、メディア終端（ブラウザ側）。
- **FreeSWITCH**: トランク終端、IVR（音声再生/DTMF）、転送/ブリッジ、B2BUA。
- **Go**: 認証、通話 API、WebSocket イベント、**IVR JSON DSL の実行/管理**、FS/Janus 制御。

## 3. 採用技術（Decision Log）

- **メディア/GW**: Janus WebRTC Server（SIP Plugin）
- **IVR/B2BUA**: FreeSWITCH（ESL 経由で Go から制御）
- **TURN/STUN**: coturn（UDP/TCP/TLS、443/TCP フォールバック）
- **Backend**: Go 1.22+（Echo or Fiber） / **DB**: PostgreSQL / **Cache**: Redis
- **Frontend**: React + TypeScript、Jotai、Vite、shadcn/ui + Tailwind
- **CI/CD**: GitHub Actions（lint/test/build/deploy）

## 4. プロトコル/コーデック/品質

- **信号**: Browser↔Janus は WebRTC（DTLS-SRTP）。Janus↔FS/Trunk は SIP（UDP/TCP/TLS）。
- **コーデック**: Opus(48k/24k/16k) 優先、PCMU(0)/PCMA(8) フォールバック。
- **DTMF**: RFC4733（telephone-event）優先、SIP INFO 代替。
- **音声処理**: AEC/AGC/NS はブラウザの既定を利用。
- **品質メトリクス**: ロス率/Jitter/RTT/MOS 相当（推定）を収集し時系列保存。

## 5. プロバイダ接続要件（要点）

- **Twilio Elastic SIP Trunking**: Secure Trunking（SIP/TLS + SRTP）。認証は **Credential List** または **IP ACL**。Termination は **FreeSWITCH の FQDN/SIP URI** を指定、Origination は **FreeSWITCH の公開 FQDN/IP** へ着信。
- **Vonage Programmable SIP/Trunking**: TLS/SRTP 有効化、ACL/ユーザ制御。DID → FreeSWITCH 着信。
- **共通**: DTMF は RFC4733、ヘルスチェックは SIP OPTIONS。事業者差は **FS プロファイル/ダイヤルプラン**で吸収。

## 6. バックエンド（Go）

### 6.1 認証/権限

- OIDC/JWT。アクセストークンを用いて API/WS を保護。通話操作は RBAC（agent/supervisor/admin）。

### 6.2 REST API

- `POST /api/sessions` : Janus セッション作成。
- `POST /api/calls` : 発信（`trunkId`, `destination`, `customHeaders?`）。
- `POST /api/calls/{id}/(hangup|answer|reject|hold|resume|mute|unmute)`
- `POST /api/calls/{id}/dtmf` : `{ "digits": "123#" }`
- `GET /api/calls/{id}/stats`
- `GET /api/trunks`
- `GET /api/ivr/trees` / `POST /api/ivr/trees` / `PUT /api/ivr/trees/{id}` / `DELETE /api/ivr/trees/{id}`
- `POST /api/ivr/prompts` : WAV(µ-law 8kHz mono) 登録

### 6.3 WebSocket Events

- `incoming_call` / `ringing` / `progress` / `established` / `hangup` / `quality` / `error`

## 7. IVR 仕様（自前: ロジック=Go / エディタ=TS、実行=FS）

### 7.1 DSL コンセプト

- ノード: `play(promptId)`, `gather(timeout,maxDigits)`, `branch(map)`, `transfer(target)`, `repeat(n)`, `hangup(code)`, `time_condition(schedule)`
- 例:

```json
{
  "id": "ivr_support_v1",
  "entry": "main",
  "nodes": {
    "main": [
      { "play": "welcome_jp_ulaw8k" },
      { "play": "menu_jp_ulaw8k" },
      { "gather": { "timeout": 5, "maxDigits": 1 } },
      {
        "branch": {
          "1": { "transfer": "queue:sales" },
          "2": { "transfer": "queue:support" },
          "0": { "transfer": "agent:operator" },
          "default": { "repeat": 2 }
        }
      }
    ]
  },
  "time_condition": {
    "hours": "9:00-18:00",
    "tz": "Asia/Tokyo",
    "offhours": { "play": "after_hours" }
  }
}
```

### 7.2 実行モデル

- Go が DSL を解釈し、**ESL** で FreeSWITCH に `playback` / `play_and_get_digits` / `bridge` を指示。
- プロンプトは GCS（署名 URL）から取得。ラウドネスは -16 LUFS 目安。

### 7.3 エディタ（React）

- React Flow でノード/エッジ編集、JSON import/export、試聴、DID マッピング、公開/ロールバック。

## 8. フロントエンド（React/TS）

- ソフトフォン UI：ダイヤルパッド/通話バー/デバイス設定/着信トースト。
- 状態管理：Zustand。メディア：`getUserMedia`、`RTCPeerConnection`。入出力：`enumerateDevices()` / `setSinkId()`。
- エラー表示：ユーザ向け簡潔メッセージ + 開発者向け詳細。

## 9. インフラ（Google Cloud）

### 9.1 開発

- docker-compose：`api`(Go), `janus`, `freeswitch`, `coturn`, `db`(Postgres), `redis`, `nginx`。

### 9.2 本番（MVP: 2 台 GCE）

- **GCE-media-01 (外向き)**: FreeSWITCH(5060/5061), Janus, coturn
  - マシン: e2-standard-4 or c3-standard-4（目安）
  - 公開: **Passthrough NLB(TCP/UDP, regional)** 推奨（最小は直 IP 可）。
- **GCE-app-01 (内向き)**: Go API + 静的フロント（Nginx）
  - 公開: **External HTTPS LB**（推奨, マネージド証明書/Cloud Armor）または直 IP+certbot。
- **マネージド**: Cloud SQL(PostgreSQL), Memorystore(Redis), Cloud Storage。
- **ネットワーク**: 単一 VPC、Cloud NAT（固定 Egress IP）、Cloud DNS（`sip.example.jp`/`app.example.jp`）。

### 9.3 ポート

- 443/TCP（API/UI/Janus API）
- 5060/UDP・TCP, **5061/TLS**（FreeSWITCH）
- 10000–20000/UDP（Janus RTP/RTCP）
- 3478/UDP・TCP, 5349/TLS（TURN）
- 16384–32768/UDP（FreeSWITCH RTP/RTCP）

### 9.4 将来スケール

- media を **MIG (multi-zonal)** + Passthrough NLB へ。`rtp_port_range` を統一。
- app を **GKE Standard** へ移行（HTTPS LB + Cloud Armor）。

## 10. セキュリティ

- TLS1.2+ 強暗号、mTLS（必要に応じて）。
- SRTP（DTLS または SDES）。
- 機微情報は Secret Manager + KMS で暗号化保存。
- CORS/CSRF/レート制限（発信 API）、監査ログ（発信/応答/拒否）。

## 12. コールフロー

### 12.1 発信（Trunk 経由）

1. React → Go `/api/calls` で発呼
2. Go → Janus（JSEP Offer）→ Janus → FreeSWITCH へ INVITE（TLS）
3. 200 OK → Janus ACK、メディア確立（SRTP）
4. RTCP 統計を Go へ push、切断で `hangup`

### 12.2 受信（Trunk → IVR → ブラウザ）

1. Trunk → FreeSWITCH に INVITE（DID）
2. Go が DSL 実行 → FS で `play/gather/branch`、選択先へ `bridge`
3. FS → Janus へ INVITE（エージェント/キュー）
4. React に `incoming_call`、応答でメディア確立

## 13. 設定例（概念）

### 13.1 Trunk プロファイル（YAML）

```yaml
- id: twilio-trunk
  fqdn: sip:fs.example.com
  auth: credential_list | ip_acl
  transport: tls
  srtp_mode: sdes_mandatory
  dtmf_mode: rfc4733
  codecs: [opus, pcmu, pcma]
- id: vonage-trunk
  fqdn: sip:fs.example.com
  auth: user | acl
  transport: tls
  srtp_mode: sdes_optional
  dtmf_mode: rfc4733
  codecs: [opus, pcmu, pcma]
```

### 13.2 IVR DSL（例）

（→ 7.1 参照）

## 14. マイルストーン（4 週）

- **週 1**: 2 台 GCE 構築、Cloud SQL/Redis/Storage、DNS/TLS
- **週 2**: Trunk 相互接続 + 発信/受信 E2E
- **週 3**: **IVR 自前**（DSL/エディタ/ESL 実行）

## 15. リスクと回避

- **NAT/プロキシ**: UDP 不可 → TURN/TCP(443) を強制。Janus/FS のポートレンジ統一。
- **事業者差/相互接続**: TLS/SRTP/DTMF 差は FS プロファイルで吸収、回帰テスト自動化。
- **スケーリング**: CPS/同時通話の上限監視、MIG 化の準備、フォールバック番号の用意。

---

（本仕様は MVP 前提。将来の ACD/録音/TTS/多トランク最適化は別ドキュメントで扱う）

## 補足: 将来のボイスボット拡張（リアルタイム WebSocket）

- **目的**: IVR メニューから選択された通話を、AI と **双方向 WebSocket** で対話するボイスボットへ接続できるようにする。
- **追加コンポーネント**: **Bot Media Gateway（GW）**（Go）
  - 外側: **SIP/RTP**（FreeSWITCH からは“エージェント”扱い）
  - 内側: **WebSocket(TLS)** で AI（ASR+LLM+TTS）と双方向ストリーミング
- **フロー（概略）**:
  ```
  Trunk → FreeSWITCH(IVR)
             └─[branch=bot]→ FSが Bot GW へ INVITE(SIP/RTP)
                                   ↕ RTP（Opus or G.711）
                            Bot GW ↔ wss ↔ AI(ASR/LLM/TTS)
             └─[transfer=agent]→ Janus → Browser(Agent)
  ```
- **非機能（目安）**: 片道遅延 ≤150ms（E2E ≤300ms）。TTS はストリーミング返却、**バージイン**（ユーザ発話で TTS 中断）対応。
- **最小 API（管理プレーン例）**:
  - `POST /bot/sessions`（callId, locale, context）→ sessionId
  - `POST /bot/sessions/{id}/handoff`（target=queue\:support 等）
  - `DELETE /bot/sessions/{id}`
- **デプロイ（MVP）**: `GCE-app-01` 同居で開始 → 将来 **MIG** 化。メトリクス: WS 往復遅延/ASR 時間/TTS 初回チャンク/バージイン率。
