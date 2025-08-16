# ViBE CTI Frontend

WebRTCベースのソフトフォンUIを提供するReactアプリケーション

## 技術スタック

### コア技術
- **React 18** + **TypeScript** - タイプセーフなUI開発
- **Vite 6** - 高速な開発環境とビルドツール
- **Tailwind CSS v4** - ユーティリティファーストCSSフレームワーク
- **shadcn/ui** - カスタマイズ可能なUIコンポーネントライブラリ
- **Jotai** - アトミックな状態管理ライブラリ

## アーキテクチャ

### ディレクトリ構造
```
src/
├── components/        # UIコンポーネント
│   ├── ui/           # shadcn/uiベースコンポーネント
│   └── Softphone.tsx # ソフトフォンメインコンポーネント
├── stores/           # Jotai状態管理
│   └── phoneStore.ts # 通話関連の状態
├── lib/              # ユーティリティ関数
│   └── utils.ts      # shadcn/ui用ヘルパー
└── App.tsx           # ルートコンポーネント
```

### 状態管理設計

Jotaiのアトムベースアーキテクチャを採用し、以下の状態を管理：

```typescript
// 通話状態
- isRegisteredAtom    // SIP登録状態
- isInCallAtom        // 通話中フラグ
- phoneNumberAtom     // 発信先番号
- callerIdAtom        // 着信元ID

// WebRTC関連
- localStreamAtom     // ローカル音声ストリーム
- remoteStreamAtom    // リモート音声ストリーム
- peerConnectionAtom  // RTCPeerConnection

// 通信
- wsConnectionAtom    // WebSocket接続
```

### WebRTC通信フロー

1. **初期化**
   - getUserMediaでマイク権限取得
   - WebSocket接続確立

2. **発信フロー**
   ```
   [UI] → 電話番号入力 → 発信ボタン
   [WebRTC] → RTCPeerConnection作成
   [SDP] → createOffer → setLocalDescription
   [WS] → offer送信 → サーバー経由でJanus
   ```

3. **着信フロー**
   ```
   [WS] → offer受信
   [WebRTC] → setRemoteDescription
   [SDP] → createAnswer → setLocalDescription
   [WS] → answer送信
   ```

4. **ICE処理**
   - STUN/TURNサーバー経由でICE候補収集
   - WebSocket経由で候補交換

## コンポーネント設計

### Softphone Component
メインのソフトフォンUI。以下の機能を提供：

- **SIP登録/解除** - バックエンドのJanus WebRTC Gatewayと連携
- **発信/切断** - WebRTC接続の確立と終了
- **音声ストリーム管理** - ローカル/リモート音声の制御

### UI Components (shadcn/ui)
- **Button** - アクション実行（登録、発信、切断）
- **Input** - 電話番号入力
- **Card** - コンテナレイアウト

## スタイリング戦略

### Tailwind CSS v4
- `@theme inline`でCSS変数を定義
- OKLCHカラースペースで一貫性のある色管理
- ダークモード対応

### CSS変数構成
```css
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  // ...
}
```

## 開発環境

### セットアップ
```bash
npm install
npm run dev
```

### ビルド
```bash
npm run build
npm run preview
```

### 環境要件
- Node.js 20+
- npm 10+

## WebSocket通信プロトコル

### メッセージタイプ

**クライアント → サーバー**
```typescript
// 登録
{ type: 'register', extension: string }

// 発信
{ type: 'call', number: string, sdp: RTCSessionDescription }

// 切断
{ type: 'hangup' }

// WebRTC
{ type: 'answer', sdp: RTCSessionDescription }
{ type: 'ice_candidate', candidate: RTCIceCandidate }
```

**サーバー → クライアント**
```typescript
// 着信通知
{ type: 'call_incoming', caller_id: string }

// 通話状態
{ type: 'call_connected' }
{ type: 'call_ended' }

// WebRTC
{ type: 'offer', sdp: RTCSessionDescription }
{ type: 'ice_candidate', candidate: RTCIceCandidate }
```

## セキュリティ考慮事項

1. **メディアアクセス**
   - HTTPSでのみgetUserMedia利用可能
   - 明示的なユーザー許可が必要

2. **WebSocket**
   - 本番環境ではWSS（WebSocket Secure）使用
   - 認証トークンによるアクセス制御

3. **WebRTC**
   - DTLS-SRTPによる音声暗号化
   - ICE候補のフィルタリング

## パフォーマンス最適化

1. **コード分割**
   - Viteの動的インポートでチャンク分割
   - React.lazyでコンポーネント遅延読み込み

2. **状態管理**
   - Jotaiのアトム分割で再レンダリング最小化
   - React.memoで不要な再描画防止

3. **WebRTC最適化**
   - 音声コーデック選択（Opus推奨）
   - ジッターバッファ調整
   - エコーキャンセレーション有効化

## トラブルシューティング

### よくある問題

1. **マイク権限エラー**
   - ブラウザ設定でマイクアクセス許可
   - HTTPSまたはlocalhostでのみ動作

2. **WebSocket接続失敗**
   - バックエンドサーバー起動確認
   - ファイアウォール/プロキシ設定確認

3. **音声が聞こえない**
   - 音声デバイス選択確認
   - ブラウザの自動再生ポリシー確認

## 今後の拡張予定

- [ ] ビデオ通話対応
- [ ] 通話履歴機能
- [ ] 連絡先管理
- [ ] 通話転送機能
- [ ] 会議通話対応
- [ ] 通話録音機能