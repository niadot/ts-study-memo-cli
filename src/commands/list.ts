import type { Command } from "commander";
import { load } from "../lib/store.js";

export function listCommand(program: Command) {
  program.command("list").action(async () => {
    const alldata = await load();
    if (alldata.memos.length !== 0) {
      return console.log(alldata.memos);
    } else {
      return console.log("メモがありません");
    }
  });
}
