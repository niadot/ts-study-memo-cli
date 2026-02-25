# CLAUDE.md

## Project Overview

TypeScript学習用のCLIメモツール。WebページのURLとメモを保存・検索できる。

- 要件定義・設計: `docs/requirements.md`
- 進捗・TODO: `docs/todo.md`

## Rules

- 実装は人間が行い、AIはコードレビューや相談相手の相棒である
- ユーザーの学習をサポートできるように立ち回る
- コードスタイルはリンターとフォーマッターに合わせる
- 新しいセッションではまず `docs/todo.md` を熟読する
- ユーザーのメッセージごとに `docs/todo.md` の進捗更新が必要か確認し、必要なら更新する
- コミット・プッシュ時は `docs/todo.md` の更新も含める（ユーザーに確認不要）

## Tech Stack

- Language: TypeScript (ESM) / Node.js
- Package Manager: pnpm
- Build: tsup
- CLI: commander
- Test: vitest
- Linter / Formatter: Biome
- HTML Parse: cheerio

## Project Structure

```
src/
├── index.ts          # エントリポイント (commander 設定)
├── commands/         # 各コマンドの実装 (add, list, search, open, delete)
├── lib/              # ビジネスロジック (store, types, fetch-title)
└── utils/            # ユーティリティ (ID生成)
tests/                # テスト
docs/
├── requirements.md   # 要件定義兼設計書
└── todo.md           # 進捗・TODO・セッション記録
```

## Development Commands

```bash
pnpm install          # 依存インストール
pnpm build            # ビルド
pnpm start <command>  # 実行
pnpm test             # テスト
pnpm exec tsc --noEmit  # 型チェック
pnpm lint             # リント
pnpm format           # フォーマット
```

## Git Convention

### ブランチ戦略

`main` ← `develop` ← `feature/*`, `fix/*`, `refactor/*`, `docs/*`, `test/*`

ブランチ名: プレフィックス + スラッシュ + ケバブケース (例: `feature/add-command`)

### コミットメッセージ

Conventional Commits（英語）:

- `feat:` 新機能
- `fix:` バグ修正
- `docs:` ドキュメント
- `refactor:` リファクタリング
- `test:` テスト追加・修正
- `chore:` ビルド・依存関係等の雑務

スコープ付き例: `feat(search): add fuzzy matching`
