const fs = require("node:fs");

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

function writeJson(path, data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
}

const rootPkgPath = "package.json";
const themeCorePkgPath = "packages/theme-core/package.json";

const rootPkg = readJson(rootPkgPath);
const themeCorePkg = readJson(themeCorePkgPath);

if (!rootPkg.version) {
  throw new Error(`Missing version in ${rootPkgPath}`);
}

themeCorePkg.version = rootPkg.version;
writeJson(themeCorePkgPath, themeCorePkg);

console.log(`Synced ${themeCorePkgPath} version -> ${rootPkg.version}`);

