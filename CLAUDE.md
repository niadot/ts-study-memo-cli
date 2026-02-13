# CLAUDE.md

## Project Overview

TypeScript学習用のCLIメモツール。WebページのURLとメモを保存・検索できる。
詳細な要件定義・設計は `docs/requirements.md` を参照。
進捗・TODOは `docs/todo.md` を参照。

## Rules

- 日本語でコミュニケーション
- 実装は人間が主体で行う。AIは一括自動実装をしない
- コードレビュー・相談・部分的な支援に徹する
- 既存のコードのスタイル・Biomeの設定に合わせる
- タスクの状態変化や新たな決定事項があれば `docs/todo.md` を自発的に更新する
- 新しいセッション開始時は `docs/todo.md` を読んで現状を把握すること

## Tech Stack

- Lang: TypeScript (ESM) / Node.js / pnpm
- Tools: tsup, commander, vitest, Biome, cheerio

## Project Structure

- `src/index.ts` - エントリポイント (commander 設定)
- `src/commands/` - 各コマンドの実装 (add, list, search, open, delete)
- `src/lib/` - ビジネスロジック (store, types, fetch-title)
- `src/utils/` - ユーティリティ (ID生成)
- `tests/` - テスト（ルートに配置）
- `docs/requirements.md` - 要件定義兼設計書

## Development Commands

```bash
# 開発環境（direnvで自動ロードされる）
direnv allow

# 依存インストール
pnpm install

# ビルド
pnpm build

# 実行
pnpm start -- <command> [args]

# テスト
pnpm test

# 型チェック
pnpm exec tsc --noEmit

# リント
pnpm lint

# フォーマット
pnpm format
```

## Git Convention

### ブランチ戦略

- `main` → `develop` → `feature/*`, `fix/*`, `refactor/*`, `docs/*`, `test/*`
- ブランチ名: プレフィックス + スラッシュ + ケバブケース (例: `feature/add-command`)

### コミットメッセージ

Conventional Commits（英語）:

- `feat:` 新機能
- `fix:` バグ修正
- `docs:` ドキュメント
- `refactor:` リファクタリング
- `test:` テスト追加・修正
- `chore:` ビルド・依存関係等の雑務

スコープ付き例: `feat(search): add fuzzy matching`
