// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { SymbolPicker } from "./symbol_picker.js";

const SPRITES = [
  {
    id: "maki-airport-11",
    group: "maki",
    sdf: true,
    svg: '<svg width="11px" height="11px" viewBox="0 0 11 11"><path fill="currentColor"></path></svg>',
  },
  {
    id: "maki-airport-15",
    group: "maki",
    sdf: true,
    svg: '<svg width="15px" height="15px" viewBox="0 0 15 15"><path fill="currentColor"></path></svg>',
  },
  { id: "geol_hatch_diagonal", group: "geology", sdf: false },
  { id: "t_b_lines_01", group: "pattern", sdf: false },
];

describe("SymbolPicker", () => {
  afterEach(() => {
    document.body.replaceChildren();
    document.head.replaceChildren();
    vi.restoreAllMocks();
  });

  it("stores and emits bare sprite ids", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);
    const onChange = vi.fn();
    const picker = new SymbolPicker({
      target,
      sprites: SPRITES,
      value: "none",
      getPreviewUrl: (id) => `/s3/style/v1/svg/${id}.svg`,
      onChange,
    });

    picker.open();
    document.querySelector('[aria-label="airport"]').click();

    expect(picker.getValue()).toBe("maki-airport-15");
    expect(onChange).toHaveBeenCalledWith("maki-airport-15");
    expect(target.textContent).toContain("maki-airport-15");
  });

  it("deduplicates Maki size variants and prefers the 15px id", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);
    const onChange = vi.fn();
    const picker = new SymbolPicker({
      target,
      sprites: SPRITES,
      value: "none",
      onChange,
    });

    picker.open();

    expect(document.querySelectorAll('[aria-label="airport"]')).toHaveLength(1);
    expect(
      document.querySelector('[title="airport (maki-airport-15)"]'),
    ).toBeTruthy();

    document.querySelector('[aria-label="airport"]').click();
    expect(picker.getValue()).toBe("maki-airport-15");
    expect(onChange).toHaveBeenCalledWith("maki-airport-15");
  });

  it("keeps an existing Maki 11px value selected", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);
    const picker = new SymbolPicker({
      target,
      sprites: SPRITES,
      value: "maki-airport-11",
    });

    picker.open();

    expect(
      document
        .querySelector('[aria-label="airport"]')
        .getAttribute("aria-pressed"),
    ).toBe("true");
    expect(picker.getValue()).toBe("maki-airport-11");
  });

  it("uses a FontAwesome icon for the clear button", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);
    new SymbolPicker({
      target,
      sprites: SPRITES,
      value: "maki-airport-11",
    });

    expect(
      target.querySelector(".mapx-symbol-picker-clear .fa.fa-times"),
    ).toBeTruthy();
  });

  it("filters with tabs and search", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);
    const picker = new SymbolPicker({
      target,
      sprites: SPRITES,
      groups: ["maki", "geology", "pattern"],
    });

    picker.open();
    document.querySelector('[data-group="geology"]').click();
    expect(
      document.querySelector('[aria-label="geol_hatch_diagonal"]'),
    ).toBeTruthy();
    expect(document.querySelector('[aria-label="airport"]')).toBeNull();

    document.querySelector('[data-group="all"]').click();
    const search = document.querySelector(".mapx-symbol-picker-search input");
    search.value = "lines";
    search.dispatchEvent(new Event("input", { bubbles: true }));

    expect(document.querySelector('[aria-label="t_b_lines_01"]')).toBeTruthy();
    expect(
      document.querySelector('[aria-label="geol_hatch_diagonal"]'),
    ).toBeNull();
  });

  it("keeps legacy ids visible when value is not in the metadata", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);
    const picker = new SymbolPicker({
      target,
      sprites: SPRITES,
      value: "old-symbol-id",
    });

    picker.open();

    expect(picker.getValue()).toBe("old-symbol-id");
    expect(document.querySelector('[aria-label="old-symbol-id"]')).toBeTruthy();
  });

  it("renders all filtered symbols without pagination", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);
    const sprites = Array.from({ length: 5 }, (_, index) => ({
      id: `t_b_lines_0${index}`,
      group: "pattern",
      sdf: false,
    }));
    const picker = new SymbolPicker({
      target,
      sprites,
    });

    picker.open();

    expect(document.querySelector('[aria-label="t_b_lines_00"]')).toBeTruthy();
    expect(document.querySelector('[aria-label="t_b_lines_02"]')).toBeTruthy();
    expect(document.querySelector('[aria-label="t_b_lines_04"]')).toBeTruthy();
    expect(picker.count.textContent).toBe("Showing 5 of 5 symbols");
  });
});
