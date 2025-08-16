---
command: validate
description: コードベース全体の静的検証を実行
---

# 静的検証の実行

このコマンドは、フロントエンドとバックエンドの両方で静的検証を実行します。

## 実行内容

### フロントエンド
1. TypeScript型チェック
2. Biome Lintチェック

### バックエンド
1. Go フォーマットチェック
2. Go vet
3. golangci-lint
4. ユニットテスト

## 実行手順

```bash
# フロントエンドの検証
echo "🔍 フロントエンドの静的検証を開始..."
cd frontend
npm run check

# バックエンドの検証
echo "🔍 バックエンドの静的検証を開始..."
cd ../backend
make check
```

## エラーが発生した場合

各ツールでエラーが検出された場合は、以下のコマンドで修正を試みてください：

### フロントエンド
- `npm run fix` - Biomeによる自動修正
- `npm run typecheck` - 型エラーの詳細確認

### バックエンド
- `make fmt` - コードのフォーマット
- `make lint` - Lintエラーの詳細確認

検証に成功すると、コードベースが品質基準を満たしていることが保証されます。