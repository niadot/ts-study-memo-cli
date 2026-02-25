import { describe, expect, it } from "vitest";
import { generateId } from "../src/utils/id.js";

describe("generateId", () => {
    it("ケース1: UUID v4 の形式に一致する", () => {
        const result = generateId();
        expect(result).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });
    it("ケース2: 2回呼ぶと異なる値が返る", () => {
        const result = generateId();
        const result2 = generateId();
        expect(result).not.toBe(result2);
    });
});