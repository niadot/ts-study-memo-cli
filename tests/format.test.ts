import { describe, expect, it } from "vitest";
import type { Memo } from "../src/lib/types.js";
import { formatMemo } from "../src/utils/format.js";

describe("formatMemo", () => {
  let testMemo: Memo;
  it("ケース1: 必須フィールドのみ", () => {
    testMemo = {
      id: "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx",
      url: "https://example.com",
      title: "Example Page",
      tags: [],
      createdAt: "2026-02-16T12:00:00.000Z",
    };
    const result = formatMemo(testMemo);
    expect(result).toBe(`[xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx] Example Page
  URL: https://example.com
  Date: 2026-02-16`);
  });
  it("ケース2: 全フィールドあり", () => {
    testMemo = {
      id: "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx",
      url: "https://example.com",
      title: "Example Page",
      description: "説明テスト",
      tags: ["Claude", "GenerativeAI"],
      createdAt: "2026-02-16T12:00:00.000Z",
      updatedAt: "2026-02-23T12:00:00.000Z",
    };
    const result = formatMemo(testMemo);
    expect(result).toBe(`[xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx] Example Page
  URL: https://example.com
  Desc: 説明テスト
  Tags: Claude, GenerativeAI
  Date: 2026-02-23`);
  });
  it("ケース3: descriptionのみあり", () => {
    testMemo = {
      id: "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx",
      url: "https://example.com",
      title: "Example Page",
      description: "説明テスト",
      tags: [],
      createdAt: "2026-02-16T12:00:00.000Z",
    };
    const result = formatMemo(testMemo);
    expect(result).toBe(`[xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx] Example Page
  URL: https://example.com
  Desc: 説明テスト
  Date: 2026-02-16`);
  });
  it("ケース4: tagsのみあり", () => {
    testMemo = {
      id: "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx",
      url: "https://example.com",
      title: "Example Page",
      tags: ["Claude", "GenerativeAI"],
      createdAt: "2026-02-16T12:00:00.000Z",
    };
    const result = formatMemo(testMemo);
    expect(result).toBe(`[xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx] Example Page
  URL: https://example.com
  Tags: Claude, GenerativeAI
  Date: 2026-02-16`);
  });
});
