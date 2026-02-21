import type { Memo } from "../lib/types.js";

export function formatMemo(memo: Memo): string {
  const split = (memo.updatedAt ? memo.updatedAt : memo.createdAt).split(
    "T",
  )[0];
  let output = `[${memo.id}] ${memo.title}
  URL: ${memo.url}`;
  if (memo.description) {
    output += `\n  Desc: ${memo.description}`;
  }
  if (memo.tags.length > 0) {
    output += `\n  Tags: ${memo.tags.join(", ")}`;
  }
  output += `\n  Date: ${split}`;
  return output;
}
