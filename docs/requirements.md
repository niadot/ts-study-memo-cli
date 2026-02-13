# ts-study-memo-cli 要件定義兼設計書

## 1. 概要

### 1.1 プロジェクトの目的

TypeScript学習のアウトプットとして、WebページのURLとメモを手軽に保存・検索できるCLIツールを作成する。

### 1.2 方針

- 配布は想定せず、GitHubで公開する学習プロジェクト
- 実装は人間が主体で行い、Claude Code / Codex はコードレビュー・相談・部分的な支援に活用する
- AIによる一括自動実装は行わない

## 2. 技術スタック

| カテゴリ | 技術 |
|---|---|
| Language | TypeScript |
| Runtime | Node.js (nodejs_latest) |
| Package Manager | pnpm |
| Dev Environment | Nix Flakes + direnv |
| CLI Library | commander |
| Testing | vitest |
| Linter / Formatter | Biome |
| Build Tool | tsup (esbuild ベース) |
| Module System | ESM (`"type": "module"`) |
| HTML Parse | cheerio |

## 3. 開発環境セットアップ

### 3.1 Nix Flakes

`flake.nix` で Node.js と pnpm を管理。direnv で自動ロードされる。

### 3.2 TypeScript / ライブラリのインストール

```bash
pnpm init
pnpm add -D typescript @types/node
pnpm add commander cheerio
pnpm add -D vitest @types/cheerio @biomejs/biome tsup
```

### 3.3 設定ファイル

- `tsconfig.json` - TypeScript コンパイラ設定
- `tsup.config.ts` - tsup ビルド設定
- `biome.json` - Biome リンター / フォーマッター設定
- `vitest.config.ts` - テスト設定
- `package.json` scripts: `build`, `start`, `test`, `lint`, `format`

## 4. 機能要件

### 4.1 データモデル

```typescript
interface Memo {
  id: string;
  url: string;
  title: string;
  description?: string;
  tags: string[];
  createdAt: string;   // ISO 8601
  updatedAt?: string;
}

interface MemoData {
  version: string;
  memos: Memo[];
}
```

### 4.2 データ保存

- 形式: JSON
- 保存先: `~/.ts-study-memo-cli/data.json`
- 想定件数: 数十件（全件メモリ読み込みで問題なし）

### 4.3 コマンド一覧

| コマンド | 説明 |
|---|---|
| `memo add <url> [title] [--tags tag1,tag2]` | メモを追加（タイトル省略時はページタイトルを自動取得） |
| `memo list [--recent N]` | 一覧表示 |
| `memo search <keyword>` | キーワード検索（タイトル・URL・タグを対象） |
| `memo open <id>` | URLをデフォルトブラウザで開く |
| `memo delete <id>` | メモを削除 |

### 4.4 タイトル自動取得

- `memo add <url>` でタイトルを省略した場合、URLにアクセスしてHTMLの `<title>` タグからタイトルを取得する
- cheerio を使ってHTMLをパース
- 取得失敗時はURLをそのままタイトルとする

## 5. ディレクトリ構成

```
ts-study-memo-cli/
├── flake.nix
├── flake.lock
├── .envrc
├── .gitignore
├── CLAUDE.md
├── package.json
├── tsconfig.json
├── biome.json
├── vitest.config.ts
├── src/
│   ├── index.ts            # エントリポイント (commander 設定)
│   ├── commands/
│   │   ├── add.ts          # add コマンド
│   │   ├── list.ts         # list コマンド
│   │   ├── search.ts       # search コマンド
│   │   ├── open.ts         # open コマンド
│   │   └── delete.ts       # delete コマンド
│   ├── lib/
│   │   ├── store.ts        # JSON読み書き
│   │   ├── types.ts        # 型定義 (Memo, MemoData)
│   │   └── fetch-title.ts  # URLからタイトル自動取得
│   └── utils/
│       └── id.ts           # ID生成
└── tests/
    ├── store.test.ts
    ├── commands/
    │   ├── add.test.ts
    │   ├── search.test.ts
    │   └── delete.test.ts
    └── lib/
        └── fetch-title.test.ts
```

## 6. ブランチ戦略

### 6.1 ブランチ構成

```
feature/xxx → develop → main
fix/xxx     → develop → main
```

- `main` - 安定版。develop からマージする
- `develop` - 開発用。feature/fix ブランチからマージする
- `feature/*` - 新機能の開発
- `fix/*` - バグ修正
- `refactor/*` - リファクタリング
- `docs/*` - ドキュメント
- `test/*` - テスト追加

### 6.2 ブランチ名ルール

- プレフィックス + スラッシュ + ケバブケースの説明
- 例: `feature/add-command`, `fix/search-bug`, `docs/update-readme`

### 6.3 コミットメッセージ

[Conventional Commits](https://www.conventionalcommits.org/) に従う。英語で記述。

```
<type>[optional scope]: <description>
```

| type | 用途 |
|---|---|
| `feat` | 新機能 |
| `fix` | バグ修正 |
| `docs` | ドキュメント |
| `refactor` | リファクタリング |
| `test` | テスト追加・修正 |
| `chore` | ビルド・依存関係等の雑務 |

例:
- `feat: add search command`
- `feat(search): add fuzzy matching`
- `fix: handle empty tags`
- `chore: update dependencies`

## 7. 実装ステップ

### Step 1: プロジェクト初期化

- pnpm init
- TypeScript, commander, cheerio, vitest, Biome のインストール
- tsconfig.json, biome.json, vitest.config.ts の作成
- package.json の scripts 設定

### Step 2: 型定義・基盤

- `src/lib/types.ts` - Memo, MemoData の型定義
- `src/lib/store.ts` - JSON ファイルの読み書き（load / save）
- `src/utils/id.ts` - ID 生成ユーティリティ
- テスト: `tests/store.test.ts`

### Step 3: コマンド実装

- `src/commands/add.ts` - メモ追加
- `src/commands/list.ts` - 一覧表示
- `src/commands/search.ts` - 検索
- `src/commands/delete.ts` - 削除
- `src/commands/open.ts` - ブラウザでURLを開く
- `src/index.ts` - commander でコマンドを登録・エントリポイント

### Step 4: タイトル自動取得

- `src/lib/fetch-title.ts` - URLからHTMLを取得し、titleタグをパース
- add コマンドにタイトル省略時の自動取得を統合

### Step 5: テスト拡充

- 各コマンドのテスト
- fetch-title のテスト（モック使用）

## 8. 検証方法

```bash
pnpm build                                                    # ビルドが通ること
pnpm test                                                     # テストが通ること
pnpm start -- add "https://example.com" "テスト" --tags test  # メモ追加
pnpm start -- add "https://example.com"                       # タイトル自動取得
pnpm start -- list                                            # 一覧表示
pnpm start -- search "テスト"                                  # 検索
pnpm start -- open <id>                                       # ブラウザで開く
pnpm start -- delete <id>                                     # 削除
```
