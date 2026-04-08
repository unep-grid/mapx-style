import { describe, it, expect } from "vitest";
import { themes } from "./index.js";

describe("themes", () => {
  it("exports exactly 8 themes", () => {
    expect(themes).toHaveLength(8);
  });

  it("each theme has id, label.en, colors", () => {
    for (const t of themes) {
      expect(typeof t.id).toBe("string");
      expect(typeof t.label?.en).toBe("string");
      expect(t.colors).toBeDefined();
      expect(typeof t.colors).toBe("object");
    }
  });

  it("ids are unique", () => {
    const ids = themes.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("expected ids are present", () => {
    const ids = themes.map((t) => t.id);
    for (const expected of [
      "classic_light", "classic_dark",
      "color_light",   "color_dark",
      "tree_light",    "tree_dark",
      "water_light",   "water_dark",
    ]) {
      expect(ids).toContain(expected);
    }
  });

  it("each theme colors object is non-empty", () => {
    for (const t of themes) {
      expect(Object.keys(t.colors).length).toBeGreaterThan(0);
    }
  });
});
