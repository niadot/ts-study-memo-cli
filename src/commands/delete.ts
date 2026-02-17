import type { Command } from "commander";
import { load, save } from "../lib/store.js";

export function deleteCommand(program: Command) {
    program
    .command("delete")
    .argument("<id>")
    .action(async (id) => {
        const data = await load();
        const filtered = data.memos.filter((memo) => memo.id !== id);
        if (filtered.length === data.memos.length) {
            return console.log("指定されたIDは存在しません");
        }
        data.memos = filtered;
        await save(data);
        console.log("指定された項目を削除しました");
    })
}