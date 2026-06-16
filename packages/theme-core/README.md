# @unep-grid/mapx-style

MapX style engine distributed through GitHub Packages.

## Install

Configure npm to resolve the `@unep-grid` scope from GitHub Packages:

```ini
@unep-grid:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Then install the package:

```sh
npm install @unep-grid/mapx-style
```

GitHub Packages requires authentication for npm installs. Use a classic personal access token with `read:packages`, or `GITHUB_TOKEN` in GitHub Actions when the workflow has access to the package.

## Usage

```js
import { MapxStyle } from "@unep-grid/mapx-style";
```
