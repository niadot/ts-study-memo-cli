# TODO

> **運用ルール**: セッション開始時にこのファイル全体を読み込むこと。作業中は進捗・決定事項を随時更新し、「セッション引き継ぎ」セクションへ同じ形式で追記していく。

## 現在の状況

Step 2 完了。`feature/types-and-store` ブランチ。store.ts + テスト完了。次は Step 3 コマンド実装。

## 未着手

- [ ] Step 3: コマンド実装 (add, list, search, delete, open)
- [ ] Step 4: タイトル自動取得 (fetch-title)
- [ ] Step 5: テスト拡充

## 進行中

(なし)

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
- [x] Step 2-4: `tests/store.test.ts` - store のテスト（5ケース）

## 決定事項メモ

- gh の git_protocol を ssh に変更済み
- nixpkgs は nixos-unstable を使用（home-manager と統一）
- develop ブランチを挟む（main ← develop ← feature/* 等）
- @types/cheerio は不要（cheerio 本体に型定義が含まれている）
- Biome のインデントはスペース（2スペース）に変更
- tsconfig.json の `include` は `["src", "tests"]` に設定（VSCode の型解決 + テストファイル対応）。`rootDir` は削除（tsup ビルドには影響しない）
- vitest.config.ts で `globals: true` を設定（describe/it/expect を import なしで使える）
- package.json に `"type": "module"` が必要（ESM プロジェクトのため。ないと CommonJS 扱いになる）
- esbuild の `Ignored build scripts` 警告は無視して OK（optionalDependencies 方式でビルドスクリプト不要）
- CLAUDE.md のルールを改訂: AIは相棒として学習サポート、聞かれたことだけでなく先回りして情報を伝える方針
- 型定義は `interface` で統一（今回の規模では `type` の出番はなさそう。必要になったら導入する）
- TypeScript の timestamp 型は存在しない。JSON 保存との相性から ISO 8601 文字列 (`string`) を採用
- store.ts の INITIAL_DATA は `{version: "1", memos: []}` を採用
- store.ts の load で ENOENT と他のエラーを区別する方針（NodeJS.ErrnoException を使う）
- store.ts のテスト可能性のため load/save にデフォルト引数で filePath を注入（DI）
- テストでは fs モックを使わず、一時ディレクトリで実ファイルI/Oを行う方針
- tsconfig.json の `include` は `["src", "tests"]`、`rootDir` は削除（決定事項メモ参照）

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

#### store.ts リファクタリング（テスト用DI対応）
- `load` / `save` にデフォルト引数 `filePath: string = DATA_FILE` を追加
- `save` 内の `DATA_DIR` を `path.dirname(filePath)` で導出するように変更
- 不要になった `DATA_DIR` 定数を削除、`DATA_FILE` の `path.join` を一行にまとめた
- DI 手法の比較検討:
  - 環境変数 → 暗黙的な依存になるので不採用
  - `vi.mock` で fs モック → ファイルI/O自体をテストしたいので不採用
  - クラス + コンストラクタ → 関数2つだけなので過剰、不採用
  - 設定オブジェクト → 設定項目1つだけなので過剰、不採用
  - 構造的型付けDI（fs を interface で抽象化）→ 保存先変更の予定がないので不採用
  - **デフォルト引数**が今回の規模に最適と判断

#### テストケース設計
- load 3ケース + save 2ケース = 計5ケース:
  1. load: ファイルあり → パースされた MemoData が返る
  2. load: ファイルなし → INITIAL_DATA が返る
  3. load: JSON不正 → エラーが throw される
  4. save: ディレクトリなしでもファイル作成される
  5. save → load ラウンドトリップで同じデータが返る
- 「JSONとして壊れている」と「データ構造がおかしい」は別。今の load はバリデーション未実装なので構造不正は素通りする
- save の異常系（MemoData の構造が壊れている）→ TypeScript の型チェックがコンパイル時に防ぐのでランタイムでは起きない

#### テスト実装の詳細
- テスト環境:
  - `beforeEach` で `fs.mkdtemp()` を使い毎回新しい一時ディレクトリを作成
  - `afterEach` で `fs.rm(tmpDir, {recursive: true})` で後始末
  - `tmpDir` は `describe` スコープに `let` で宣言し、`beforeEach` 内で代入
  - `beforeAll`/`afterAll` だとテスト間でディレクトリを共有してしまい、ファイル有無のテストが干渉するため `beforeEach`/`afterEach` を採用
- テスト1（ファイルあり）:
  - `fs.writeFile` で直接ファイルを書く（`save` を使わない → テストの独立性を保つため。`save` にバグがあると `load` のテストも巻き添えで壊れる）
  - `expect(result).toEqual(data)` でオブジェクトの中身を比較
  - 最初 `toBeTypeOf("object")` を試したが、どんなオブジェクトでも通るので不適切
  - 最初 `expect(result).equals(...)` を試したが、これは文字列比較。オブジェクト比較には `toEqual` を使う
  - 最初比較対象を文字列 `'{version: "1", memos: []}'` で書いたが、`load` が返すのはオブジェクトなのでオブジェクトリテラルで書く
  - 非同期の `fs.writeFile` に `await` を付け忘れた → 書き込み完了前に `load` が走る可能性がある
  - `await` は `async` 関数の中でしか使えないので、`it` のコールバックも `async` にする必要がある
  - memos を1件含めたデータを使用（空データだとテスト2との差別化が弱い）
- テスト2（ファイルなし）:
  - 存在しない `filePath` を渡すだけ（事前準備不要）
  - `expect(result).toEqual({version: "1", memos: []})` で検証
- テスト3（JSON不正）:
  - `fs.writeFile(filePath, "{broken")` で壊れたJSONを書く。`JSON.stringify` は有効なJSONしか生成しないので使えない
  - `await expect(load(filePath)).rejects.toThrow()` で Promise の reject を検証
  - `rejects` は `await` していない Promise に対して使う。`await load(...)` するとその場でエラーが throw されてテスト自体が失敗する
  - 最初 `const result = await load(...)` してから `expect(result).rejects.toThrow()` としたが、`await` した時点で expect に到達しない
  - テスト1・2は値の検証なので `result` 変数に分けるが、テスト3は reject の検証なので1行で書く。統一感より意図の明確さを優先
- テスト4（ディレクトリなしでもファイル作成）:
  - `filePath` にサブディレクトリを挟む（`path.join(tmpDir, "subdir", "data.json")`）ことで、存在しないディレクトリの状態を作る
  - 最初 `save` の呼び出しを書き忘れた → `readFile` がエラーになる
  - save 後に `fs.readFile` → `JSON.parse` で中身を検証。ファイル存在 + 中身の正しさを一度に確認
  - `JSON.parse` は同期関数なので `await` 不要。`await` が必要なのは Promise を返す非同期関数だけ
  - `JSON.parse(await fs.readFile(...))` のように `await` をネストして変数を減らせる
  - `fs.stat`/`fs.access` でのファイル存在確認は本番コードでは TOCTOU 問題があるが、テストの事後検証では問題ない
- テスト5（ラウンドトリップ）:
  - save でデータを書き、load で読み直し、同じデータが返るかを検証
  - テスト4との違い: テスト4は `fs.readFile` で直接読む、テスト5は `load` 関数で読む
  - memos を1件含めたデータを使用

#### tsconfig.json の試行錯誤
- 課題: テストファイルで VSCode の型解決が効かない（`include` が `["src"]` のみだったため）
- 試したこと:
  1. `include` に `tests` を追加 → `rootDir: "./src"` と競合して `tsc --noEmit` がエラー
  2. tsconfig 分離（ソリューション形式: `tsconfig.json` + `tsconfig.app.json` + `tsconfig.test.json`）→ `composite: true` が必要で、`src/` 内に `.js`/`.d.ts`/`.js.map` が生成される副作用。`dist-test/` も生成。学習プロジェクトには過剰
  3. `rootDir` を `"."` に変更 → `dist/src/index.js` になりビルド出力のパスが壊れる
- 最終的な解決: `include: ["src", "tests"]` にして `rootDir` を削除。ビルドは tsup がやるので `rootDir` は不要だった
- `composite: true` で生成されたゴミファイル（`.js`, `.d.ts`, `.js.map`）を手動削除

#### 学んだこと
- **DI（依存性の注入）**: テスト対象の依存を外から渡せるようにする設計手法
- **デフォルト引数**: `param: type = defaultValue` で引数省略時にデフォルト値が使われる
- **構造的型付け**: TypeScript は型の名前ではなく構造で互換性を判断する。DI に応用できる
- **async/await**: `await` は `async` 関数の中でしか使えない。非同期関数（`fs.readFile` 等）には `await` が必要、同期関数（`JSON.parse` 等）には不要
- **vitest**: `toEqual` はオブジェクト比較、`rejects.toThrow()` は Promise の reject 検証。空の `it` もエラーがなければ passed になる
- **beforeEach/afterEach**: 各テストの前後に毎回実行。`beforeAll`/`afterAll` は全体で1回
- **一時ディレクトリ**: `os.tmpdir()` + `fs.mkdtemp()` でユニークな一時ディレクトリを作成
- **fs.rm**: `{recursive: true}` でディレクトリを中身ごと削除（`fs.mkdir` の `recursive` と対称的）
- **path.dirname()**: ファイルパスからディレクトリ部分を取得
- **モジュールの種類**: 標準モジュール（`node:fs` 等）、サードパーティモジュール（npm）、ローカルモジュール（自作）
- **ESM**: ファイルごとにスコープが独立しており、他ファイルの import は見えない
- **git**: ステージング単位でコミットを分けられる
- **TOCTOU問題**: `fs.stat`/`fs.access` での存在確認→操作の間にファイル状態が変わりうる。本番では非推奨だがテストの事後検証では問題ない
- **tsconfig**: `rootDir` はビルドツール（tsup）が出力構造を制御する場合は不要。`include` でコンパイル対象を制御すれば十分
- **tsconfig ソリューション形式**: `composite: true` + `references` で複数 tsconfig を束ねる方式。`declaration` 出力が必須になり、副作用が多い
- **git checkout <commit> -- <file>**: 特定コミットから特定ファイルを復元できる
- **git commit --amend**: 直前のコミットを修正できる（歴史が変わるので `--force-with-lease` でプッシュが必要）

#### git 操作（最終）
- 4コミット構成でプッシュ完了:
  - `feat: add Memo/MemoData type definitions`
  - `feat: add ID generation utility`
  - `feat(store): add JSON file load/save with DI support`
  - `test(store): add unit tests for load and save functions`（amend で tsconfig 変更を含めた）

- 全5ケース通過（`pnpm test`）
- 次にやること: Step 3 コマンド実装
