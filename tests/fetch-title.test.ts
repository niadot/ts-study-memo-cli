import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchTitle } from "../src/lib/fetch-title.js";

describe("fetchTitle", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns title from HTML", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        text: () =>
          Promise.resolve(
            "<html><head><title>テストタイトル</title></head></html>",
          ),
      } as Response),
    );
    const result = await fetchTitle("https://example.com");
    expect(result).toBe("テストタイトル");
  });

  it("returns URL when title is empty", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        text: () =>
          Promise.resolve("<html><head><title></title></head></html>"),
      } as Response),
    );
    const result = await fetchTitle("https://example.com");
    expect(result).toBe("https://example.com");
  });

  it("returns URL when fetch throws an error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network error")),
    );
    const result = await fetchTitle("https://example.com");
    expect(result).toBe("https://example.com");
  });
});
