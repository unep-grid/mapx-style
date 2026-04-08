import { describe, it, expect } from "vitest";
import { makePolygon, makeGrid, CELL, STEP } from "./sprite_demo.js";

// ── makePolygon ──────────────────────────────────────────────────────────────

describe("makePolygon", () => {
  it("returns 5 points (closed ring)", () => {
    const ring = makePolygon(0, 0);
    expect(ring).toHaveLength(5);
  });

  it("first and last points are equal (closed)", () => {
    const ring = makePolygon(1, 2);
    expect(ring[0]).toEqual(ring[4]);
  });

  it("bottom-left corner matches origin", () => {
    const ring = makePolygon(3, 4);
    expect(ring[0]).toEqual([3, 4]);
  });

  it("top-right corner is origin + CELL", () => {
    const ring = makePolygon(3, 4);
    expect(ring[2][0]).toBeCloseTo(3 + CELL);
    expect(ring[2][1]).toBeCloseTo(4 + CELL);
  });
});

// ── makeGrid — polygons ───────────────────────────────────────────────────────

const polyIcons = (n) =>
  Array.from({ length: n }, (_, i) => ({
    id: `pat_${i}`,
    group: "pattern",
    geometry: "Polygon",
  }));

const pointIcons = (n) =>
  Array.from({ length: n }, (_, i) => ({
    id: `icon_${i}`,
    group: "maki",
    geometry: "Point",
  }));

describe("makeGrid — polygons", () => {
  it("returns correct feature count", () => {
    const fc = makeGrid(polyIcons(7), [0, 0], 3);
    expect(fc.features).toHaveLength(7);
  });

  it("all features are Polygon type", () => {
    for (const f of makeGrid(polyIcons(5), [0, 0], 3).features) {
      expect(f.geometry.type).toBe("Polygon");
    }
  });

  it("polygon coordinates is an array wrapping a ring", () => {
    const f = makeGrid(polyIcons(1), [0, 0], 1).features[0];
    expect(Array.isArray(f.geometry.coordinates)).toBe(true);
    expect(f.geometry.coordinates).toHaveLength(1); // one ring
    expect(f.geometry.coordinates[0]).toHaveLength(5); // closed ring
  });

  it("properties carry id and group", () => {
    const f = makeGrid(polyIcons(1), [0, 0], 1).features[0];
    expect(f.properties.id).toBe("pat_0");
    expect(f.properties.group).toBe("pattern");
  });

  it("column wrapping: 5 icons in 3 cols → row 0 has 3, row 1 has 2", () => {
    const features = makeGrid(polyIcons(5), [0, 0], 3).features;
    // row 0: indices 0,1,2 → lat = 0; row 1: indices 3,4 → lat = STEP
    const row0 = features.filter((f) => Math.abs(f.geometry.coordinates[0][0][1] - 0) < 1e-9);
    const row1 = features.filter((f) => Math.abs(f.geometry.coordinates[0][0][1] - STEP) < 1e-9);
    expect(row0).toHaveLength(3);
    expect(row1).toHaveLength(2);
  });

  it("columns advance by STEP along longitude", () => {
    const features = makeGrid(polyIcons(3), [10, 20], 3).features;
    expect(features[0].geometry.coordinates[0][0][0]).toBeCloseTo(10);
    expect(features[1].geometry.coordinates[0][0][0]).toBeCloseTo(10 + STEP);
    expect(features[2].geometry.coordinates[0][0][0]).toBeCloseTo(10 + 2 * STEP);
  });
});

// ── makeGrid — points ─────────────────────────────────────────────────────────

describe("makeGrid — points", () => {
  it("returns correct feature count", () => {
    expect(makeGrid(pointIcons(9), [0, 0], 4).features).toHaveLength(9);
  });

  it("all features are Point type", () => {
    for (const f of makeGrid(pointIcons(4), [0, 0], 2).features) {
      expect(f.geometry.type).toBe("Point");
    }
  });

  it("point coordinates are centered in the cell", () => {
    const f = makeGrid(pointIcons(1), [0, 0], 1).features[0];
    expect(f.geometry.coordinates[0]).toBeCloseTo(CELL / 2);
    expect(f.geometry.coordinates[1]).toBeCloseTo(CELL / 2);
  });

  it("coordinates are [lon, lat] — not nested", () => {
    const f = makeGrid(pointIcons(1), [5, 10], 1).features[0];
    expect(f.geometry.coordinates).toHaveLength(2);
    expect(typeof f.geometry.coordinates[0]).toBe("number");
    expect(typeof f.geometry.coordinates[1]).toBe("number");
  });
});
