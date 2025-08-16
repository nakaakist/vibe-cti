# プロジェクト開発ガイドライン

## タスク実行時の注意事項

### 1. 仕様書の確認

タスクに取り組む前に、必ず以下のドキュメントを参照し、技術選定や実装方針を確認すること：

- `docs/specs/main.md` - プロジェクト全体の技術仕様
- `docs/specs/pages/` - 画面や API 実装時は関連するページ仕様も参照

### 2. テストの実装と検証

- タスクに記載されているテスト要件は必ず考慮すること
- ユニットテストやインテグレーションテストは、実装と並行して追加すること
- 各テストが通ることを逐一確認しながら開発を進めること
- テストファースト開発を推奨
- Claude Code でコードを書いた後は、必ず/validate カスタムスラッシュコマンドを使って静的検証を行うこと。出てきた問題は必ず修正すること。

### 3. 手動テストが必要な場合の対応

人手によるテストが必要になった場合は：

- 作業を一時停止する
- ユーザーに明示的に指示を仰ぐ
- 手動テストの手順や確認項目を明確に伝える

### 4. 画面動作確認時の注意事項

- フロントエンドやバックエンドの変更後、画面確認が必要な場合は Playwright MCP を適宜使用する
- Playwright MCP でスクリーンショットを撮る際は、`.playwright-mcp/`ディレクトリに保存する

### 5. タスクステータス管理

タスクの進捗管理のため、以下のルールに従うこと：

- タスクごとにステータスを `docs/tasks/task-status.md` に記録する
- ステータスは以下の 4 種類：
  - `not started`: 未着手
  - `coding`: 実装中
  - `coding done`: 実装完了（テスト未実施）
  - `testing done`: テスト完了（手動テスト含む）
- タスクに着手する際、完了する際は必ずステータスを更新する
- 手動テストが完了して初めて `testing done` に更新できる
- タスクを一個 coding done の状態にしたら、テストと静的検証が終わっているかを確認する。人間が必要なテストの場合は、そこで停止して人間の判断を仰ぐ。unit test/playwright など含めた自動テストで行ける場合は、それを行なう。通ったら、testing done にして、git commit する。

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

- **React + TypeScript** - UI フレームワーク
- **Jotai** - 状態管理
- **Vite** - ビルドツール
- **shadcn/ui + Tailwind CSS** - UI コンポーネント・スタイリング
- **Axios** - HTTP クライアント
- **WebRTC** - リアルタイム通信

### Backend

- **Go 1.21** - バックエンド言語
- **Echo v4** - Web フレームワーク
- **Gorilla WebSocket** - WebSocket 通信
- **PostgreSQL** - データベース（予定）
- **Redis** - セッション管理（予定）

### インフラ・通信

- **Janus Gateway** - WebRTC/SIP ゲートウェイ
- **FreeSWITCH** - PBX/SIP サーバー
- **Docker Compose** - コンテナオーケストレーション

## 開発環境の起動方法

### 1. バックエンド（Docker Compose）

バックエンドとデータベースは Docker Compose で起動する：

```bash
# 起動
docker-compose up -d

# 停止
docker-compose down

# ログ確認
docker-compose logs -f api
```

### 2. フロントエンド（開発サーバー）

フロントエンドは`npm run dev`で起動する：

```bash
cd frontend
npm install  # 初回のみ
npm run dev  # http://localhost:5173 で起動
```

### ポート使用状況の確認

開発サーバーを起動する前に、必ず以下を確認すること：

```bash
# フロントエンド（ポート5173）の確認
lsof -i :5173 | grep LISTEN

# バックエンド（ポート8080）の確認
lsof -i :8080 | grep LISTEN

# Docker起動状況の確認
docker ps | grep vibe-
```

すでにプロセスが起動している場合は、新たに起動せずに既存のプロセスを使用すること。

## 開発コマンド

### Frontend

```bash
cd frontend
npm install          # 依存関係のインストール
npm run dev          # 開発サーバー起動 (http://localhost:5173)
npm run build        # ビルド
npm run typecheck    # TypeScript型チェック
npm run lint         # Biomeでフォーマット・Lint（自動修正）
npm run lint:check   # Biomeでフォーマット・Lintチェック（修正なし）
npm run check        # 型チェック + Lintチェック（CI用）
npm run fix          # コードの自動修正
npm run preview      # ビルド結果のプレビュー
```

### Backend

```bash
cd backend
make help            # 利用可能なコマンド一覧を表示
make run             # サーバー起動
make build           # ビルド
make test            # テスト実行
make lint            # golangci-lintを実行
make fmt             # コードをフォーマット
make check           # 全ての静的チェックとテストを実行
make mod             # go mod tidy実行
make install-tools   # 開発ツールをインストール
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
- `backend/internal/janus/client.go` - Janus 通信クライアント

## コーディング規約

- 日本語でのコメント記載を推奨
- 既存のコードスタイルに従う
- 必要最小限のファイル作成（既存ファイルの編集を優先）
- TypeScript の型定義を厳密に行う
- Go のエラーハンドリングを適切に実装
