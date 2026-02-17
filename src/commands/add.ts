import type { Command } from "commander";
import { load, save } from "../lib/store.js";
import type { Memo } from "../lib/types.js";
import { generateId } from "../utils/id.js";

export function addCommand(program: Command) {
    program
    .command("add")
    .argument("<url>")
    .argument("[title]")
    .option("--tags <values>")
    .action(async (url, title, options) => {
        const data = await load();
        const newMemo: Memo = {
            id: generateId(),
            url,
            title: title ?? url,
            tags: options.tags ? options.tags.split(",") : [],
            createdAt: new Date().toISOString()
        };
        data.memos.push(newMemo);
        await save(data);
        console.log("メモを保存しました");
    })
}