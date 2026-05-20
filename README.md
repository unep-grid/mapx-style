# mapx-style

Static style assets and the MapLibre style package for [MapX](https://mapx.org).

- Demo: https://unep-grid.github.io/mapx-style/
- Package: `@unep-grid/mapx-style`
- Developer guide: [DEVELOPERS.md](DEVELOPERS.md)

## Local Preview

```bash
npm install
npm run dev
```

## What's Here

- MapLibre base style JSON and themes
- Sprite, glyph, and font source metadata
- Build scripts for S3-hosted style assets and PMTiles layers
- A Vite demo app for previewing the style

Large generated assets are stored on S3 and are not committed. See
[DEVELOPERS.md](DEVELOPERS.md) for setup, build, release, data-source, and assisted workflow details.
