# TODO

## 現在の状況

プロジェクト初期化前。要件定義・設計・各種規約の策定が完了。次は develop ブランチ作成 → Step 1 プロジェクト初期化へ。

## 未着手

- [ ] develop ブランチ作成
- [ ] Step 1: プロジェクト初期化 (pnpm init, ライブラリインストール, 設定ファイル作成)
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

## 決定事項メモ

- gh の git_protocol を ssh に変更済み
- nixpkgs は nixos-unstable を使用（home-manager と統一）
- develop ブランチを挟む（main ← develop ← feature/* 等）
