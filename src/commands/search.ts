import type { Command } from "commander";
import { load } from "../lib/store.js";
import { formatMemo } from "../utils/format.js";

export function searchCommand(program: Command) {
  program
    .command("search")
    .argument("<keyword>")
    .action(async (keyword) => {
      const data = await load();
      const filtered = data.memos.filter(
        (memo) =>
          memo.title.includes(keyword) ||
          memo.url.includes(keyword) ||
          memo.tags.some((tag) => tag.includes(keyword)),
      );
      if (filtered.length !== 0) {
        for (const memo of filtered) {
          console.log(formatMemo(memo));
        }
      } else {
        return console.log("検索結果はゼロ件です");
      }
    });
}
