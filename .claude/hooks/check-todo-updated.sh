#!/bin/bash
# git diff でファイル変更を検知し、変更があれば todo.md 更新リマインドを出す

# 変更されたファイルがあるか確認（staged + unstaged 両方）
CHANGED=$(git diff --name-only HEAD 2>/dev/null)

if [ -z "$CHANGED" ]; then
  # 変更なし → スルー
  exit 0
fi

# 変更あり → リマインド
jq -n '{
  "hookSpecificOutput": {
    "hookEventName": "PostToolUse",
    "additionalContext": "ファイルに変更があります。docs/todo.md の進捗更新が必要か確認し、必要なら更新してください。"
  }
}'
