# プロジェクト開発ガイドライン

## タスク実行時の注意事項

### 1. 仕様書の確認
タスクに取り組む前に、必ず以下のドキュメントを参照し、技術選定や実装方針を確認すること：
- `docs/specs/main.md` - プロジェクト全体の技術仕様
- `docs/specs/pages/` - 画面やAPI実装時は関連するページ仕様も参照

### 2. テストの実装と検証
- タスクに記載されているテスト要件は必ず考慮すること
- ユニットテストやインテグレーションテストは、実装と並行して追加すること
- 各テストが通ることを逐一確認しながら開発を進めること
- テストファースト開発を推奨

### 3. 手動テストが必要な場合の対応
人手によるテストが必要になった場合は：
- 作業を一時停止する
- ユーザーに明示的に指示を仰ぐ
- 手動テストの手順や確認項目を明確に伝える

## プロジェクト構造

```
vibe-cti/
├── frontend/           # Reactフロントエンド
│   ├── src/
│   │   ├── components/ # UIコンポーネント
│   │   ├── stores/     # Jotai状態管理
│   │   └── lib/        # ユーティリティ
│   └── package.json
├── backend/            # Go バックエンド
│   ├── cmd/server/     # エントリーポイント
│   ├── internal/
│   │   ├── handlers/   # HTTPハンドラー
│   │   ├── websocket/  # WebSocket管理
│   │   └── janus/      # Janusクライアント
│   └── go.mod
├── docker/             # Docker設定
│   ├── janus/          # Janus Gateway設定
│   └── freeswitch/     # FreeSWITCH設定
├── docs/
│   ├── specs/          # 仕様書
│   │   ├── main.md     # メイン仕様書
│   │   └── pages/      # ページ別仕様
│   └── tasks/          # フェーズ別タスク
└── docker-compose.yml  # Docker構成

```

## 技術スタック

### Frontend
- **React + TypeScript** - UIフレームワーク
- **Jotai** - 状態管理
- **Vite** - ビルドツール
- **shadcn/ui + Tailwind CSS** - UIコンポーネント・スタイリング
- **Axios** - HTTPクライアント
- **WebRTC** - リアルタイム通信

### Backend
- **Go 1.21** - バックエンド言語
- **Echo v4** - Webフレームワーク
- **Gorilla WebSocket** - WebSocket通信
- **PostgreSQL** - データベース（予定）
- **Redis** - セッション管理（予定）

### インフラ・通信
- **Janus Gateway** - WebRTC/SIP ゲートウェイ
- **FreeSWITCH** - PBX/SIPサーバー
- **Docker Compose** - コンテナオーケストレーション

## 開発コマンド

### Frontend
```bash
cd frontend
npm install          # 依存関係のインストール
npm run dev          # 開発サーバー起動 (http://localhost:5173)
npm run build        # ビルド
npm run lint         # ESLint実行
npm run preview      # ビルド結果のプレビュー
```

### Backend
```bash
cd backend
go mod download      # 依存関係のダウンロード
go run cmd/server/main.go  # サーバー起動
go test ./...        # テスト実行
go build -o server cmd/server/main.go  # ビルド
```

### Docker環境
```bash
# 最小構成での起動（開発用）
docker-compose -f docker-compose-minimal.yml up -d

# フル構成での起動
docker-compose up -d

# 停止
docker-compose down
```

## タスクフェーズ
1. **Phase 1 (MVP)** - 基本的な発着信機能
2. **Phase 2** - 基本機能（保留、転送など）
3. **Phase 3** - IVR・高度な機能
4. **Phase 4** - 管理・レポート機能
5. **Phase 5** - 本番環境デプロイ

詳細は `docs/tasks/` ディレクトリを参照。

## 重要なファイル
- `docs/specs/main.md` - プロジェクト全体の仕様
- `docs/specs/pages/*.md` - 各画面の詳細仕様
- `frontend/src/components/Softphone.tsx` - ソフトフォンコンポーネント
- `frontend/src/stores/phoneStore.ts` - 電話状態管理
- `backend/internal/websocket/hub.go` - WebSocket Hub
- `backend/internal/janus/client.go` - Janus通信クライアント

## コーディング規約
- 日本語でのコメント記載を推奨
- 既存のコードスタイルに従う
- 必要最小限のファイル作成（既存ファイルの編集を優先）
- TypeScriptの型定義を厳密に行う
- Goのエラーハンドリングを適切に実装