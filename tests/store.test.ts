import os from "node:os";
import fs from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { load, save } from "../src/lib/store.js";
import type { MemoData } from "../src/lib/types.js";

describe("load", () => {
  let tmpDir: string;
  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "store-test-"));
  });
  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true });
  });
  it("returns parsed MemoData when file exists", async () => {
    const filePath = path.join(tmpDir, "data.json");
    const data: MemoData = {
      version: "1",
      memos: [
        {
          id: "550e8400-e29b-41d4-a716-446655440000",
          url: "https://example.com",
          title: "Example Page",
          tags: ["test"],
          createdAt: "2026-02-16T12:00:00.000Z",
        },
      ],
    };
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    const result = await load(filePath);
    expect(result).toEqual(data);
  });
  it("returns INITIAL_DATA when file does not exist", async () => {
    const filePath = path.join(tmpDir, "data.json");
    const result = await load(filePath);
    expect(result).toEqual({ version: "1", memos: [] });
  });
  it("throws error when file contains invalid JSON", async () => {
    const filePath = path.join(tmpDir, "data.json");
    await fs.writeFile(filePath, "{broken");
    await expect(load(filePath)).rejects.toThrow();
  });
});

describe("save", () => {
  let tmpDir: string;
  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "store-test-"));
  });
  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true });
  });
  it("creates file even when directory does not exist", async () => {
    const filePath = path.join(tmpDir, "subdir", "data.json");
    const data: MemoData = { version: "1", memos: [] };
    await save(data, filePath);
    const result = JSON.parse(
      await fs.readFile(filePath, { encoding: "utf8" }),
    );
    expect(result).toEqual(data);
  });
  it("save then load returns same data", async () => {
    const filePath = path.join(tmpDir, "subdir", "data.json");
    const data: MemoData = {
      version: "1",
      memos: [
        {
          id: "550e8400-e29b-41d4-a716-446655440000",
          url: "https://example.com",
          title: "Example Page",
          tags: ["test"],
          createdAt: "2026-02-16T12:00:00.000Z",
        },
      ],
    };
    await save(data, filePath);
    const result = await load(filePath);
    expect(result).toEqual(data);
  });
});
