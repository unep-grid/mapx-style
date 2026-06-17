# @unep-grid/mapx-style

MapX style engine distributed through the public npm registry.

## Install

```sh
npm install @unep-grid/mapx-style
```

## Usage

```js
import { MapxStyle } from "@unep-grid/mapx-style";
```

## Standalone browser test

For a no-build HTML page, load the published bundle from npm through a CDN:

```html
<script type="module">
  import { MapxStyle } from "https://cdn.jsdelivr.net/npm/@unep-grid/mapx-style@latest/dist/mapx-style.esm.js";
</script>
```

The UMD bundle is also published:

```html
<script src="https://cdn.jsdelivr.net/npm/@unep-grid/mapx-style@latest/dist/mapx-style.umd.js"></script>
```

Load MapLibre GL JS separately and pass it to `MapxStyle` when creating an
interactive map. Pin a concrete package version instead of `latest` when you
need reproducible test pages.
