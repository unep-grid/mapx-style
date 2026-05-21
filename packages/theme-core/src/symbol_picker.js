import "./symbol_picker.css";

const NONE_ID = "none";
const GROUP_LABELS = {
  maki: "Maki",
  geology: "Geology",
  pattern: "Patterns",
  legacy: "Other",
};
const MAKI_SIZE_RE = /-(11|15)$/u;

export class SymbolPicker {
  constructor({
    target,
    sprites = [],
    value = NONE_ID,
    groups = [],
    getPreviewUrl,
    onChange,
  } = {}) {
    if (!target) {
      throw new Error("SymbolPicker requires a target element");
    }

    this.target = target;
    this.groups = Array.isArray(groups) ? groups.filter(Boolean) : [];
    this.getPreviewUrl =
      typeof getPreviewUrl === "function" ? getPreviewUrl : () => "";
    this.onChange = typeof onChange === "function" ? onChange : () => {};
    this.value = normalizeValue(value);
    this.search = "";
    this.activeGroup = "all";
    this.sprites = [];
    this.displaySprites = [];
    this.isOpen = false;

    this._onDocumentPointerDown = this._handleDocumentPointerDown.bind(this);
    this._onWindowResize = this._positionPopover.bind(this);
    this._onDocumentScroll = this._positionPopover.bind(this);
    this._onKeyDown = this._handleKeyDown.bind(this);

    this._build();
    this.setSprites(sprites);
    this.setValue(this.value);
  }

  setSprites(sprites = []) {
    const cleaned = sprites
      .filter((sprite) => sprite && sprite.id)
      .map((sprite) => ({ ...sprite, id: String(sprite.id) }));
    const byId = new Map(cleaned.map((sprite) => [sprite.id, sprite]));
    this.sprites = cleaned.sort(compareSprites);
    this.displaySprites = buildDisplaySprites(this.sprites);
    this._spriteById = byId;
    this._renderTabs();
    this._renderGrid();
    this._renderControl();
  }

  setValue(value) {
    this.value = normalizeValue(value);
    if (this.value !== NONE_ID && !this._spriteById?.has(this.value)) {
      const legacy = { id: this.value, group: "legacy" };
      this.sprites = [...this.sprites, legacy].sort(compareSprites);
      this.displaySprites = buildDisplaySprites(this.sprites);
      this._spriteById = new Map(
        this.sprites.map((sprite) => [sprite.id, sprite]),
      );
    }
    this._renderTabs();
    this._renderGrid();
    this._renderControl();
  }

  getValue() {
    return this.value || NONE_ID;
  }

  destroy() {
    this.close();
    this.root?.remove();
    this.popover?.remove();
    this.target = null;
  }

  open() {
    if (this.isOpen) {
      return;
    }
    this.isOpen = true;
    this.popover.hidden = false;
    this.button.setAttribute("aria-expanded", "true");
    this._positionPopover();
    this.searchInput.focus();
    document.addEventListener("pointerdown", this._onDocumentPointerDown);
    window.addEventListener("resize", this._onWindowResize);
    document.addEventListener("scroll", this._onDocumentScroll, true);
    document.addEventListener("keydown", this._onKeyDown);
  }

  close() {
    if (!this.isOpen) {
      return;
    }
    this.isOpen = false;
    this.popover.hidden = true;
    this.button.setAttribute("aria-expanded", "false");
    document.removeEventListener("pointerdown", this._onDocumentPointerDown);
    window.removeEventListener("resize", this._onWindowResize);
    document.removeEventListener("scroll", this._onDocumentScroll, true);
    document.removeEventListener("keydown", this._onKeyDown);
  }

  _build() {
    this.root = document.createElement("div");
    this.root.className = "mapx-symbol-picker";

    this.button = document.createElement("button");
    this.button.type = "button";
    this.button.className = "mapx-symbol-picker-control";
    this.button.setAttribute("aria-haspopup", "dialog");
    this.button.setAttribute("aria-expanded", "false");
    this.button.addEventListener("click", () => this.open());

    this.controlSwatch = document.createElement("span");
    this.controlSwatch.className = "mapx-symbol-picker-control-swatch";
    this.controlLabel = document.createElement("span");
    this.controlLabel.className = "mapx-symbol-picker-control-label";

    this.clearButton = document.createElement("button");
    this.clearButton.type = "button";
    this.clearButton.className = "mapx-symbol-picker-clear";
    this.clearButton.setAttribute("aria-label", "Clear symbol");
    const clearIcon = document.createElement("i");
    clearIcon.className = "fa fa-times";
    clearIcon.setAttribute("aria-hidden", "true");
    this.clearButton.appendChild(clearIcon);
    this.clearButton.addEventListener("click", (event) => {
      event.stopPropagation();
      this._select(NONE_ID);
    });

    this.button.append(this.controlSwatch, this.controlLabel, this.clearButton);
    this.root.appendChild(this.button);
    this.target.appendChild(this.root);

    this.popover = document.createElement("div");
    this.popover.className = "mapx-symbol-picker-popover";
    this.popover.hidden = true;
    this.popover.setAttribute("role", "dialog");

    const searchWrap = document.createElement("div");
    searchWrap.className = "mapx-symbol-picker-search";
    this.searchInput = document.createElement("input");
    this.searchInput.type = "search";
    this.searchInput.placeholder = "Search symbol";
    this.searchInput.autocomplete = "off";
    this.searchInput.addEventListener("input", () => {
      this.search = this.searchInput.value.trim().toLowerCase();
      this._renderGrid();
    });
    this.searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        const first = this._getVisibleSprites()[0];
        if (first) {
          event.preventDefault();
          this._select(first.id);
        }
      }
    });
    searchWrap.appendChild(this.searchInput);

    this.tabs = document.createElement("div");
    this.tabs.className = "mapx-symbol-picker-tabs";

    this.grid = document.createElement("div");
    this.grid.className = "mapx-symbol-picker-grid";

    this.footer = document.createElement("div");
    this.footer.className = "mapx-symbol-picker-footer";
    this.count = document.createElement("span");
    this.footer.append(this.count);

    this.popover.append(searchWrap, this.tabs, this.grid, this.footer);
    document.body.appendChild(this.popover);
  }

  _renderControl() {
    const sprite = this._spriteById?.get(this.value);
    this.controlSwatch.replaceChildren(this._buildPreview(this.value, sprite));
    this.controlLabel.textContent = this.value;
    this.clearButton.hidden = this.value === NONE_ID;
  }

  _renderTabs() {
    const groups = new Set(
      this.displaySprites.map((sprite) => sprite.group).filter(Boolean),
    );
    const tabGroups = [
      "all",
      ...this.groups.filter((group) => groups.has(group)),
    ];
    for (const group of groups) {
      if (!tabGroups.includes(group)) {
        tabGroups.push(group);
      }
    }
    if (!tabGroups.includes(this.activeGroup)) {
      this.activeGroup = "all";
    }

    this.tabs.replaceChildren();
    for (const group of tabGroups) {
      const tab = document.createElement("button");
      tab.type = "button";
      tab.className = "mapx-symbol-picker-tab";
      tab.textContent = getGroupLabel(group);
      tab.dataset.group = group;
      tab.setAttribute("aria-pressed", String(group === this.activeGroup));
      tab.addEventListener("click", () => {
        this.activeGroup = group;
        this._renderTabs();
        this._renderGrid();
      });
      this.tabs.appendChild(tab);
    }
  }

  _renderGrid() {
    const visible = this._getVisibleSprites();

    this.grid.replaceChildren();
    this.grid.appendChild(
      this._buildTile({ id: NONE_ID }, this.value === NONE_ID),
    );
    for (const sprite of visible) {
      this.grid.appendChild(this._buildTile(sprite, this._isSelected(sprite)));
    }

    this.count.textContent = `Showing ${visible.length} of ${visible.length} symbols`;
  }

  _buildTile(sprite, selected) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "mapx-symbol-picker-tile";
    const label = getSpriteLabel(sprite);
    button.title = sprite.id === NONE_ID ? NONE_ID : `${label} (${sprite.id})`;
    button.setAttribute("aria-label", label);
    button.setAttribute("aria-pressed", String(selected));
    button.appendChild(this._buildPreview(sprite.id, sprite));
    button.addEventListener("click", () => this._select(sprite.id));
    return button;
  }

  _buildPreview(id, sprite) {
    const swatch = document.createElement("span");
    swatch.className = "mapx-symbol-picker-swatch";
    if (isWhitePatternSymbol(id)) {
      swatch.classList.add("mapx-symbol-picker-swatch-white-pattern");
    }

    if (id === NONE_ID) {
      swatch.classList.add("mapx-symbol-picker-swatch-none");
      swatch.textContent = "-";
      return swatch;
    }

    if (sprite?.sdf && sprite.svg) {
      swatch.classList.add("mapx-symbol-picker-swatch-svg");
      swatch.innerHTML = sprite.svg;
      return swatch;
    }

    const url = this.getPreviewUrl(id, sprite);
    if (url) {
      const img = document.createElement("img");
      img.src = url;
      img.alt = "";
      img.loading = "lazy";
      swatch.appendChild(img);
      return swatch;
    }

    swatch.classList.add("mapx-symbol-picker-swatch-missing");
    swatch.textContent = "?";
    return swatch;
  }

  _getVisibleSprites() {
    return this.displaySprites.filter((sprite) => {
      if (this.activeGroup !== "all" && sprite.group !== this.activeGroup) {
        return false;
      }
      if (!this.search) {
        return true;
      }
      return `${sprite.id} ${sprite.group || ""} ${sprite.label || ""} ${
        sprite.variantIds?.join(" ") || ""
      }`
        .toLowerCase()
        .includes(this.search);
    });
  }

  _isSelected(sprite) {
    return sprite.id === this.value || sprite.variantIds?.includes(this.value);
  }

  _select(value) {
    const normalized = normalizeValue(value);
    this.setValue(normalized);
    this.onChange(normalized);
    this.close();
  }

  _positionPopover() {
    if (!this.isOpen) {
      return;
    }
    const rect = this.button.getBoundingClientRect();
    const margin = 16;
    const width = Math.min(680, window.innerWidth - margin * 2);
    const left = Math.max(
      margin,
      Math.min(rect.left, window.innerWidth - width - margin),
    );
    const bottomTop = rect.bottom + 8;
    const popoverHeight = Math.min(640, window.innerHeight * 0.72);
    const top =
      bottomTop + popoverHeight > window.innerHeight - margin
        ? Math.max(margin, rect.top - popoverHeight - 8)
        : bottomTop;

    this.popover.style.left = `${left}px`;
    this.popover.style.top = `${top}px`;
    this.popover.style.width = `${width}px`;
    this.popover.style.maxHeight = `${popoverHeight}px`;
  }

  _handleDocumentPointerDown(event) {
    if (
      this.root.contains(event.target) ||
      this.popover.contains(event.target)
    ) {
      return;
    }
    this.close();
  }

  _handleKeyDown(event) {
    if (event.key === "Escape") {
      this.close();
      this.button.focus();
    }
  }
}

function normalizeValue(value) {
  return value ? String(value) : NONE_ID;
}

function compareSprites(a, b) {
  return a.id.localeCompare(b.id);
}

function buildDisplaySprites(sprites) {
  const out = [];
  const makiGroups = new Map();

  for (const sprite of sprites) {
    const base = getMakiBaseId(sprite.id);
    if (!base) {
      out.push({ ...sprite, label: sprite.id });
      continue;
    }
    if (!makiGroups.has(base)) {
      makiGroups.set(base, []);
    }
    makiGroups.get(base).push(sprite);
  }

  for (const [base, variants] of makiGroups) {
    const preferred =
      variants.find((sprite) => sprite.id === `${base}-15`) || variants[0];
    out.push({
      ...preferred,
      label: base.replace(/^maki-/u, ""),
      variantIds: variants.map((sprite) => sprite.id),
    });
  }

  return out.sort(compareSprites);
}

function getMakiBaseId(id) {
  if (!id?.startsWith("maki-") || !MAKI_SIZE_RE.test(id)) {
    return null;
  }
  return id.replace(MAKI_SIZE_RE, "");
}

function getSpriteLabel(sprite) {
  if (sprite.id === NONE_ID) {
    return NONE_ID;
  }
  return sprite.label || sprite.id;
}

function isWhitePatternSymbol(id) {
  return typeof id === "string" && id.startsWith("t_w_");
}

function getGroupLabel(group) {
  if (group === "all") {
    return "All";
  }
  return GROUP_LABELS[group] || group;
}
