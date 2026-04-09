/**
 * MapScaler — scales text-size and icon-size on all basemap layers.
 *
 * Uses a `["*", factor, size]` expression convention: any expression
 * matching `["*", number, ...]` is treated as scalable and its factor
 * is replaced in place.
 *
 * Usage:
 *   const scaler = new MapScaler(map);
 *   scaler.update(1.5, ["text", "icon"]); // scale text + icons to 1.5×
 *   scaler.text(2);                       // scale text only
 *   scaler.icon(0.8);                     // scale icons only
 */
export class MapScaler {
  constructor(map) {
    this._map = map;
    this._pending = null;
    this._render = this._render.bind(this);
    map.on("idle", this._render);
  }

  /**
   * Schedule a scale update. Runs immediately if the style is loaded,
   * otherwise deferred to the next idle event.
   * @param {number} [value=1] - Scale factor.
   * @param {string[]} [types=["text","icon"]] - Which sizes to scale.
   */
  update(value = 1, types = ["text", "icon"]) {
    this._pending = { value, types };
    if (this._map.isStyleLoaded()) {
      this._render();
    }
  }

  /** Scale text-size only. */
  text(value = 1) {
    return this.update(value, ["text"]);
  }

  /** Scale icon-size only. */
  icon(value = 1) {
    return this.update(value, ["icon"]);
  }

  /** Remove the idle listener (call when the map is removed). */
  destroy() {
    this._map.off("idle", this._render);
    this._map = null;
  }

  _render() {
    if (!this._pending || !this._map) return;
    const { value, types } = this._pending;
    this._pending = null;

    const scaleText = types.includes("text");
    const scaleIcon = types.includes("icon");
    const layers = this._map.getStyle().layers;

    for (const layer of layers) {
      if (!layer.layout) continue;
      if (scaleText && layer.layout["text-size"]) {
        const newSize = this._scaleExpr(layer.layout["text-size"], value);
        this._map.setLayoutProperty(layer.id, "text-size", newSize);
      }
      if (scaleIcon && layer.layout["icon-size"]) {
        const newSize = this._scaleExpr(layer.layout["icon-size"], value);
        this._map.setLayoutProperty(layer.id, "icon-size", newSize);
      }
    }
  }

  /** Replace the factor in `["*", number, ...]` expressions recursively. */
  _scaleExpr(expr, factor) {
    if (this._isScalable(expr)) {
      expr[2] = factor;
      return expr;
    }
    if (Array.isArray(expr)) {
      return expr.map((sub) => this._scaleExpr(sub, factor));
    }
    return expr;
  }

  /** True for `["*", number, anything]` — the scalable expression pattern. */
  _isScalable(expr) {
    return (
      Array.isArray(expr) &&
      expr.length === 3 &&
      expr[0] === "*" &&
      typeof expr[1] === "number"
    );
  }
}
