.PHONY: help
help: ## ヘルプを表示
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

.PHONY: run
run: ## サーバーを起動
	go run cmd/server/main.go

.PHONY: build
build: ## ビルド
	go build -o bin/server cmd/server/main.go

.PHONY: test
test: ## テストを実行
	go test -v -race -cover ./...

.PHONY: test-coverage
test-coverage: ## カバレッジレポート付きでテストを実行
	go test -v -race -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out -o coverage.html

.PHONY: lint
lint: ## golangci-lintを実行
	@if ! which golangci-lint > /dev/null; then \
		echo "Installing golangci-lint..."; \
		go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest; \
	fi
	golangci-lint run

.PHONY: fmt
fmt: ## コードをフォーマット
	go fmt ./...
	goimports -w .

.PHONY: vet
vet: ## go vetを実行
	go vet ./...

.PHONY: check
check: fmt vet lint test ## 全ての静的チェックとテストを実行

.PHONY: mod
mod: ## go mod tidy
	go mod tidy

.PHONY: mod-download
mod-download: ## 依存関係をダウンロード
	go mod download

.PHONY: clean
clean: ## ビルド成果物をクリーンアップ
	rm -rf bin/
	rm -f coverage.out coverage.html

.PHONY: install-tools
install-tools: ## 開発ツールをインストール
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
	go install golang.org/x/tools/cmd/goimports@latest