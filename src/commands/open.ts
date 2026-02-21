import type { Command } from "commander";
import open from "open";
import { load } from "../lib/store.js";

export function openCommand(program: Command) {
  program
    .command("open")
    .argument("<id>")
    .action(async (id) => {
      const data = await load();
      const find = data.memos.find((memo) => memo.id === id);
      if (find === undefined) {
        return console.log("メモが見つかりませんでした");
      }
      await open(find.url);
    });
}
