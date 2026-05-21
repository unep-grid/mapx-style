/**
 * Pattern SVG generator for MapX fill styles.
 * Reads config.json (same dir) and writes SVGs to config.out resolved from repo root.
 *
 * Usage (from any directory):
 *   node scripts/patterns/index.cjs
 *   npm run build:patterns
 */
var fs = require('fs');
var textures = require('textures');
var d3 = require('d3');
var jsdom = require('jsdom');
var {JSDOM} = jsdom;
var path = require('path');

// Resolve config relative to this file, not CWD
var config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')));

// Resolve output dir relative to repo root (two dirs up from scripts/patterns/)
var outDirSvg = path.resolve(__dirname, '../../', config.out);

var patterns = [];

mkdirSync(outDirSvg);

/*
 * lines
 */
Object.keys(config.colors).forEach(function(c) {
  config.linesAngles.forEach(function(i) {
    var n = 0;
    config.linesStrokeWidth.forEach(function(j) {
      n++;
      var dynSize = Math.round(config.baseSize * config.linesSize[i]);
      var p = [
        {
          name: 't_' + c + '_lines_' + i + n,
          texture: textures
            .lines()
            .orientation(i + '/8')
            .size(dynSize)
            .strokeWidth(j)
            .stroke(config.colors[c])
        }
      ];
      patterns = patterns.concat(p);
    });
  });
});

/*
 * circles
 */
Object.keys(config.colors).forEach(function(c) {
  config.circlesRadius.forEach(function(i) {
    var p = [
      {
        name: 't_' + c + '_circles_a' + i,
        texture: textures
          .circles()
          .radius(i)
          .size(config.baseSize + 2)
          .stroke(config.colors[c])
          .fill(config.colors[c])
      },
      {
        name: 't_' + c + '_circles_b' + i,
        texture: textures
          .circles()
          .radius(i)
          .complement()
          .size(config.baseSize + 2)
          .stroke(config.colors[c])
          .fill(config.colors[c])
      }
    ];
    patterns = patterns.concat(p);
  });
});

/*
 * Paths
 */
Object.keys(config.colors).forEach(function(c) {
  config.pathsType.forEach(function(t) {
    config.pathsStrokeWidth.forEach(function(s) {
      var p = [
        {
          name: 't_' + c + '_' + t + '_0' + s,
          texture: textures
            .paths()
            .d(t)
            .size(10)
            .strokeWidth(s)
            .stroke(config.colors[c])
        }
      ];
      patterns = patterns.concat(p);
    });
  });
});

/*
 * Extract patterns to SVG files
 */
const dom = new JSDOM();
patterns.forEach(function(x) {
  var outFile = path.join(outDirSvg, x.name + '.svg');
  var window = dom.window;
  window.d3 = d3.select(window.document);
  var texture = window.d3.select('body').append('svg');
  texture.call(x.texture);
  var pat = texture.select('pattern');
  var size = pat.attr('width');
  var out = window.document.createElement('svg');
  out.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  out.setAttribute('version', '1.1');
  out.setAttribute('width', size);
  out.setAttribute('height', size);
  out.innerHTML = pat.html();
  fs.writeFileSync(outFile, out.outerHTML);
  out.remove();
  texture.remove();
  console.log(x.name);
});

function mkdirSync(dir) {
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (e) {}
}
