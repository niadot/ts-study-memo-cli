# ts-study-memo-cli

TypeScript 学習のアウトプットとして作成した CLI メモツール。Web ページの URL とメモを保存・検索できる。

## AI との協働について

このプロジェクトは **人間が主体で実装** し、**Claude Code（AI）をコードレビュー・相談相手** として活用する形で開発した。

- AI ツールは [Claude Code](https://docs.anthropic.com/en/docs/claude-code)（Anthropic の CLI ツール）を使用
- 要件定義・設計・技術選定は人間と AI の対話で決定
- ソースコードは基本的に人間が書き、AI がレビュー・アドバイス（一部テストは AI が実装）
- ドキュメント（`docs/todo.md`, `README.md`, `CLAUDE.md`）の作成・更新は主に AI が担当
- git 操作（コミット、プッシュ、PR 作成、ブランチ管理）も AI に任せる場面が多かった
- 実装中に詰まった箇所は AI に相談しながら解決
- 各セッションで学んだことを `docs/todo.md` に記録し、学習ログとして蓄積

AI に一括生成させるのではなく、1行ずつ理解しながら書くことを重視した。

## 機能

| コマンド | 説明 |
|---|---|
| `memo add <url> [title] [--tags t1,t2] [--desc text]` | メモを追加（タイトル省略時は自動取得） |
| `memo list` | 一覧表示（新しい順） |
| `memo search <keyword>` | キーワード検索（タイトル・URL・タグ対象） |
| `memo open <id>` | URL をデフォルトブラウザで開く |
| `memo delete <id>` | メモを削除 |

## 技術スタック

| カテゴリ | 技術 |
|---|---|
| Language | TypeScript (ESM) / Node.js |
| Package Manager | pnpm |
| Build | tsup (esbuild ベース) |
| CLI | commander |
| Test | vitest |
| Linter / Formatter | Biome |
| HTML Parse | cheerio |

## 開発

```bash
pnpm install          # 依存インストール
pnpm build            # ビルド
pnpm start <command>  # 実行
pnpm test             # テスト（14ケース）
pnpm lint             # リント
pnpm format           # フォーマット
```

## プロジェクト構成

```
src/
├── index.ts          # エントリポイント (commander 設定)
├── commands/         # 各コマンドの実装 (add, list, search, open, delete)
├── lib/              # ビジネスロジック (store, types, fetch-title)
└── utils/            # ユーティリティ (ID生成, 表示整形)
tests/                # テスト (store, format, id, fetch-title)
docs/
├── requirements.md   # 要件定義兼設計書
└── todo.md           # 進捗・学習ログ
```
