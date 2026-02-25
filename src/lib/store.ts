import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { MemoData } from "./types.js";

const DATA_FILE = path.join(os.homedir(), ".ts-study-memo-cli", "data.json");
const INITIAL_DATA: MemoData = { version: "1", memos: [] };

export async function load(filePath: string = DATA_FILE): Promise<MemoData> {
  try {
    const reading = await fs.readFile(filePath, { encoding: "utf8" });
    return JSON.parse(reading);
  } catch (e) {
    if (e instanceof Error && (e as NodeJS.ErrnoException).code === "ENOENT") {
      return INITIAL_DATA;
    }
    throw e;
  }
}

export async function save(
  data: MemoData,
  filePath: string = DATA_FILE,
): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}
