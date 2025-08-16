# ViBE CTI System

WebRTC/SIPベースのCTI（Computer Telephony Integration）システム

## 概要

ViBE CTIは、ブラウザベースのソフトフォンを提供するCTIシステムです。WebRTCとSIPを使用して、Webアプリケーションから電話の発着信を行うことができます。

## 技術スタック

- **Frontend**: React + TypeScript + Vite
- **Backend**: Go + Echo
- **WebRTC Gateway**: Janus Gateway
- **SIP Server**: FreeSWITCH
- **Database**: PostgreSQL
- **Cache/Session**: Redis

## クイックスタート

### 1. バックエンドの起動

```bash
# Docker Composeで起動（Janus/FreeSWITCH/PostgreSQL/Redis含む）
docker-compose up -d
```

### 2. フロントエンドの起動

```bash
cd frontend
npm install
npm run dev
```

アプリケーションは http://localhost:5173 でアクセスできます。

## 開発

### 必要な環境

- Node.js 18+
- Go 1.21+
- Docker & Docker Compose
- Make

### 開発コマンド

#### Frontend
```bash
cd frontend
npm run dev          # 開発サーバー起動
npm run build        # ビルド
npm run typecheck    # 型チェック
npm run lint         # Lint（自動修正）
npm run check        # 型チェック + Lint
```

#### Backend
```bash
cd backend
make run             # サーバー起動
make build           # ビルド
make test            # テスト実行
make check           # 静的検証（fmt + lint + test）
```

### 静的検証

コード品質を保つため、以下のツールを使用しています：

- **Frontend**: TypeScript + Biome
- **Backend**: golangci-lint + gofmt + goimports

### ポート一覧

| サービス | ポート | 説明 |
|---------|-------|------|
| Frontend | 5173 | Vite開発サーバー |
| Backend API | 8080 | Go APIサーバー |
| PostgreSQL | 5432 | データベース |
| Redis | 6379 | キャッシュ/セッション |
| Janus HTTP | 8088 | WebRTC Gateway |
| Janus WebSocket | 8188 | WebRTC Gateway WS |
| FreeSWITCH SIP | 5060 | SIPサーバー |

## プロジェクト構造

```
vibe-cti/
├── frontend/           # Reactフロントエンド
│   ├── src/
│   │   ├── components/ # UIコンポーネント
│   │   ├── services/   # WebSocket/WebRTCサービス
│   │   └── stores/     # Jotai状態管理
│   └── package.json
├── backend/            # Go バックエンド
│   ├── cmd/server/     # エントリーポイント
│   ├── internal/
│   │   ├── handlers/   # HTTPハンドラー
│   │   ├── websocket/  # WebSocket管理
│   │   └── janus/      # Janusクライアント
│   └── Makefile
├── docker/             # Docker設定
│   ├── janus/          # Janus Gateway設定
│   └── freeswitch/     # FreeSWITCH設定
└── docker-compose.yml  # Docker構成
```

## ライセンス

プロプライエタリ

## 開発者向け情報

詳細な開発ガイドラインについては、[CLAUDE.md](./CLAUDE.md)を参照してください。