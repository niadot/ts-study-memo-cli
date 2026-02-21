# TODO

> **運用ルール**: セッション開始時にこのファイル全体を読み込むこと。作業中は進捗・決定事項を随時更新し、「セッション引き継ぎ」セクションへ同じ形式で追記していく。

## 現在の状況

Step 3 進行中。`feature/commands` ブランチ。`index.ts`, `list`, `add`, `delete`, `search` 完了。次は `open`。

## 未着手

- [ ] Step 4: タイトル自動取得 (fetch-title)
- [ ] Step 5: テスト拡充

## 進行中

- [ ] Step 3: コマンド実装 — `open` が残り。その後 description 追加、list 表示整形・`--recent N` 対応

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
- [x] Step 3-1: `src/index.ts` - commander エントリポイント
- [x] Step 3-2: `src/commands/list.ts` - 一覧表示
- [x] Step 3-3: `src/commands/add.ts` - メモ追加
- [x] Step 3-4: `src/commands/delete.ts` - メモ削除
- [x] Step 3-5: `src/commands/search.ts` - キーワード検索

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

### 2026-02-16 セッション03
- `feature/types-and-store` → develop へPR作成・マージ完了
- ブランチ切り替え時に stash → pop でコンフリクト発生、`--theirs` で解消
- 学んだこと:
  - `git stash` / `git stash pop`: 未コミットの変更を一時退避・復元
  - stash pop のコンフリクト時は stash が自動削除されない（`git stash drop` で手動削除）
  - `git checkout --theirs <file>`: コンフリクト時にブランチ側の内容を採用
  - `git fetch --prune`: リモートで削除されたブランチの追跡参照もクリーンアップ
  - `git branch -d`: マージ済みブランチの安全な削除（未マージは `-D` が必要）
- Step 3 コマンド実装に着手
- `feature/commands` ブランチを作成
- `src/index.ts` を実装（commander のエントリポイント）
  - `new Command()` でインスタンス生成、`.name("memo")` でコマンド名設定
  - 各コマンド登録は関数で分離する方針（`addCommand(program)` 等）→ まだコメントアウト中
  - `program.parse()` で `process.argv` を解析・実行
- `pnpm build && pnpm start --help` で動作確認済み（`Usage: memo` と表示）
- 学んだこと:
  - commander: `new Command()` → `.name()` → `.command()` → `.parse()` の流れ
  - `process.argv` の構造: `[node, script, ...args]`。commander は `argv[1]` からプログラム名を取るが、`.name()` で明示する方が確実
  - `pnpm start -- --help` だと `--` が commander に渡されてエラーになる。`pnpm start --help` で OK（pnpm がスクリプトの引数として渡してくれる）
  - エントリポイントはトップレベルにそのまま書く（関数で囲う必要なし。他から呼ばれないため）
- `src/commands/list.ts` を実装（全件表示）
  - `Command` を引数に受け取り `.command("list").action()` でサブコマンドを登録
  - `load()` でデータ読み込み、`alldata.memos` を表示。0件なら「メモがありません」
  - `index.ts` で `import { listCommand }` して登録
  - `pnpm build && pnpm start list` で動作確認済み（「メモがありません」と表示）
- 学んだこと:
  - `import type { Command }` — 型だけを import する構文。ビルド後の JS に残らない
  - `.command()` が内部で新しい `Command` インスタンスを生成するので、コマンドモジュール側で `new Command()` は不要
  - `!==`（厳密比較）と `!=`（型変換あり）の違い。TypeScript では `!==` を使う習慣
  - `memo list` のように直接実行するには `package.json` の `bin` 設定 + グローバルリンクが必要。今は `pnpm start list` で開発
  - `.description()` はヘルプ表示用。なくても動く
- `src/commands/add.ts` を実装
  - `.argument("<url>")`, `.argument("[title]")`, `.option("--tags <values>")` で引数・オプションを定義
  - `load()` → Memo オブジェクト作成 → `push` → `save()` の流れ
  - `index.ts` に登録し、`pnpm build && pnpm start add "https://example.com" "テスト" --tags test,sample` で動作確認済み
  - `pnpm start list` で追加されたメモが表示されることも確認
- 学んだこと:
  - `.argument("<required>")` は必須、`.argument("[optional]")` は任意
  - `.action()` のコールバック引数: 位置引数が先、最後に options オブジェクト
  - `??`（Null合体演算子）: 左辺が `null` / `undefined` のときだけ右辺を返す。`?:` は空文字も falsy 扱い
  - オブジェクトリテラルの shorthand property: `url: url` → `url` と省略可（キー名と変数名が同じ場合）
  - オブジェクトリテラルはキー名を指定するので、`title: title ?? url` のように変数名と異なる値を入れられる
  - `--tags foo,bar` は文字列で渡ってくるので `.split(",")` で配列にする
  - `import { url } from "node:inspector"` のような不要な import に注意
  - `.toISOString` ではなく `.toISOString()`（関数呼び出しなので括弧が必要）
  - 1回しか使わない値は変数に入れず、オブジェクトリテラルに直接式を書ける
- `src/commands/delete.ts` を実装
  - `load()` → `filter()` で該当 id を除外 → `save()` の流れ
  - 存在しない id の判定: `filter` 後の配列の長さを元と比較する方法を採用
  - `find` + `filter` 版（条件の `===` / `!==` 使い分けが必要）と `filter` + 長さ比較版の2案を検討 → 後者を採用（ミスが起きにくい）
  - `index.ts` に登録し、`pnpm build && pnpm start delete <id>` で動作確認済み
- 学んだこと:
  - `find()` / `filter()` の引数はコールバック関数。`(memo) => memo.id === id` のように書く
  - `filter()` は元の配列を変更しない（新しい配列を返す）。結果を代入する必要がある
  - `find()` は見つからないと `undefined` を返す。`!` で否定して「見つからなかったとき」を判定
  - `=`（代入）と `===`（厳密比較）の違い。`if` の条件で `=` を使うと代入になってしまう
  - 「id が見つからない」は例外ではなく正常な判定ロジックなので、`try-catch` ではなく `if` で扱う
  - `return console.log(...)` で早期リターンできるが、`console.log(); return;` と分ける方が意図が明確
- Biome 関連:
  - `pnpm format` でフォーマット修正（インデント4→2スペース統一）、`pnpm lint --fix` で import 順整理
  - VSCode の Biome 拡張がバイナリを見つけられない問題 → `.vscode/settings.json` で `biome.lspBin` を設定
  - 原因: VSCode のワークスペースルートが `~` だったため相対パスが解決できなかった → プロジェクトフォルダを直接開いて解決
  - Biome はRust製ネイティブバイナリなのでOS・アーキテクチャごとに別バイナリが必要。Prettier（JS製）と違い拡張機能に内蔵できない
- 次にやること: `search` コマンド → `open` コマンド → description 追加 → list 表示整形・`--recent N` 対応

### 2026-02-21 セッション01
- `src/commands/search.ts` を実装
  - `memo search <keyword>` — タイトル・URL・タグを対象にキーワード検索
  - 1回の `filter` で3つの条件を `||` でまとめる（重複回避）
  - タグは配列なので `.some()` で要素ごとに `.includes()` 判定
  - 0件のときは「検索結果はゼロ件です」と表示
  - `index.ts` に登録し、`pnpm build && pnpm start search "キーワード"` で動作確認済み
- 学んだこと:
  - `some()` — 配列メソッド。要素のうち1つでも条件を満たせば `true` を返す
  - `includes()` — 文字列メソッド。指定した文字列が含まれていれば `true`
  - 複数条件を `||` でまとめれば `filter` 1回で済む。3回 `filter` すると重複が発生する
- ドキュメント整備:
  - `docs/todo.md`: 「未着手」「進行中」「完了」セクションを実態に合わせて更新
  - `CLAUDE.md`: 実行コマンドの `--` を削除（`pnpm start -- <command>` → `pnpm start <command>`）
  - `.gitignore` の確認 → 追加不要。`tsconfig.*.tsbuildinfo` の残骸を手動削除
- PR #4 作成: `feature/commands` → `develop`（list, add, delete, search の4コマンド）
- 次にやること: `open` コマンド → description 追加 → list 表示整形・`--recent N` 対応
