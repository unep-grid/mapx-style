/**
 * MapCompare — side-by-side map comparison with a draggable divider.
 *
 * mapA sits on top (z-index 2), clipped to the left of the divider.
 * mapB sits behind (z-index 1), always full-size, visible on the right.
 * Both maps stay view-synced via mutual "move" listeners.
 *
 * @example
 * const compare = new MapCompare(mapProd, mapDebug, {
 *   wrap:    document.getElementById("compare-wrap"),
 *   divider: document.getElementById("compare-divider"),
 *   labelB:  document.getElementById("label-debug"),
 * });
 * // on teardown:
 * compare.destroy();
 *
 * @param {object} mapA     - Foreground map (clipped left).
 * @param {object} mapB     - Background map (always full-size).
 * @param {object} opt
 * @param {HTMLElement} opt.wrap    - Container element for both maps.
 * @param {HTMLElement} opt.divider - Draggable divider element.
 */
export class MapCompare {
  constructor(mapA, mapB, { wrap, divider } = {}) {
    this._mapA    = mapA;
    this._mapB    = mapB;
    this._wrap    = wrap;
    this._divider = divider;
    this._dragging = false;
    this._syncing  = false;

    // ── Bound handlers (stored for removeEventListener)
    this._onResize     = () => this._setDivider(wrap.clientWidth / 2);
    this._onMouseMove  = (e) => { if (this._dragging) this._setDivider(e.clientX - wrap.getBoundingClientRect().left); };
    this._onTouchMove  = (e) => { if (this._dragging) this._setDivider(e.touches[0].clientX - wrap.getBoundingClientRect().left); };
    this._onMouseUp    = () => { this._dragging = false; };
    this._onTouchEnd   = () => { this._dragging = false; };
    this._onMouseDown  = (e) => { this._dragging = true; e.preventDefault(); };
    this._onTouchStart = (e) => { this._dragging = true; e.preventDefault(); };

    divider.addEventListener("mousedown",  this._onMouseDown);
    divider.addEventListener("touchstart", this._onTouchStart, { passive: false });
    window.addEventListener("mousemove",  this._onMouseMove);
    window.addEventListener("touchmove",  this._onTouchMove);
    window.addEventListener("mouseup",    this._onMouseUp);
    window.addEventListener("touchend",   this._onTouchEnd);
    window.addEventListener("resize",     this._onResize);

    // ── Map sync (mutual, with lock to prevent feedback loop)
    this._syncAtoB = this._makeSyncHandler(mapA, mapB);
    this._syncBtoA = this._makeSyncHandler(mapB, mapA);
    mapA.on("move", this._syncAtoB);
    mapB.on("move", this._syncBtoA);

    // ── Initial position
    this._setDivider(wrap.clientWidth / 2);
  }

  destroy() {
    this._divider.removeEventListener("mousedown",  this._onMouseDown);
    this._divider.removeEventListener("touchstart", this._onTouchStart);
    window.removeEventListener("mousemove",  this._onMouseMove);
    window.removeEventListener("touchmove",  this._onTouchMove);
    window.removeEventListener("mouseup",    this._onMouseUp);
    window.removeEventListener("touchend",   this._onTouchEnd);
    window.removeEventListener("resize",     this._onResize);
    this._mapA.off("move", this._syncAtoB);
    this._mapB.off("move", this._syncBtoA);
  }

  _setDivider(x) {
    const w = this._wrap.clientWidth;
    const clamped = Math.max(0, Math.min(w, x));
    this._mapA.getContainer().style.clipPath = `inset(0 ${w - clamped}px 0 0)`;
    this._divider.style.left = `${clamped}px`;
  }

  _makeSyncHandler(source, target) {
    return () => {
      if (this._syncing) return;
      this._syncing = true;
      target.jumpTo({
        center:  source.getCenter(),
        zoom:    source.getZoom(),
        bearing: source.getBearing(),
        pitch:   source.getPitch(),
      });
      this._syncing = false;
    };
  }
}
