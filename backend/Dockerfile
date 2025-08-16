FROM golang:1.21-alpine AS builder

# 依存関係のインストール
RUN apk add --no-cache git gcc musl-dev

WORKDIR /app

# Goモジュールファイルをコピー
COPY go.mod go.sum ./
RUN go mod download

# ソースコードをコピー
COPY . .

# アプリケーションのビルド
RUN go build -o vibe-cti-api cmd/server/main.go

# 実行用イメージ
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# ビルドしたバイナリをコピー
COPY --from=builder /app/vibe-cti-api .

EXPOSE 8080

CMD ["./vibe-cti-api"]