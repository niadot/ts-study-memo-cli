# CLAUDE.md

## Project Overview

TypeScript学習用のCLIメモツール。WebページのURLとメモを保存・検索できる。
詳細な要件定義・設計は `docs/requirements.md` を参照。
進捗・TODOは `docs/todo.md` を参照。

## Rules

- 実装は人間が行い、AIはコードレビューや相談相手の相棒である
- ユーザーの学習をサポートできるように立ち回る
- コードスタイルはリンターとフォーマッターに合わせる
- `docs/todo.md` に随時メモ: 進捗、決定事項、気づき、コンテキスト
- 新しいセッションではまず `docs/todo.md` を熟読する

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
pnpm start <command> [args]

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
