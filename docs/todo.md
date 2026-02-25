# TODO

> **運用ルール**: セッション開始時にこのファイル全体を読み込むこと。作業中は進捗・決定事項を随時更新し、「セッション引き継ぎ」セクションへ同じ形式で追記していく。

## 現在の状況

全 Step 完了。`develop` ブランチ。

## 完了

- [x] 準備: 要件定義, CLAUDE.md, flake.nix, GitHub リポジトリ, 技術選定, ブランチ戦略
- [x] Step 1: プロジェクト初期化 — pnpm init, ライブラリインストール, 設定ファイル作成
- [x] Step 2: 型定義・基盤 — types.ts, id.ts, store.ts（load/save + DI対応）, store テスト（5ケース）
- [x] Step 3: コマンド実装 — add, list, search, delete, open + 表示整形（format.ts）
- [x] Step 4: タイトル自動取得 — fetch-title.ts, add コマンドに統合（PR#6）
- [x] Step 5: テスト拡充 — format.ts（4ケース）, id.ts（2ケース）, fetch-title.ts（3ケース）。全14テスト通過（PR#7）

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
  - `CLAUDE.md` 整理（Tech Stack, Project Structure, Development Commands をコンパクトに）
  - `CLAUDE.md` に進捗記録の自動更新ルールを追加
- `feature/commands` ブランチを restore して `open` コマンド実装の準備
- 現在のブランチ: `feature/commands`
- 次にやること: `open` コマンド実装 → description 追加 → list 表示整形・`--recent N` 対応

### 2026-02-21 セッション02
- `open` コマンドの仕様確認・方針決定
  - `memo open <id>` — 指定 id のメモの URL をデフォルトブラウザで開く
  - ブラウザを開く方法: npm パッケージ `open` を使う（A案）に決定
    - B案（`child_process` で OS ごとにコマンドを呼び分ける）は学習的には面白いが、OS 差異のエッジケース対応が大変
    - 現場では「本質でない部分は信頼できるライブラリに任せる」が基本方針
  - 処理の流れ: `load()` → `find()` で id 検索 → 見つからなければメッセージ → `await open(url)` でブラウザを開く
  - `delete` と似た構造だが、データ変更がないので `save()` 不要
- 次にやること: `pnpm add open` → `src/commands/open.ts` 実装 → `index.ts` に登録

### 2026-02-21 セッション03
- Claude Code hooks で todo.md 更新リマインドを実装
  - `.claude/hooks/check-todo-updated.sh` — `git diff --name-only HEAD` でファイル変更を検知し、変更があれば `block` decision でリマインドを出す
  - `.claude/settings.json` — `PostToolUse` hook で `Edit`/`Write`/`Bash` の実行後にスクリプトを発火
  - `.gitignore` に `.claude/settings.local.json` を追記（個人設定は gitignore、共有設定はコミット対象）
- 学んだこと:
  - Claude Code hooks: `PostToolUse` イベントでツール実行後にスクリプトを発火できる
  - `matcher` でツール名を正規表現で指定（`Edit|Write|Bash`）
  - hook スクリプトから JSON で `decision: "block"` を返すとリマインドメッセージが表示される
  - `$CLAUDE_PROJECT_DIR` 環境変数でプロジェクトルートを参照可能

### 2026-02-21 セッション04
- `src/commands/open.ts` を実装
  - `memo open <id>` — 指定 id のメモの URL をデフォルトブラウザで開く
  - npm パッケージ `open`（v11.0.0）をインストール（`pnpm add open`）
  - `import open from "open"` — デフォルトエクスポートなので `{}` なしで import
  - 処理の流れ: `load()` → `find()` で id 検索 → 見つからなければメッセージ → `await open(url)` でブラウザを開く
  - `delete` と似た構造だが、データ変更がないので `save()` 不要
  - `index.ts` に登録し、`pnpm build && pnpm start open <id>` で動作確認済み
- 学んだこと:
  - `find()` — 配列の標準メソッド。コールバック関数を渡し、最初に条件を満たした要素を返す。見つからなければ `undefined`
  - `find()` vs `filter()`: `find` は最初の1つを返す、`filter` は条件を満たす全要素を配列で返す
  - `find()` にはコールバック関数を渡す（`find(id)` ではなく `find((memo) => memo.id === id)`）
- Claude Code hooks の修正:
  - `PostToolUse` では `decision: "block"` が機能しないことが判明（ツール実行**後**なのでブロックする意味がない）
  - `hookSpecificOutput` + `additionalContext` に変更してリマインドメッセージが届くようになった
- 次にやること: description 追加 → list 表示整形・`--recent N` 対応

### 2026-02-21 セッション05
- `add` コマンドに `--desc <text>` オプションを追加
  - `.option("--desc <text>")` で定義、`description: options.desc` で Memo オブジェクトに代入
  - `--desc` 未指定時は `options.desc` が `undefined` → `JSON.stringify` が `undefined` のプロパティを省略するため JSON に残らない
- 学んだこと:
  - `JSON.stringify` は値が `undefined` のプロパティをキーごと省略する（`null` は残る）
  - `undefined` = 「存在しない」、`null` = 「明示的に空」という使い分け
- 次にやること: list/search に description 表示 → list 表示整形・`--recent N` 対応

### 2026-02-21 セッション05 (続き)
- list/search の表示整形を実装
  - C案（インデント付きブロック表示）を採用
  - `src/utils/format.ts` に `formatMemo(memo: Memo): string` を切り出し
  - `list.ts` と `search.ts` の両方から共通関数を利用
  - description・tags がない場合は行ごと省略（`if` で条件分岐して `+=` で文字列を組み立てる）
  - 日付は `.split("T")[0]` で日付部分のみ表示、`updatedAt` があればそちらを優先
  - `.sort()` で新しい順（降順）にソート
- `--recent N` は不要と判断し保留
- 学んだこと:
  - `.sort()` は破壊的メソッド（元の配列を変更する）。非破壊版は `.toSorted()`（ES2023）
  - `.sort()` の比較関数: 負の数 → `a` を前、正の数 → `b` を前
  - `for` は文（statement）。値を返さない。`filter` 等のメソッドは式（expression）
  - 関数の切り出し: 単一責任（1件の整形）に絞ると使い回しやすい
- 次にやること: Step 3 完了 → Step 4（タイトル自動取得）

### 2026-02-22 セッション01
- Step 4: タイトル自動取得を実装
  - `src/lib/fetch-title.ts` を新規作成
    - `fetchTitle(url: string): Promise<string>` — URL から HTML を取得し `<title>` を返す
    - Node.js 標準の `fetch()` で HTTP リクエスト、cheerio でパース
    - `$("head > title").text()` で `<head>` 直下の `<title>` のみ取得（SVG 内の `<title>` を除外）
    - `try-catch` で全エラーを捕捉し、失敗時は URL をそのまま返す
    - `<title>` が空文字の場合も `|| url` で URL にフォールバック
  - `src/commands/add.ts` を修正
    - `title ?? await fetchTitle(url)` で title 省略時にタイトル自動取得
- 学んだこと:
  - `fetch()` は HTTP エラー（403 等）でも例外を投げない（Promise は resolve する）
  - cheerio の `$("title").text()` は全マッチ要素のテキストを連結する。`$("title").first().text()` や `$("head > title")` で絞り込む必要がある
  - CSS セレクタの `>` は子結合子（child combinator）。直接の子要素だけにマッチ
  - サイトによっては User-Agent でレスポンスを変える（ブラウザと `fetch` で異なる HTML が返る）
  - `??` の右辺は左辺が `null`/`undefined` のときだけ評価される（短絡評価）

### 2026-02-25 セッション01
- Step 5 テスト拡充に着手
- テスト対象をA群（純粋関数）・B群（モック必要）・C群（テスト不要）に分類
- A群から着手: `format.ts` → `id.ts` の順で実装
- `tests/format.test.ts` — 4ケース:
  1. 必須フィールドのみ（description なし、tags 空、updatedAt なし）
  2. 全フィールドあり（description、tags、updatedAt すべてあり）
  3. description のみあり
  4. tags のみあり
- `tests/id.test.ts` — 2ケース:
  1. UUID v4 の形式に一致する（正規表現で検証）
  2. 2回呼ぶと異なる値が返る
- 学んだこと:
  - `toBe` はプリミティブ値（文字列、数値）の完全一致、`toEqual` はオブジェクトの中身の比較
  - `toMatch(/正規表現/)` で文字列のパターンマッチを検証できる
  - `not.toBe` で「一致しないこと」を検証できる
  - テンプレートリテラル内のインデントはそのまま文字列になるので、期待値の空白に注意が必要
  - `import { it } from "node:test"` と `import { it } from "vitest"` を混ぜないこと（テストランナーが異なる）
  - 純粋関数のテストは `beforeEach` / `afterEach` 不要で、入力→出力を検証するだけ
- `tests/fetch-title.test.ts` — 3ケース（AIが実装）:
  1. 正常なHTML → title が返る
  2. title が空 → URL がフォールバック
  3. fetch が失敗 → URL がフォールバック
- `vi.stubGlobal("fetch", vi.fn())` でグローバルの `fetch` をモックに差し替え
- `afterEach(() => vi.restoreAllMocks())` で各テスト後にモックをリセット
- commands 系テストはモックだらけになり価値が低いためスキップと判断
- 学んだこと:
  - `vi.stubGlobal` — グローバル関数（fetch 等）をモックに差し替える
  - `vi.fn()` — 空の偽関数を作る
  - `mockResolvedValue` — Promise が成功する値を設定
  - `mockRejectedValue` — Promise が失敗するエラーを設定
  - `vi.restoreAllMocks()` — モックを元に戻す（テスト間の干渉防止）
  - `as Response` — 型アサーション。必要なプロパティだけ用意して型を満たす
  - テストで全部をモックする必要はない。テストする価値（ロジックの有無、バグの入りやすさ）で判断する
  - API のシグネチャは暗記不要。「何ができるか」の引き出しを知っていれば、必要な時に参照して書ける
- PR#7 作成・マージ。全 Step 完了
