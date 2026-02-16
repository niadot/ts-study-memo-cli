# TODO

> **運用ルール**: セッション開始時にこのファイル全体を読み込むこと。作業中は進捗・決定事項を随時更新し、「セッション引き継ぎ」セクションへ同じ形式で追記していく。

## 現在の状況

Step 2 作業中。`feature/types-and-store` ブランチ。store.ts リファクタリング完了（テスト用DI対応）。次は store のテスト。

## 未着手

- [ ] Step 2-4: `tests/store.test.ts` - store のテスト
- [ ] Step 3: コマンド実装 (add, list, search, delete, open)
- [ ] Step 4: タイトル自動取得 (fetch-title)
- [ ] Step 5: テスト拡充

## 進行中

- [ ] Step 2-4: `tests/store.test.ts` - store のテスト

## 完了

- [x] 要件定義兼設計書の作成 (`docs/requirements.md`)
- [x] CLAUDE.md の作成・整備
- [x] flake.nix のカスタマイズ (nixos-unstable, pnpm, overlay削除)
- [x] GitHub リポジトリ作成
- [x] 技術選定 (tsup, Biome, ESM, crypto.randomUUID())
- [x] ブランチ戦略・コミットメッセージ規約の策定
- [x] docs/todo.md の作成・進捗管理フロー整備
- [x] develop ブランチ作成
- [x] Step 1: プロジェクト初期化 (pnpm init, ライブラリインストール, 設定ファイル作成)
- [x] Step 2-1: `src/lib/types.ts` - Memo, MemoData の型定義
- [x] Step 2-3: `src/utils/id.ts` - ID 生成ユーティリティ
- [x] Step 2-2: `src/lib/store.ts` - JSON ファイルの load / save

## 決定事項メモ

- gh の git_protocol を ssh に変更済み
- nixpkgs は nixos-unstable を使用（home-manager と統一）
- develop ブランチを挟む（main ← develop ← feature/* 等）
- @types/cheerio は不要（cheerio 本体に型定義が含まれている）
- Biome のインデントはスペース（2スペース）に変更
- tsconfig.json に `"include": ["src"]` を追加（ルートの .ts 設定ファイルが rootDir 外エラーになるため）
- vitest.config.ts で `globals: true` を設定（describe/it/expect を import なしで使える）
- package.json に `"type": "module"` が必要（ESM プロジェクトのため。ないと CommonJS 扱いになる）
- esbuild の `Ignored build scripts` 警告は無視して OK（optionalDependencies 方式でビルドスクリプト不要）
- CLAUDE.md のルールを改訂: AIは相棒として学習サポート、聞かれたことだけでなく先回りして情報を伝える方針
- 型定義は `interface` で統一（今回の規模では `type` の出番はなさそう。必要になったら導入する）
- TypeScript の timestamp 型は存在しない。JSON 保存との相性から ISO 8601 文字列 (`string`) を採用
- store.ts の INITIAL_DATA は `{version: "1", memos: []}` を採用
- store.ts の load で ENOENT と他のエラーを区別する方針（NodeJS.ErrnoException を使う）

## セッション引き継ぎ

> 形式: `### YYYY-MM-DD セッションNN`。セッション番号は日付ごとにリセット。

### 2026-02-13 セッション01
- Step 2 開始。types.ts から着手
- interface vs type の違いを議論 → 今回は interface で統一
- timestamp の型について議論 → JS にはなく、JSON 保存なら string (ISO 8601) が妥当
- type/ユニオン型を使う要件追加は見送り。必要になったら導入する方針
- 次にやること: types.ts を書く

### 2026-02-15 セッション01
- types.ts 完了（updatedAt を optional に修正）
- id.ts 完了（crypto.randomUUID() を使った関数）
- store.ts の load 関数まで実装済み
  - fs/promises + async/await で実装
  - INITIAL_DATA は `{version: "1", memos: []}` に決定
  - catch で ENOENT（ファイル未存在）とそれ以外のエラーを区別する方針。NodeJS.ErrnoException + instanceof で型を絞り込む
- JSON 保存の代替手段（SQLite, lowdb）を検討 → 学習目的なので fs/promises で自前実装に決定
- 次にやること: load の ENOENT エラー区別を実装 → save 関数を書く

### 2026-02-16 セッション01
- store.ts 完成（load + save）
  - load の実装:
    - `fs.readFile(DATA_FILE, {encoding: 'utf8'})` でファイルを文字列として読み込み
    - `JSON.parse` でオブジェクトに変換して返す
    - catch で `e instanceof Error && (e as NodeJS.ErrnoException).code === "ENOENT"` のときだけ初期値を返す
    - それ以外のエラー（権限不足など）は `throw e` で再送出
  - save の実装:
    - `fs.mkdir(DATA_DIR, {recursive: true})` でディレクトリを作成（既存でもエラーにならない）
    - `fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2))` で整形された JSON を書き込み
    - 両方とも `await` が必須（非同期処理の完了を待つ）
  - 定数:
    - `DATA_DIR` / `DATA_FILE` は `path.join` + `os.homedir()` でパスを組み立て
    - `INITIAL_DATA` は `{version: "1", memos: []}` に決定
- 学んだこと:
  - `path.join` は OS ごとのパス区切り文字の違いを吸収してくれる
  - `fs.readFile` の第2引数に `{encoding: 'utf8'}` を指定しないと Buffer（バイナリ）が返る
  - `JSON.stringify` の引数は `(値, 置換関数, インデント)`。第2引数を省略せず `null` を渡す必要がある
  - `JSON.parse` の戻り値はオブジェクトで、キーの `"` が外れてプロパティアクセスできるようになる
  - 型ガード (`instanceof Error`) で型を絞り込んでから、型アサーション (`as NodeJS.ErrnoException`) で `code` にアクセスする流れ
  - `recursive: true` を渡した `mkdir` はディレクトリ存在チェックの if が不要
  - `writeFile` はデフォルトで utf8 なのでエンコーディング省略可
  - `JSON.stringify` の `null` と `undefined` は動作上同じだが、型定義上 `null` が正しい
- 次にやること: tests/store.test.ts を書く

### 2026-02-16 セッション02
- store.ts をテスト可能な設計にリファクタリング
  - `load` / `save` にデフォルト引数 `filePath: string = DATA_FILE` を追加（DI）
  - テスト時に一時ディレクトリのパスを渡せるようになった
  - `save` 内の `DATA_DIR` を `path.dirname(filePath)` で導出するように変更
  - 不要になった `DATA_DIR` 定数を削除、`DATA_FILE` の `path.join` を一行にまとめた
- DI の代替手段を議論:
  - 環境変数 → 暗黙的な依存になるので不採用
  - `vi.mock` で fs モック → ファイルI/O自体をテストしたいので不採用
  - クラス + コンストラクタ → 関数2つだけなので過剰、不採用
  - 設定オブジェクト → 設定項目1つだけなので過剰、不採用
  - 構造的型付けDI（fs を interface で抽象化）→ 保存先変更の予定がないので不採用
  - デフォルト引数が今回の規模に最適と判断
- 学んだこと:
  - デフォルト引数（default parameter）: `param: type = defaultValue` で引数省略時にデフォルト値が使われる
  - DI（依存性の注入）: テスト対象の依存（今回はファイルパス）を外から渡せるようにする設計手法
  - 構造的型付け（structural typing）: TypeScript は型の名前ではなく構造（形）で互換性を判断する。これを利用してDIができる
  - `path.dirname()` でファイルパスからディレクトリ部分を取得できる
- テストケースの洗い出し完了（load 3ケース + save 2ケース）
  - load: ファイルあり→パース結果 / ファイルなし→初期値 / JSON壊れ→エラー再送出
  - save: ディレクトリなしでもファイル作成される / save→loadラウンドトリップ
- 議論:
  - 「JSONとして壊れている」と「データ構造がおかしい」は別。今の load はバリデーションしていないので後者は素通りする
  - save の異常系（MemoDataの構造が壊れている）→ TypeScriptの型チェックがコンパイル時に防ぐのでランタイムでは起きない
- 次にやること: tests/store.test.ts の骨組みを書く
