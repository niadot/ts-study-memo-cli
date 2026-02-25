import type { Command } from "commander";
import { load } from "../lib/store.js";
import { formatMemo } from "../utils/format.js";

export function listCommand(program: Command) {
  program.command("list").action(async () => {
    const alldata = await load();
    if (alldata.memos.length !== 0) {
      alldata.memos.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
      for (const memo of alldata.memos) {
        console.log(formatMemo(memo));
      }
    } else {
      return console.log("メモがありません");
    }
  });
}
