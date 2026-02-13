# TODO

## 現在の状況

Step 1 完了。次は Step 2 型定義・基盤へ。

## 未着手

- [ ] Step 2: 型定義・基盤 (types, store, id)
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

## 決定事項メモ

- gh の git_protocol を ssh に変更済み
- nixpkgs は nixos-unstable を使用（home-manager と統一）
- develop ブランチを挟む（main ← develop ← feature/* 等）
- @types/cheerio は不要（cheerio 本体に型定義が含まれている）
- Biome のインデントはスペース（2スペース）に変更
