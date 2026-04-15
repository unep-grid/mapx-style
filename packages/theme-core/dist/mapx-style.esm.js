var Xi = Object.defineProperty;
var Vi = (e, t, i) => t in e ? Xi(e, t, { enumerable: !0, configurable: !0, writable: !0, value: i }) : e[t] = i;
var X = (e, t, i) => Vi(e, typeof t != "symbol" ? t + "" : t, i);
var K = Uint8Array, xe = Uint16Array, Wi = Int32Array, Qt = new K([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  2,
  2,
  3,
  3,
  3,
  3,
  4,
  4,
  4,
  4,
  5,
  5,
  5,
  5,
  0,
  /* unused */
  0,
  0,
  /* impossible */
  0
]), ei = new K([
  0,
  0,
  0,
  0,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  4,
  5,
  5,
  6,
  6,
  7,
  7,
  8,
  8,
  9,
  9,
  10,
  10,
  11,
  11,
  12,
  12,
  13,
  13,
  /* unused */
  0,
  0
]), qi = new K([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), ti = function(e, t) {
  for (var i = new xe(31), o = 0; o < 31; ++o)
    i[o] = t += 1 << e[o - 1];
  for (var r = new Wi(i[30]), o = 1; o < 30; ++o)
    for (var a = i[o]; a < i[o + 1]; ++a)
      r[a] = a - i[o] << 5 | o;
  return { b: i, r };
}, ii = ti(Qt, 2), oi = ii.b, Ji = ii.r;
oi[28] = 258, Ji[258] = 28;
var Qi = ti(ei, 0), eo = Qi.b, nt = new xe(32768);
for (var C = 0; C < 32768; ++C) {
  var _e = (C & 43690) >> 1 | (C & 21845) << 1;
  _e = (_e & 52428) >> 2 | (_e & 13107) << 2, _e = (_e & 61680) >> 4 | (_e & 3855) << 4, nt[C] = ((_e & 65280) >> 8 | (_e & 255) << 8) >> 1;
}
var Me = function(e, t, i) {
  for (var o = e.length, r = 0, a = new xe(t); r < o; ++r)
    e[r] && ++a[e[r] - 1];
  var l = new xe(t);
  for (r = 1; r < t; ++r)
    l[r] = l[r - 1] + a[r - 1] << 1;
  var n;
  if (i) {
    n = new xe(1 << t);
    var s = 15 - t;
    for (r = 0; r < o; ++r)
      if (e[r])
        for (var c = r << 4 | e[r], u = t - e[r], b = l[e[r] - 1]++ << u, _ = b | (1 << u) - 1; b <= _; ++b)
          n[nt[b] >> s] = c;
  } else
    for (n = new xe(o), r = 0; r < o; ++r)
      e[r] && (n[r] = nt[l[e[r] - 1]++] >> 15 - e[r]);
  return n;
}, je = new K(288);
for (var C = 0; C < 144; ++C)
  je[C] = 8;
for (var C = 144; C < 256; ++C)
  je[C] = 9;
for (var C = 256; C < 280; ++C)
  je[C] = 7;
for (var C = 280; C < 288; ++C)
  je[C] = 8;
var ri = new K(32);
for (var C = 0; C < 32; ++C)
  ri[C] = 5;
var to = /* @__PURE__ */ Me(je, 9, 1), io = /* @__PURE__ */ Me(ri, 5, 1), Xe = function(e) {
  for (var t = e[0], i = 1; i < e.length; ++i)
    e[i] > t && (t = e[i]);
  return t;
}, ee = function(e, t, i) {
  var o = t / 8 | 0;
  return (e[o] | e[o + 1] << 8) >> (t & 7) & i;
}, Ve = function(e, t) {
  var i = t / 8 | 0;
  return (e[i] | e[i + 1] << 8 | e[i + 2] << 16) >> (t & 7);
}, oo = function(e) {
  return (e + 7) / 8 | 0;
}, ro = function(e, t, i) {
  return (i == null || i > e.length) && (i = e.length), new K(e.subarray(t, i));
}, ao = [
  "unexpected EOF",
  "invalid block type",
  "invalid length/literal",
  "invalid distance",
  "stream finished",
  "no stream handler",
  ,
  "no callback",
  "invalid UTF-8 data",
  "extra field too long",
  "date not in range 1980-2099",
  "filename too long",
  "stream finishing",
  "invalid zip data"
  // determined by unknown compression method
], F = function(e, t, i) {
  var o = new Error(t || ao[e]);
  if (o.code = e, Error.captureStackTrace && Error.captureStackTrace(o, F), !i)
    throw o;
  return o;
}, ut = function(e, t, i, o) {
  var r = e.length, a = 0;
  if (!r || t.f && !t.l)
    return i || new K(0);
  var l = !i, n = l || t.i != 2, s = t.i;
  l && (i = new K(r * 3));
  var c = function(Rt) {
    var Mt = i.length;
    if (Rt > Mt) {
      var At = new K(Math.max(Mt * 2, Rt));
      At.set(i), i = At;
    }
  }, u = t.f || 0, b = t.p || 0, _ = t.b || 0, p = t.l, v = t.d, x = t.m, g = t.n, h = r * 8;
  do {
    if (!p) {
      u = ee(e, b, 1);
      var P = ee(e, b + 1, 3);
      if (b += 3, P)
        if (P == 1)
          p = to, v = io, x = 9, g = 5;
        else if (P == 2) {
          var H = ee(e, b, 31) + 257, E = ee(e, b + 10, 15) + 4, m = H + ee(e, b + 5, 31) + 1;
          b += 14;
          for (var y = new K(m), k = new K(19), f = 0; f < E; ++f)
            k[qi[f]] = ee(e, b + f * 3, 7);
          b += E * 3;
          for (var R = Xe(k), w = (1 << R) - 1, D = Me(k, R, 1), f = 0; f < m; ) {
            var J = D[ee(e, b, w)];
            b += J & 15;
            var A = J >> 4;
            if (A < 16)
              y[f++] = A;
            else {
              var Q = 0, oe = 0;
              for (A == 16 ? (oe = 3 + ee(e, b, 3), b += 2, Q = y[f - 1]) : A == 17 ? (oe = 3 + ee(e, b, 7), b += 3) : A == 18 && (oe = 11 + ee(e, b, 127), b += 7); oe--; )
                y[f++] = Q;
            }
          }
          var de = y.subarray(0, H), re = y.subarray(H);
          x = Xe(de), g = Xe(re), p = Me(de, x, 1), v = Me(re, g, 1);
        } else
          F(1);
      else {
        var A = oo(b) + 4, T = e[A - 4] | e[A - 3] << 8, I = A + T;
        if (I > r) {
          s && F(0);
          break;
        }
        n && c(_ + T), i.set(e.subarray(A, I), _), t.b = _ += T, t.p = b = I * 8, t.f = u;
        continue;
      }
      if (b > h) {
        s && F(0);
        break;
      }
    }
    n && c(_ + 131072);
    for (var $t = (1 << x) - 1, Ze = (1 << g) - 1, Ee = b; ; Ee = b) {
      var Q = p[Ve(e, b) & $t], ae = Q >> 4;
      if (b += Q & 15, b > h) {
        s && F(0);
        break;
      }
      if (Q || F(2), ae < 256)
        i[_++] = ae;
      else if (ae == 256) {
        Ee = b, p = null;
        break;
      } else {
        var Lt = ae - 254;
        if (ae > 264) {
          var f = ae - 257, Ne = Qt[f];
          Lt = ee(e, b, (1 << Ne) - 1) + oi[f], b += Ne;
        }
        var Fe = v[Ve(e, b) & Ze], Ke = Fe >> 4;
        Fe || F(3), b += Fe & 15;
        var re = eo[Ke];
        if (Ke > 3) {
          var Ne = ei[Ke];
          re += Ve(e, b) & (1 << Ne) - 1, b += Ne;
        }
        if (b > h) {
          s && F(0);
          break;
        }
        n && c(_ + 131072);
        var Et = _ + Lt;
        if (_ < re) {
          var Nt = a - re, Ki = Math.min(re, Et);
          for (Nt + _ < 0 && F(3); _ < Ki; ++_)
            i[_] = o[Nt + _];
        }
        for (; _ < Et; ++_)
          i[_] = i[_ - re];
      }
    }
    t.l = p, t.p = Ee, t.b = _, t.f = u, p && (u = 1, t.m = x, t.d = v, t.n = g);
  } while (!u);
  return _ != i.length && l ? ro(i, 0, _) : i.subarray(0, _);
}, lo = /* @__PURE__ */ new K(0), no = function(e) {
  (e[0] != 31 || e[1] != 139 || e[2] != 8) && F(6, "invalid gzip data");
  var t = e[3], i = 10;
  t & 4 && (i += (e[10] | e[11] << 8) + 2);
  for (var o = (t >> 3 & 1) + (t >> 4 & 1); o > 0; o -= !e[i++])
    ;
  return i + (t & 2);
}, so = function(e) {
  var t = e.length;
  return (e[t - 4] | e[t - 3] << 8 | e[t - 2] << 16 | e[t - 1] << 24) >>> 0;
}, co = function(e, t) {
  return ((e[0] & 15) != 8 || e[0] >> 4 > 7 || (e[0] << 8 | e[1]) % 31) && F(6, "invalid zlib data"), (e[1] >> 5 & 1) == 1 && F(6, "invalid zlib data: " + (e[1] & 32 ? "need" : "unexpected") + " dictionary"), (e[1] >> 3 & 4) + 2;
};
function bo(e, t) {
  return ut(e, { i: 2 }, t, t);
}
function _o(e, t) {
  var i = no(e);
  return i + 8 > e.length && F(6, "invalid gzip data"), ut(e.subarray(i, -8), { i: 2 }, new K(so(e)), t);
}
function uo(e, t) {
  return ut(e.subarray(co(e), -4), { i: 2 }, t, t);
}
function mo(e, t) {
  return e[0] == 31 && e[1] == 139 && e[2] == 8 ? _o(e, t) : (e[0] & 15) != 8 || e[0] >> 4 > 7 || (e[0] << 8 | e[1]) % 31 ? bo(e, t) : uo(e, t);
}
var po = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), fo = 0;
try {
  po.decode(lo, { stream: !0 }), fo = 1;
} catch {
}
var go = Object.defineProperty, yo = Math.pow, j = (e, t) => go(e, "name", { value: t, configurable: !0 }), U = (e, t, i) => new Promise((o, r) => {
  var a = (s) => {
    try {
      n(i.next(s));
    } catch (c) {
      r(c);
    }
  }, l = (s) => {
    try {
      n(i.throw(s));
    } catch (c) {
      r(c);
    }
  }, n = (s) => s.done ? o(s.value) : Promise.resolve(s.value).then(a, l);
  n((i = i.apply(e, t)).next());
});
j((e, t) => {
  let i = !1, o = "", r = L.GridLayer.extend({ createTile: j((a, l) => {
    let n = document.createElement("img"), s = new AbortController(), c = s.signal;
    return n.cancel = () => {
      s.abort();
    }, i || (e.getHeader().then((u) => {
      u.tileType === 1 ? console.error("Error: archive contains MVT vector tiles, but leafletRasterLayer is for displaying raster tiles. See https://github.com/protomaps/PMTiles/tree/main/js for details.") : u.tileType === 2 ? o = "image/png" : u.tileType === 3 ? o = "image/jpeg" : u.tileType === 4 ? o = "image/webp" : u.tileType === 5 && (o = "image/avif");
    }), i = !0), e.getZxy(a.z, a.x, a.y, c).then((u) => {
      if (u) {
        let b = new Blob([u.data], { type: o }), _ = window.URL.createObjectURL(b);
        n.src = _;
      } else n.style.display = "none";
      n.cancel = void 0, l(void 0, n);
    }).catch((u) => {
      if (u.name !== "AbortError") throw u;
    }), n;
  }, "createTile"), _removeTile: j(function(a) {
    let l = this._tiles[a];
    l && (l.el.cancel && l.el.cancel(), l.el.width = 0, l.el.height = 0, l.el.deleted = !0, L.DomUtil.remove(l.el), delete this._tiles[a], this.fire("tileunload", { tile: l.el, coords: this._keyToTileCoords(a) }));
  }, "_removeTile") });
  return new r(t);
}, "leafletRasterLayer");
var ho = j((e) => (t, i) => {
  if (i instanceof AbortController) return e(t, i);
  let o = new AbortController();
  return e(t, o).then((r) => i(void 0, r.data, r.cacheControl || "", r.expires || ""), (r) => i(r)).catch((r) => i(r)), { cancel: j(() => o.abort(), "cancel") };
}, "v3compat"), ai = class {
  constructor(t) {
    this.tilev4 = j((i, o) => U(this, null, function* () {
      if (i.type === "json") {
        let p = i.url.substr(10), v = this.tiles.get(p);
        if (v || (v = new jt(p), this.tiles.set(p, v)), this.metadata) {
          let g = yield v.getTileJson(i.url);
          return o.signal.throwIfAborted(), { data: g };
        }
        let x = yield v.getHeader();
        return o.signal.throwIfAborted(), (x.minLon >= x.maxLon || x.minLat >= x.maxLat) && console.error(`Bounds of PMTiles archive ${x.minLon},${x.minLat},${x.maxLon},${x.maxLat} are not valid.`), { data: { tiles: [`${i.url}/{z}/{x}/{y}`], minzoom: x.minZoom, maxzoom: x.maxZoom, bounds: [x.minLon, x.minLat, x.maxLon, x.maxLat] } };
      }
      let r = new RegExp(/pmtiles:\/\/(.+)\/(\d+)\/(\d+)\/(\d+)/), a = i.url.match(r);
      if (!a) throw new Error("Invalid PMTiles protocol URL");
      let l = a[1], n = this.tiles.get(l);
      n || (n = new jt(l), this.tiles.set(l, n));
      let s = a[2], c = a[3], u = a[4], b = yield n.getHeader(), _ = yield n == null ? void 0 : n.getZxy(+s, +c, +u, o.signal);
      if (o.signal.throwIfAborted(), _) return { data: new Uint8Array(_.data), cacheControl: _.cacheControl, expires: _.expires };
      if (b.tileType === 1) {
        if (this.errorOnMissingTile) throw new Error("Tile not found.");
        return { data: new Uint8Array() };
      }
      return { data: null };
    }), "tilev4"), this.tile = ho(this.tilev4), this.tiles = /* @__PURE__ */ new Map(), this.metadata = (t == null ? void 0 : t.metadata) || !1, this.errorOnMissingTile = (t == null ? void 0 : t.errorOnMissingTile) || !1;
  }
  add(t) {
    this.tiles.set(t.source.getKey(), t);
  }
  get(t) {
    return this.tiles.get(t);
  }
};
j(ai, "Protocol");
var vo = ai;
function li(e, t) {
  return (t >>> 0) * 4294967296 + (e >>> 0);
}
j(li, "toNum");
function ni(e, t) {
  let i = t.buf, o = i[t.pos++], r = (o & 112) >> 4;
  if (o < 128 || (o = i[t.pos++], r |= (o & 127) << 3, o < 128) || (o = i[t.pos++], r |= (o & 127) << 10, o < 128) || (o = i[t.pos++], r |= (o & 127) << 17, o < 128) || (o = i[t.pos++], r |= (o & 127) << 24, o < 128) || (o = i[t.pos++], r |= (o & 1) << 31, o < 128)) return li(e, r);
  throw new Error("Expected varint not more than 10 bytes");
}
j(ni, "readVarintRemainder");
function ve(e) {
  let t = e.buf, i = t[e.pos++], o = i & 127;
  return i < 128 || (i = t[e.pos++], o |= (i & 127) << 7, i < 128) || (i = t[e.pos++], o |= (i & 127) << 14, i < 128) || (i = t[e.pos++], o |= (i & 127) << 21, i < 128) ? o : (i = t[e.pos], o |= (i & 15) << 28, ni(o, e));
}
j(ve, "readVarint");
function mt(e, t, i, o, r) {
  return r === 0 ? o !== 0 ? [e - 1 - i, e - 1 - t] : [i, t] : [t, i];
}
j(mt, "rotate");
function si(e, t, i) {
  if (e > 26) throw new Error("Tile zoom level exceeds max safe number limit (26)");
  if (t >= 1 << e || i >= 1 << e) throw new Error("tile x/y outside zoom level bounds");
  let o = ((1 << e) * (1 << e) - 1) / 3, r = e - 1, [a, l] = [t, i];
  for (let n = 1 << r; n > 0; n >>= 1) {
    let s = a & n, c = l & n;
    o += (3 * s ^ c) * (1 << r), [a, l] = mt(n, a, l, s, c), r--;
  }
  return o;
}
j(si, "zxyToTileId");
function ci(e) {
  let t = 3 * e + 1;
  return t < 4294967296 ? 31 - Math.clz32(t) : 63 - Math.clz32(t / 4294967296);
}
j(ci, "tileIdToZ");
function xo(e) {
  let t = ci(e) >> 1;
  if (t > 26) throw new Error("Tile zoom level exceeds max safe number limit (26)");
  let i = ((1 << t) * (1 << t) - 1) / 3, o = e - i, r = 0, a = 0, l = 1 << t;
  for (let n = 1; n < l; n <<= 1) {
    let s = n & o / 2, c = n & (o ^ s);
    [r, a] = mt(n, r, a, s, c), o = o / 2, r += s, a += c;
  }
  return [t, r, a];
}
j(xo, "tileIdToZxy");
var wo = ((e) => (e[e.Unknown = 0] = "Unknown", e[e.None = 1] = "None", e[e.Gzip = 2] = "Gzip", e[e.Brotli = 3] = "Brotli", e[e.Zstd = 4] = "Zstd", e))(wo || {});
function De(e, t) {
  return U(this, null, function* () {
    if (t === 1 || t === 0) return e;
    if (t === 2) {
      if (typeof globalThis.DecompressionStream > "u") return mo(new Uint8Array(e));
      let i = new Response(e).body;
      if (!i) throw new Error("Failed to read response stream");
      let o = i.pipeThrough(new globalThis.DecompressionStream("gzip"));
      return new Response(o).arrayBuffer();
    }
    throw new Error("Compression method not supported");
  });
}
j(De, "defaultDecompress");
var ko = ((e) => (e[e.Unknown = 0] = "Unknown", e[e.Mvt = 1] = "Mvt", e[e.Png = 2] = "Png", e[e.Jpeg = 3] = "Jpeg", e[e.Webp = 4] = "Webp", e[e.Avif = 5] = "Avif", e[e.Mlt = 6] = "Mlt", e))(ko || {});
function bi(e) {
  return e === 1 ? ".mvt" : e === 2 ? ".png" : e === 3 ? ".jpg" : e === 4 ? ".webp" : e === 5 ? ".avif" : e === 6 ? ".mlt" : "";
}
j(bi, "tileTypeExt");
var zo = 127;
function _i(e, t) {
  let i = 0, o = e.length - 1;
  for (; i <= o; ) {
    let r = o + i >> 1, a = t - e[r].tileId;
    if (a > 0) i = r + 1;
    else if (a < 0) o = r - 1;
    else return e[r];
  }
  return o >= 0 && (e[o].runLength === 0 || t - e[o].tileId < e[o].runLength) ? e[o] : null;
}
j(_i, "findTile");
var So = class {
  constructor(t) {
    this.file = t;
  }
  getKey() {
    return this.file.name;
  }
  getBytes(t, i) {
    return U(this, null, function* () {
      return { data: yield this.file.slice(t, t + i).arrayBuffer() };
    });
  }
};
j(So, "FileSource");
var ui = class {
  constructor(t, i = new Headers()) {
    var o, r;
    this.url = t, this.customHeaders = i, this.mustReload = !1;
    let a = "";
    "navigator" in globalThis && (a = (r = (o = globalThis.navigator) == null ? void 0 : o.userAgent) != null ? r : "");
    let l = a.indexOf("Windows") > -1, n = /Chrome|Chromium|Edg|OPR|Brave/.test(a);
    this.chromeWindowsNoCache = !1, l && n && (this.chromeWindowsNoCache = !0);
  }
  getKey() {
    return this.url;
  }
  setHeaders(t) {
    this.customHeaders = t;
  }
  getBytes(t, i, o, r) {
    return U(this, null, function* () {
      let a, l;
      o ? l = o : (a = new AbortController(), l = a.signal);
      let n = new Headers(this.customHeaders);
      n.set("range", `bytes=${t}-${t + i - 1}`);
      let s;
      this.mustReload ? s = "reload" : this.chromeWindowsNoCache && (s = "no-store");
      let c = yield fetch(this.url, { signal: l, cache: s, headers: n });
      if (t === 0 && c.status === 416) {
        let _ = c.headers.get("Content-Range");
        if (!_ || !_.startsWith("bytes */")) throw new Error("Missing content-length on 416 response");
        let p = +_.substr(8);
        c = yield fetch(this.url, { signal: l, cache: "reload", headers: { range: `bytes=0-${p - 1}` } });
      }
      let u = c.headers.get("Etag");
      if (u != null && u.startsWith("W/") && (u = null), c.status === 416 || r && u && u !== r) throw this.mustReload = !0, new st(`Server returned non-matching ETag ${r} after one retry. Check browser extensions and servers for issues that may affect correct ETag headers.`);
      if (c.status >= 300) throw new Error(`Bad response code: ${c.status}`);
      let b = c.headers.get("Content-Length");
      if (c.status === 200 && (!b || +b > i)) throw a && a.abort(), new Error("Server returned no content-length header or content-length exceeding request. Check that your storage backend supports HTTP Byte Serving.");
      return { data: yield c.arrayBuffer(), etag: u || void 0, cacheControl: c.headers.get("Cache-Control") || void 0, expires: c.headers.get("Expires") || void 0 };
    });
  }
};
j(ui, "FetchSource");
var $o = ui;
function V(e, t) {
  let i = e.getUint32(t + 4, !0), o = e.getUint32(t + 0, !0);
  return i * yo(2, 32) + o;
}
j(V, "getUint64");
function mi(e, t) {
  let i = new DataView(e), o = i.getUint8(7);
  if (o > 3) throw new Error(`Archive is spec version ${o} but this library supports up to spec version 3`);
  return { specVersion: o, rootDirectoryOffset: V(i, 8), rootDirectoryLength: V(i, 16), jsonMetadataOffset: V(i, 24), jsonMetadataLength: V(i, 32), leafDirectoryOffset: V(i, 40), leafDirectoryLength: V(i, 48), tileDataOffset: V(i, 56), tileDataLength: V(i, 64), numAddressedTiles: V(i, 72), numTileEntries: V(i, 80), numTileContents: V(i, 88), clustered: i.getUint8(96) === 1, internalCompression: i.getUint8(97), tileCompression: i.getUint8(98), tileType: i.getUint8(99), minZoom: i.getUint8(100), maxZoom: i.getUint8(101), minLon: i.getInt32(102, !0) / 1e7, minLat: i.getInt32(106, !0) / 1e7, maxLon: i.getInt32(110, !0) / 1e7, maxLat: i.getInt32(114, !0) / 1e7, centerZoom: i.getUint8(118), centerLon: i.getInt32(119, !0) / 1e7, centerLat: i.getInt32(123, !0) / 1e7, etag: t };
}
j(mi, "bytesToHeader");
function dt(e) {
  let t = { buf: new Uint8Array(e), pos: 0 }, i = ve(t), o = [], r = 0;
  for (let a = 0; a < i; a++) {
    let l = ve(t);
    o.push({ tileId: r + l, offset: 0, length: 0, runLength: 1 }), r += l;
  }
  for (let a = 0; a < i; a++) o[a].runLength = ve(t);
  for (let a = 0; a < i; a++) o[a].length = ve(t);
  for (let a = 0; a < i; a++) {
    let l = ve(t);
    l === 0 && a > 0 ? o[a].offset = o[a - 1].offset + o[a - 1].length : o[a].offset = l - 1;
  }
  return o;
}
j(dt, "deserializeIndex");
var di = class extends Error {
};
j(di, "EtagMismatch");
var st = di;
function pt(e, t) {
  return U(this, null, function* () {
    let i = yield e.getBytes(0, 16384);
    if (new DataView(i.data).getUint16(0, !0) !== 19792) throw new Error("Wrong magic number for PMTiles archive");
    let o = i.data.slice(0, zo), r = mi(o, i.etag), a = i.data.slice(r.rootDirectoryOffset, r.rootDirectoryOffset + r.rootDirectoryLength), l = `${e.getKey()}|${r.etag || ""}|${r.rootDirectoryOffset}|${r.rootDirectoryLength}`, n = dt(yield t(a, r.internalCompression));
    return [r, [l, n.length, n]];
  });
}
j(pt, "getHeaderAndRoot");
function ft(e, t, i, o, r) {
  return U(this, null, function* () {
    let a = yield e.getBytes(i, o, void 0, r.etag), l = yield t(a.data, r.internalCompression), n = dt(l);
    if (n.length === 0) throw new Error("Empty directory is invalid");
    return n;
  });
}
j(ft, "getDirectory");
var Lo = class {
  constructor(t = 100, i = !0, o = De) {
    this.cache = /* @__PURE__ */ new Map(), this.maxCacheEntries = t, this.counter = 1, this.decompress = o;
  }
  getHeader(t) {
    return U(this, null, function* () {
      let i = t.getKey(), o = this.cache.get(i);
      if (o) return o.lastUsed = this.counter++, o.data;
      let r = yield pt(t, this.decompress);
      return r[1] && this.cache.set(r[1][0], { lastUsed: this.counter++, data: r[1][2] }), this.cache.set(i, { lastUsed: this.counter++, data: r[0] }), this.prune(), r[0];
    });
  }
  getDirectory(t, i, o, r) {
    return U(this, null, function* () {
      let a = `${t.getKey()}|${r.etag || ""}|${i}|${o}`, l = this.cache.get(a);
      if (l) return l.lastUsed = this.counter++, l.data;
      let n = yield ft(t, this.decompress, i, o, r);
      return this.cache.set(a, { lastUsed: this.counter++, data: n }), this.prune(), n;
    });
  }
  prune() {
    if (this.cache.size > this.maxCacheEntries) {
      let t = 1 / 0, i;
      this.cache.forEach((o, r) => {
        o.lastUsed < t && (t = o.lastUsed, i = r);
      }), i && this.cache.delete(i);
    }
  }
  invalidate(t) {
    return U(this, null, function* () {
      this.cache.delete(t.getKey());
    });
  }
};
j(Lo, "ResolvedValueCache");
var pi = class {
  constructor(t = 100, i = !0, o = De) {
    this.cache = /* @__PURE__ */ new Map(), this.invalidations = /* @__PURE__ */ new Map(), this.maxCacheEntries = t, this.counter = 1, this.decompress = o;
  }
  getHeader(t) {
    return U(this, null, function* () {
      let i = t.getKey(), o = this.cache.get(i);
      if (o) return o.lastUsed = this.counter++, yield o.data;
      let r = new Promise((a, l) => {
        pt(t, this.decompress).then((n) => {
          n[1] && this.cache.set(n[1][0], { lastUsed: this.counter++, data: Promise.resolve(n[1][2]) }), a(n[0]), this.prune();
        }).catch((n) => {
          l(n);
        });
      });
      return this.cache.set(i, { lastUsed: this.counter++, data: r }), r;
    });
  }
  getDirectory(t, i, o, r) {
    return U(this, null, function* () {
      let a = `${t.getKey()}|${r.etag || ""}|${i}|${o}`, l = this.cache.get(a);
      if (l) return l.lastUsed = this.counter++, yield l.data;
      let n = new Promise((s, c) => {
        ft(t, this.decompress, i, o, r).then((u) => {
          s(u), this.prune();
        }).catch((u) => {
          c(u);
        });
      });
      return this.cache.set(a, { lastUsed: this.counter++, data: n }), n;
    });
  }
  prune() {
    if (this.cache.size >= this.maxCacheEntries) {
      let t = 1 / 0, i;
      this.cache.forEach((o, r) => {
        o.lastUsed < t && (t = o.lastUsed, i = r);
      }), i && this.cache.delete(i);
    }
  }
  invalidate(t) {
    return U(this, null, function* () {
      let i = t.getKey();
      if (this.invalidations.get(i)) return yield this.invalidations.get(i);
      this.cache.delete(t.getKey());
      let o = new Promise((r, a) => {
        this.getHeader(t).then((l) => {
          r(), this.invalidations.delete(i);
        }).catch((l) => {
          a(l);
        });
      });
      this.invalidations.set(i, o);
    });
  }
};
j(pi, "SharedPromiseCache");
var Eo = pi, fi = class {
  constructor(t, i, o) {
    typeof t == "string" ? this.source = new $o(t) : this.source = t, o ? this.decompress = o : this.decompress = De, i ? this.cache = i : this.cache = new Eo();
  }
  getHeader() {
    return U(this, null, function* () {
      return yield this.cache.getHeader(this.source);
    });
  }
  getZxyAttempt(t, i, o, r) {
    return U(this, null, function* () {
      let a = si(t, i, o), l = yield this.cache.getHeader(this.source);
      if (t < l.minZoom || t > l.maxZoom) return;
      let n = l.rootDirectoryOffset, s = l.rootDirectoryLength;
      for (let c = 0; c <= 3; c++) {
        let u = yield this.cache.getDirectory(this.source, n, s, l), b = _i(u, a);
        if (b) {
          if (b.runLength > 0) {
            let _ = yield this.source.getBytes(l.tileDataOffset + b.offset, b.length, r, l.etag);
            return { data: yield this.decompress(_.data, l.tileCompression), cacheControl: _.cacheControl, expires: _.expires };
          }
          n = l.leafDirectoryOffset + b.offset, s = b.length;
        } else return;
      }
      throw new Error("Maximum directory depth exceeded");
    });
  }
  getZxy(t, i, o, r) {
    return U(this, null, function* () {
      try {
        return yield this.getZxyAttempt(t, i, o, r);
      } catch (a) {
        if (a instanceof st) return this.cache.invalidate(this.source), yield this.getZxyAttempt(t, i, o, r);
        throw a;
      }
    });
  }
  getMetadataAttempt() {
    return U(this, null, function* () {
      let t = yield this.cache.getHeader(this.source), i = yield this.source.getBytes(t.jsonMetadataOffset, t.jsonMetadataLength, void 0, t.etag), o = yield this.decompress(i.data, t.internalCompression), r = new TextDecoder("utf-8");
      return JSON.parse(r.decode(o));
    });
  }
  getMetadata() {
    return U(this, null, function* () {
      try {
        return yield this.getMetadataAttempt();
      } catch (t) {
        if (t instanceof st) return this.cache.invalidate(this.source), yield this.getMetadataAttempt();
        throw t;
      }
    });
  }
  getTileJson(t) {
    return U(this, null, function* () {
      let i = yield this.getHeader(), o = yield this.getMetadata(), r = bi(i.tileType);
      return { tilejson: "3.0.0", scheme: "xyz", tiles: [`${t}/{z}/{x}/{y}${r}`], vector_layers: o.vector_layers, attribution: o.attribution, description: o.description, name: o.name, version: o.version, bounds: [i.minLon, i.minLat, i.maxLon, i.maxLat], center: [i.centerLon, i.centerLat, i.centerZoom], minzoom: i.minZoom, maxzoom: i.maxZoom };
    });
  }
};
j(fi, "PMTiles");
var jt = fi;
const No = 8, Ro = "MapX Style", Mo = "https://mapx.unepgrid.s3.unige.ch/mapx/style/v1/glyphs/{fontstack}/{range}.pbf", Ao = [], jo = {
  protomaps_basemap: {
    type: "vector",
    url: "pmtiles://https://mapx.unepgrid.s3.unige.ch/mapx/layers/protomaps_basemap__v0.pmtiles",
    attribution: "© <a href='https://openstreetmap.org'>OpenStreetMap</a> contributors"
  },
  mapx_borders: {
    type: "vector",
    url: "pmtiles://https://mapx.unepgrid.s3.unige.ch/mapx/layers/mapx_borders__v1.pmtiles"
  },
  mapx_bathymetry: {
    type: "vector",
    url: "pmtiles://https://mapx.unepgrid.s3.unige.ch/mapx/layers/bathymetry__v0.pmtiles",
    attribution: "Bathymetry © <a href='https://www.gebco.net'>GEBCO</a> via <a href='https://versatiles.org'>VersaTiles</a>"
  },
  terrain: {
    type: "raster-dem",
    encoding: "terrarium",
    tiles: [
      "__terrain_tiles_placeholder__"
    ],
    tileSize: 512,
    maxzoom: 14,
    attribution: "Terrain tiles © <a href='https://mapterhorn.com/attribution'>Mapterhorn</a>"
  },
  terrain_hillshade: {
    type: "raster-dem",
    encoding: "terrarium",
    tiles: [
      "__terrain_tiles_placeholder__"
    ],
    tileSize: 512,
    maxzoom: 14
  },
  contours: {
    type: "vector",
    tiles: [
      "__contours_tiles_placeholder__"
    ],
    maxzoom: 15
  },
  satellite: {
    type: "raster",
    tiles: [
      "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2024_3857/default/g/{z}/{y}/{x}.jpg"
    ],
    tileSize: 256,
    maxzoom: 14,
    attribution: "Sentinel-2 cloudless - <a href='https://s2maps.eu'>s2maps.eu</a> by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2024)"
  }
}, Co = [
  {
    id: "background",
    type: "background",
    paint: {
      "background-color": "rgb(189,209,227)"
    }
  },
  {
    id: "earth",
    type: "fill",
    source: "protomaps_basemap",
    "source-layer": "earth",
    paint: {
      "fill-color": "rgb(246,242,234)"
    }
  },
  {
    id: "landcover_vegetation",
    type: "fill",
    source: "protomaps_basemap",
    "source-layer": "landcover",
    filter: [
      "in",
      [
        "get",
        "kind"
      ],
      [
        "literal",
        [
          "wood",
          "scrub",
          "grass",
          "crop",
          "farmland",
          "forest"
        ]
      ]
    ],
    paint: {
      "fill-color": "rgba(158,225,152,0.4)",
      "fill-opacity": 0.6
    }
  },
  {
    id: "national_park",
    type: "fill",
    source: "protomaps_basemap",
    "source-layer": "landuse",
    minzoom: 5,
    filter: [
      "==",
      [
        "get",
        "kind"
      ],
      "national_park"
    ],
    paint: {
      "fill-color": "rgba(158,225,152,0.4)",
      "fill-opacity": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        5,
        0,
        6,
        0.6,
        12,
        0.2
      ]
    }
  },
  {
    id: "landuse_vegetation",
    type: "fill",
    source: "protomaps_basemap",
    "source-layer": "landuse",
    minzoom: 5,
    filter: [
      "in",
      [
        "get",
        "kind"
      ],
      [
        "literal",
        [
          "park",
          "cemetery",
          "allotments",
          "grass",
          "forest",
          "farmland"
        ]
      ]
    ],
    paint: {
      "fill-color": "rgba(158,225,152,0.4)",
      "fill-opacity": 0.6
    }
  },
  {
    id: "landuse_commercial",
    type: "fill",
    source: "protomaps_basemap",
    "source-layer": "landuse",
    minzoom: 5,
    filter: [
      "in",
      [
        "get",
        "kind"
      ],
      [
        "literal",
        [
          "aerodrome",
          "industrial",
          "commercial",
          "retail",
          "hospital",
          "school"
        ]
      ]
    ],
    paint: {
      "fill-color": "rgba(255,194,194,0.4)",
      "fill-opacity": 0.6
    }
  },
  {
    id: "landuse_snow",
    type: "fill",
    source: "protomaps_basemap",
    "source-layer": "landcover",
    filter: [
      "in",
      [
        "get",
        "kind"
      ],
      [
        "literal",
        [
          "glacier",
          "snow"
        ]
      ]
    ],
    paint: {
      "fill-color": "rgba(164,208,249,0.24)",
      "fill-opacity": 0.6
    }
  },
  {
    id: "hillshade",
    type: "hillshade",
    source: "terrain_hillshade",
    layout: {
      visibility: "visible"
    },
    paint: {
      "hillshade-shadow-color": "rgba(40,30,10,0.55)",
      "hillshade-highlight-color": "rgba(255,255,255,0.12)",
      "hillshade-accent-color": "rgba(40,30,10,0.15)",
      "hillshade-illumination-direction": 335,
      "hillshade-exaggeration": 0.5
    }
  },
  {
    id: "boundary_un_1",
    type: "line",
    source: "mapx_borders",
    "source-layer": "un_2020_borders_line",
    filter: [
      "==",
      [
        "get",
        "type"
      ],
      1
    ],
    layout: {
      "line-join": "bevel"
    },
    paint: {
      "line-color": "rgba(38,38,38,0.3)",
      "line-width": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        0,
        0.5,
        22,
        2
      ],
      "line-opacity": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        0,
        0.9,
        6,
        1
      ]
    }
  },
  {
    id: "boundary_un_2",
    type: "line",
    source: "mapx_borders",
    "source-layer": "un_2020_borders_line",
    filter: [
      "==",
      [
        "get",
        "type"
      ],
      2
    ],
    layout: {
      "line-join": "bevel"
    },
    paint: {
      "line-color": "rgba(38,38,38,0.3)",
      "line-dasharray": [
        1,
        2,
        6,
        2
      ],
      "line-width": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        0,
        0.5,
        22,
        2
      ],
      "line-opacity": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        0,
        0.9,
        6,
        1
      ]
    }
  },
  {
    id: "boundary_un_3",
    type: "line",
    source: "mapx_borders",
    "source-layer": "un_2020_borders_line",
    filter: [
      "==",
      [
        "get",
        "type"
      ],
      3
    ],
    layout: {
      "line-join": "bevel"
    },
    paint: {
      "line-color": "rgba(38,38,38,0.3)",
      "line-dasharray": [
        3,
        2
      ],
      "line-width": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        0,
        0.5,
        22,
        2
      ],
      "line-opacity": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        0,
        0.9,
        6,
        1
      ]
    }
  },
  {
    id: "boundary_un_4",
    type: "line",
    source: "mapx_borders",
    "source-layer": "un_2020_borders_line",
    filter: [
      "==",
      [
        "get",
        "type"
      ],
      4
    ],
    layout: {
      "line-join": "bevel",
      "line-cap": "round"
    },
    paint: {
      "line-color": "rgba(38,38,38,0.3)",
      "line-dasharray": [
        0,
        4
      ],
      "line-width": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        0,
        1,
        22,
        2
      ],
      "line-opacity": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        0,
        0.9,
        6,
        1
      ]
    }
  },
  {
    id: "boundary_un_8",
    type: "line",
    source: "mapx_borders",
    "source-layer": "un_2020_borders_line",
    filter: [
      "==",
      [
        "get",
        "type"
      ],
      8
    ],
    layout: {
      "line-join": "bevel"
    },
    paint: {
      "line-color": "rgba(38,38,38,0.3)",
      "line-dasharray": [
        3,
        2
      ],
      "line-width": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        0,
        0.5,
        22,
        2
      ],
      "line-opacity": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        0,
        0.9,
        6,
        1
      ]
    }
  },
  {
    id: "boundary_un_9",
    type: "line",
    source: "mapx_borders",
    "source-layer": "un_2020_borders_line",
    filter: [
      "==",
      [
        "get",
        "type"
      ],
      9
    ],
    layout: {
      "line-join": "bevel"
    },
    paint: {
      "line-color": "rgba(38,38,38,0.3)",
      "line-width": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        0,
        0.5,
        22,
        2
      ],
      "line-opacity": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        0,
        0.9,
        6,
        1
      ]
    }
  },
  {
    id: "boundary_un_6",
    type: "line",
    source: "mapx_borders",
    "source-layer": "un_2020_borders_line",
    minzoom: 4,
    filter: [
      "==",
      [
        "get",
        "type"
      ],
      6
    ],
    layout: {
      "line-join": "bevel"
    },
    paint: {
      "line-color": "rgba(121,121,121,0.6)",
      "line-width": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        4,
        0.5,
        22,
        1
      ],
      "line-opacity": [
        "interpolate",
        [
          "exponential",
          0.8
        ],
        [
          "zoom"
        ],
        4,
        0.7,
        22,
        1
      ]
    }
  },
  {
    id: "water",
    type: "fill",
    source: "protomaps_basemap",
    "source-layer": "water",
    filter: [
      "all",
      [
        "==",
        [
          "geometry-type"
        ],
        "Polygon"
      ],
      [
        "!",
        [
          "in",
          [
            "get",
            "kind"
          ],
          [
            "literal",
            [
              "river",
              "canal",
              "stream",
              "drain",
              "ditch"
            ]
          ]
        ]
      ]
    ],
    paint: {
      "fill-color": "rgba(189,209,227,0.4)",
      "fill-outline-color": "hsla(0,0%,45%,0.55)"
    }
  },
  {
    id: "waterway",
    type: "line",
    source: "protomaps_basemap",
    "source-layer": "water",
    filter: [
      "all",
      [
        "==",
        [
          "geometry-type"
        ],
        "Line"
      ],
      [
        "in",
        [
          "get",
          "kind"
        ],
        [
          "literal",
          [
            "river",
            "canal",
            "stream",
            "drain",
            "ditch"
          ]
        ]
      ]
    ],
    layout: {
      "line-cap": "round",
      "line-join": "round"
    },
    paint: {
      "line-color": "rgb(189,209,227)",
      "line-width": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        8,
        0.5,
        14,
        2
      ],
      "line-opacity": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        0,
        0,
        6,
        0.4,
        22,
        0.8
      ]
    }
  },
  {
    id: "water_river",
    type: "fill",
    source: "protomaps_basemap",
    "source-layer": "water",
    minzoom: 12,
    filter: [
      "all",
      [
        "==",
        [
          "geometry-type"
        ],
        "Line"
      ],
      [
        "in",
        [
          "get",
          "kind"
        ],
        [
          "literal",
          [
            "river",
            "canal",
            "stream"
          ]
        ]
      ]
    ],
    paint: {
      "fill-color": "rgb(189,209,227)"
    }
  },
  {
    id: "bathymetry",
    type: "fill",
    source: "mapx_bathymetry",
    "source-layer": "bathymetry",
    paint: {
      "fill-outline-color": "rgba(0,0,0,0)",
      "fill-color": [
        "interpolate",
        [
          "linear"
        ],
        [
          "get",
          "mindepth"
        ],
        -9e3,
        "rgba(11,16,19,0.5)",
        0,
        "rgba(109,156,190,0.5)"
      ]
    }
  },
  {
    id: "contour-lines",
    type: "line",
    source: "contours",
    "source-layer": "contours",
    layout: {
      visibility: "visible"
    },
    paint: {
      "line-color": "rgba(90,65,30,0.45)",
      "line-opacity": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        9,
        [
          "match",
          [
            "get",
            "level"
          ],
          1,
          0.3,
          0.1
        ],
        16,
        [
          "match",
          [
            "get",
            "level"
          ],
          1,
          0.4,
          0.2
        ]
      ],
      "line-width": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        9,
        [
          "match",
          [
            "get",
            "level"
          ],
          1,
          0.2,
          0.1
        ],
        16,
        [
          "match",
          [
            "get",
            "level"
          ],
          1,
          0.4,
          0.2
        ]
      ]
    }
  },
  {
    id: "contour-labels",
    type: "symbol",
    source: "contours",
    "source-layer": "contours",
    filter: [
      ">",
      [
        "get",
        "level"
      ],
      0
    ],
    layout: {
      visibility: "visible",
      "symbol-placement": "line",
      "text-size": 10,
      "text-field": [
        "concat",
        [
          "number-format",
          [
            "get",
            "ele"
          ],
          {}
        ],
        " m"
      ],
      "text-font": [
        "Noto Sans Regular"
      ]
    },
    paint: {
      "text-color": "rgba(90,65,30,0.9)",
      "text-halo-color": "rgba(255,255,255,0.85)",
      "text-halo-width": 1
    }
  },
  {
    id: "road_path_tunnel_case",
    metadata: {
      auto_generated: !0,
      generator: "generator_roads.js"
    },
    minzoom: 12,
    type: "line",
    source: "protomaps_basemap",
    "source-layer": "roads",
    filter: [
      "all",
      [
        "==",
        "kind",
        "path"
      ],
      [
        "has",
        "is_tunnel"
      ]
    ],
    paint: {
      "line-color": "rgb(200,200,200)",
      "line-opacity": [
        "interpolate",
        [
          "exponential",
          1.5
        ],
        [
          "zoom"
        ],
        10,
        0,
        14,
        0.2,
        15,
        0.8,
        15.1,
        1
      ],
      "line-width": [
        "interpolate",
        [
          "exponential",
          1.5
        ],
        [
          "zoom"
        ],
        10,
        0.41,
        18,
        4.1
      ]
    },
    layout: {
      "line-join": "round",
      "line-cap": "butt",
      "line-round-limit": 2
    }
  },
  {
    id: "road_path_tunnel",
    metadata: {
      auto_generated: !0,
      generator: "generator_roads.js"
    },
    minzoom: 12,
    type: "line",
    source: "protomaps_basemap",
    "source-layer": "roads",
    filter: [
      "all",
      [
        "==",
        "kind",
        "path"
      ],
      [
        "has",
        "is_tunnel"
      ]
    ],
    paint: {
      "line-color": "rgb(255,255,255)",
      "line-opacity": 0.4,
      "line-width": [
        "interpolate",
        [
          "exponential",
          1.5
        ],
        [
          "zoom"
        ],
        10,
        0.26,
        18,
        2.6
      ]
    },
    layout: {
      "line-join": "round",
      "line-cap": "butt",
      "line-round-limit": 2
    }
  },
  {
    id: "road_path_case",
    metadata: {
      auto_generated: !0,
      generator: "generator_roads.js"
    },
    minzoom: 12,
    type: "line",
    source: "protomaps_basemap",
    "source-layer": "roads",
    filter: [
      "all",
      [
        "==",
        "kind",
        "path"
      ],
      [
        "!has",
        "is_tunnel"
      ],
      [
        "!has",
        "is_bridge"
      ]
    ],
    paint: {
      "line-color": "rgb(200,200,200)",
      "line-opacity": [
        "interpolate",
        [
          "exponential",
          1.5
        ],
        [
          "zoom"
        ],
        10,
        0,
        14,
        0.2,
        15,
        0.8,
        15.1,
        1
      ],
      "line-width": [
        "interpolate",
        [
          "exponential",
          1.5
        ],
        [
          "zoom"
        ],
        10,
        0.41,
        18,
        4.1
      ]
    },
    layout: {
      "line-join": "round",
      "line-cap": "butt",
      "line-round-limit": 2
    }
  },
  {
    id: "road_path",
    metadata: {
      auto_generated: !0,
      generator: "generator_roads.js"
    },
    minzoom: 12,
    type: "line",
    source: "protomaps_basemap",
    "source-layer": "roads",
    filter: [
      "all",
      [
        "==",
        "kind",
        "path"
      ],
      [
        "!has",
        "is_tunnel"
      ],
      [
        "!has",
        "is_bridge"
      ]
    ],
    paint: {
      "line-color": "rgb(255,255,255)",
      "line-opacity": 1,
      "line-width": [
        "interpolate",
        [
          "exponential",
          1.5
        ],
        [
          "zoom"
        ],
        10,
        0.26,
        18,
        2.6
      ]
    },
    layout: {
      "line-join": "round",
      "line-cap": "round",
      "line-round-limit": 2
    }
  },
  {
    id: "road_path_bridge_case",
    metadata: {
      auto_generated: !0,
      generator: "generator_roads.js"
    },
    minzoom: 12,
    type: "line",
    source: "protomaps_basemap",
    "source-layer": "roads",
    filter: [
      "all",
      [
        "==",
        "kind",
        "path"
      ],
      [
        "has",
        "is_bridge"
      ]
    ],
    paint: {
      "line-color": "rgb(200,200,200)",
      "line-opacity": [
        "interpolate",
        [
          "exponential",
          1.5
        ],
        [
          "zoom"
        ],
        10,
        0,
        14,
        0.2,
        15,
        0.8,
        15.1,
        1
      ],
      "line-width": [
        "interpolate",
        [
          "exponential",
          1.5
        ],
        [
          "zoom"
        ],
        10,
        0.41,
        18,
        4.1
      ]
    },
    layout: {
      "line-join": "round",
      "line-cap": "butt",
      "line-round-limit": 2
    }
  },
  {
    id: "road_path_bridge",
    metadata: {
      auto_generated: !0,
      generator: "generator_roads.js"
    },
    minzoom: 12,
    type: "line",
    source: "protomaps_basemap",
    "source-layer": "roads",
    filter: [
      "all",
      [
        "==",
        "kind",
        "path"
      ],
      [
        "has",
        "is_bridge"
      ]
    ],
    paint: {
      "line-color": "rgb(255,255,255)",
      "line-opacity": 1,
      "line-width": [
        "interpolate",
        [
          "exponential",
          1.5
        ],
        [
          "zoom"
        ],
        10,
        0.26,
        18,
        2.6
      ]
    },
    layout: {
      "line-join": "round",
      "line-cap": "butt",
      "line-round-limit": 2
    }
  },
  {
    id: "road_regular_tunnel_case",
    metadata: {
      auto_generated: !0,
      generator: "generator_roads.js"
    },
    minzoom: 8,
    type: "line",
    source: "protomaps_basemap",
    "source-layer": "roads",
    filter: [
      "all",
      [
        "in",
        "kind",
        "major_road",
        "minor_road"
      ],
      [
        "has",
        "is_tunnel"
      ]
    ],
    paint: {
      "line-color": "rgb(200,200,200)",
      "line-opacity": [
        "interpolate",
        [
          "exponential",
          1.5
        ],
        [
          "zoom"
        ],
        10,
        0,
        14,
        0.2,
        15,
        0.8,
        15.1,
        1
      ],
      "line-width": [
        "interpolate",
        [
          "exponential",
          1.5
        ],
        [
          "zoom"
        ],
        10,
        1.01,
        18,
        10.1
      ]
    },
    layout: {
      "line-join": "round",
      "line-cap": "butt",
      "line-round-limit": 2
    }
  },
  {
    id: "road_regular_tunnel",
    metadata: {
      auto_generated: !0,
      generator: "generator_roads.js"
    },
    minzoom: 8,
    type: "line",
    source: "protomaps_basemap",
    "source-layer": "roads",
    filter: [
      "all",
      [
        "in",
        "kind",
        "major_road",
        "minor_road"
      ],
      [
        "has",
        "is_tunnel"
      ]
    ],
    paint: {
      "line-color": "rgb(255,255,255)",
      "line-opacity": 0.4,
      "line-width": [
        "interpolate",
        [
          "exponential",
          1.5
        ],
        [
          "zoom"
        ],
        10,
        0.86,
        18,
        8.6
      ]
    },
    layout: {
      "line-join": "round",
      "line-cap": "butt",
      "line-round-limit": 2
    }
  },
  {
    id: "road_regular_case",
    metadata: {
      auto_generated: !0,
      generator: "generator_roads.js"
    },
    minzoom: 8,
    type: "line",
    source: "protomaps_basemap",
    "source-layer": "roads",
    filter: [
      "all",
      [
        "in",
        "kind",
        "major_road",
        "minor_road"
      ],
      [
        "!has",
        "is_tunnel"
      ],
      [
        "!has",
        "is_bridge"
      ]
    ],
    paint: {
      "line-color": "rgb(200,200,200)",
      "line-opacity": [
        "interpolate",
        [
          "exponential",
          1.5
        ],
        [
          "zoom"
        ],
        10,
        0,
        14,
        0.2,
        15,
        0.8,
        15.1,
        1
      ],
      "line-width": [
        "interpolate",
        [
          "exponential",
          1.5
        ],
        [
          "zoom"
        ],
        10,
        1.01,
        18,
        10.1
      ]
    },
    layout: {
      "line-join": "round",
      "line-cap": "butt",
      "line-round-limit": 2
    }
  },
  {
    id: "road_regular",
    metadata: {
      auto_generated: !0,
      generator: "generator_roads.js"
    },
    minzoom: 8,
    type: "line",
    source: "protomaps_basemap",
    "source-layer": "roads",
    filter: [
      "all",
      [
        "in",
        "kind",
        "major_road",
        "minor_road"
      ],
      [
        "!has",
        "is_tunnel"
      ],
      [
        "!has",
        "is_bridge"
      ]
    ],
    paint: {
      "line-color": "rgb(255,255,255)",
      "line-opacity": 1,
      "line-width": [
        "interpolate",
        [
          "exponential",
          1.5
        ],
        [
          "zoom"
        ],
        10,
        0.86,
        18,
        8.6
      ]
    },
    layout: {
      "line-join": "round",
      "line-cap": "round",
      "line-round-limit": 2
    }
  },
  {
    id: "road_regular_bridge_case",
    metadata: {
      auto_generated: !0,
      generator: "generator_roads.js"
    },
    minzoom: 8,
    type: "line",
    source: "protomaps_basemap",
    "source-layer": "roads",
    filter: [
      "all",
      [
        "in",
        "kind",
        "major_road",
        "minor_road"
      ],
      [
        "has",
        "is_bridge"
      ]
    ],
    paint: {
      "line-color": "rgb(200,200,200)",
      "line-opacity": [
        "interpolate",
        [
          "exponential",
          1.5
        ],
        [
          "zoom"
        ],
        10,
        0,
        14,
        0.2,
        15,
        0.8,
        15.1,
        1
      ],
      "line-width": [
        "interpolate",
        [
          "exponential",
          1.5
        ],
        [
          "zoom"
        ],
        10,
        1.01,
        18,
        10.1
      ]
    },
    layout: {
      "line-join": "round",
      "line-cap": "butt",
      "line-round-limit": 2
    }
  },
  {
    id: "road_regular_bridge",
    metadata: {
      auto_generated: !0,
      generator: "generator_roads.js"
    },
    minzoom: 8,
    type: "line",
    source: "protomaps_basemap",
    "source-layer": "roads",
    filter: [
      "all",
      [
        "in",
        "kind",
        "major_road",
        "minor_road"
      ],
      [
        "has",
        "is_bridge"
      ]
    ],
    paint: {
      "line-color": "rgb(255,255,255)",
      "line-opacity": 1,
      "line-width": [
        "interpolate",
        [
          "exponential",
          1.5
        ],
        [
          "zoom"
        ],
        10,
        0.86,
        18,
        8.6
      ]
    },
    layout: {
      "line-join": "round",
      "line-cap": "butt",
      "line-round-limit": 2
    }
  },
  {
    id: "road_motor_tunnel_case",
    metadata: {
      auto_generated: !0,
      generator: "generator_roads.js"
    },
    minzoom: 8,
    type: "line",
    source: "protomaps_basemap",
    "source-layer": "roads",
    filter: [
      "all",
      [
        "==",
        "kind",
        "highway"
      ],
      [
        "has",
        "is_tunnel"
      ]
    ],
    paint: {
      "line-color": "rgb(200,200,200)",
      "line-opacity": [
        "interpolate",
        [
          "exponential",
          1.5
        ],
        [
          "zoom"
        ],
        10,
        0,
        14,
        0.2,
        15,
        0.8,
        15.1,
        1
      ],
      "line-width": [
        "interpolate",
        [
          "exponential",
          1.5
        ],
        [
          "zoom"
        ],
        10,
        1.21,
        18,
        12.1
      ]
    },
    layout: {
      "line-join": "round",
      "line-cap": "butt",
      "line-round-limit": 2
    }
  },
  {
    id: "road_motor_tunnel",
    metadata: {
      auto_generated: !0,
      generator: "generator_roads.js"
    },
    minzoom: 8,
    type: "line",
    source: "protomaps_basemap",
    "source-layer": "roads",
    filter: [
      "all",
      [
        "==",
        "kind",
        "highway"
      ],
      [
        "has",
        "is_tunnel"
      ]
    ],
    paint: {
      "line-color": "rgb(240,240,240)",
      "line-opacity": 0.4,
      "line-width": [
        "interpolate",
        [
          "exponential",
          1.5
        ],
        [
          "zoom"
        ],
        10,
        1.06,
        18,
        10.6
      ]
    },
    layout: {
      "line-join": "round",
      "line-cap": "butt",
      "line-round-limit": 2
    }
  },
  {
    id: "road_motor_case",
    metadata: {
      auto_generated: !0,
      generator: "generator_roads.js"
    },
    minzoom: 8,
    type: "line",
    source: "protomaps_basemap",
    "source-layer": "roads",
    filter: [
      "all",
      [
        "==",
        "kind",
        "highway"
      ],
      [
        "!has",
        "is_tunnel"
      ],
      [
        "!has",
        "is_bridge"
      ]
    ],
    paint: {
      "line-color": "rgb(200,200,200)",
      "line-opacity": [
        "interpolate",
        [
          "exponential",
          1.5
        ],
        [
          "zoom"
        ],
        10,
        0,
        14,
        0.2,
        15,
        0.8,
        15.1,
        1
      ],
      "line-width": [
        "interpolate",
        [
          "exponential",
          1.5
        ],
        [
          "zoom"
        ],
        10,
        1.21,
        18,
        12.1
      ]
    },
    layout: {
      "line-join": "round",
      "line-cap": "butt",
      "line-round-limit": 2
    }
  },
  {
    id: "road_motor",
    metadata: {
      auto_generated: !0,
      generator: "generator_roads.js"
    },
    minzoom: 8,
    type: "line",
    source: "protomaps_basemap",
    "source-layer": "roads",
    filter: [
      "all",
      [
        "==",
        "kind",
        "highway"
      ],
      [
        "!has",
        "is_tunnel"
      ],
      [
        "!has",
        "is_bridge"
      ]
    ],
    paint: {
      "line-color": "rgb(240,240,240)",
      "line-opacity": 1,
      "line-width": [
        "interpolate",
        [
          "exponential",
          1.5
        ],
        [
          "zoom"
        ],
        10,
        1.06,
        18,
        10.6
      ]
    },
    layout: {
      "line-join": "round",
      "line-cap": "round",
      "line-round-limit": 2
    }
  },
  {
    id: "road_motor_bridge_case",
    metadata: {
      auto_generated: !0,
      generator: "generator_roads.js"
    },
    minzoom: 8,
    type: "line",
    source: "protomaps_basemap",
    "source-layer": "roads",
    filter: [
      "all",
      [
        "==",
        "kind",
        "highway"
      ],
      [
        "has",
        "is_bridge"
      ]
    ],
    paint: {
      "line-color": "rgb(200,200,200)",
      "line-opacity": [
        "interpolate",
        [
          "exponential",
          1.5
        ],
        [
          "zoom"
        ],
        10,
        0,
        14,
        0.2,
        15,
        0.8,
        15.1,
        1
      ],
      "line-width": [
        "interpolate",
        [
          "exponential",
          1.5
        ],
        [
          "zoom"
        ],
        10,
        1.21,
        18,
        12.1
      ]
    },
    layout: {
      "line-join": "round",
      "line-cap": "butt",
      "line-round-limit": 2
    }
  },
  {
    id: "road_motor_bridge",
    metadata: {
      auto_generated: !0,
      generator: "generator_roads.js"
    },
    minzoom: 8,
    type: "line",
    source: "protomaps_basemap",
    "source-layer": "roads",
    filter: [
      "all",
      [
        "==",
        "kind",
        "highway"
      ],
      [
        "has",
        "is_bridge"
      ]
    ],
    paint: {
      "line-color": "rgb(240,240,240)",
      "line-opacity": 1,
      "line-width": [
        "interpolate",
        [
          "exponential",
          1.5
        ],
        [
          "zoom"
        ],
        10,
        1.06,
        18,
        10.6
      ]
    },
    layout: {
      "line-join": "round",
      "line-cap": "butt",
      "line-round-limit": 2
    }
  },
  {
    id: "road_rail",
    type: "line",
    source: "protomaps_basemap",
    "source-layer": "roads",
    minzoom: 4,
    filter: [
      "==",
      [
        "get",
        "kind"
      ],
      "rail"
    ],
    layout: {
      "line-join": "round"
    },
    paint: {
      "line-color": "rgba(251,4,4,0.15)",
      "line-width": [
        "interpolate",
        [
          "exponential",
          1.5
        ],
        [
          "zoom"
        ],
        4,
        0.5,
        14,
        1,
        20,
        2
      ]
    }
  },
  {
    id: "road_rail_ticks",
    type: "line",
    source: "protomaps_basemap",
    "source-layer": "roads",
    minzoom: 4,
    filter: [
      "==",
      [
        "get",
        "kind"
      ],
      "rail"
    ],
    layout: {
      "line-join": "round"
    },
    paint: {
      "line-color": "rgba(251,4,4,0.15)",
      "line-dasharray": [
        0.1,
        5
      ],
      "line-width": [
        "interpolate",
        [
          "exponential",
          1.5
        ],
        [
          "zoom"
        ],
        4,
        0.1,
        14,
        4,
        20,
        8
      ]
    }
  },
  {
    id: "road_pedestrian_polygon",
    type: "fill",
    source: "protomaps_basemap",
    "source-layer": "landuse",
    minzoom: 12,
    filter: [
      "==",
      [
        "get",
        "kind"
      ],
      "pedestrian"
    ],
    paint: {
      "fill-color": "rgb(255,255,255)",
      "fill-opacity": 1
    }
  },
  {
    id: "road_pedestrian_polygon_pattern",
    type: "fill",
    source: "protomaps_basemap",
    "source-layer": "landuse",
    minzoom: 12,
    filter: [
      "==",
      [
        "get",
        "kind"
      ],
      "pedestrian"
    ],
    paint: {
      "fill-color": "rgba(255,255,255,0)",
      "fill-opacity": 0.2
    }
  },
  {
    id: "road_polygon",
    type: "fill",
    source: "protomaps_basemap",
    "source-layer": "landuse",
    minzoom: 12,
    filter: [
      "in",
      [
        "get",
        "kind"
      ],
      [
        "literal",
        [
          "commercial",
          "retail"
        ]
      ]
    ],
    paint: {
      "fill-color": "rgb(255,255,255)"
    }
  },
  {
    id: "building",
    type: "fill",
    source: "protomaps_basemap",
    "source-layer": "buildings",
    minzoom: 14,
    paint: {
      "fill-color": "rgba(209,209,209,0.95)",
      "fill-opacity": 0.8
    }
  },
  {
    id: "building_border",
    type: "line",
    source: "protomaps_basemap",
    "source-layer": "buildings",
    minzoom: 14,
    paint: {
      "line-color": "rgba(255,255,255,0.95)",
      "line-opacity": 0.4
    }
  },
  {
    id: "road-label",
    type: "symbol",
    source: "protomaps_basemap",
    "source-layer": "roads",
    minzoom: 13,
    filter: [
      "all",
      [
        "has",
        "name"
      ],
      [
        "!=",
        [
          "get",
          "kind"
        ],
        "path"
      ]
    ],
    layout: {
      "text-field": [
        "coalesce",
        [
          "get",
          "name:en"
        ],
        [
          "get",
          "name_en"
        ],
        [
          "get",
          "name"
        ]
      ],
      "text-font": [
        "Noto Sans Medium"
      ],
      "text-size": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        13,
        10,
        18,
        12
      ],
      "symbol-placement": "line",
      "text-max-angle": 30,
      "text-padding": 1,
      "text-pitch-alignment": "viewport",
      "text-rotation-alignment": "map",
      "text-letter-spacing": 0.01,
      "symbol-spacing": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        10,
        100,
        18,
        250
      ]
    },
    paint: {
      "text-color": "rgb(143,143,143)",
      "text-halo-color": "rgba(255,255,255,0.24)",
      "text-halo-width": 1,
      "text-halo-blur": 1
    }
  },
  {
    id: "water-label-line",
    type: "symbol",
    source: "protomaps_basemap",
    "source-layer": "water",
    filter: [
      "all",
      [
        "has",
        "name"
      ],
      [
        "in",
        [
          "get",
          "kind"
        ],
        [
          "literal",
          [
            "bay",
            "ocean",
            "sea",
            "water"
          ]
        ]
      ]
    ],
    layout: {
      "text-field": [
        "coalesce",
        [
          "get",
          "name:en"
        ],
        [
          "get",
          "name_en"
        ],
        [
          "get",
          "name"
        ]
      ],
      "text-font": [
        "Libre Baskerville Italic"
      ],
      "text-size": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        7,
        12,
        11,
        18
      ],
      "text-max-angle": 30,
      "text-letter-spacing": [
        "match",
        [
          "get",
          "kind"
        ],
        "ocean",
        0.18,
        [
          "sea",
          "bay"
        ],
        0.15,
        0
      ],
      "symbol-placement": "line-center",
      "text-pitch-alignment": "viewport"
    },
    paint: {
      "text-color": "rgba(45,64,74,0.63)",
      "text-halo-color": "rgba(169,196,218,0.63)",
      "text-halo-width": 1.2
    }
  },
  {
    id: "water-label-point",
    type: "symbol",
    source: "protomaps_basemap",
    "source-layer": "water",
    filter: [
      "all",
      [
        "has",
        "name"
      ],
      [
        "in",
        [
          "get",
          "kind"
        ],
        [
          "literal",
          [
            "bay",
            "ocean",
            "sea",
            "water",
            "lake"
          ]
        ]
      ]
    ],
    layout: {
      "text-field": [
        "coalesce",
        [
          "get",
          "name:en"
        ],
        [
          "get",
          "name_en"
        ],
        [
          "get",
          "name"
        ]
      ],
      "text-font": [
        "Libre Baskerville Italic"
      ],
      "text-size": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        7,
        12,
        10,
        18
      ],
      "text-line-height": 1.3,
      "text-letter-spacing": [
        "match",
        [
          "get",
          "kind"
        ],
        "ocean",
        0.21,
        [
          "bay",
          "sea"
        ],
        0.15,
        0.01
      ],
      "text-max-width": [
        "match",
        [
          "get",
          "kind"
        ],
        "ocean",
        4,
        "sea",
        5,
        [
          "bay",
          "water"
        ],
        7,
        10
      ]
    },
    paint: {
      "text-color": "rgba(45,64,74,0.63)",
      "text-halo-color": "rgba(169,196,218,0.63)",
      "text-halo-width": 1.2
    }
  },
  {
    id: "waterway-label",
    type: "symbol",
    source: "protomaps_basemap",
    "source-layer": "water",
    minzoom: 13,
    filter: [
      "all",
      [
        "has",
        "name"
      ],
      [
        "in",
        [
          "get",
          "kind"
        ],
        [
          "literal",
          [
            "canal",
            "river",
            "stream"
          ]
        ]
      ]
    ],
    layout: {
      "text-field": [
        "coalesce",
        [
          "get",
          "name:en"
        ],
        [
          "get",
          "name_en"
        ],
        [
          "get",
          "name"
        ]
      ],
      "text-font": [
        "Libre Baskerville Regular"
      ],
      "text-size": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        13,
        6,
        18,
        12
      ],
      "text-max-angle": 30,
      "symbol-placement": "line",
      "text-pitch-alignment": "viewport",
      "symbol-spacing": [
        "interpolate",
        [
          "linear",
          1
        ],
        [
          "zoom"
        ],
        15,
        250,
        17,
        400
      ]
    },
    paint: {
      "text-color": "rgba(47,47,47,0.5)",
      "text-halo-color": "rgba(252,252,252,0)",
      "text-halo-width": 1.2,
      "text-opacity": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        13,
        0.5,
        18,
        1
      ]
    }
  },
  {
    id: "satellite",
    type: "raster",
    source: "satellite",
    layout: {
      visibility: "none"
    },
    paint: {
      "raster-opacity": 1
    }
  },
  {
    id: "mxlayers",
    type: "background",
    layout: {
      visibility: "none"
    },
    paint: {
      "background-color": "rgba(255,0,0,0)",
      "background-opacity": 0
    }
  },
  {
    id: "country-code",
    type: "fill",
    source: "mapx_borders",
    "source-layer": "un_2020_borders_poly",
    paint: {},
    layout: {
      visibility: "none"
    }
  },
  {
    id: "maritime",
    type: "line",
    source: "protomaps_basemap",
    "source-layer": "boundaries",
    layout: {
      visibility: "none"
    },
    filter: [
      "==",
      [
        "get",
        "kind"
      ],
      "maritime"
    ],
    paint: {
      "line-color": "rgba(255,255,255,0)",
      "line-dasharray": [
        3,
        2
      ],
      "line-width": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        0,
        0.5,
        8,
        1,
        14,
        2,
        22,
        4
      ],
      "line-opacity": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        0,
        0.9,
        6,
        1
      ]
    }
  },
  {
    id: "places_locality_capital",
    type: "symbol",
    source: "protomaps_basemap",
    "source-layer": "places",
    minzoom: 2,
    filter: [
      "all",
      [
        "==",
        [
          "get",
          "kind"
        ],
        "locality"
      ],
      [
        "in",
        [
          "get",
          "capital"
        ],
        [
          "literal",
          [
            "2",
            "yes"
          ]
        ]
      ]
    ],
    layout: {
      "symbol-sort-key": 0,
      "icon-image": "maki-star-11",
      "icon-size": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        1,
        0.8,
        8,
        0.5,
        12,
        0.2
      ],
      "text-field": [
        "coalesce",
        [
          "get",
          "name:en"
        ],
        [
          "get",
          "name_en"
        ],
        [
          "get",
          "name"
        ]
      ],
      "text-font": [
        "Noto Sans Regular"
      ],
      "text-size": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        3,
        11,
        10,
        14,
        15,
        16
      ],
      "text-letter-spacing": 0.2,
      "text-variable-anchor": [
        "top",
        "bottom",
        "left",
        "right"
      ],
      "text-radial-offset": 0.6
    },
    paint: {
      "icon-color": "rgba(47,47,47,0.9)",
      "text-color": "rgba(47,47,47,0.9)",
      "text-halo-color": "rgba(255,255,255,0.3)",
      "text-halo-width": 1.2
    }
  },
  {
    id: "places_locality_regional",
    type: "symbol",
    source: "protomaps_basemap",
    "source-layer": "places",
    minzoom: 5,
    filter: [
      "all",
      [
        "==",
        [
          "get",
          "kind"
        ],
        "locality"
      ],
      [
        "==",
        [
          "get",
          "capital"
        ],
        "4"
      ]
    ],
    layout: {
      "symbol-sort-key": 1,
      "icon-image": "maki-circle-11",
      "icon-size": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        5,
        0.3,
        10,
        0.5,
        16,
        0.6
      ],
      "text-field": [
        "coalesce",
        [
          "get",
          "name:en"
        ],
        [
          "get",
          "name_en"
        ],
        [
          "get",
          "name"
        ]
      ],
      "text-font": [
        "Noto Sans Regular"
      ],
      "text-size": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        10,
        11,
        14,
        13,
        16,
        14
      ],
      "text-letter-spacing": 0.2,
      "text-variable-anchor": [
        "top",
        "bottom",
        "left",
        "right"
      ],
      "text-radial-offset": 2
    },
    paint: {
      "icon-color": "rgba(47,47,47,0.8)",
      "text-color": "rgba(47,47,47,0.8)",
      "text-halo-color": "rgba(255,255,255,0.25)",
      "text-halo-width": 1.1
    }
  },
  {
    id: "places_locality_minor",
    type: "symbol",
    source: "protomaps_basemap",
    "source-layer": "places",
    minzoom: 8,
    filter: [
      "all",
      [
        "==",
        [
          "get",
          "kind"
        ],
        "locality"
      ],
      [
        "!=",
        [
          "get",
          "capital"
        ],
        "yes"
      ]
    ],
    layout: {
      "symbol-sort-key": 2,
      "icon-image": "maki-circle-11",
      "icon-size": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        14,
        0.35,
        16,
        0.25,
        18,
        0.2
      ],
      "text-field": [
        "coalesce",
        [
          "get",
          "name:en"
        ],
        [
          "get",
          "name_en"
        ],
        [
          "get",
          "name"
        ]
      ],
      "text-font": [
        "Noto Sans Regular"
      ],
      "text-size": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        14,
        10,
        16,
        11,
        18,
        12
      ],
      "text-letter-spacing": 0.15,
      "text-variable-anchor": [
        "top",
        "bottom"
      ],
      "text-radial-offset": 0.4
    },
    paint: {
      "icon-color": "rgba(47,47,47,0.7)",
      "text-color": "rgba(47,47,47,0.7)",
      "text-halo-color": "rgba(255,255,255,0.2)",
      "text-halo-width": 1
    }
  },
  {
    id: "country_un_1_label_1",
    type: "symbol",
    source: "mapx_borders",
    "source-layer": "un_2020_labels_countries_point",
    minzoom: 2,
    filter: [
      "==",
      [
        "get",
        "stscod"
      ],
      11
    ],
    layout: {
      "text-size": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        4,
        6,
        22,
        24
      ],
      "text-allow-overlap": !1,
      "text-field": [
        "coalesce",
        [
          "get",
          "name:en"
        ],
        [
          "get",
          "name_en"
        ],
        [
          "get",
          "name"
        ]
      ],
      "text-font": [
        "Noto Sans Italic"
      ],
      "text-letter-spacing": 0.2,
      "text-padding": 10,
      "text-anchor": "bottom",
      "text-justify": "auto"
    },
    paint: {
      "text-color": "rgba(11,16,19,0.72)",
      "text-halo-width": 2,
      "text-halo-color": "rgba(255,255,255,0.24)",
      "text-opacity": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        5,
        1,
        8,
        0.8,
        20,
        0.4
      ]
    }
  },
  {
    id: "country_un_0_label_99",
    type: "symbol",
    source: "mapx_borders",
    "source-layer": "un_2020_labels_countries_point",
    minzoom: 6.01,
    filter: [
      "==",
      [
        "get",
        "stscod"
      ],
      99
    ],
    layout: {
      "symbol-sort-key": [
        "-",
        100,
        [
          "get",
          "group_size"
        ]
      ],
      "text-size": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        4,
        6,
        22,
        24
      ],
      "text-allow-overlap": !1,
      "text-field": [
        "coalesce",
        [
          "get",
          "name:en"
        ],
        [
          "get",
          "name_en"
        ],
        [
          "get",
          "name"
        ]
      ],
      "text-font": [
        "Noto Sans Regular"
      ],
      "text-letter-spacing": 0.2,
      "text-padding": 10,
      "text-anchor": "bottom",
      "text-justify": "auto"
    },
    paint: {
      "text-color": "rgba(11,16,19,0.72)",
      "text-halo-width": 2,
      "text-halo-color": "rgba(255,255,255,0.24)",
      "text-opacity": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        5,
        1,
        8,
        0.8,
        20,
        0.4
      ]
    }
  },
  {
    id: "country_un_0_label_5",
    type: "symbol",
    source: "mapx_borders",
    "source-layer": "un_2020_labels_countries_point",
    minzoom: 6.01,
    filter: [
      "==",
      [
        "get",
        "stscod"
      ],
      5
    ],
    layout: {
      "symbol-sort-key": [
        "-",
        100,
        [
          "get",
          "group_size"
        ]
      ],
      "text-size": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        4,
        8,
        22,
        32
      ],
      "text-allow-overlap": !1,
      "text-field": [
        "coalesce",
        [
          "get",
          "name:en"
        ],
        [
          "get",
          "name_en"
        ],
        [
          "get",
          "name"
        ]
      ],
      "text-font": [
        "Noto Sans Italic"
      ],
      "text-letter-spacing": 0.2,
      "text-padding": 10,
      "text-anchor": "bottom",
      "text-justify": "auto"
    },
    paint: {
      "text-color": "rgba(11,16,19,0.72)",
      "text-halo-width": 2,
      "text-halo-color": "rgba(255,255,255,0.24)",
      "text-opacity": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        5,
        1,
        8,
        0.8,
        20,
        0.4
      ]
    }
  },
  {
    id: "country_un_0_label_4",
    type: "symbol",
    source: "mapx_borders",
    "source-layer": "un_2020_labels_countries_point",
    minzoom: 4.01,
    filter: [
      "==",
      [
        "get",
        "stscod"
      ],
      4
    ],
    layout: {
      "symbol-sort-key": [
        "-",
        100,
        [
          "get",
          "group_size"
        ]
      ],
      "text-size": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        4,
        9,
        22,
        36
      ],
      "text-allow-overlap": !1,
      "text-field": [
        "coalesce",
        [
          "get",
          "name:en"
        ],
        [
          "get",
          "name_en"
        ],
        [
          "get",
          "name"
        ]
      ],
      "text-font": [
        "Noto Sans Regular"
      ],
      "text-letter-spacing": 0.2,
      "text-padding": 10,
      "text-anchor": "bottom",
      "text-justify": "auto"
    },
    paint: {
      "text-color": "rgba(11,16,19,0.72)",
      "text-halo-width": 2,
      "text-halo-color": "rgba(255,255,255,0.24)",
      "text-opacity": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        5,
        1,
        8,
        0.8,
        20,
        0.4
      ]
    }
  },
  {
    id: "country_un_0_label_3",
    type: "symbol",
    source: "mapx_borders",
    "source-layer": "un_2020_labels_countries_point",
    minzoom: 4.01,
    filter: [
      "==",
      [
        "get",
        "stscod"
      ],
      3
    ],
    layout: {
      "symbol-sort-key": [
        "-",
        100,
        [
          "get",
          "group_size"
        ]
      ],
      "text-size": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        4,
        9,
        22,
        36
      ],
      "text-allow-overlap": !1,
      "text-field": [
        "coalesce",
        [
          "get",
          "name:en"
        ],
        [
          "get",
          "name_en"
        ],
        [
          "get",
          "name"
        ]
      ],
      "text-font": [
        "Noto Sans Regular"
      ],
      "text-letter-spacing": 0.2,
      "text-padding": 10,
      "text-anchor": "bottom",
      "icon-anchor": "center",
      "text-justify": "auto"
    },
    paint: {
      "text-color": "rgba(11,16,19,0.93)",
      "text-halo-width": 2,
      "text-halo-color": "rgba(255,255,255,0.24)",
      "text-opacity": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        5,
        1,
        8,
        0.8,
        20,
        0.4
      ]
    }
  },
  {
    id: "country_un_0_label_2",
    type: "symbol",
    source: "mapx_borders",
    "source-layer": "un_2020_labels_countries_point",
    minzoom: 4.01,
    filter: [
      "==",
      [
        "get",
        "stscod"
      ],
      2
    ],
    layout: {
      "symbol-sort-key": [
        "-",
        100,
        [
          "get",
          "group_size"
        ]
      ],
      "text-size": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        4,
        9,
        22,
        36
      ],
      "text-transform": "uppercase",
      "text-allow-overlap": !1,
      "text-field": [
        "coalesce",
        [
          "get",
          "name:en"
        ],
        [
          "get",
          "name_en"
        ],
        [
          "get",
          "name"
        ]
      ],
      "text-font": [
        "Noto Sans Italic"
      ],
      "text-letter-spacing": 0.2,
      "text-padding": 10,
      "text-anchor": "bottom",
      "text-justify": "auto"
    },
    paint: {
      "text-color": "rgba(11,16,19,0.81)",
      "text-halo-width": 2,
      "text-halo-color": "rgba(255,255,255,0.24)",
      "text-opacity": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        5,
        1,
        8,
        0.8,
        20,
        0.4
      ]
    }
  },
  {
    id: "country_un_0_label_1",
    type: "symbol",
    source: "mapx_borders",
    "source-layer": "un_2020_labels_countries_point",
    minzoom: 1.01,
    filter: [
      "==",
      [
        "get",
        "stscod"
      ],
      1
    ],
    layout: {
      "symbol-sort-key": [
        "-",
        100,
        [
          "get",
          "group_size"
        ]
      ],
      "text-size": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        4,
        10,
        22,
        40
      ],
      "text-transform": "uppercase",
      "text-allow-overlap": !1,
      "text-field": [
        "coalesce",
        [
          "get",
          "name:en"
        ],
        [
          "get",
          "name_en"
        ],
        [
          "get",
          "name"
        ]
      ],
      "text-font": [
        "Noto Sans Regular"
      ],
      "text-letter-spacing": 0.2,
      "text-padding": 10,
      "text-anchor": "bottom",
      "text-justify": "auto"
    },
    paint: {
      "text-color": "rgba(11,16,19,0.76)",
      "text-halo-width": 2,
      "text-halo-color": "rgba(255,255,255,0.24)",
      "text-opacity": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        5,
        1,
        8,
        0.8,
        20,
        0.4
      ]
    }
  },
  {
    id: "country_un_0_label_0",
    type: "symbol",
    source: "mapx_borders",
    "source-layer": "un_2020_labels_countries_point",
    minzoom: 1.01,
    filter: [
      "==",
      [
        "get",
        "stscod"
      ],
      0
    ],
    layout: {
      "symbol-sort-key": [
        "-",
        100,
        [
          "get",
          "group_size"
        ]
      ],
      "text-size": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        4,
        11,
        22,
        44
      ],
      "text-transform": "uppercase",
      "text-allow-overlap": !1,
      "text-field": [
        "coalesce",
        [
          "get",
          "name:en"
        ],
        [
          "get",
          "name_en"
        ],
        [
          "get",
          "name"
        ]
      ],
      "text-font": [
        "Noto Sans Medium Italic"
      ],
      "text-letter-spacing": 0.2,
      "text-padding": 10,
      "text-anchor": "bottom",
      "text-justify": "auto"
    },
    paint: {
      "text-color": "rgba(11,16,19,0.78)",
      "text-halo-width": 2,
      "text-halo-color": "rgba(255,255,255,0.24)",
      "text-opacity": [
        "interpolate",
        [
          "linear"
        ],
        [
          "zoom"
        ],
        5,
        1,
        8,
        0.8,
        20,
        0.4
      ]
    }
  }
], To = {
  version: No,
  name: Ro,
  glyphs: Mo,
  sprite: Ao,
  sources: jo,
  layers: Co
}, Io = "DEBUG style — mapx_borders wireframe. Black bg, neon per layer. All collision/zoom limits removed. Swap into main.js to diagnose borders at any zoom.", Po = 8, Oo = "MapX Borders Debug", Bo = "https://mapx.unepgrid.s3.unige.ch/mapx/style/v1/glyphs/{fontstack}/{range}.pbf", Uo = {
  mapx_borders: {
    type: "vector",
    url: "pmtiles://https://mapx.unepgrid.s3.unige.ch/mapx/layers/mapx_borders__v1.pmtiles"
  },
  protomaps_basemap: {
    type: "vector",
    url: "pmtiles://https://mapx.unepgrid.s3.unige.ch/mapx/layers/protomaps_basemap__v0.pmtiles",
    attribution: "© <a href='https://openstreetmap.org'>OpenStreetMap</a> contributors"
  },
  mapx_bathymetry: {
    type: "vector",
    url: "pmtiles://https://mapx.unepgrid.s3.unige.ch/mapx/layers/bathymetry__v0.pmtiles",
    attribution: "Bathymetry © <a href='https://www.gebco.net'>GEBCO</a> via <a href='https://versatiles.org'>VersaTiles</a>"
  },
  terrain: {
    type: "raster-dem",
    encoding: "terrarium",
    tiles: [
      "__terrain_tiles_placeholder__"
    ],
    tileSize: 512,
    maxzoom: 14
  },
  contours: {
    type: "vector",
    tiles: [
      "__contours_tiles_placeholder__"
    ],
    maxzoom: 15
  },
  satellite: {
    type: "raster",
    tiles: [
      "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2024_3857/default/g/{z}/{y}/{x}.jpg"
    ],
    tileSize: 256,
    maxzoom: 14,
    attribution: "Sentinel-2 cloudless - <a href='https://s2maps.eu'>s2maps.eu</a> by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2024)"
  }
}, Ho = [
  {
    _comment: "── BACKGROUND ─────────────────────────────────────────────",
    id: "background",
    type: "background",
    paint: {
      "background-color": "#000000"
    }
  },
  {
    _comment: "── PROTOMAPS BASEMAP — neon wireframe, zoom-independent ────",
    id: "debug_basemap_earth",
    type: "fill",
    source: "protomaps_basemap",
    "source-layer": "earth",
    paint: {
      "fill-color": "rgba(0,255,68,0.03)"
    }
  },
  {
    id: "debug_basemap_water",
    type: "fill",
    source: "protomaps_basemap",
    "source-layer": "water",
    filter: [
      "==",
      [
        "geometry-type"
      ],
      "Polygon"
    ],
    paint: {
      "fill-color": "rgba(0,255,255,0.06)",
      "fill-outline-color": "#00ffff"
    }
  },
  {
    id: "debug_basemap_roads",
    type: "line",
    source: "protomaps_basemap",
    "source-layer": "roads",
    layout: {
      "line-join": "round",
      "line-cap": "round"
    },
    paint: {
      "line-color": "#ffff00",
      "line-width": 0.8,
      "line-opacity": 0.7
    }
  },
  {
    id: "debug_basemap_buildings",
    type: "fill",
    source: "protomaps_basemap",
    "source-layer": "buildings",
    paint: {
      "fill-color": "rgba(255,0,255,0.04)",
      "fill-outline-color": "#ff00ff"
    }
  },
  {
    _comment: "── BATHYMETRY — neon blue depth zones ─────────────────────",
    id: "debug_bathymetry_fill",
    type: "fill",
    source: "mapx_bathymetry",
    "source-layer": "bathymetry",
    paint: {
      "fill-color": "#4488ff",
      "fill-opacity": 0.08
    }
  },
  {
    id: "debug_bathymetry_lines",
    type: "line",
    source: "mapx_bathymetry",
    "source-layer": "bathymetry",
    paint: {
      "line-color": "#4488ff",
      "line-width": 0.5,
      "line-opacity": 0.8
    }
  },
  {
    _comment: "── CONTOURS (Matterhorn DEM via mlcontour) — neon orange ──",
    id: "debug_contour_lines",
    type: "line",
    source: "contours",
    "source-layer": "contours",
    layout: {
      "line-join": "round"
    },
    paint: {
      "line-color": [
        "case",
        [
          ">",
          [
            "get",
            "level"
          ],
          0
        ],
        "#ff8800",
        "rgba(255,136,0,0.35)"
      ],
      "line-width": [
        "case",
        [
          ">",
          [
            "get",
            "level"
          ],
          0
        ],
        1.5,
        0.5
      ],
      "line-opacity": 1
    }
  },
  {
    id: "debug_contour_labels",
    type: "symbol",
    source: "contours",
    "source-layer": "contours",
    filter: [
      ">",
      [
        "get",
        "level"
      ],
      0
    ],
    layout: {
      "symbol-placement": "line",
      "symbol-spacing": 300,
      "text-field": [
        "concat",
        [
          "to-string",
          [
            "get",
            "ele"
          ]
        ],
        "m"
      ],
      "text-font": [
        "Noto Sans Regular"
      ],
      "text-size": 9,
      "text-allow-overlap": !0,
      "text-ignore-placement": !0
    },
    paint: {
      "text-color": "#ff8800",
      "text-halo-color": "#000000",
      "text-halo-width": 1
    }
  },
  {
    _comment: "── POLYGONS (un_2020_borders_poly) — cyan outline, barely-there fill ──",
    id: "debug_poly_fill",
    type: "fill",
    source: "mapx_borders",
    "source-layer": "un_2020_borders_poly",
    paint: {
      "fill-color": "rgba(0, 255, 255, 0.04)",
      "fill-outline-color": "#00ffff",
      "fill-antialias": !0
    }
  },
  {
    _comment: "── LINES by type — each type gets its own neon colour ──────",
    _legend: "magenta=type1 orange-red=type2 orange=type3 yellow=type4 grey=type6 violet=type8 sky=type9",
    id: "debug_line_type1",
    type: "line",
    source: "mapx_borders",
    "source-layer": "un_2020_borders_line",
    filter: [
      "==",
      [
        "get",
        "type"
      ],
      1
    ],
    layout: {
      "line-join": "round",
      "line-cap": "round"
    },
    paint: {
      "line-color": "#ff00ff",
      "line-width": 1.5,
      "line-opacity": 1
    }
  },
  {
    id: "debug_line_type2",
    type: "line",
    source: "mapx_borders",
    "source-layer": "un_2020_borders_line",
    filter: [
      "==",
      [
        "get",
        "type"
      ],
      2
    ],
    layout: {
      "line-join": "round"
    },
    paint: {
      "line-color": "#ff4400",
      "line-width": 1.5,
      "line-dasharray": [
        4,
        3
      ],
      "line-opacity": 1
    }
  },
  {
    id: "debug_line_type3",
    type: "line",
    source: "mapx_borders",
    "source-layer": "un_2020_borders_line",
    filter: [
      "==",
      [
        "get",
        "type"
      ],
      3
    ],
    layout: {
      "line-join": "round"
    },
    paint: {
      "line-color": "#ff8800",
      "line-width": 1.5,
      "line-dasharray": [
        3,
        2
      ],
      "line-opacity": 1
    }
  },
  {
    id: "debug_line_type4",
    type: "line",
    source: "mapx_borders",
    "source-layer": "un_2020_borders_line",
    filter: [
      "==",
      [
        "get",
        "type"
      ],
      4
    ],
    layout: {
      "line-join": "round",
      "line-cap": "round"
    },
    paint: {
      "line-color": "#ffff00",
      "line-width": 1.5,
      "line-dasharray": [
        0,
        4
      ],
      "line-opacity": 1
    }
  },
  {
    id: "debug_line_type6",
    type: "line",
    source: "mapx_borders",
    "source-layer": "un_2020_borders_line",
    filter: [
      "==",
      [
        "get",
        "type"
      ],
      6
    ],
    layout: {
      "line-join": "round"
    },
    paint: {
      "line-color": "#888888",
      "line-width": 1,
      "line-opacity": 1
    }
  },
  {
    id: "debug_line_type8",
    type: "line",
    source: "mapx_borders",
    "source-layer": "un_2020_borders_line",
    filter: [
      "==",
      [
        "get",
        "type"
      ],
      8
    ],
    layout: {
      "line-join": "round"
    },
    paint: {
      "line-color": "#8844ff",
      "line-width": 1.5,
      "line-dasharray": [
        3,
        2
      ],
      "line-opacity": 1
    }
  },
  {
    id: "debug_line_type9",
    type: "line",
    source: "mapx_borders",
    "source-layer": "un_2020_borders_line",
    filter: [
      "==",
      [
        "get",
        "type"
      ],
      9
    ],
    layout: {
      "line-join": "round"
    },
    paint: {
      "line-color": "#44aaff",
      "line-width": 1.5,
      "line-opacity": 1
    }
  },
  {
    _comment: "── LINE TYPE LABEL — shows type number along the line ──────",
    id: "debug_line_type_label",
    type: "symbol",
    source: "mapx_borders",
    "source-layer": "un_2020_borders_line",
    layout: {
      "symbol-placement": "line",
      "symbol-spacing": 300,
      "text-field": [
        "concat",
        "t",
        [
          "to-string",
          [
            "get",
            "type"
          ]
        ]
      ],
      "text-font": [
        "Noto Sans Regular"
      ],
      "text-size": 9,
      "text-allow-overlap": !0,
      "text-ignore-placement": !0
    },
    paint: {
      "text-color": [
        "match",
        [
          "get",
          "type"
        ],
        1,
        "#ff00ff",
        2,
        "#ff4400",
        3,
        "#ff8800",
        4,
        "#ffff00",
        6,
        "#888888",
        8,
        "#8844ff",
        9,
        "#44aaff",
        "#ffffff"
      ],
      "text-halo-color": "#000000",
      "text-halo-width": 1
    }
  },
  {
    _comment: "── RAW POINTS — white dot for every feature in points layer ─",
    _note: "If no dot → feature not in tile at this zoom. If dot but no label → collision or minzoom issue.",
    id: "debug_points_dot",
    type: "circle",
    source: "mapx_borders",
    "source-layer": "un_2020_labels_countries_point",
    paint: {
      "circle-color": "#ffffff",
      "circle-radius": 3,
      "circle-stroke-color": "#000000",
      "circle-stroke-width": 1,
      "circle-opacity": 0.9
    }
  },
  {
    _comment: "── POINT LABELS — all features, all zooms, no collision, name + stscod ──",
    _legend: "bright-green=stscod0  green=1  lime=2  yellow=3  orange=4  red=5  magenta=99  cyan=11",
    id: "debug_points_label",
    type: "symbol",
    source: "mapx_borders",
    "source-layer": "un_2020_labels_countries_point",
    layout: {
      "text-field": [
        "concat",
        [
          "coalesce",
          [
            "get",
            "name_en"
          ],
          [
            "get",
            "name"
          ],
          "?"
        ],
        " [",
        [
          "to-string",
          [
            "get",
            "stscod"
          ]
        ],
        "]"
      ],
      "text-font": [
        "Noto Sans Regular"
      ],
      "text-size": 11,
      "text-allow-overlap": !0,
      "text-ignore-placement": !0,
      "text-anchor": "top",
      "text-offset": [
        0,
        0.4
      ],
      "text-padding": 0
    },
    paint: {
      "text-color": [
        "match",
        [
          "get",
          "stscod"
        ],
        0,
        "#00ff44",
        1,
        "#00cc44",
        2,
        "#88ff00",
        3,
        "#ffff00",
        4,
        "#ff8800",
        5,
        "#ff4400",
        11,
        "#00ffff",
        99,
        "#ff00ff",
        "#ffffff"
      ],
      "text-halo-color": "#000000",
      "text-halo-width": 1.5,
      "text-opacity": 1
    }
  },
  {
    id: "satellite",
    type: "raster",
    source: "satellite",
    layout: {
      visibility: "none"
    },
    paint: {
      "raster-opacity": 1
    }
  }
], Do = {
  _comment: Io,
  version: Po,
  name: Oo,
  glyphs: Bo,
  sources: Uo,
  layers: Ho
}, Ce = 1;
function Ct(e, t) {
  return e.sources.terrain.tiles = [t.sharedDemProtocolUrl], e.sources.terrain_hillshade.tiles = [t.sharedDemProtocolUrl], e.sources.contours.tiles = [
    t.contourProtocolUrl({
      multiplier: 1,
      thresholds: {
        9: [500, 2e3],
        10: [200, 1e3],
        11: [100, 500],
        12: [50, 200],
        13: [20, 100],
        14: [10, 50]
      },
      contourLayer: "contours",
      elevationKey: "ele",
      levelKey: "level",
      extent: 4096,
      buffer: 1
    })
  ], e;
}
const Yo = "classic_light", Go = {
  en: "Classic light"
}, Zo = {
  en: "Classic bright theme with minimal colors, emphasis on data presented on the map"
}, Fo = 1, Ko = 1, Xo = "2025-05-19T09:46:32.000Z", Vo = !1, Wo = !1, qo = !1, Jo = {
  mx_ui_text: {
    visibility: "visible",
    color: "rgb(53,53,53)",
    font: "Noto Sans"
  },
  mx_ui_link: {
    visibility: "visible",
    color: "rgb(17,176,248)"
  },
  mx_ui_input_accent: {
    visibility: "visible",
    color: "rgb(17,176,248)"
  },
  mx_ui_text_faded: {
    visibility: "visible",
    color: "rgba(53,53,53,0.5)"
  },
  mx_ui_hidden: {
    visibility: "visible",
    color: "rgba(2,186,253,0)"
  },
  mx_ui_border: {
    visibility: "visible",
    color: "rgba(156,156,156,0.2)"
  },
  mx_ui_background: {
    visibility: "visible",
    color: "rgb(255,255,255)"
  },
  mx_ui_background_accent: {
    visibility: "visible",
    color: "rgb(252,252,252)"
  },
  mx_ui_background_faded: {
    visibility: "visible",
    color: "rgb(250,250,250)"
  },
  mx_ui_background_contrast: {
    visibility: "visible",
    color: "rgb(245,245,245)"
  },
  mx_ui_background_transparent: {
    visibility: "visible",
    color: "rgba(245,245,245,0.4)"
  },
  mx_ui_shadow: {
    visibility: "visible",
    color: "rgba(61,61,61,0.09)"
  },
  mx_map_background: {
    visibility: "visible",
    color: "rgb(245,245,245)"
  },
  mx_map_snow: {
    visibility: "visible",
    color: "rgba(222,222,222,0.45)"
  },
  mx_map_vegetation: {
    visibility: "none",
    color: "rgba(204,204,204,0.4)"
  },
  mx_map_zone_commercial: {
    visibility: "visible",
    color: "rgba(163,163,163,0.4)"
  },
  mx_map_text_land_outline: {
    visibility: "visible",
    color: "rgba(255,255,255,0.24)"
  },
  mx_map_text_water_outline: {
    visibility: "visible",
    color: "rgba(69,69,69,0.57)"
  },
  mx_map_text_bathymetry_outline: {
    visibility: "visible",
    color: "rgba(255,255,255,0)"
  },
  mx_map_contour_lines: {
    visibility: "visible",
    color: "rgba(0,0,0,0.9)"
  },
  mx_map_text_contour: {
    visibility: "visible",
    color: "rgba(0,0,0,0.9)",
    font: "Noto Sans Light"
  },
  mx_map_text_contour_outline: {
    visibility: "visible",
    color: "rgba(255,255,255,0.9)"
  },
  mx_map_feature_highlight: {
    visibility: "visible",
    color: "rgb(255,0,255)"
  },
  mx_map_hillshade_shadow: {
    visibility: "visible",
    color: "rgba(145,145,145,0.1)"
  },
  mx_map_hillshade_highlight: {
    visibility: "visible",
    color: "rgba(255,255,255,0.1)"
  },
  mx_map_mask: {
    visibility: "none",
    color: "rgba(153,153,153,0.4)"
  },
  mx_map_text_place: {
    visibility: "visible",
    color: "rgba(47,47,47,0.8)",
    font: "Noto Sans Regular"
  },
  mx_map_text_road: {
    visibility: "visible",
    color: "rgb(143,143,143)",
    font: "Noto Sans Medium"
  },
  mx_map_text_water: {
    visibility: "visible",
    color: "rgba(215,214,214,0.89)",
    font: "Libre Baskerville Italic"
  },
  mx_map_water: {
    visibility: "visible",
    color: "rgb(125,125,125)"
  },
  mx_map_bathymetry_high: {
    visibility: "visible",
    color: "rgba(151,149,149,0.5)"
  },
  mx_map_bathymetry_low: {
    visibility: "visible",
    color: "rgba(43,43,43,0.77)"
  },
  mx_map_bathymetry_lines: {
    visibility: "visible",
    color: "rgb(255,255,255)"
  },
  mx_map_text_bathymetry: {
    visibility: "visible",
    color: "rgb(255,255,255)",
    font: "Noto Sans Light"
  },
  mx_map_road: {
    visibility: "visible",
    color: "rgb(255,255,255)"
  },
  mx_map_road_border: {
    visibility: "visible",
    color: "rgb(155,155,155)"
  },
  mx_map_rail: {
    visibility: "visible",
    color: "rgba(10,10,10,0.15)"
  },
  mx_map_building: {
    visibility: "visible",
    color: "rgba(209,209,209,0.95)"
  },
  mx_map_building_border: {
    visibility: "visible",
    color: "rgba(255,255,255,0.95)"
  },
  mx_map_boundary_un_1: {
    visibility: "visible",
    color: "rgba(38,38,38,0.3)"
  },
  mx_map_boundary_un_2: {
    visibility: "visible",
    color: "rgba(38,38,38,0.3)"
  },
  mx_map_boundary_un_3: {
    visibility: "visible",
    color: "rgba(38,38,38,0.3)"
  },
  mx_map_boundary_un_4: {
    visibility: "visible",
    color: "rgba(38,38,38,0.3)"
  },
  mx_map_boundary_un_8: {
    visibility: "visible",
    color: "rgba(38,38,38,0.3)"
  },
  mx_map_boundary_un_9: {
    visibility: "visible",
    color: "rgba(38,38,38,0.3)"
  },
  mx_map_boundary_un_6: {
    visibility: "visible",
    color: "rgba(121,121,121,0.6)"
  },
  mx_map_text_country_0_0: {
    visibility: "visible",
    color: "rgba(11,16,19,0.78)",
    font: "Noto Sans Medium Italic"
  },
  mx_map_text_country_0_1: {
    visibility: "visible",
    color: "rgba(11,16,19,0.76)",
    font: "Noto Sans Regular"
  },
  mx_map_text_country_0_2: {
    visibility: "visible",
    color: "rgba(11,16,19,0.81)",
    font: "Noto Sans Italic"
  },
  mx_map_text_country_0_3: {
    visibility: "visible",
    color: "rgba(11,16,19,0.93)",
    font: "Noto Sans Regular"
  },
  mx_map_text_country_0_4: {
    visibility: "visible",
    color: "rgba(11,16,19,0.72)",
    font: "Noto Sans Regular"
  },
  mx_map_text_country_0_5: {
    visibility: "visible",
    color: "rgba(11,16,19,0.72)",
    font: "Noto Sans Italic"
  },
  mx_map_text_country_0_99: {
    visibility: "visible",
    color: "rgba(11,16,19,0.72)",
    font: "Noto Sans Regular"
  },
  mx_map_text_country_1_1: {
    visibility: "visible",
    color: "rgba(11,16,19,0.72)",
    font: "Noto Sans Italic"
  },
  mx_ui_highlighter: {
    color: "rgb(255,0,255)",
    visibility: "visible"
  }
}, Qo = {
  id: Yo,
  label: Go,
  description: Zo,
  creator: Fo,
  last_editor: Ko,
  date_modified: Xo,
  dark: Vo,
  tree: Wo,
  water: qo,
  colors: Jo
}, er = "classic_dark", tr = {
  en: "Classic dark"
}, ir = {
  en: "Classic dark theme with minimal colors, optimized for low light environments"
}, or = 1, rr = 1, ar = "2025-05-19T09:46:21.000Z", lr = !0, nr = !1, sr = !1, cr = {
  mx_ui_text: {
    visibility: "visible",
    color: "rgb(250,250,250)",
    font: "Noto Sans"
  },
  mx_ui_link: {
    visibility: "visible",
    color: "rgb(17,176,248)"
  },
  mx_ui_input_accent: {
    visibility: "visible",
    color: "rgb(17,176,248)"
  },
  mx_ui_text_faded: {
    visibility: "visible",
    color: "rgba(192,192,192,0.75)"
  },
  mx_ui_hidden: {
    visibility: "visible",
    color: "rgba(0,84,147,0)"
  },
  mx_ui_border: {
    visibility: "visible",
    color: "rgba(255,255,255,0.1)"
  },
  mx_ui_background: {
    visibility: "visible",
    color: "rgb(66,66,66)"
  },
  mx_ui_background_accent: {
    visibility: "visible",
    color: "rgb(70,70,70)"
  },
  mx_ui_background_faded: {
    visibility: "visible",
    color: "rgb(51,51,51)"
  },
  mx_ui_background_contrast: {
    visibility: "visible",
    color: "rgb(58,58,58)"
  },
  mx_ui_background_transparent: {
    visibility: "visible",
    color: "rgba(66,66,66,0.5)"
  },
  mx_ui_shadow: {
    visibility: "visible",
    color: "rgba(36,36,36,0.3)"
  },
  mx_map_background: {
    visibility: "visible",
    color: "rgb(41,41,41)"
  },
  mx_map_snow: {
    visibility: "visible",
    color: "rgb(107,107,107)"
  },
  mx_map_vegetation: {
    visibility: "none",
    color: "rgba(0,0,0,0.35)"
  },
  mx_map_zone_commercial: {
    visibility: "visible",
    color: "rgba(94,94,94,0.73)"
  },
  mx_map_feature_highlight: {
    visibility: "visible",
    color: "rgb(255, 255, 0)"
  },
  mx_map_hillshade_shadow: {
    visibility: "visible",
    color: "rgba(18,18,18,0.32)"
  },
  mx_map_hillshade_highlight: {
    visibility: "visible",
    color: "rgba(135,135,135,0.16)"
  },
  mx_map_mask: {
    visibility: "none",
    color: "rgba(0,0,0,0.2)"
  },
  mx_map_text_place: {
    visibility: "visible",
    color: "rgb(214,214,214)",
    font: "Noto Sans Regular"
  },
  mx_map_text_road: {
    visibility: "visible",
    color: "rgb(255,255,255)",
    font: "Noto Sans Medium"
  },
  mx_map_text_water: {
    visibility: "visible",
    color: "rgba(56,56,56,0.9)",
    font: "Libre Baskerville Italic"
  },
  mx_map_text_water_outline: {
    visibility: "visible",
    color: "rgba(255,255,255,0.1)"
  },
  mx_map_water: {
    visibility: "visible",
    color: "rgb(255,255,255)"
  },
  mx_map_bathymetry_high: {
    visibility: "visible",
    color: "rgba(214,214,214,0.5)"
  },
  mx_map_bathymetry_low: {
    visibility: "visible",
    color: "rgba(46,46,46,0.5)"
  },
  mx_map_bathymetry_lines: {
    visibility: "visible",
    color: "rgba(250,250,250,0.8)"
  },
  mx_map_road: {
    visibility: "visible",
    color: "rgb(28,28,28)"
  },
  mx_map_rail: {
    visibility: "visible",
    color: "rgba(250,250,250,0.2)"
  },
  mx_map_road_border: {
    visibility: "visible",
    color: "rgba(232,232,232,0.54)"
  },
  mx_map_building: {
    visibility: "visible",
    color: "rgba(158,158,158,0.52)"
  },
  mx_map_building_border: {
    visibility: "visible",
    color: "rgb(255,255,255)"
  },
  mx_map_boundary_un_1: {
    visibility: "visible",
    color: "rgb(121,121,121)"
  },
  mx_map_boundary_un_2: {
    visibility: "visible",
    color: "rgba(121,121,121,0.6)"
  },
  mx_map_boundary_un_3: {
    visibility: "visible",
    color: "rgba(121,121,121,0.6)"
  },
  mx_map_boundary_un_4: {
    visibility: "visible",
    color: "rgba(121,121,121,0.6)"
  },
  mx_map_boundary_un_8: {
    visibility: "visible",
    color: "rgba(121,121,121,0.6)"
  },
  mx_map_boundary_un_9: {
    visibility: "visible",
    color: "rgba(121,121,121,0.6)"
  },
  mx_map_boundary_un_6: {
    visibility: "visible",
    color: "rgba(121,121,121,0.6)"
  },
  mx_map_text_land_outline: {
    visibility: "visible",
    color: "rgba(82,82,82,0.53)"
  },
  mx_map_text_bathymetry_outline: {
    visibility: "visible",
    color: "rgba(255,255,255,0.6)"
  },
  mx_map_text_bathymetry: {
    visibility: "visible",
    color: "rgba(28,28,28,0.82)",
    font: "Varela Round Regular"
  },
  mx_map_contour_lines: {
    visibility: "visible",
    color: "rgba(255,255,255,0.6)"
  },
  mx_map_text_contour: {
    visibility: "visible",
    color: "rgba(255,255,255,0.6)",
    font: "Noto Sans Light"
  },
  mx_map_text_contour_outline: {
    visibility: "visible",
    color: "rgba(0,0,0,0.9)"
  },
  mx_map_text_country_0_0: {
    visibility: "visible",
    color: "rgb(245,245,245)",
    font: "Noto Sans Medium Italic"
  },
  mx_map_text_country_0_1: {
    visibility: "visible",
    color: "rgb(255,255,255)",
    font: "Noto Sans Regular"
  },
  mx_map_text_country_0_2: {
    visibility: "visible",
    color: "rgb(250,250,250)",
    font: "Noto Sans Italic"
  },
  mx_map_text_country_0_3: {
    visibility: "visible",
    color: "rgb(250,250,250)",
    font: "Noto Sans Regular"
  },
  mx_map_text_country_0_4: {
    visibility: "visible",
    color: "rgb(252,252,252)",
    font: "Noto Sans Regular"
  },
  mx_map_text_country_0_5: {
    visibility: "visible",
    color: "rgb(245,245,245)",
    font: "Noto Sans Italic"
  },
  mx_map_text_country_0_99: {
    visibility: "visible",
    color: "rgb(245,245,245)",
    font: "Noto Sans Regular"
  },
  mx_map_text_country_1_1: {
    visibility: "visible",
    color: "rgb(250,250,250)",
    font: "Noto Sans Italic"
  },
  mx_ui_highlighter: {
    color: "rgb(255, 255, 0)",
    visibility: "visible"
  }
}, br = {
  id: er,
  label: tr,
  description: ir,
  creator: or,
  last_editor: rr,
  date_modified: ar,
  dark: lr,
  tree: nr,
  water: sr,
  colors: cr
}, _r = "color_light", ur = {
  en: "Color light"
}, mr = {
  en: "Bright theme with enhanced colors for both vegetation and water features"
}, dr = 1, pr = 1, fr = "2025-05-19T09:47:43.000Z", gr = !1, yr = !0, hr = !0, vr = {
  mx_ui_text: {
    visibility: "visible",
    color: "rgb(53,53,53)",
    font: "Noto Sans"
  },
  mx_ui_link: {
    visibility: "visible",
    color: "rgb(17,176,248)"
  },
  mx_ui_input_accent: {
    visibility: "visible",
    color: "rgb(17,176,248)"
  },
  mx_ui_text_faded: {
    visibility: "visible",
    color: "rgba(53,53,53,0.5)"
  },
  mx_ui_hidden: {
    visibility: "visible",
    color: "rgba(2,186,253,0)"
  },
  mx_ui_border: {
    visibility: "visible",
    color: "rgba(156,156,156,0.2)"
  },
  mx_ui_background: {
    visibility: "visible",
    color: "rgb(255,255,255)"
  },
  mx_ui_background_accent: {
    visibility: "visible",
    color: "rgb(252,252,252)"
  },
  mx_ui_background_faded: {
    visibility: "visible",
    color: "rgb(250,250,250)"
  },
  mx_ui_background_contrast: {
    visibility: "visible",
    color: "rgb(245,245,245)"
  },
  mx_ui_background_transparent: {
    visibility: "visible",
    color: "rgba(245,245,245,0.4)"
  },
  mx_ui_shadow: {
    visibility: "visible",
    color: "rgba(61,61,61,0.09)"
  },
  mx_map_background: {
    visibility: "visible",
    color: "rgb(246,242,234)"
  },
  mx_map_snow: {
    visibility: "visible",
    color: "rgba(164,208,249,0.24)"
  },
  mx_map_vegetation: {
    visibility: "visible",
    color: "rgba(158,225,152,0.4)"
  },
  mx_map_zone_commercial: {
    visibility: "visible",
    color: "rgba(255,194,194,0.4)"
  },
  mx_map_text_land_outline: {
    visibility: "visible",
    color: "rgba(255,255,255,0.24)"
  },
  mx_map_text_water_outline: {
    visibility: "visible",
    color: "rgba(169,196,218,0.63)"
  },
  mx_map_text_bathymetry_outline: {
    visibility: "visible",
    color: "rgba(255,255,255,0.9)"
  },
  mx_map_contour_lines: {
    visibility: "visible",
    color: "rgba(0,0,0,0.9)"
  },
  mx_map_text_contour: {
    visibility: "visible",
    color: "rgba(0,0,0,0.9)",
    font: "Noto Sans Light"
  },
  mx_map_text_contour_outline: {
    visibility: "visible",
    color: "rgba(255,255,255,0.9)"
  },
  mx_map_feature_highlight: {
    visibility: "visible",
    color: "rgb(255,0,255)"
  },
  mx_map_hillshade_shadow: {
    visibility: "visible",
    color: "rgba(145,145,145,0.1)"
  },
  mx_map_hillshade_highlight: {
    visibility: "visible",
    color: "rgba(255,255,255,0.1)"
  },
  mx_map_mask: {
    visibility: "none",
    color: "rgba(153,153,153,0.4)"
  },
  mx_map_text_place: {
    visibility: "visible",
    color: "rgba(47,47,47,0.8)",
    font: "Noto Sans Regular"
  },
  mx_map_text_road: {
    visibility: "visible",
    color: "rgb(143,143,143)",
    font: "Noto Sans Medium"
  },
  mx_map_text_water: {
    visibility: "visible",
    color: "rgba(45,64,74,0.63)",
    font: "Libre Baskerville Italic"
  },
  mx_map_water: {
    visibility: "visible",
    color: "rgb(189,209,227)"
  },
  mx_map_bathymetry_high: {
    visibility: "visible",
    color: "rgba(109,156,190,0.5)"
  },
  mx_map_bathymetry_low: {
    visibility: "visible",
    color: "rgba(11,16,19,0.5)"
  },
  mx_map_bathymetry_lines: {
    visibility: "visible",
    color: "rgb(255,255,255)"
  },
  mx_map_text_bathymetry: {
    visibility: "visible",
    color: "rgba(0,71,102,0.9)",
    font: "Varela Round Regular"
  },
  mx_map_road: {
    visibility: "visible",
    color: "rgb(255,255,255)"
  },
  mx_map_road_border: {
    visibility: "visible",
    color: "rgb(155,155,155)"
  },
  mx_map_rail: {
    visibility: "visible",
    color: "rgba(251,4,4,0.15)"
  },
  mx_map_building: {
    visibility: "visible",
    color: "rgba(209,209,209,0.95)"
  },
  mx_map_building_border: {
    visibility: "visible",
    color: "rgba(255,255,255,0.95)"
  },
  mx_map_boundary_un_1: {
    visibility: "visible",
    color: "rgba(38,38,38,0.3)"
  },
  mx_map_boundary_un_2: {
    visibility: "visible",
    color: "rgba(38,38,38,0.3)"
  },
  mx_map_boundary_un_3: {
    visibility: "visible",
    color: "rgba(38,38,38,0.3)"
  },
  mx_map_boundary_un_4: {
    visibility: "visible",
    color: "rgba(38,38,38,0.3)"
  },
  mx_map_boundary_un_8: {
    visibility: "visible",
    color: "rgba(38,38,38,0.3)"
  },
  mx_map_boundary_un_9: {
    visibility: "visible",
    color: "rgba(38,38,38,0.3)"
  },
  mx_map_boundary_un_6: {
    visibility: "visible",
    color: "rgba(121,121,121,0.6)"
  },
  mx_map_text_country_0_0: {
    visibility: "visible",
    color: "rgba(11,16,19,0.78)",
    font: "Noto Sans Medium Italic"
  },
  mx_map_text_country_0_1: {
    visibility: "visible",
    color: "rgba(11,16,19,0.76)",
    font: "Noto Sans Regular"
  },
  mx_map_text_country_0_2: {
    visibility: "visible",
    color: "rgba(11,16,19,0.81)",
    font: "Noto Sans Italic"
  },
  mx_map_text_country_0_3: {
    visibility: "visible",
    color: "rgba(11,16,19,0.93)",
    font: "Noto Sans Regular"
  },
  mx_map_text_country_0_4: {
    visibility: "visible",
    color: "rgba(11,16,19,0.72)",
    font: "Noto Sans Regular"
  },
  mx_map_text_country_0_5: {
    visibility: "visible",
    color: "rgba(11,16,19,0.72)",
    font: "Noto Sans Italic"
  },
  mx_map_text_country_0_99: {
    visibility: "visible",
    color: "rgba(11,16,19,0.72)",
    font: "Noto Sans Regular"
  },
  mx_map_text_country_1_1: {
    visibility: "visible",
    color: "rgba(11,16,19,0.72)",
    font: "Noto Sans Italic"
  },
  mx_ui_highlighter: {
    color: "rgb(255,0,255)",
    visibility: "visible"
  }
}, xr = {
  id: _r,
  label: ur,
  description: mr,
  creator: dr,
  last_editor: pr,
  date_modified: fr,
  dark: gr,
  tree: yr,
  water: hr,
  colors: vr
}, wr = "color_dark", kr = {
  en: "Color dark"
}, zr = {
  en: "Dark theme with enhanced colors for both vegetation and water features"
}, Sr = 1, $r = 1, Lr = "2025-05-19T09:47:32.000Z", Er = !0, Nr = !0, Rr = !0, Mr = {
  mx_ui_text: {
    visibility: "visible",
    color: "rgb(250,250,250)",
    font: "Noto Sans"
  },
  mx_ui_link: {
    visibility: "visible",
    color: "rgb(17,176,248)"
  },
  mx_ui_input_accent: {
    visibility: "visible",
    color: "rgb(17,176,248)"
  },
  mx_ui_text_faded: {
    visibility: "visible",
    color: "rgba(192,192,192,0.75)"
  },
  mx_ui_hidden: {
    visibility: "visible",
    color: "rgba(0,84,147,0)"
  },
  mx_ui_border: {
    visibility: "visible",
    color: "rgba(255,255,255,0.1)"
  },
  mx_ui_background: {
    visibility: "visible",
    color: "rgb(66,66,66)"
  },
  mx_ui_background_accent: {
    visibility: "visible",
    color: "rgb(70,70,70)"
  },
  mx_ui_background_faded: {
    visibility: "visible",
    color: "rgb(51,51,51)"
  },
  mx_ui_background_contrast: {
    visibility: "visible",
    color: "rgb(58,58,58)"
  },
  mx_ui_background_transparent: {
    visibility: "visible",
    color: "rgba(66,66,66,0.5)"
  },
  mx_ui_shadow: {
    visibility: "visible",
    color: "rgba(36,36,36,0.3)"
  },
  mx_map_background: {
    visibility: "visible",
    color: "rgb(41,41,41)"
  },
  mx_map_snow: {
    visibility: "visible",
    color: "rgba(175,219,253,0.38)"
  },
  mx_map_vegetation: {
    visibility: "visible",
    color: "rgba(128,248,63,0.1)"
  },
  mx_map_zone_commercial: {
    visibility: "visible",
    color: "rgba(3,37,68,0.73)"
  },
  mx_map_text_land_outline: {
    visibility: "visible",
    color: "rgba(82,82,82,0.53)"
  },
  mx_map_text_water_outline: {
    visibility: "visible",
    color: "rgba(255,255,255,0.1)"
  },
  mx_map_text_bathymetry_outline: {
    visibility: "visible",
    color: "rgba(255,255,255,0.6)"
  },
  mx_map_contour_lines: {
    visibility: "visible",
    color: "rgba(255,255,255,0.6)"
  },
  mx_map_text_contour: {
    visibility: "visible",
    color: "rgba(255,255,255,0.6)",
    font: "Noto Sans Light"
  },
  mx_map_text_contour_outline: {
    visibility: "visible",
    color: "rgba(0,0,0,0.9)"
  },
  mx_map_feature_highlight: {
    visibility: "visible",
    color: "rgb(255, 255, 0)"
  },
  mx_map_hillshade_shadow: {
    visibility: "visible",
    color: "rgba(18,18,18,0.32)"
  },
  mx_map_hillshade_highlight: {
    visibility: "visible",
    color: "rgba(135,135,135,0.16)"
  },
  mx_map_mask: {
    visibility: "none",
    color: "rgba(0,0,0,0.2)"
  },
  mx_map_text_place: {
    visibility: "visible",
    color: "rgb(214,214,214)",
    font: "Noto Sans Regular"
  },
  mx_map_text_road: {
    visibility: "visible",
    color: "rgb(255,255,255)",
    font: "Noto Sans Medium"
  },
  mx_map_text_water: {
    visibility: "visible",
    color: "rgba(56,56,56,0.9)",
    font: "Libre Baskerville Italic"
  },
  mx_map_water: {
    visibility: "visible",
    color: "rgb(163,212,255)"
  },
  mx_map_bathymetry_high: {
    visibility: "visible",
    color: "rgba(86,167,225,0.5)"
  },
  mx_map_bathymetry_low: {
    visibility: "visible",
    color: "rgba(3,13,50,0.5)"
  },
  mx_map_bathymetry_lines: {
    visibility: "visible",
    color: "rgba(250,250,250,0.8)"
  },
  mx_map_text_bathymetry: {
    visibility: "visible",
    color: "rgba(28,28,28,0.82)",
    font: "Varela Round Regular"
  },
  mx_map_road: {
    visibility: "visible",
    color: "rgb(28,28,28)"
  },
  mx_map_road_border: {
    visibility: "visible",
    color: "rgba(232,232,232,0.54)"
  },
  mx_map_rail: {
    visibility: "visible",
    color: "rgba(250,250,250,0.2)"
  },
  mx_map_building: {
    visibility: "visible",
    color: "rgba(95,148,171,0.52)"
  },
  mx_map_building_border: {
    visibility: "visible",
    color: "rgb(0,213,255)"
  },
  mx_map_boundary_un_1: {
    visibility: "visible",
    color: "rgb(121,121,121)"
  },
  mx_map_boundary_un_2: {
    visibility: "visible",
    color: "rgba(121,121,121,0.6)"
  },
  mx_map_boundary_un_3: {
    visibility: "visible",
    color: "rgba(121,121,121,0.6)"
  },
  mx_map_boundary_un_4: {
    visibility: "visible",
    color: "rgba(121,121,121,0.6)"
  },
  mx_map_boundary_un_8: {
    visibility: "visible",
    color: "rgba(121,121,121,0.6)"
  },
  mx_map_boundary_un_9: {
    visibility: "visible",
    color: "rgba(121,121,121,0.6)"
  },
  mx_map_boundary_un_6: {
    visibility: "visible",
    color: "rgba(121,121,121,0.6)"
  },
  mx_map_text_country_0_0: {
    visibility: "visible",
    color: "rgb(245,245,245)",
    font: "Noto Sans Medium Italic"
  },
  mx_map_text_country_0_1: {
    visibility: "visible",
    color: "rgb(255,255,255)",
    font: "Noto Sans Regular"
  },
  mx_map_text_country_0_2: {
    visibility: "visible",
    color: "rgb(250,250,250)",
    font: "Noto Sans Italic"
  },
  mx_map_text_country_0_3: {
    visibility: "visible",
    color: "rgb(250,250,250)",
    font: "Noto Sans Regular"
  },
  mx_map_text_country_0_4: {
    visibility: "visible",
    color: "rgb(252,252,252)",
    font: "Noto Sans Regular"
  },
  mx_map_text_country_0_5: {
    visibility: "visible",
    color: "rgb(245,245,245)",
    font: "Noto Sans Italic"
  },
  mx_map_text_country_0_99: {
    visibility: "visible",
    color: "rgb(245,245,245)",
    font: "Noto Sans Regular"
  },
  mx_map_text_country_1_1: {
    visibility: "visible",
    color: "rgb(250,250,250)",
    font: "Noto Sans Italic"
  },
  mx_ui_highlighter: {
    color: "rgb(255, 255, 0)",
    visibility: "visible"
  }
}, Ar = {
  id: wr,
  label: kr,
  description: zr,
  creator: Sr,
  last_editor: $r,
  date_modified: Lr,
  dark: Er,
  tree: Nr,
  water: Rr,
  colors: Mr
}, jr = "tree_light", Cr = {
  en: "Vegetation light"
}, Tr = {
  en: "Bright theme with emphasis on vegetation features"
}, Ir = 1, Pr = 1, Or = "2025-05-19T09:47:59.000Z", Br = !1, Ur = !0, Hr = !1, Dr = {
  mx_ui_text: {
    visibility: "visible",
    color: "rgb(53,53,53)",
    font: "Noto Sans"
  },
  mx_ui_link: {
    visibility: "visible",
    color: "rgb(17,176,248)"
  },
  mx_ui_input_accent: {
    visibility: "visible",
    color: "rgb(17,176,248)"
  },
  mx_ui_text_faded: {
    visibility: "visible",
    color: "rgba(53,53,53,0.5)"
  },
  mx_ui_hidden: {
    visibility: "visible",
    color: "rgba(2,186,253,0)"
  },
  mx_ui_border: {
    visibility: "visible",
    color: "rgba(156,156,156,0.2)"
  },
  mx_ui_background: {
    visibility: "visible",
    color: "rgb(255,255,255)"
  },
  mx_ui_background_accent: {
    visibility: "visible",
    color: "rgb(252,252,252)"
  },
  mx_ui_background_faded: {
    visibility: "visible",
    color: "rgb(250,250,250)"
  },
  mx_ui_background_contrast: {
    visibility: "visible",
    color: "rgb(245,245,245)"
  },
  mx_ui_background_transparent: {
    visibility: "visible",
    color: "rgba(245,245,245,0.4)"
  },
  mx_ui_shadow: {
    visibility: "visible",
    color: "rgba(61,61,61,0.09)"
  },
  mx_map_background: {
    visibility: "visible",
    color: "rgb(246,242,234)"
  },
  mx_map_snow: {
    visibility: "visible",
    color: "rgba(210,200,255,0.4)"
  },
  mx_map_vegetation: {
    visibility: "visible",
    color: "rgba(158,225,152,0.4)"
  },
  mx_map_zone_commercial: {
    visibility: "visible",
    color: "rgba(255,194,194,0.4)"
  },
  mx_map_text_land_outline: {
    visibility: "visible",
    color: "rgba(255,255,255,0.24)"
  },
  mx_map_text_water_outline: {
    visibility: "visible",
    color: "rgba(227,227,227,0.57)"
  },
  mx_map_text_bathymetry_outline: {
    visibility: "visible",
    color: "rgba(255,255,255,0.9)"
  },
  mx_map_feature_highlight: {
    visibility: "visible",
    color: "rgb(255,0,255)"
  },
  mx_map_hillshade_shadow: {
    visibility: "visible",
    color: "rgba(145,145,145,0.1)"
  },
  mx_map_hillshade_highlight: {
    visibility: "visible",
    color: "rgba(255,255,255,0.1)"
  },
  mx_map_mask: {
    visibility: "none",
    color: "rgba(153,153,153,0.4)"
  },
  mx_map_text_place: {
    visibility: "visible",
    color: "rgba(47,47,47,0.8)",
    font: "Noto Sans Regular"
  },
  mx_map_text_road: {
    visibility: "visible",
    color: "rgb(143,143,143)",
    font: "Noto Sans Medium"
  },
  mx_map_text_water: {
    visibility: "visible",
    color: "rgba(115,115,115,0.89)",
    font: "Libre Baskerville Italic"
  },
  mx_map_water: {
    visibility: "visible",
    color: "rgb(222,222,222)"
  },
  mx_map_bathymetry_high: {
    visibility: "visible",
    color: "rgba(196,196,196,0.5)"
  },
  mx_map_bathymetry_low: {
    visibility: "visible",
    color: "rgba(51,51,51,0.5)"
  },
  mx_map_bathymetry_lines: {
    visibility: "visible",
    color: "rgb(255,255,255)"
  },
  mx_map_text_bathymetry: {
    visibility: "visible",
    color: "rgba(0,71,102,0.9)",
    font: "Varela Round Regular"
  },
  mx_map_contour_lines: {
    visibility: "visible",
    color: "rgba(0,0,0,0.9)"
  },
  mx_map_text_contour: {
    visibility: "visible",
    color: "rgba(0,0,0,0.9)",
    font: "Noto Sans Light"
  },
  mx_map_text_contour_outline: {
    visibility: "visible",
    color: "rgba(255,255,255,0.9)"
  },
  mx_map_road: {
    visibility: "visible",
    color: "rgb(255,255,255)"
  },
  mx_map_road_border: {
    visibility: "visible",
    color: "rgb(155,155,155)"
  },
  mx_map_rail: {
    visibility: "visible",
    color: "rgba(251,4,4,0.15)"
  },
  mx_map_building: {
    visibility: "visible",
    color: "rgba(209,209,209,0.95)"
  },
  mx_map_building_border: {
    visibility: "visible",
    color: "rgba(255,255,255,0.95)"
  },
  mx_map_boundary_un_1: {
    visibility: "visible",
    color: "rgba(38,38,38,0.3)"
  },
  mx_map_boundary_un_2: {
    visibility: "visible",
    color: "rgba(38,38,38,0.3)"
  },
  mx_map_boundary_un_3: {
    visibility: "visible",
    color: "rgba(38,38,38,0.3)"
  },
  mx_map_boundary_un_4: {
    visibility: "visible",
    color: "rgba(38,38,38,0.3)"
  },
  mx_map_boundary_un_8: {
    visibility: "visible",
    color: "rgba(38,38,38,0.3)"
  },
  mx_map_boundary_un_9: {
    visibility: "visible",
    color: "rgba(38,38,38,0.3)"
  },
  mx_map_boundary_un_6: {
    visibility: "visible",
    color: "rgba(121,121,121,0.6)"
  },
  mx_map_text_country_0_0: {
    visibility: "visible",
    color: "rgba(11,16,19,0.78)",
    font: "Noto Sans Medium Italic"
  },
  mx_map_text_country_0_1: {
    visibility: "visible",
    color: "rgba(11,16,19,0.76)",
    font: "Noto Sans Regular"
  },
  mx_map_text_country_0_2: {
    visibility: "visible",
    color: "rgba(11,16,19,0.81)",
    font: "Noto Sans Italic"
  },
  mx_map_text_country_0_3: {
    visibility: "visible",
    color: "rgba(11,16,19,0.93)",
    font: "Noto Sans Regular"
  },
  mx_map_text_country_0_4: {
    visibility: "visible",
    color: "rgba(11,16,19,0.72)",
    font: "Noto Sans Regular"
  },
  mx_map_text_country_0_5: {
    visibility: "visible",
    color: "rgba(11,16,19,0.72)",
    font: "Noto Sans Italic"
  },
  mx_map_text_country_0_99: {
    visibility: "visible",
    color: "rgba(11,16,19,0.72)",
    font: "Noto Sans Regular"
  },
  mx_map_text_country_1_1: {
    visibility: "visible",
    color: "rgba(11,16,19,0.72)",
    font: "Noto Sans Italic"
  },
  mx_ui_highlighter: {
    color: "rgb(255,0,255)",
    visibility: "visible"
  }
}, Yr = {
  id: jr,
  label: Cr,
  description: Tr,
  creator: Ir,
  last_editor: Pr,
  date_modified: Or,
  dark: Br,
  tree: Ur,
  water: Hr,
  colors: Dr
}, Gr = "tree_dark", Zr = {
  en: "Vegetation dark"
}, Fr = {
  en: "Theme emphasis on vegetation features, for low light environments"
}, Kr = 1, Xr = 1, Vr = "2025-05-19T09:47:50.000Z", Wr = !0, qr = !0, Jr = !1, Qr = {
  mx_ui_text: {
    visibility: "visible",
    color: "rgb(250,250,250)",
    font: "Noto Sans"
  },
  mx_ui_link: {
    visibility: "visible",
    color: "rgb(17,176,248)"
  },
  mx_ui_input_accent: {
    visibility: "visible",
    color: "rgb(17,176,248)"
  },
  mx_ui_text_faded: {
    visibility: "visible",
    color: "rgba(192,192,192,0.75)"
  },
  mx_ui_hidden: {
    visibility: "visible",
    color: "rgba(0,84,147,0)"
  },
  mx_ui_border: {
    visibility: "visible",
    color: "rgba(255,255,255,0.1)"
  },
  mx_ui_background: {
    visibility: "visible",
    color: "rgb(66,66,66)"
  },
  mx_ui_background_accent: {
    visibility: "visible",
    color: "rgb(70,70,70)"
  },
  mx_ui_background_faded: {
    visibility: "visible",
    color: "rgb(51,51,51)"
  },
  mx_ui_background_contrast: {
    visibility: "visible",
    color: "rgb(58,58,58)"
  },
  mx_ui_background_transparent: {
    visibility: "visible",
    color: "rgba(66,66,66,0.5)"
  },
  mx_ui_shadow: {
    visibility: "visible",
    color: "rgba(36,36,36,0.3)"
  },
  mx_map_background: {
    visibility: "visible",
    color: "rgb(41,41,41)"
  },
  mx_map_snow: {
    visibility: "visible",
    color: "rgb(107,107,107)"
  },
  mx_map_vegetation: {
    visibility: "visible",
    color: "rgba(128,248,63,0.1)"
  },
  mx_map_zone_commercial: {
    visibility: "visible",
    color: "rgba(94,94,94,0.73)"
  },
  mx_map_feature_highlight: {
    visibility: "visible",
    color: "rgb(255, 255, 0)"
  },
  mx_map_hillshade_shadow: {
    visibility: "visible",
    color: "rgba(18,18,18,0.32)"
  },
  mx_map_hillshade_highlight: {
    visibility: "visible",
    color: "rgba(135,135,135,0.16)"
  },
  mx_map_mask: {
    visibility: "none",
    color: "rgba(0,0,0,0.2)"
  },
  mx_map_text_place: {
    visibility: "visible",
    color: "rgb(214,214,214)",
    font: "Noto Sans Regular"
  },
  mx_map_text_road: {
    visibility: "visible",
    color: "rgb(255,255,255)",
    font: "Noto Sans Medium"
  },
  mx_map_text_water: {
    visibility: "visible",
    color: "rgba(56,56,56,0.9)",
    font: "Libre Baskerville Italic"
  },
  mx_map_text_water_outline: {
    visibility: "visible",
    color: "rgba(255,255,255,0.1)"
  },
  mx_map_water: {
    visibility: "visible",
    color: "rgb(255,255,255)"
  },
  mx_map_bathymetry_high: {
    visibility: "visible",
    color: "rgba(214,214,214,0.5)"
  },
  mx_map_bathymetry_low: {
    visibility: "visible",
    color: "rgba(46,46,46,0.5)"
  },
  mx_map_bathymetry_lines: {
    visibility: "visible",
    color: "rgba(250,250,250,0.8)"
  },
  mx_map_contour_lines: {
    visibility: "visible",
    color: "rgba(255,255,255,0.6)"
  },
  mx_map_text_contour: {
    visibility: "visible",
    color: "rgba(255,255,255,0.6)",
    font: "Noto Sans Light"
  },
  mx_map_text_contour_outline: {
    visibility: "visible",
    color: "rgba(0,0,0,0.9)"
  },
  mx_map_road: {
    visibility: "visible",
    color: "rgb(28,28,28)"
  },
  mx_map_rail: {
    visibility: "visible",
    color: "rgba(250,250,250,0.2)"
  },
  mx_map_road_border: {
    visibility: "visible",
    color: "rgba(232,232,232,0.54)"
  },
  mx_map_building: {
    visibility: "visible",
    color: "rgba(95,148,171,0.52)"
  },
  mx_map_building_border: {
    visibility: "visible",
    color: "rgb(0,213,255)"
  },
  mx_map_boundary_un_1: {
    visibility: "visible",
    color: "rgb(121,121,121)"
  },
  mx_map_boundary_un_2: {
    visibility: "visible",
    color: "rgba(121,121,121,0.6)"
  },
  mx_map_boundary_un_3: {
    visibility: "visible",
    color: "rgba(121,121,121,0.6)"
  },
  mx_map_boundary_un_4: {
    visibility: "visible",
    color: "rgba(121,121,121,0.6)"
  },
  mx_map_boundary_un_8: {
    visibility: "visible",
    color: "rgba(121,121,121,0.6)"
  },
  mx_map_boundary_un_9: {
    visibility: "visible",
    color: "rgba(121,121,121,0.6)"
  },
  mx_map_boundary_un_6: {
    visibility: "visible",
    color: "rgba(121,121,121,0.6)"
  },
  mx_map_text_land_outline: {
    visibility: "visible",
    color: "rgba(82,82,82,0.53)"
  },
  mx_map_text_bathymetry_outline: {
    visibility: "visible",
    color: "rgba(255,255,255,0.6)"
  },
  mx_map_text_bathymetry: {
    visibility: "visible",
    color: "rgba(28,28,28,0.82)",
    font: "Varela Round Regular"
  },
  mx_map_text_country_0_0: {
    visibility: "visible",
    color: "rgb(245,245,245)",
    font: "Noto Sans Medium Italic"
  },
  mx_map_text_country_0_1: {
    visibility: "visible",
    color: "rgb(255,255,255)",
    font: "Noto Sans Regular"
  },
  mx_map_text_country_0_2: {
    visibility: "visible",
    color: "rgb(250,250,250)",
    font: "Noto Sans Italic"
  },
  mx_map_text_country_0_3: {
    visibility: "visible",
    color: "rgb(250,250,250)",
    font: "Noto Sans Regular"
  },
  mx_map_text_country_0_4: {
    visibility: "visible",
    color: "rgb(252,252,252)",
    font: "Noto Sans Regular"
  },
  mx_map_text_country_0_5: {
    visibility: "visible",
    color: "rgb(245,245,245)",
    font: "Noto Sans Italic"
  },
  mx_map_text_country_0_99: {
    visibility: "visible",
    color: "rgb(245,245,245)",
    font: "Noto Sans Regular"
  },
  mx_map_text_country_1_1: {
    visibility: "visible",
    color: "rgb(250,250,250)",
    font: "Noto Sans Italic"
  },
  mx_ui_highlighter: {
    color: "rgb(255, 255, 0)",
    visibility: "visible"
  }
}, ea = {
  id: Gr,
  label: Zr,
  description: Fr,
  creator: Kr,
  last_editor: Xr,
  date_modified: Vr,
  dark: Wr,
  tree: qr,
  water: Jr,
  colors: Qr
}, ta = "water_light", ia = {
  en: "Water light"
}, oa = {
  en: "Bright theme with emphasis on water features"
}, ra = 1, aa = 1, la = "2025-05-19T09:48:13.000Z", na = !1, sa = !1, ca = !0, ba = {
  mx_ui_text: {
    visibility: "visible",
    color: "rgb(53,53,53)",
    font: "Noto Sans"
  },
  mx_ui_link: {
    visibility: "visible",
    color: "rgb(17,176,248)"
  },
  mx_ui_input_accent: {
    visibility: "visible",
    color: "rgb(17,176,248)"
  },
  mx_ui_text_faded: {
    visibility: "visible",
    color: "rgba(53,53,53,0.5)"
  },
  mx_ui_hidden: {
    visibility: "visible",
    color: "rgba(2,186,253,0)"
  },
  mx_ui_border: {
    visibility: "visible",
    color: "rgba(156,156,156,0.2)"
  },
  mx_ui_background: {
    visibility: "visible",
    color: "rgb(255,255,255)"
  },
  mx_ui_background_accent: {
    visibility: "visible",
    color: "rgb(252,252,252)"
  },
  mx_ui_background_faded: {
    visibility: "visible",
    color: "rgb(250,250,250)"
  },
  mx_ui_background_contrast: {
    visibility: "visible",
    color: "rgb(245,245,245)"
  },
  mx_ui_background_transparent: {
    visibility: "visible",
    color: "rgba(245,245,245,0.4)"
  },
  mx_ui_shadow: {
    visibility: "visible",
    color: "rgba(61,61,61,0.09)"
  },
  mx_map_background: {
    visibility: "visible",
    color: "rgb(244,243,240)"
  },
  mx_map_snow: {
    visibility: "visible",
    color: "rgba(199,231,255,0.49)"
  },
  mx_map_vegetation: {
    visibility: "none",
    color: "rgba(199,199,199,0.27)"
  },
  mx_map_zone_commercial: {
    visibility: "visible",
    color: "rgba(255,194,194,0.4)"
  },
  mx_map_text_land_outline: {
    visibility: "visible",
    color: "rgba(255,255,255,0.24)"
  },
  mx_map_text_water_outline: {
    visibility: "visible",
    color: "rgba(169,196,218,0.63)"
  },
  mx_map_text_bathymetry_outline: {
    visibility: "visible",
    color: "rgba(255,255,255,0.9)"
  },
  mx_map_contour_lines: {
    visibility: "visible",
    color: "rgba(0,0,0,0.9)"
  },
  mx_map_text_contour: {
    visibility: "visible",
    color: "rgba(0,0,0,0.9)",
    font: "Noto Sans Light"
  },
  mx_map_text_contour_outline: {
    visibility: "visible",
    color: "rgba(255,255,255,0.9)"
  },
  mx_map_feature_highlight: {
    visibility: "visible",
    color: "rgb(255,0,255)"
  },
  mx_map_hillshade_shadow: {
    visibility: "visible",
    color: "rgba(145,145,145,0.1)"
  },
  mx_map_hillshade_highlight: {
    visibility: "visible",
    color: "rgba(255,255,255,0.1)"
  },
  mx_map_mask: {
    visibility: "none",
    color: "rgba(153,153,153,0.4)"
  },
  mx_map_text_place: {
    visibility: "visible",
    color: "rgba(47,47,47,0.8)",
    font: "Noto Sans Regular"
  },
  mx_map_text_road: {
    visibility: "visible",
    color: "rgb(143,143,143)",
    font: "Noto Sans Medium"
  },
  mx_map_text_water: {
    visibility: "visible",
    color: "rgba(45,64,74,0.63)",
    font: "Libre Baskerville Italic"
  },
  mx_map_water: {
    visibility: "visible",
    color: "rgb(189,209,227)"
  },
  mx_map_bathymetry_high: {
    visibility: "visible",
    color: "rgba(109,156,190,0.5)"
  },
  mx_map_bathymetry_low: {
    visibility: "visible",
    color: "rgba(11,16,19,0.5)"
  },
  mx_map_bathymetry_lines: {
    visibility: "visible",
    color: "rgb(255,255,255)"
  },
  mx_map_text_bathymetry: {
    visibility: "visible",
    color: "rgba(0,71,102,0.9)",
    font: "Varela Round Regular"
  },
  mx_map_road: {
    visibility: "visible",
    color: "rgb(255,255,255)"
  },
  mx_map_road_border: {
    visibility: "visible",
    color: "rgb(155,155,155)"
  },
  mx_map_rail: {
    visibility: "visible",
    color: "rgba(251,4,4,0.15)"
  },
  mx_map_building: {
    visibility: "visible",
    color: "rgba(209,209,209,0.95)"
  },
  mx_map_building_border: {
    visibility: "visible",
    color: "rgba(255,255,255,0.95)"
  },
  mx_map_boundary_un_1: {
    visibility: "visible",
    color: "rgba(38,38,38,0.3)"
  },
  mx_map_boundary_un_2: {
    visibility: "visible",
    color: "rgba(38,38,38,0.3)"
  },
  mx_map_boundary_un_3: {
    visibility: "visible",
    color: "rgba(38,38,38,0.3)"
  },
  mx_map_boundary_un_4: {
    visibility: "visible",
    color: "rgba(38,38,38,0.3)"
  },
  mx_map_boundary_un_8: {
    visibility: "visible",
    color: "rgba(38,38,38,0.3)"
  },
  mx_map_boundary_un_9: {
    visibility: "visible",
    color: "rgba(38,38,38,0.3)"
  },
  mx_map_boundary_un_6: {
    visibility: "visible",
    color: "rgba(121,121,121,0.6)"
  },
  mx_map_text_country_0_0: {
    visibility: "visible",
    color: "rgba(11,16,19,0.78)",
    font: "Noto Sans Medium Italic"
  },
  mx_map_text_country_0_1: {
    visibility: "visible",
    color: "rgba(11,16,19,0.76)",
    font: "Noto Sans Regular"
  },
  mx_map_text_country_0_2: {
    visibility: "visible",
    color: "rgba(11,16,19,0.81)",
    font: "Noto Sans Italic"
  },
  mx_map_text_country_0_3: {
    visibility: "visible",
    color: "rgba(11,16,19,0.93)",
    font: "Noto Sans Regular"
  },
  mx_map_text_country_0_4: {
    visibility: "visible",
    color: "rgba(11,16,19,0.72)",
    font: "Noto Sans Regular"
  },
  mx_map_text_country_0_5: {
    visibility: "visible",
    color: "rgba(11,16,19,0.72)",
    font: "Noto Sans Italic"
  },
  mx_map_text_country_0_99: {
    visibility: "visible",
    color: "rgba(11,16,19,0.72)",
    font: "Noto Sans Regular"
  },
  mx_map_text_country_1_1: {
    visibility: "visible",
    color: "rgba(11,16,19,0.72)",
    font: "Noto Sans Italic"
  },
  mx_ui_highlighter: {
    color: "rgb(255,0,255)",
    visibility: "visible"
  }
}, _a = {
  id: ta,
  label: ia,
  description: oa,
  creator: ra,
  last_editor: aa,
  date_modified: la,
  dark: na,
  tree: sa,
  water: ca,
  colors: ba
}, ua = "water_dark", ma = {
  en: "Water dark"
}, da = {
  en: "Dark theme with emphasis on water features, suitable for low light viewing"
}, pa = 1, fa = 1, ga = "2025-05-19T09:48:06.000Z", ya = !0, ha = !0, va = !1, xa = {
  mx_ui_text: {
    visibility: "visible",
    color: "rgb(250,250,250)",
    font: "Noto Sans"
  },
  mx_ui_link: {
    visibility: "visible",
    color: "rgb(17,176,248)"
  },
  mx_ui_input_accent: {
    visibility: "visible",
    color: "rgb(17,176,248)"
  },
  mx_ui_text_faded: {
    visibility: "visible",
    color: "rgba(192,192,192,0.75)"
  },
  mx_ui_hidden: {
    visibility: "visible",
    color: "rgba(0,84,147,0)"
  },
  mx_ui_border: {
    visibility: "visible",
    color: "rgba(255,255,255,0.1)"
  },
  mx_ui_background: {
    visibility: "visible",
    color: "rgb(66,66,66)"
  },
  mx_ui_background_accent: {
    visibility: "visible",
    color: "rgb(70,70,70)"
  },
  mx_ui_background_faded: {
    visibility: "visible",
    color: "rgb(51,51,51)"
  },
  mx_ui_background_contrast: {
    visibility: "visible",
    color: "rgb(58,58,58)"
  },
  mx_ui_background_transparent: {
    visibility: "visible",
    color: "rgba(66,66,66,0.5)"
  },
  mx_ui_shadow: {
    visibility: "visible",
    color: "rgba(36,36,36,0.3)"
  },
  mx_map_background: {
    visibility: "visible",
    color: "rgb(41,41,41)"
  },
  mx_map_snow: {
    visibility: "visible",
    color: "rgb(107,107,107)"
  },
  mx_map_vegetation: {
    visibility: "none",
    color: "rgba(1,75,81,0.4)"
  },
  mx_map_zone_commercial: {
    visibility: "visible",
    color: "rgba(1,9,9,0.73)"
  },
  mx_map_feature_highlight: {
    visibility: "visible",
    color: "rgb(255, 255, 0)"
  },
  mx_map_hillshade_shadow: {
    visibility: "visible",
    color: "rgba(18,18,18,0.32)"
  },
  mx_map_hillshade_highlight: {
    visibility: "visible",
    color: "rgba(121,121,121,0.2)"
  },
  mx_map_mask: {
    visibility: "none",
    color: "rgba(0,0,0,0.2)"
  },
  mx_map_text_place: {
    visibility: "visible",
    color: "rgb(214,214,214)",
    font: "Noto Sans Regular"
  },
  mx_map_text_road: {
    visibility: "visible",
    color: "rgb(255,255,255)",
    font: "Noto Sans Medium"
  },
  mx_map_text_water: {
    visibility: "visible",
    color: "rgba(56,56,56,0.9)",
    font: "Libre Baskerville Italic"
  },
  mx_map_text_water_outline: {
    visibility: "visible",
    color: "rgba(255,255,255,0.1)"
  },
  mx_map_water: {
    visibility: "visible",
    color: "rgb(189,209,227)"
  },
  mx_map_bathymetry_high: {
    visibility: "visible",
    color: "rgba(86,167,225,0.5)"
  },
  mx_map_bathymetry_low: {
    visibility: "visible",
    color: "rgba(3,13,50,0.5)"
  },
  mx_map_bathymetry_lines: {
    visibility: "visible",
    color: "rgba(250,250,250,0.8)"
  },
  mx_map_road: {
    visibility: "visible",
    color: "rgb(8,8,8)"
  },
  mx_map_rail: {
    visibility: "visible",
    color: "rgba(250,250,250,0.2)"
  },
  mx_map_road_border: {
    visibility: "visible",
    color: "rgb(150,150,150)"
  },
  mx_map_building: {
    visibility: "visible",
    color: "rgba(95,148,171,0.52)"
  },
  mx_map_building_border: {
    visibility: "visible",
    color: "rgb(0,213,255)"
  },
  mx_map_boundary_un_1: {
    visibility: "visible",
    color: "rgb(121,121,121)"
  },
  mx_map_boundary_un_2: {
    visibility: "visible",
    color: "rgba(121,121,121,0.6)"
  },
  mx_map_boundary_un_3: {
    visibility: "visible",
    color: "rgba(121,121,121,0.6)"
  },
  mx_map_boundary_un_4: {
    visibility: "visible",
    color: "rgba(121,121,121,0.6)"
  },
  mx_map_boundary_un_8: {
    visibility: "visible",
    color: "rgba(121,121,121,0.6)"
  },
  mx_map_boundary_un_9: {
    visibility: "visible",
    color: "rgba(121,121,121,0.6)"
  },
  mx_map_boundary_un_6: {
    visibility: "visible",
    color: "rgba(121,121,121,0.6)"
  },
  mx_map_text_land_outline: {
    visibility: "visible",
    color: "rgba(82,82,82,0.53)"
  },
  mx_map_text_bathymetry_outline: {
    visibility: "visible",
    color: "rgba(255,255,255,0.6)"
  },
  mx_map_text_bathymetry: {
    visibility: "visible",
    color: "rgba(28,28,28,0.82)",
    font: "Varela Round Regular"
  },
  mx_map_contour_lines: {
    visibility: "visible",
    color: "rgba(255,255,255,0.6)"
  },
  mx_map_text_contour: {
    visibility: "visible",
    color: "rgba(255,255,255,0.6)",
    font: "Noto Sans Light"
  },
  mx_map_text_contour_outline: {
    visibility: "visible",
    color: "rgba(0,0,0,0.9)"
  },
  mx_map_text_country_0_0: {
    visibility: "visible",
    color: "rgb(245,245,245)",
    font: "Noto Sans Medium Italic"
  },
  mx_map_text_country_0_1: {
    visibility: "visible",
    color: "rgb(255,255,255)",
    font: "Noto Sans Regular"
  },
  mx_map_text_country_0_2: {
    visibility: "visible",
    color: "rgb(250,250,250)",
    font: "Noto Sans Italic"
  },
  mx_map_text_country_0_3: {
    visibility: "visible",
    color: "rgb(250,250,250)",
    font: "Noto Sans Regular"
  },
  mx_map_text_country_0_4: {
    visibility: "visible",
    color: "rgb(252,252,252)",
    font: "Noto Sans Regular"
  },
  mx_map_text_country_0_5: {
    visibility: "visible",
    color: "rgb(245,245,245)",
    font: "Noto Sans Italic"
  },
  mx_map_text_country_0_99: {
    visibility: "visible",
    color: "rgb(245,245,245)",
    font: "Noto Sans Regular"
  },
  mx_map_text_country_1_1: {
    visibility: "visible",
    color: "rgb(250,250,250)",
    font: "Noto Sans Italic"
  },
  mx_ui_highlighter: {
    color: "rgb(255, 255, 0)",
    visibility: "visible"
  }
}, wa = {
  id: ua,
  label: ma,
  description: da,
  creator: pa,
  last_editor: fa,
  date_modified: ga,
  dark: ya,
  water: ha,
  tree: va,
  colors: xa
}, Tt = [
  Qo,
  br,
  xr,
  Ar,
  Yr,
  ea,
  _a,
  wa
];
function It(e) {
  return e == null || Object.keys(e).length === 0 ? (console.warn("layer_resolver received empty color config"), []) : [
    // Ocean canvas background (Protomaps: background = ocean, not land)
    {
      id: ["background"],
      paint: { "background-color": e.mx_map_water.color }
    },
    // Land fill (Protomaps: earth = land, was "background" in legacy style)
    {
      id: ["earth"],
      layout: { visibility: e.mx_map_background.visibility },
      paint: { "fill-color": e.mx_map_background.color }
    },
    {
      id: ["landuse_vegetation", "national_park", "landcover_vegetation"],
      layout: { visibility: e.mx_map_vegetation.visibility },
      paint: { "fill-color": e.mx_map_vegetation.color }
    },
    {
      id: ["landuse_commercial"],
      layout: { visibility: e.mx_map_zone_commercial.visibility },
      paint: { "fill-color": e.mx_map_zone_commercial.color }
    },
    {
      id: ["landuse_snow"],
      layout: { visibility: e.mx_map_snow.visibility },
      paint: { "fill-color": e.mx_map_snow.color }
    },
    // Water: named water bodies + rivers
    {
      id: ["water", "water_river"],
      layout: { visibility: e.mx_map_water.visibility },
      paint: { "fill-color": e.mx_map_water.color }
    },
    {
      id: ["waterway"],
      layout: { visibility: e.mx_map_water.visibility },
      paint: { "line-color": e.mx_map_water.color }
    },
    // Bathymetry depth zones (ocean only — after water fill, on top)
    {
      id: ["bathymetry"],
      layout: {
        visibility: ka([
          e.mx_map_bathymetry_low.visibility,
          e.mx_map_bathymetry_high.visibility
        ])
      },
      paint: {
        "fill-color": [
          "interpolate",
          ["linear"],
          ["get", "mindepth"],
          -9e3,
          e.mx_map_bathymetry_low.color,
          0,
          e.mx_map_bathymetry_high.color
        ]
      }
    },
    // Bathymetry zone contour lines
    {
      id: ["bathymetry-lines"],
      layout: { visibility: e.mx_map_bathymetry_lines.visibility },
      paint: { "line-color": e.mx_map_bathymetry_lines.color }
    },
    // Contours (added dynamically after map load)
    {
      id: ["contour-lines"],
      layout: { visibility: e.mx_map_contour_lines.visibility },
      paint: { "line-color": e.mx_map_contour_lines.color }
    },
    {
      id: ["contour-labels"],
      layout: {
        visibility: e.mx_map_text_contour.visibility,
        "text-font": fe(e.mx_map_text_contour.font)
      },
      paint: { "text-color": e.mx_map_text_contour.color }
    },
    // Mask (country-code overlay)
    {
      id: ["country-code"],
      layout: { visibility: e.mx_map_mask.visibility },
      paint: { "fill-color": e.mx_map_mask.color }
    },
    // Roads
    {
      id: [
        "road_path_tunnel",
        "road_path",
        "road_path_bridge",
        "road_regular_tunnel",
        "road_regular",
        "road_regular_bridge",
        "road_motor_tunnel",
        "road_motor",
        "road_motor_bridge"
      ],
      layout: { visibility: e.mx_map_road.visibility },
      paint: { "line-color": e.mx_map_road.color }
    },
    {
      id: ["road_rail", "road_rail_ticks"],
      layout: { visibility: e.mx_map_rail.visibility },
      paint: { "line-color": e.mx_map_rail.color }
    },
    {
      id: ["road_pedestrian_polygon", "road_polygon"],
      layout: { visibility: e.mx_map_road.visibility },
      paint: { "fill-color": e.mx_map_road.color }
    },
    {
      id: [
        "road_path_tunnel_case",
        "road_path_case",
        "road_path_bridge_case",
        "road_regular_tunnel_case",
        "road_regular_case",
        "road_regular_bridge_case",
        "road_motor_tunnel_case",
        "road_motor_case",
        "road_motor_bridge_case"
      ],
      layout: { visibility: e.mx_map_road_border.visibility },
      paint: { "line-color": e.mx_map_road_border.color }
    },
    // Buildings
    {
      id: ["building_extrusion"],
      paint: { "fill-extrusion-color": e.mx_map_building.color }
    },
    {
      id: ["building"],
      layout: { visibility: e.mx_map_building.visibility },
      paint: { "fill-color": e.mx_map_building.color }
    },
    {
      id: ["building_border"],
      layout: { visibility: e.mx_map_building_border.visibility },
      paint: { "line-color": e.mx_map_building_border.color }
    },
    // Boundaries
    ...[1, 2, 3, 4, 8, 9, 6].map((t) => ({
      id: [`boundary_un_${t}`],
      layout: { visibility: e[`mx_map_boundary_un_${t}`].visibility },
      paint: { "line-color": e[`mx_map_boundary_un_${t}`].color }
    })),
    // Place labels
    {
      id: ["places_locality_capital", "places_locality_regional", "places_locality_minor"],
      layout: {
        visibility: e.mx_map_text_place.visibility,
        "text-font": fe(e.mx_map_text_place.font)
      },
      paint: {
        "text-color": e.mx_map_text_place.color,
        "icon-color": e.mx_map_text_place.color
      }
    },
    // Sub-country level 1 labels
    ...[1].map((t) => ({
      id: [`country_un_1_label_${t}`],
      layout: {
        visibility: e[`mx_map_text_country_1_${t}`].visibility,
        "text-font": fe(e[`mx_map_text_country_1_${t}`].font)
      },
      paint: {
        "text-color": e[`mx_map_text_country_1_${t}`].color,
        "icon-color": e[`mx_map_text_country_1_${t}`].color
      }
    })),
    // Country level 0 labels
    ...[0, 1, 2, 3, 4, 5, 99].map((t) => ({
      id: [`country_un_0_label_${t}`],
      layout: {
        visibility: e[`mx_map_text_country_0_${t}`].visibility,
        "text-font": fe(e[`mx_map_text_country_0_${t}`].font)
      },
      paint: {
        "text-color": e[`mx_map_text_country_0_${t}`].color,
        "icon-color": e[`mx_map_text_country_0_${t}`].color
      }
    })),
    // Water labels
    {
      id: ["water-label-line", "water-label-point", "waterway-label"],
      layout: {
        visibility: e.mx_map_text_water.visibility,
        "text-font": fe(e.mx_map_text_water.font)
      },
      paint: {
        "text-color": e.mx_map_text_water.color,
        "icon-color": e.mx_map_text_water.color
      }
    },
    {
      id: ["road-label"],
      layout: {
        visibility: e.mx_map_text_road.visibility,
        "text-font": fe(e.mx_map_text_road.font)
      },
      paint: { "text-color": e.mx_map_text_road.color }
    },
    // Text halos
    {
      id: ["water-label-line", "water-label-point", "waterway-label"],
      paint: { "text-halo-color": e.mx_map_text_water_outline.color }
    },
    {
      id: [
        "road-label",
        "places_locality_capital",
        "places_locality_regional",
        "places_locality_minor",
        "country_un_0_label_0",
        "country_un_0_label_1",
        "country_un_0_label_2",
        "country_un_0_label_3",
        "country_un_0_label_4",
        "country_un_0_label_5",
        "country_un_0_label_99",
        "country_un_1_label_1",
        "contour-labels"
      ],
      paint: { "text-halo-color": e.mx_map_text_land_outline.color }
    }
  ];
}
function fe(e) {
  return [e || "Noto Sans Regular"];
}
function ka(e) {
  return e.every((t) => t === "visible") ? "visible" : "none";
}
const { min: za, max: Sa } = Math, pe = (e, t = 0, i = 1) => za(Sa(t, e), i), gt = (e) => {
  e._clipped = !1, e._unclipped = e.slice(0);
  for (let t = 0; t <= 3; t++)
    t < 3 ? ((e[t] < 0 || e[t] > 255) && (e._clipped = !0), e[t] = pe(e[t], 0, 255)) : t === 3 && (e[t] = pe(e[t], 0, 1));
  return e;
}, gi = {};
for (let e of [
  "Boolean",
  "Number",
  "String",
  "Function",
  "Array",
  "Date",
  "RegExp",
  "Undefined",
  "Null"
])
  gi[`[object ${e}]`] = e.toLowerCase();
function $(e) {
  return gi[Object.prototype.toString.call(e)] || "object";
}
const S = (e, t = null) => e.length >= 3 ? Array.prototype.slice.call(e) : $(e[0]) == "object" && t ? t.split("").filter((i) => e[0][i] !== void 0).map((i) => e[0][i]) : e[0].slice(0), ze = (e) => {
  if (e.length < 2) return null;
  const t = e.length - 1;
  return $(e[t]) == "string" ? e[t].toLowerCase() : null;
}, { PI: Ye, min: yi, max: hi } = Math, W = (e) => Math.round(e * 100) / 100, ct = (e) => Math.round(e * 100) / 100, se = Ye * 2, We = Ye / 3, $a = Ye / 180, La = 180 / Ye;
function vi(e) {
  return [...e.slice(0, 3).reverse(), ...e.slice(3)];
}
const z = {
  format: {},
  autodetect: []
};
class d {
  constructor(...t) {
    const i = this;
    if ($(t[0]) === "object" && t[0].constructor && t[0].constructor === this.constructor)
      return t[0];
    let o = ze(t), r = !1;
    if (!o) {
      r = !0, z.sorted || (z.autodetect = z.autodetect.sort((a, l) => l.p - a.p), z.sorted = !0);
      for (let a of z.autodetect)
        if (o = a.test(...t), o) break;
    }
    if (z.format[o]) {
      const a = z.format[o].apply(
        null,
        r ? t : t.slice(0, -1)
      );
      i._rgb = gt(a);
    } else
      throw new Error("unknown format: " + t);
    i._rgb.length === 3 && i._rgb.push(1);
  }
  toString() {
    return $(this.hex) == "function" ? this.hex() : `[${this._rgb.join(",")}]`;
  }
}
const Ea = "3.2.0", N = (...e) => new d(...e);
N.version = Ea;
const we = {
  aliceblue: "#f0f8ff",
  antiquewhite: "#faebd7",
  aqua: "#00ffff",
  aquamarine: "#7fffd4",
  azure: "#f0ffff",
  beige: "#f5f5dc",
  bisque: "#ffe4c4",
  black: "#000000",
  blanchedalmond: "#ffebcd",
  blue: "#0000ff",
  blueviolet: "#8a2be2",
  brown: "#a52a2a",
  burlywood: "#deb887",
  cadetblue: "#5f9ea0",
  chartreuse: "#7fff00",
  chocolate: "#d2691e",
  coral: "#ff7f50",
  cornflowerblue: "#6495ed",
  cornsilk: "#fff8dc",
  crimson: "#dc143c",
  cyan: "#00ffff",
  darkblue: "#00008b",
  darkcyan: "#008b8b",
  darkgoldenrod: "#b8860b",
  darkgray: "#a9a9a9",
  darkgreen: "#006400",
  darkgrey: "#a9a9a9",
  darkkhaki: "#bdb76b",
  darkmagenta: "#8b008b",
  darkolivegreen: "#556b2f",
  darkorange: "#ff8c00",
  darkorchid: "#9932cc",
  darkred: "#8b0000",
  darksalmon: "#e9967a",
  darkseagreen: "#8fbc8f",
  darkslateblue: "#483d8b",
  darkslategray: "#2f4f4f",
  darkslategrey: "#2f4f4f",
  darkturquoise: "#00ced1",
  darkviolet: "#9400d3",
  deeppink: "#ff1493",
  deepskyblue: "#00bfff",
  dimgray: "#696969",
  dimgrey: "#696969",
  dodgerblue: "#1e90ff",
  firebrick: "#b22222",
  floralwhite: "#fffaf0",
  forestgreen: "#228b22",
  fuchsia: "#ff00ff",
  gainsboro: "#dcdcdc",
  ghostwhite: "#f8f8ff",
  gold: "#ffd700",
  goldenrod: "#daa520",
  gray: "#808080",
  green: "#008000",
  greenyellow: "#adff2f",
  grey: "#808080",
  honeydew: "#f0fff0",
  hotpink: "#ff69b4",
  indianred: "#cd5c5c",
  indigo: "#4b0082",
  ivory: "#fffff0",
  khaki: "#f0e68c",
  laserlemon: "#ffff54",
  lavender: "#e6e6fa",
  lavenderblush: "#fff0f5",
  lawngreen: "#7cfc00",
  lemonchiffon: "#fffacd",
  lightblue: "#add8e6",
  lightcoral: "#f08080",
  lightcyan: "#e0ffff",
  lightgoldenrod: "#fafad2",
  lightgoldenrodyellow: "#fafad2",
  lightgray: "#d3d3d3",
  lightgreen: "#90ee90",
  lightgrey: "#d3d3d3",
  lightpink: "#ffb6c1",
  lightsalmon: "#ffa07a",
  lightseagreen: "#20b2aa",
  lightskyblue: "#87cefa",
  lightslategray: "#778899",
  lightslategrey: "#778899",
  lightsteelblue: "#b0c4de",
  lightyellow: "#ffffe0",
  lime: "#00ff00",
  limegreen: "#32cd32",
  linen: "#faf0e6",
  magenta: "#ff00ff",
  maroon: "#800000",
  maroon2: "#7f0000",
  maroon3: "#b03060",
  mediumaquamarine: "#66cdaa",
  mediumblue: "#0000cd",
  mediumorchid: "#ba55d3",
  mediumpurple: "#9370db",
  mediumseagreen: "#3cb371",
  mediumslateblue: "#7b68ee",
  mediumspringgreen: "#00fa9a",
  mediumturquoise: "#48d1cc",
  mediumvioletred: "#c71585",
  midnightblue: "#191970",
  mintcream: "#f5fffa",
  mistyrose: "#ffe4e1",
  moccasin: "#ffe4b5",
  navajowhite: "#ffdead",
  navy: "#000080",
  oldlace: "#fdf5e6",
  olive: "#808000",
  olivedrab: "#6b8e23",
  orange: "#ffa500",
  orangered: "#ff4500",
  orchid: "#da70d6",
  palegoldenrod: "#eee8aa",
  palegreen: "#98fb98",
  paleturquoise: "#afeeee",
  palevioletred: "#db7093",
  papayawhip: "#ffefd5",
  peachpuff: "#ffdab9",
  peru: "#cd853f",
  pink: "#ffc0cb",
  plum: "#dda0dd",
  powderblue: "#b0e0e6",
  purple: "#800080",
  purple2: "#7f007f",
  purple3: "#a020f0",
  rebeccapurple: "#663399",
  red: "#ff0000",
  rosybrown: "#bc8f8f",
  royalblue: "#4169e1",
  saddlebrown: "#8b4513",
  salmon: "#fa8072",
  sandybrown: "#f4a460",
  seagreen: "#2e8b57",
  seashell: "#fff5ee",
  sienna: "#a0522d",
  silver: "#c0c0c0",
  skyblue: "#87ceeb",
  slateblue: "#6a5acd",
  slategray: "#708090",
  slategrey: "#708090",
  snow: "#fffafa",
  springgreen: "#00ff7f",
  steelblue: "#4682b4",
  tan: "#d2b48c",
  teal: "#008080",
  thistle: "#d8bfd8",
  tomato: "#ff6347",
  turquoise: "#40e0d0",
  violet: "#ee82ee",
  wheat: "#f5deb3",
  white: "#ffffff",
  whitesmoke: "#f5f5f5",
  yellow: "#ffff00",
  yellowgreen: "#9acd32"
}, Na = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, Ra = /^#?([A-Fa-f0-9]{8}|[A-Fa-f0-9]{4})$/, xi = (e) => {
  if (e.match(Na)) {
    (e.length === 4 || e.length === 7) && (e = e.substr(1)), e.length === 3 && (e = e.split(""), e = e[0] + e[0] + e[1] + e[1] + e[2] + e[2]);
    const t = parseInt(e, 16), i = t >> 16, o = t >> 8 & 255, r = t & 255;
    return [i, o, r, 1];
  }
  if (e.match(Ra)) {
    (e.length === 5 || e.length === 9) && (e = e.substr(1)), e.length === 4 && (e = e.split(""), e = e[0] + e[0] + e[1] + e[1] + e[2] + e[2] + e[3] + e[3]);
    const t = parseInt(e, 16), i = t >> 24 & 255, o = t >> 16 & 255, r = t >> 8 & 255, a = Math.round((t & 255) / 255 * 100) / 100;
    return [i, o, r, a];
  }
  throw new Error(`unknown hex color: ${e}`);
}, { round: Te } = Math, wi = (...e) => {
  let [t, i, o, r] = S(e, "rgba"), a = ze(e) || "auto";
  r === void 0 && (r = 1), a === "auto" && (a = r < 1 ? "rgba" : "rgb"), t = Te(t), i = Te(i), o = Te(o);
  let n = "000000" + (t << 16 | i << 8 | o).toString(16);
  n = n.substr(n.length - 6);
  let s = "0" + Te(r * 255).toString(16);
  switch (s = s.substr(s.length - 2), a.toLowerCase()) {
    case "rgba":
      return `#${n}${s}`;
    case "argb":
      return `#${s}${n}`;
    default:
      return `#${n}`;
  }
};
d.prototype.name = function() {
  const e = wi(this._rgb, "rgb");
  for (let t of Object.keys(we))
    if (we[t] === e) return t.toLowerCase();
  return e;
};
z.format.named = (e) => {
  if (e = e.toLowerCase(), we[e]) return xi(we[e]);
  throw new Error("unknown color name: " + e);
};
z.autodetect.push({
  p: 5,
  test: (e, ...t) => {
    if (!t.length && $(e) === "string" && we[e.toLowerCase()])
      return "named";
  }
});
d.prototype.alpha = function(e, t = !1) {
  return e !== void 0 && $(e) === "number" ? t ? (this._rgb[3] = e, this) : new d([this._rgb[0], this._rgb[1], this._rgb[2], e], "rgb") : this._rgb[3];
};
d.prototype.clipped = function() {
  return this._rgb._clipped || !1;
};
const le = {
  // Corresponds roughly to RGB brighter/darker
  Kn: 18,
  // D65 standard referent
  labWhitePoint: "d65",
  Xn: 0.95047,
  Yn: 1,
  Zn: 1.08883,
  kE: 216 / 24389,
  kKE: 8,
  kK: 24389 / 27,
  RefWhiteRGB: {
    // sRGB
    X: 0.95047,
    Y: 1,
    Z: 1.08883
  },
  MtxRGB2XYZ: {
    m00: 0.4124564390896922,
    m01: 0.21267285140562253,
    m02: 0.0193338955823293,
    m10: 0.357576077643909,
    m11: 0.715152155287818,
    m12: 0.11919202588130297,
    m20: 0.18043748326639894,
    m21: 0.07217499330655958,
    m22: 0.9503040785363679
  },
  MtxXYZ2RGB: {
    m00: 3.2404541621141045,
    m01: -0.9692660305051868,
    m02: 0.055643430959114726,
    m10: -1.5371385127977166,
    m11: 1.8760108454466942,
    m12: -0.2040259135167538,
    m20: -0.498531409556016,
    m21: 0.041556017530349834,
    m22: 1.0572251882231791
  },
  // used in rgb2xyz
  As: 0.9414285350000001,
  Bs: 1.040417467,
  Cs: 1.089532651,
  MtxAdaptMa: {
    m00: 0.8951,
    m01: -0.7502,
    m02: 0.0389,
    m10: 0.2664,
    m11: 1.7135,
    m12: -0.0685,
    m20: -0.1614,
    m21: 0.0367,
    m22: 1.0296
  },
  MtxAdaptMaI: {
    m00: 0.9869929054667123,
    m01: 0.43230526972339456,
    m02: -0.008528664575177328,
    m10: -0.14705425642099013,
    m11: 0.5183602715367776,
    m12: 0.04004282165408487,
    m20: 0.15996265166373125,
    m21: 0.0492912282128556,
    m22: 0.9684866957875502
  }
}, Ma = /* @__PURE__ */ new Map([
  // ASTM E308-01
  ["a", [1.0985, 0.35585]],
  // Wyszecki & Stiles, p. 769
  ["b", [1.0985, 0.35585]],
  // C ASTM E308-01
  ["c", [0.98074, 1.18232]],
  // D50 (ASTM E308-01)
  ["d50", [0.96422, 0.82521]],
  // D55 (ASTM E308-01)
  ["d55", [0.95682, 0.92149]],
  // D65 (ASTM E308-01)
  ["d65", [0.95047, 1.08883]],
  // E (ASTM E308-01)
  ["e", [1, 1, 1]],
  // F2 (ASTM E308-01)
  ["f2", [0.99186, 0.67393]],
  // F7 (ASTM E308-01)
  ["f7", [0.95041, 1.08747]],
  // F11 (ASTM E308-01)
  ["f11", [1.00962, 0.6435]],
  ["icc", [0.96422, 0.82521]]
]);
function ce(e) {
  const t = Ma.get(String(e).toLowerCase());
  if (!t)
    throw new Error("unknown Lab illuminant " + e);
  le.labWhitePoint = e, le.Xn = t[0], le.Zn = t[1];
}
function Ae() {
  return le.labWhitePoint;
}
const yt = (...e) => {
  e = S(e, "lab");
  const [t, i, o] = e, [r, a, l] = Aa(t, i, o), [n, s, c] = ki(r, a, l);
  return [n, s, c, e.length > 3 ? e[3] : 1];
}, Aa = (e, t, i) => {
  const { kE: o, kK: r, kKE: a, Xn: l, Yn: n, Zn: s } = le, c = (e + 16) / 116, u = 2e-3 * t + c, b = c - 5e-3 * i, _ = u * u * u, p = b * b * b, v = _ > o ? _ : (116 * u - 16) / r, x = e > a ? Math.pow((e + 16) / 116, 3) : e / r, g = p > o ? p : (116 * b - 16) / r, h = v * l, P = x * n, A = g * s;
  return [h, P, A];
}, qe = (e) => {
  const t = Math.sign(e);
  return e = Math.abs(e), (e <= 31308e-7 ? e * 12.92 : 1.055 * Math.pow(e, 1 / 2.4) - 0.055) * t;
}, ki = (e, t, i) => {
  const { MtxAdaptMa: o, MtxAdaptMaI: r, MtxXYZ2RGB: a, RefWhiteRGB: l, Xn: n, Yn: s, Zn: c } = le, u = n * o.m00 + s * o.m10 + c * o.m20, b = n * o.m01 + s * o.m11 + c * o.m21, _ = n * o.m02 + s * o.m12 + c * o.m22, p = l.X * o.m00 + l.Y * o.m10 + l.Z * o.m20, v = l.X * o.m01 + l.Y * o.m11 + l.Z * o.m21, x = l.X * o.m02 + l.Y * o.m12 + l.Z * o.m22, g = (e * o.m00 + t * o.m10 + i * o.m20) * (p / u), h = (e * o.m01 + t * o.m11 + i * o.m21) * (v / b), P = (e * o.m02 + t * o.m12 + i * o.m22) * (x / _), A = g * r.m00 + h * r.m10 + P * r.m20, T = g * r.m01 + h * r.m11 + P * r.m21, I = g * r.m02 + h * r.m12 + P * r.m22, H = qe(
    A * a.m00 + T * a.m10 + I * a.m20
  ), E = qe(
    A * a.m01 + T * a.m11 + I * a.m21
  ), m = qe(
    A * a.m02 + T * a.m12 + I * a.m22
  );
  return [H * 255, E * 255, m * 255];
}, ht = (...e) => {
  const [t, i, o, ...r] = S(e, "rgb"), [a, l, n] = zi(t, i, o), [s, c, u] = ja(a, l, n);
  return [s, c, u, ...r.length > 0 && r[0] < 1 ? [r[0]] : []];
};
function ja(e, t, i) {
  const { Xn: o, Yn: r, Zn: a, kE: l, kK: n } = le, s = e / o, c = t / r, u = i / a, b = s > l ? Math.pow(s, 1 / 3) : (n * s + 16) / 116, _ = c > l ? Math.pow(c, 1 / 3) : (n * c + 16) / 116, p = u > l ? Math.pow(u, 1 / 3) : (n * u + 16) / 116;
  return [116 * _ - 16, 500 * (b - _), 200 * (_ - p)];
}
function Je(e) {
  const t = Math.sign(e);
  return e = Math.abs(e), (e <= 0.04045 ? e / 12.92 : Math.pow((e + 0.055) / 1.055, 2.4)) * t;
}
const zi = (e, t, i) => {
  e = Je(e / 255), t = Je(t / 255), i = Je(i / 255);
  const { MtxRGB2XYZ: o, MtxAdaptMa: r, MtxAdaptMaI: a, Xn: l, Yn: n, Zn: s, As: c, Bs: u, Cs: b } = le;
  let _ = e * o.m00 + t * o.m10 + i * o.m20, p = e * o.m01 + t * o.m11 + i * o.m21, v = e * o.m02 + t * o.m12 + i * o.m22;
  const x = l * r.m00 + n * r.m10 + s * r.m20, g = l * r.m01 + n * r.m11 + s * r.m21, h = l * r.m02 + n * r.m12 + s * r.m22;
  let P = _ * r.m00 + p * r.m10 + v * r.m20, A = _ * r.m01 + p * r.m11 + v * r.m21, T = _ * r.m02 + p * r.m12 + v * r.m22;
  return P *= x / c, A *= g / u, T *= h / b, _ = P * a.m00 + A * a.m10 + T * a.m20, p = P * a.m01 + A * a.m11 + T * a.m21, v = P * a.m02 + A * a.m12 + T * a.m22, [_, p, v];
};
d.prototype.lab = function() {
  return ht(this._rgb);
};
const Ca = (...e) => new d(...e, "lab");
Object.assign(N, { lab: Ca, getLabWhitePoint: Ae, setLabWhitePoint: ce });
z.format.lab = yt;
z.autodetect.push({
  p: 2,
  test: (...e) => {
    if (e = S(e, "lab"), $(e) === "array" && e.length === 3)
      return "lab";
  }
});
d.prototype.darken = function(e = 1) {
  const t = this, i = t.lab();
  return i[0] -= le.Kn * e, new d(i, "lab").alpha(t.alpha(), !0);
};
d.prototype.brighten = function(e = 1) {
  return this.darken(-e);
};
d.prototype.darker = d.prototype.darken;
d.prototype.brighter = d.prototype.brighten;
d.prototype.get = function(e) {
  const [t, i] = e.split("."), o = this[t]();
  if (i) {
    const r = t.indexOf(i) - (t.substr(0, 2) === "ok" ? 2 : 0);
    if (r > -1) return o[r];
    throw new Error(`unknown channel ${i} in mode ${t}`);
  } else
    return o;
};
const { pow: Ta } = Math, Ia = 1e-7, Pa = 20;
d.prototype.luminance = function(e, t = "rgb") {
  if (e !== void 0 && $(e) === "number") {
    if (e === 0)
      return new d([0, 0, 0, this._rgb[3]], "rgb");
    if (e === 1)
      return new d([255, 255, 255, this._rgb[3]], "rgb");
    let i = this.luminance(), o = Pa;
    const r = (l, n) => {
      const s = l.interpolate(n, 0.5, t), c = s.luminance();
      return Math.abs(e - c) < Ia || !o-- ? s : c > e ? r(l, s) : r(s, n);
    }, a = (i > e ? r(new d([0, 0, 0]), this) : r(this, new d([255, 255, 255]))).rgb();
    return new d([...a, this._rgb[3]]);
  }
  return Oa(...this._rgb.slice(0, 3));
};
const Oa = (e, t, i) => (e = Qe(e), t = Qe(t), i = Qe(i), 0.2126 * e + 0.7152 * t + 0.0722 * i), Qe = (e) => (e /= 255, e <= 0.03928 ? e / 12.92 : Ta((e + 0.055) / 1.055, 2.4)), Y = {}, ke = (e, t, i = 0.5, ...o) => {
  let r = o[0] || "lrgb";
  if (!Y[r] && !o.length && (r = Object.keys(Y)[0]), !Y[r])
    throw new Error(`interpolation mode ${r} is not defined`);
  return $(e) !== "object" && (e = new d(e)), $(t) !== "object" && (t = new d(t)), Y[r](e, t, i).alpha(
    e.alpha() + i * (t.alpha() - e.alpha())
  );
};
d.prototype.mix = d.prototype.interpolate = function(e, t = 0.5, ...i) {
  return ke(this, e, t, ...i);
};
d.prototype.premultiply = function(e = !1) {
  const t = this._rgb, i = t[3];
  return e ? (this._rgb = [t[0] * i, t[1] * i, t[2] * i, i], this) : new d([t[0] * i, t[1] * i, t[2] * i, i], "rgb");
};
const { sin: Ba, cos: Ua } = Math, Si = (...e) => {
  let [t, i, o] = S(e, "lch");
  return isNaN(o) && (o = 0), o = o * $a, [t, Ua(o) * i, Ba(o) * i];
}, vt = (...e) => {
  e = S(e, "lch");
  const [t, i, o] = e, [r, a, l] = Si(t, i, o), [n, s, c] = yt(r, a, l);
  return [n, s, c, e.length > 3 ? e[3] : 1];
}, Ha = (...e) => {
  const t = vi(S(e, "hcl"));
  return vt(...t);
}, { sqrt: Da, atan2: Ya, round: Ga } = Math, $i = (...e) => {
  const [t, i, o] = S(e, "lab"), r = Da(i * i + o * o);
  let a = (Ya(o, i) * La + 360) % 360;
  return Ga(r * 1e4) === 0 && (a = Number.NaN), [t, r, a];
}, xt = (...e) => {
  const [t, i, o, ...r] = S(e, "rgb"), [a, l, n] = ht(t, i, o), [s, c, u] = $i(a, l, n);
  return [s, c, u, ...r.length > 0 && r[0] < 1 ? [r[0]] : []];
};
d.prototype.lch = function() {
  return xt(this._rgb);
};
d.prototype.hcl = function() {
  return vi(xt(this._rgb));
};
const Za = (...e) => new d(...e, "lch"), Fa = (...e) => new d(...e, "hcl");
Object.assign(N, { lch: Za, hcl: Fa });
z.format.lch = vt;
z.format.hcl = Ha;
["lch", "hcl"].forEach(
  (e) => z.autodetect.push({
    p: 2,
    test: (...t) => {
      if (t = S(t, e), $(t) === "array" && t.length === 3)
        return e;
    }
  })
);
d.prototype.saturate = function(e = 1) {
  const t = this, i = t.lch();
  return i[1] += le.Kn * e, i[1] < 0 && (i[1] = 0), new d(i, "lch").alpha(t.alpha(), !0);
};
d.prototype.desaturate = function(e = 1) {
  return this.saturate(-e);
};
d.prototype.set = function(e, t, i = !1) {
  const [o, r] = e.split("."), a = this[o]();
  if (r) {
    const l = o.indexOf(r) - (o.substr(0, 2) === "ok" ? 2 : 0);
    if (l > -1) {
      if ($(t) == "string")
        switch (t.charAt(0)) {
          case "+":
            a[l] += +t;
            break;
          case "-":
            a[l] += +t;
            break;
          case "*":
            a[l] *= +t.substr(1);
            break;
          case "/":
            a[l] /= +t.substr(1);
            break;
          default:
            a[l] = +t;
        }
      else if ($(t) === "number")
        a[l] = t;
      else
        throw new Error("unsupported value for Color.set");
      const n = new d(a, o);
      return i ? (this._rgb = n._rgb, this) : n;
    }
    throw new Error(`unknown channel ${r} in mode ${o}`);
  } else
    return a;
};
d.prototype.tint = function(e = 0.5, ...t) {
  return ke(this, "white", e, ...t);
};
d.prototype.shade = function(e = 0.5, ...t) {
  return ke(this, "black", e, ...t);
};
const Ka = (e, t, i) => {
  const o = e._rgb, r = t._rgb;
  return new d(
    o[0] + i * (r[0] - o[0]),
    o[1] + i * (r[1] - o[1]),
    o[2] + i * (r[2] - o[2]),
    "rgb"
  );
};
Y.rgb = Ka;
const { sqrt: et, pow: ge } = Math, Xa = (e, t, i) => {
  const [o, r, a] = e._rgb, [l, n, s] = t._rgb;
  return new d(
    et(ge(o, 2) * (1 - i) + ge(l, 2) * i),
    et(ge(r, 2) * (1 - i) + ge(n, 2) * i),
    et(ge(a, 2) * (1 - i) + ge(s, 2) * i),
    "rgb"
  );
};
Y.lrgb = Xa;
const Va = (e, t, i) => {
  const o = e.lab(), r = t.lab();
  return new d(
    o[0] + i * (r[0] - o[0]),
    o[1] + i * (r[1] - o[1]),
    o[2] + i * (r[2] - o[2]),
    "lab"
  );
};
Y.lab = Va;
const Se = (e, t, i, o) => {
  let r, a;
  o === "hsl" ? (r = e.hsl(), a = t.hsl()) : o === "hsv" ? (r = e.hsv(), a = t.hsv()) : o === "hcg" ? (r = e.hcg(), a = t.hcg()) : o === "hsi" ? (r = e.hsi(), a = t.hsi()) : o === "lch" || o === "hcl" ? (o = "hcl", r = e.hcl(), a = t.hcl()) : o === "oklch" && (r = e.oklch().reverse(), a = t.oklch().reverse());
  let l, n, s, c, u, b;
  (o.substr(0, 1) === "h" || o === "oklch") && ([l, s, u] = r, [n, c, b] = a);
  let _, p, v, x;
  return !isNaN(l) && !isNaN(n) ? (n > l && n - l > 180 ? x = n - (l + 360) : n < l && l - n > 180 ? x = n + 360 - l : x = n - l, p = l + i * x) : isNaN(l) ? isNaN(n) ? p = Number.NaN : (p = n, (u == 1 || u == 0) && o != "hsv" && (_ = c)) : (p = l, (b == 1 || b == 0) && o != "hsv" && (_ = s)), _ === void 0 && (_ = s + i * (c - s)), v = u + i * (b - u), o === "oklch" ? new d([v, _, p], o) : new d([p, _, v], o);
}, Li = (e, t, i) => Se(e, t, i, "lch");
Y.lch = Li;
Y.hcl = Li;
const Wa = (e) => {
  if ($(e) == "number" && e >= 0 && e <= 16777215) {
    const t = e >> 16, i = e >> 8 & 255, o = e & 255;
    return [t, i, o, 1];
  }
  throw new Error("unknown num color: " + e);
}, qa = (...e) => {
  const [t, i, o] = S(e, "rgb");
  return (t << 16) + (i << 8) + o;
};
d.prototype.num = function() {
  return qa(this._rgb);
};
const Ja = (...e) => new d(...e, "num");
Object.assign(N, { num: Ja });
z.format.num = Wa;
z.autodetect.push({
  p: 5,
  test: (...e) => {
    if (e.length === 1 && $(e[0]) === "number" && e[0] >= 0 && e[0] <= 16777215)
      return "num";
  }
});
const Qa = (e, t, i) => {
  const o = e.num(), r = t.num();
  return new d(o + i * (r - o), "num");
};
Y.num = Qa;
const { floor: el } = Math, tl = (...e) => {
  e = S(e, "hcg");
  let [t, i, o] = e, r, a, l;
  o = o * 255;
  const n = i * 255;
  if (i === 0)
    r = a = l = o;
  else {
    t === 360 && (t = 0), t > 360 && (t -= 360), t < 0 && (t += 360), t /= 60;
    const s = el(t), c = t - s, u = o * (1 - i), b = u + n * (1 - c), _ = u + n * c, p = u + n;
    switch (s) {
      case 0:
        [r, a, l] = [p, _, u];
        break;
      case 1:
        [r, a, l] = [b, p, u];
        break;
      case 2:
        [r, a, l] = [u, p, _];
        break;
      case 3:
        [r, a, l] = [u, b, p];
        break;
      case 4:
        [r, a, l] = [_, u, p];
        break;
      case 5:
        [r, a, l] = [p, u, b];
        break;
    }
  }
  return [r, a, l, e.length > 3 ? e[3] : 1];
}, il = (...e) => {
  const [t, i, o] = S(e, "rgb"), r = yi(t, i, o), a = hi(t, i, o), l = a - r, n = l * 100 / 255, s = r / (255 - l) * 100;
  let c;
  return l === 0 ? c = Number.NaN : (t === a && (c = (i - o) / l), i === a && (c = 2 + (o - t) / l), o === a && (c = 4 + (t - i) / l), c *= 60, c < 0 && (c += 360)), [c, n, s];
};
d.prototype.hcg = function() {
  return il(this._rgb);
};
const ol = (...e) => new d(...e, "hcg");
N.hcg = ol;
z.format.hcg = tl;
z.autodetect.push({
  p: 1,
  test: (...e) => {
    if (e = S(e, "hcg"), $(e) === "array" && e.length === 3)
      return "hcg";
  }
});
const rl = (e, t, i) => Se(e, t, i, "hcg");
Y.hcg = rl;
const { cos: ye } = Math, al = (...e) => {
  e = S(e, "hsi");
  let [t, i, o] = e, r, a, l;
  return isNaN(t) && (t = 0), isNaN(i) && (i = 0), t > 360 && (t -= 360), t < 0 && (t += 360), t /= 360, t < 1 / 3 ? (l = (1 - i) / 3, r = (1 + i * ye(se * t) / ye(We - se * t)) / 3, a = 1 - (l + r)) : t < 2 / 3 ? (t -= 1 / 3, r = (1 - i) / 3, a = (1 + i * ye(se * t) / ye(We - se * t)) / 3, l = 1 - (r + a)) : (t -= 2 / 3, a = (1 - i) / 3, l = (1 + i * ye(se * t) / ye(We - se * t)) / 3, r = 1 - (a + l)), r = pe(o * r * 3), a = pe(o * a * 3), l = pe(o * l * 3), [r * 255, a * 255, l * 255, e.length > 3 ? e[3] : 1];
}, { min: ll, sqrt: nl, acos: sl } = Math, cl = (...e) => {
  let [t, i, o] = S(e, "rgb");
  t /= 255, i /= 255, o /= 255;
  let r;
  const a = ll(t, i, o), l = (t + i + o) / 3, n = l > 0 ? 1 - a / l : 0;
  return n === 0 ? r = NaN : (r = (t - i + (t - o)) / 2, r /= nl((t - i) * (t - i) + (t - o) * (i - o)), r = sl(r), o > i && (r = se - r), r /= se), [r * 360, n, l];
};
d.prototype.hsi = function() {
  return cl(this._rgb);
};
const bl = (...e) => new d(...e, "hsi");
N.hsi = bl;
z.format.hsi = al;
z.autodetect.push({
  p: 2,
  test: (...e) => {
    if (e = S(e, "hsi"), $(e) === "array" && e.length === 3)
      return "hsi";
  }
});
const _l = (e, t, i) => Se(e, t, i, "hsi");
Y.hsi = _l;
const bt = (...e) => {
  e = S(e, "hsl");
  const [t, i, o] = e;
  let r, a, l;
  if (i === 0)
    r = a = l = o * 255;
  else {
    const n = [0, 0, 0], s = [0, 0, 0], c = o < 0.5 ? o * (1 + i) : o + i - o * i, u = 2 * o - c, b = t / 360;
    n[0] = b + 1 / 3, n[1] = b, n[2] = b - 1 / 3;
    for (let _ = 0; _ < 3; _++)
      n[_] < 0 && (n[_] += 1), n[_] > 1 && (n[_] -= 1), 6 * n[_] < 1 ? s[_] = u + (c - u) * 6 * n[_] : 2 * n[_] < 1 ? s[_] = c : 3 * n[_] < 2 ? s[_] = u + (c - u) * (2 / 3 - n[_]) * 6 : s[_] = u;
    [r, a, l] = [s[0] * 255, s[1] * 255, s[2] * 255];
  }
  return e.length > 3 ? [r, a, l, e[3]] : [r, a, l, 1];
}, Ei = (...e) => {
  e = S(e, "rgba");
  let [t, i, o] = e;
  t /= 255, i /= 255, o /= 255;
  const r = yi(t, i, o), a = hi(t, i, o), l = (a + r) / 2;
  let n, s;
  return a === r ? (n = 0, s = Number.NaN) : n = l < 0.5 ? (a - r) / (a + r) : (a - r) / (2 - a - r), t == a ? s = (i - o) / (a - r) : i == a ? s = 2 + (o - t) / (a - r) : o == a && (s = 4 + (t - i) / (a - r)), s *= 60, s < 0 && (s += 360), e.length > 3 && e[3] !== void 0 ? [s, n, l, e[3]] : [s, n, l];
};
d.prototype.hsl = function() {
  return Ei(this._rgb);
};
const ul = (...e) => new d(...e, "hsl");
N.hsl = ul;
z.format.hsl = bt;
z.autodetect.push({
  p: 2,
  test: (...e) => {
    if (e = S(e, "hsl"), $(e) === "array" && e.length === 3)
      return "hsl";
  }
});
const ml = (e, t, i) => Se(e, t, i, "hsl");
Y.hsl = ml;
const { floor: dl } = Math, pl = (...e) => {
  e = S(e, "hsv");
  let [t, i, o] = e, r, a, l;
  if (o *= 255, i === 0)
    r = a = l = o;
  else {
    t === 360 && (t = 0), t > 360 && (t -= 360), t < 0 && (t += 360), t /= 60;
    const n = dl(t), s = t - n, c = o * (1 - i), u = o * (1 - i * s), b = o * (1 - i * (1 - s));
    switch (n) {
      case 0:
        [r, a, l] = [o, b, c];
        break;
      case 1:
        [r, a, l] = [u, o, c];
        break;
      case 2:
        [r, a, l] = [c, o, b];
        break;
      case 3:
        [r, a, l] = [c, u, o];
        break;
      case 4:
        [r, a, l] = [b, c, o];
        break;
      case 5:
        [r, a, l] = [o, c, u];
        break;
    }
  }
  return [r, a, l, e.length > 3 ? e[3] : 1];
}, { min: fl, max: gl } = Math, yl = (...e) => {
  e = S(e, "rgb");
  let [t, i, o] = e;
  const r = fl(t, i, o), a = gl(t, i, o), l = a - r;
  let n, s, c;
  return c = a / 255, a === 0 ? (n = Number.NaN, s = 0) : (s = l / a, t === a && (n = (i - o) / l), i === a && (n = 2 + (o - t) / l), o === a && (n = 4 + (t - i) / l), n *= 60, n < 0 && (n += 360)), [n, s, c];
};
d.prototype.hsv = function() {
  return yl(this._rgb);
};
const hl = (...e) => new d(...e, "hsv");
N.hsv = hl;
z.format.hsv = pl;
z.autodetect.push({
  p: 2,
  test: (...e) => {
    if (e = S(e, "hsv"), $(e) === "array" && e.length === 3)
      return "hsv";
  }
});
const vl = (e, t, i) => Se(e, t, i, "hsv");
Y.hsv = vl;
function Be(e, t) {
  let i = e.length;
  Array.isArray(e[0]) || (e = [e]), Array.isArray(t[0]) || (t = t.map((l) => [l]));
  let o = t[0].length, r = t[0].map((l, n) => t.map((s) => s[n])), a = e.map(
    (l) => r.map((n) => Array.isArray(l) ? l.reduce((s, c, u) => s + c * (n[u] || 0), 0) : n.reduce((s, c) => s + c * l, 0))
  );
  return i === 1 && (a = a[0]), o === 1 ? a.map((l) => l[0]) : a;
}
const wt = (...e) => {
  e = S(e, "lab");
  const [t, i, o, ...r] = e, [a, l, n] = xl([t, i, o]), [s, c, u] = ki(a, l, n);
  return [s, c, u, ...r.length > 0 && r[0] < 1 ? [r[0]] : []];
};
function xl(e) {
  var t = [
    [1.2268798758459243, -0.5578149944602171, 0.2813910456659647],
    [-0.0405757452148008, 1.112286803280317, -0.0717110580655164],
    [-0.0763729366746601, -0.4214933324022432, 1.5869240198367816]
  ], i = [
    [1, 0.3963377773761749, 0.2158037573099136],
    [1, -0.1055613458156586, -0.0638541728258133],
    [1, -0.0894841775298119, -1.2914855480194092]
  ], o = Be(i, e);
  return Be(
    t,
    o.map((r) => r ** 3)
  );
}
const kt = (...e) => {
  const [t, i, o, ...r] = S(e, "rgb"), a = zi(t, i, o);
  return [...wl(a), ...r.length > 0 && r[0] < 1 ? [r[0]] : []];
};
function wl(e) {
  const t = [
    [0.819022437996703, 0.3619062600528904, -0.1288737815209879],
    [0.0329836539323885, 0.9292868615863434, 0.0361446663506424],
    [0.0481771893596242, 0.2642395317527308, 0.6335478284694309]
  ], i = [
    [0.210454268309314, 0.7936177747023054, -0.0040720430116193],
    [1.9779985324311684, -2.42859224204858, 0.450593709617411],
    [0.0259040424655478, 0.7827717124575296, -0.8086757549230774]
  ], o = Be(t, e);
  return Be(
    i,
    o.map((r) => Math.cbrt(r))
  );
}
d.prototype.oklab = function() {
  return kt(this._rgb);
};
const kl = (...e) => new d(...e, "oklab");
Object.assign(N, { oklab: kl });
z.format.oklab = wt;
z.autodetect.push({
  p: 2,
  test: (...e) => {
    if (e = S(e, "oklab"), $(e) === "array" && e.length === 3)
      return "oklab";
  }
});
const zl = (e, t, i) => {
  const o = e.oklab(), r = t.oklab();
  return new d(
    o[0] + i * (r[0] - o[0]),
    o[1] + i * (r[1] - o[1]),
    o[2] + i * (r[2] - o[2]),
    "oklab"
  );
};
Y.oklab = zl;
const Sl = (e, t, i) => Se(e, t, i, "oklch");
Y.oklch = Sl;
const { pow: tt, sqrt: it, PI: ot, cos: Pt, sin: Ot, atan2: $l } = Math, Ll = (e, t = "lrgb", i = null) => {
  const o = e.length;
  i || (i = Array.from(new Array(o)).map(() => 1));
  const r = o / i.reduce(function(b, _) {
    return b + _;
  });
  if (i.forEach((b, _) => {
    i[_] *= r;
  }), e = e.map((b) => new d(b)), t === "lrgb")
    return El(e, i);
  const a = e.shift(), l = a.get(t), n = [];
  let s = 0, c = 0;
  for (let b = 0; b < l.length; b++)
    if (l[b] = (l[b] || 0) * i[0], n.push(isNaN(l[b]) ? 0 : i[0]), t.charAt(b) === "h" && !isNaN(l[b])) {
      const _ = l[b] / 180 * ot;
      s += Pt(_) * i[0], c += Ot(_) * i[0];
    }
  let u = a.alpha() * i[0];
  e.forEach((b, _) => {
    const p = b.get(t);
    u += b.alpha() * i[_ + 1];
    for (let v = 0; v < l.length; v++)
      if (!isNaN(p[v]))
        if (n[v] += i[_ + 1], t.charAt(v) === "h") {
          const x = p[v] / 180 * ot;
          s += Pt(x) * i[_ + 1], c += Ot(x) * i[_ + 1];
        } else
          l[v] += p[v] * i[_ + 1];
  });
  for (let b = 0; b < l.length; b++)
    if (t.charAt(b) === "h") {
      let _ = $l(c / n[b], s / n[b]) / ot * 180;
      for (; _ < 0; ) _ += 360;
      for (; _ >= 360; ) _ -= 360;
      l[b] = _;
    } else
      l[b] = l[b] / n[b];
  return u /= o, new d(l, t).alpha(u > 0.99999 ? 1 : u, !0);
}, El = (e, t) => {
  const i = e.length, o = [0, 0, 0, 0];
  for (let r = 0; r < e.length; r++) {
    const a = e[r], l = t[r] / i, n = a._rgb;
    o[0] += tt(n[0], 2) * l, o[1] += tt(n[1], 2) * l, o[2] += tt(n[2], 2) * l, o[3] += n[3] * l;
  }
  return o[0] = it(o[0]), o[1] = it(o[1]), o[2] = it(o[2]), o[3] > 0.9999999 && (o[3] = 1), new d(gt(o));
}, { pow: Nl } = Math;
function Ue(e) {
  let t = "rgb", i = N("#ccc"), o = 0, r = [0, 1], a = [0, 1], l = [], n = [0, 0], s = !1, c = [], u = !1, b = 0, _ = 1, p = !1, v = {}, x = !0, g = 1;
  const h = function(m) {
    if (m = m || ["#fff", "#000"], m && $(m) === "string" && N.brewer && N.brewer[m.toLowerCase()] && (m = N.brewer[m.toLowerCase()]), $(m) === "array") {
      m.length === 1 && (m = [m[0], m[0]]), m = m.slice(0);
      for (let y = 0; y < m.length; y++)
        m[y] = N(m[y]);
      l.length = 0;
      for (let y = 0; y < m.length; y++)
        l.push(y / (m.length - 1));
    }
    return H(), c = m;
  }, P = function(m) {
    if (s != null) {
      const y = s.length - 1;
      let k = 0;
      for (; k < y && m >= s[k]; )
        k++;
      return k - 1;
    }
    return 0;
  };
  let A = (m) => m, T = (m) => m;
  const I = function(m, y) {
    let k, f;
    if (y == null && (y = !1), isNaN(m) || m === null)
      return i;
    y ? f = m : s && s.length > 2 ? f = P(m) / (s.length - 2) : _ !== b ? f = (m - b) / (_ - b) : f = 1, f = T(f), y || (f = A(f)), g !== 1 && (f = Nl(f, g)), f = n[0] + f * (1 - n[0] - n[1]), f = pe(f, 0, 1);
    const R = Math.floor(f * 1e4);
    if (x && v[R])
      k = v[R];
    else {
      if ($(c) === "array")
        for (let w = 0; w < l.length; w++) {
          const D = l[w];
          if (f <= D) {
            k = c[w];
            break;
          }
          if (f >= D && w === l.length - 1) {
            k = c[w];
            break;
          }
          if (f > D && f < l[w + 1]) {
            f = (f - D) / (l[w + 1] - D), k = N.interpolate(
              c[w],
              c[w + 1],
              f,
              t
            );
            break;
          }
        }
      else $(c) === "function" && (k = c(f));
      x && (v[R] = k);
    }
    return k;
  };
  var H = () => v = {};
  h(e);
  const E = function(m) {
    const y = N(I(m));
    return u && y[u] ? y[u]() : y;
  };
  return E.classes = function(m) {
    if (m != null) {
      if ($(m) === "array")
        s = m, r = [m[0], m[m.length - 1]];
      else {
        const y = N.analyze(r);
        m === 0 ? s = [y.min, y.max] : s = N.limits(y, "e", m);
      }
      return E;
    }
    return s;
  }, E.domain = function(m) {
    if (!arguments.length)
      return a;
    a = m.slice(0), b = m[0], _ = m[m.length - 1], l = [];
    const y = c.length;
    if (m.length === y && b !== _)
      for (let k of Array.from(m))
        l.push((k - b) / (_ - b));
    else {
      for (let k = 0; k < y; k++)
        l.push(k / (y - 1));
      if (m.length > 2) {
        const k = m.map((R, w) => w / (m.length - 1)), f = m.map((R) => (R - b) / (_ - b));
        f.every((R, w) => k[w] === R) || (T = (R) => {
          if (R <= 0 || R >= 1) return R;
          let w = 0;
          for (; R >= f[w + 1]; ) w++;
          const D = (R - f[w]) / (f[w + 1] - f[w]);
          return k[w] + D * (k[w + 1] - k[w]);
        });
      }
    }
    return r = [b, _], E;
  }, E.mode = function(m) {
    return arguments.length ? (t = m, H(), E) : t;
  }, E.range = function(m, y) {
    return h(m), E;
  }, E.out = function(m) {
    return u = m, E;
  }, E.spread = function(m) {
    return arguments.length ? (o = m, E) : o;
  }, E.correctLightness = function(m) {
    return m == null && (m = !0), p = m, H(), p ? A = function(y) {
      const k = I(0, !0).lab()[0], f = I(1, !0).lab()[0], R = k > f;
      let w = I(y, !0).lab()[0];
      const D = k + (f - k) * y;
      let J = w - D, Q = 0, oe = 1, de = 20;
      for (; Math.abs(J) > 0.01 && de-- > 0; )
        (function() {
          return R && (J *= -1), J < 0 ? (Q = y, y += (oe - y) * 0.5) : (oe = y, y += (Q - y) * 0.5), w = I(y, !0).lab()[0], J = w - D;
        })();
      return y;
    } : A = (y) => y, E;
  }, E.padding = function(m) {
    return m != null ? ($(m) === "number" && (m = [m, m]), n = m, E) : n;
  }, E.colors = function(m, y) {
    arguments.length < 2 && (y = "hex");
    let k = [];
    if (arguments.length === 0)
      k = c.slice(0);
    else if (m === 1)
      k = [E(0.5)];
    else if (m > 1) {
      const f = r[0], R = r[1] - f;
      k = Rl(0, m).map(
        (w) => E(f + w / (m - 1) * R)
      );
    } else {
      e = [];
      let f = [];
      if (s && s.length > 2)
        for (let R = 1, w = s.length, D = 1 <= w; D ? R < w : R > w; D ? R++ : R--)
          f.push((s[R - 1] + s[R]) * 0.5);
      else
        f = r;
      k = f.map((R) => E(R));
    }
    return N[y] && (k = k.map((f) => f[y]())), k;
  }, E.cache = function(m) {
    return m != null ? (x = m, E) : x;
  }, E.gamma = function(m) {
    return m != null ? (g = m, E) : g;
  }, E.nodata = function(m) {
    return m != null ? (i = N(m), E) : i;
  }, E;
}
function Rl(e, t, i) {
  let o = [], r = e < t, a = t;
  for (let l = e; r ? l < a : l > a; r ? l++ : l--)
    o.push(l);
  return o;
}
const Ml = function(e) {
  let t = [1, 1];
  for (let i = 1; i < e; i++) {
    let o = [1];
    for (let r = 1; r <= t.length; r++)
      o[r] = (t[r] || 0) + t[r - 1];
    t = o;
  }
  return t;
}, Al = function(e) {
  let t, i, o, r;
  if (e = e.map((a) => new d(a)), e.length === 2)
    [i, o] = e.map((a) => a.lab()), t = function(a) {
      const l = [0, 1, 2].map((n) => i[n] + a * (o[n] - i[n]));
      return new d(l, "lab");
    };
  else if (e.length === 3)
    [i, o, r] = e.map((a) => a.lab()), t = function(a) {
      const l = [0, 1, 2].map(
        (n) => (1 - a) * (1 - a) * i[n] + 2 * (1 - a) * a * o[n] + a * a * r[n]
      );
      return new d(l, "lab");
    };
  else if (e.length === 4) {
    let a;
    [i, o, r, a] = e.map((l) => l.lab()), t = function(l) {
      const n = [0, 1, 2].map(
        (s) => (1 - l) * (1 - l) * (1 - l) * i[s] + 3 * (1 - l) * (1 - l) * l * o[s] + 3 * (1 - l) * l * l * r[s] + l * l * l * a[s]
      );
      return new d(n, "lab");
    };
  } else if (e.length >= 5) {
    let a, l, n;
    a = e.map((s) => s.lab()), n = e.length - 1, l = Ml(n), t = function(s) {
      const c = 1 - s, u = [0, 1, 2].map(
        (b) => a.reduce(
          (_, p, v) => _ + l[v] * c ** (n - v) * s ** v * p[b],
          0
        )
      );
      return new d(u, "lab");
    };
  } else
    throw new RangeError("No point in running bezier with only one color.");
  return t;
}, jl = (e) => {
  const t = Al(e);
  return t.scale = () => Ue(t), t;
}, { round: Ni } = Math;
d.prototype.rgb = function(e = !0) {
  return e === !1 ? this._rgb.slice(0, 3) : this._rgb.slice(0, 3).map(Ni);
};
d.prototype.rgba = function(e = !0) {
  return this._rgb.slice(0, 4).map((t, i) => i < 3 ? e === !1 ? t : Ni(t) : t);
};
const Cl = (...e) => new d(...e, "rgb");
Object.assign(N, { rgb: Cl });
z.format.rgb = (...e) => {
  const t = S(e, "rgba");
  return t[3] === void 0 && (t[3] = 1), t;
};
z.autodetect.push({
  p: 3,
  test: (...e) => {
    if (e = S(e, "rgba"), $(e) === "array" && (e.length === 3 || e.length === 4 && $(e[3]) == "number" && e[3] >= 0 && e[3] <= 1))
      return "rgb";
  }
});
const ie = (e, t, i) => {
  if (!ie[i])
    throw new Error("unknown blend mode " + i);
  return ie[i](e, t);
}, ue = (e) => (t, i) => {
  const o = N(i).rgb(), r = N(t).rgb();
  return N.rgb(e(o, r));
}, me = (e) => (t, i) => {
  const o = [];
  return o[0] = e(t[0], i[0]), o[1] = e(t[1], i[1]), o[2] = e(t[2], i[2]), o;
}, Tl = (e) => e, Il = (e, t) => e * t / 255, Pl = (e, t) => e > t ? t : e, Ol = (e, t) => e > t ? e : t, Bl = (e, t) => 255 * (1 - (1 - e / 255) * (1 - t / 255)), Ul = (e, t) => t < 128 ? 2 * e * t / 255 : 255 * (1 - 2 * (1 - e / 255) * (1 - t / 255)), Hl = (e, t) => 255 * (1 - (1 - t / 255) / (e / 255)), Dl = (e, t) => e === 255 ? 255 : (e = 255 * (t / 255) / (1 - e / 255), e > 255 ? 255 : e);
ie.normal = ue(me(Tl));
ie.multiply = ue(me(Il));
ie.screen = ue(me(Bl));
ie.overlay = ue(me(Ul));
ie.darken = ue(me(Pl));
ie.lighten = ue(me(Ol));
ie.dodge = ue(me(Dl));
ie.burn = ue(me(Hl));
const { pow: Yl, sin: Gl, cos: Zl } = Math;
function Fl(e = 300, t = -1.5, i = 1, o = 1, r = [0, 1]) {
  let a = 0, l;
  $(r) === "array" ? l = r[1] - r[0] : (l = 0, r = [r, r]);
  const n = function(s) {
    const c = se * ((e + 120) / 360 + t * s), u = Yl(r[0] + l * s, o), _ = (a !== 0 ? i[0] + s * a : i) * u * (1 - u) / 2, p = Zl(c), v = Gl(c), x = u + _ * (-0.14861 * p + 1.78277 * v), g = u + _ * (-0.29227 * p - 0.90649 * v), h = u + _ * (1.97294 * p);
    return N(gt([x * 255, g * 255, h * 255, 1]));
  };
  return n.start = function(s) {
    return s == null ? e : (e = s, n);
  }, n.rotations = function(s) {
    return s == null ? t : (t = s, n);
  }, n.gamma = function(s) {
    return s == null ? o : (o = s, n);
  }, n.hue = function(s) {
    return s == null ? i : (i = s, $(i) === "array" ? (a = i[1] - i[0], a === 0 && (i = i[1])) : a = 0, n);
  }, n.lightness = function(s) {
    return s == null ? r : ($(s) === "array" ? (r = s, l = s[1] - s[0]) : (r = [s, s], l = 0), n);
  }, n.scale = () => N.scale(n), n.hue(i), n;
}
const Kl = "0123456789abcdef", { floor: Xl, random: Vl } = Math, Wl = (e = Vl) => {
  let t = "#";
  for (let i = 0; i < 6; i++)
    t += Kl.charAt(Xl(e() * 16));
  return new d(t, "hex");
}, { log: Bt, pow: ql, floor: Jl, abs: Ql } = Math;
function Ri(e, t = null) {
  const i = {
    min: Number.MAX_VALUE,
    max: Number.MAX_VALUE * -1,
    sum: 0,
    values: [],
    count: 0
  };
  return $(e) === "object" && (e = Object.values(e)), e.forEach((o) => {
    t && $(o) === "object" && (o = o[t]), o != null && !isNaN(o) && (i.values.push(o), i.sum += o, o < i.min && (i.min = o), o > i.max && (i.max = o), i.count += 1);
  }), i.domain = [i.min, i.max], i.limits = (o, r) => Mi(i, o, r), i;
}
function Mi(e, t = "equal", i = 7) {
  $(e) == "array" && (e = Ri(e));
  const { min: o, max: r } = e, a = e.values.sort((n, s) => n - s);
  if (i === 1)
    return [o, r];
  const l = [];
  if (t.substr(0, 1) === "c" && (l.push(o), l.push(r)), t.substr(0, 1) === "e") {
    l.push(o);
    for (let n = 1; n < i; n++)
      l.push(o + n / i * (r - o));
    l.push(r);
  } else if (t.substr(0, 1) === "l") {
    if (o <= 0)
      throw new Error(
        "Logarithmic scales are only possible for values > 0"
      );
    const n = Math.LOG10E * Bt(o), s = Math.LOG10E * Bt(r);
    l.push(o);
    for (let c = 1; c < i; c++)
      l.push(ql(10, n + c / i * (s - n)));
    l.push(r);
  } else if (t.substr(0, 1) === "q") {
    l.push(o);
    for (let n = 1; n < i; n++) {
      const s = (a.length - 1) * n / i, c = Jl(s);
      if (c === s)
        l.push(a[c]);
      else {
        const u = s - c;
        l.push(a[c] * (1 - u) + a[c + 1] * u);
      }
    }
    l.push(r);
  } else if (t.substr(0, 1) === "k") {
    let n;
    const s = a.length, c = new Array(s), u = new Array(i);
    let b = !0, _ = 0, p = null;
    p = [], p.push(o);
    for (let g = 1; g < i; g++)
      p.push(o + g / i * (r - o));
    for (p.push(r); b; ) {
      for (let h = 0; h < i; h++)
        u[h] = 0;
      for (let h = 0; h < s; h++) {
        const P = a[h];
        let A = Number.MAX_VALUE, T;
        for (let I = 0; I < i; I++) {
          const H = Ql(p[I] - P);
          H < A && (A = H, T = I), u[T]++, c[h] = T;
        }
      }
      const g = new Array(i);
      for (let h = 0; h < i; h++)
        g[h] = null;
      for (let h = 0; h < s; h++)
        n = c[h], g[n] === null ? g[n] = a[h] : g[n] += a[h];
      for (let h = 0; h < i; h++)
        g[h] *= 1 / u[h];
      b = !1;
      for (let h = 0; h < i; h++)
        if (g[h] !== p[h]) {
          b = !0;
          break;
        }
      p = g, _++, _ > 200 && (b = !1);
    }
    const v = {};
    for (let g = 0; g < i; g++)
      v[g] = [];
    for (let g = 0; g < s; g++)
      n = c[g], v[n].push(a[g]);
    let x = [];
    for (let g = 0; g < i; g++)
      x.push(v[g][0]), x.push(v[g][v[g].length - 1]);
    x = x.sort((g, h) => g - h), l.push(x[0]);
    for (let g = 1; g < x.length; g += 2) {
      const h = x[g];
      !isNaN(h) && l.indexOf(h) === -1 && l.push(h);
    }
  }
  return l;
}
const en = (e, t) => {
  e = new d(e), t = new d(t);
  const i = e.luminance(), o = t.luminance();
  return i > o ? (i + 0.05) / (o + 0.05) : (o + 0.05) / (i + 0.05);
};
/**
 * @license
 *
 * The APCA contrast prediction algorithm is based of the formulas published
 * in the APCA-1.0.98G specification by Myndex. The specification is available at:
 * https://raw.githubusercontent.com/Myndex/apca-w3/master/images/APCAw3_0.1.17_APCA0.0.98G.svg
 *
 * Note that the APCA implementation is still beta, so please update to
 * future versions of chroma.js when they become available.
 *
 * You can read more about the APCA Readability Criterion at
 * https://readtech.org/ARC/
 */
const Ut = 0.027, tn = 5e-4, on = 0.1, Ht = 1.14, Ie = 0.022, Dt = 1.414, rn = (e, t) => {
  e = new d(e), t = new d(t), e.alpha() < 1 && (e = ke(t, e, e.alpha(), "rgb"));
  const i = Yt(...e.rgb()), o = Yt(...t.rgb()), r = i >= Ie ? i : i + Math.pow(Ie - i, Dt), a = o >= Ie ? o : o + Math.pow(Ie - o, Dt), l = Math.pow(a, 0.56) - Math.pow(r, 0.57), n = Math.pow(a, 0.65) - Math.pow(r, 0.62), s = Math.abs(a - r) < tn ? 0 : r < a ? l * Ht : n * Ht;
  return (Math.abs(s) < on ? 0 : s > 0 ? s - Ut : s + Ut) * 100;
};
function Yt(e, t, i) {
  return 0.2126729 * Math.pow(e / 255, 2.4) + 0.7151522 * Math.pow(t / 255, 2.4) + 0.072175 * Math.pow(i / 255, 2.4);
}
const { sqrt: ne, pow: O, min: an, max: ln, atan2: Gt, abs: Zt, cos: Pe, sin: Ft, exp: nn, PI: Kt } = Math;
function sn(e, t, i = 1, o = 1, r = 1) {
  var a = function(ae) {
    return 360 * ae / (2 * Kt);
  }, l = function(ae) {
    return 2 * Kt * ae / 360;
  };
  e = new d(e), t = new d(t);
  const [n, s, c] = Array.from(e.lab()), [u, b, _] = Array.from(t.lab()), p = (n + u) / 2, v = ne(O(s, 2) + O(c, 2)), x = ne(O(b, 2) + O(_, 2)), g = (v + x) / 2, h = 0.5 * (1 - ne(O(g, 7) / (O(g, 7) + O(25, 7)))), P = s * (1 + h), A = b * (1 + h), T = ne(O(P, 2) + O(c, 2)), I = ne(O(A, 2) + O(_, 2)), H = (T + I) / 2, E = a(Gt(c, P)), m = a(Gt(_, A)), y = E >= 0 ? E : E + 360, k = m >= 0 ? m : m + 360, f = Zt(y - k) > 180 ? (y + k + 360) / 2 : (y + k) / 2, R = 1 - 0.17 * Pe(l(f - 30)) + 0.24 * Pe(l(2 * f)) + 0.32 * Pe(l(3 * f + 6)) - 0.2 * Pe(l(4 * f - 63));
  let w = k - y;
  w = Zt(w) <= 180 ? w : k <= y ? w + 360 : w - 360, w = 2 * ne(T * I) * Ft(l(w) / 2);
  const D = u - n, J = I - T, Q = 1 + 0.015 * O(p - 50, 2) / ne(20 + O(p - 50, 2)), oe = 1 + 0.045 * H, de = 1 + 0.015 * H * R, re = 30 * nn(-O((f - 275) / 25, 2)), Ze = -(2 * ne(O(H, 7) / (O(H, 7) + O(25, 7)))) * Ft(2 * l(re)), Ee = ne(
    O(D / (i * Q), 2) + O(J / (o * oe), 2) + O(w / (r * de), 2) + Ze * (J / (o * oe)) * (w / (r * de))
  );
  return ln(0, an(100, Ee));
}
function cn(e, t, i = "lab") {
  e = new d(e), t = new d(t);
  const o = e.get(i), r = t.get(i);
  let a = 0;
  for (let l in o) {
    const n = (o[l] || 0) - (r[l] || 0);
    a += n * n;
  }
  return Math.sqrt(a);
}
const bn = (...e) => {
  try {
    return new d(...e), !0;
  } catch {
    return !1;
  }
}, _n = {
  cool() {
    return Ue([N.hsl(180, 1, 0.9), N.hsl(250, 0.7, 0.4)]);
  },
  hot() {
    return Ue(["#000", "#f00", "#ff0", "#fff"]).mode(
      "rgb"
    );
  }
}, _t = {
  // sequential
  OrRd: ["#fff7ec", "#fee8c8", "#fdd49e", "#fdbb84", "#fc8d59", "#ef6548", "#d7301f", "#b30000", "#7f0000"],
  PuBu: ["#fff7fb", "#ece7f2", "#d0d1e6", "#a6bddb", "#74a9cf", "#3690c0", "#0570b0", "#045a8d", "#023858"],
  BuPu: ["#f7fcfd", "#e0ecf4", "#bfd3e6", "#9ebcda", "#8c96c6", "#8c6bb1", "#88419d", "#810f7c", "#4d004b"],
  Oranges: ["#fff5eb", "#fee6ce", "#fdd0a2", "#fdae6b", "#fd8d3c", "#f16913", "#d94801", "#a63603", "#7f2704"],
  BuGn: ["#f7fcfd", "#e5f5f9", "#ccece6", "#99d8c9", "#66c2a4", "#41ae76", "#238b45", "#006d2c", "#00441b"],
  YlOrBr: ["#ffffe5", "#fff7bc", "#fee391", "#fec44f", "#fe9929", "#ec7014", "#cc4c02", "#993404", "#662506"],
  YlGn: ["#ffffe5", "#f7fcb9", "#d9f0a3", "#addd8e", "#78c679", "#41ab5d", "#238443", "#006837", "#004529"],
  Reds: ["#fff5f0", "#fee0d2", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#a50f15", "#67000d"],
  RdPu: ["#fff7f3", "#fde0dd", "#fcc5c0", "#fa9fb5", "#f768a1", "#dd3497", "#ae017e", "#7a0177", "#49006a"],
  Greens: ["#f7fcf5", "#e5f5e0", "#c7e9c0", "#a1d99b", "#74c476", "#41ab5d", "#238b45", "#006d2c", "#00441b"],
  YlGnBu: ["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"],
  Purples: ["#fcfbfd", "#efedf5", "#dadaeb", "#bcbddc", "#9e9ac8", "#807dba", "#6a51a3", "#54278f", "#3f007d"],
  GnBu: ["#f7fcf0", "#e0f3db", "#ccebc5", "#a8ddb5", "#7bccc4", "#4eb3d3", "#2b8cbe", "#0868ac", "#084081"],
  Greys: ["#ffffff", "#f0f0f0", "#d9d9d9", "#bdbdbd", "#969696", "#737373", "#525252", "#252525", "#000000"],
  YlOrRd: ["#ffffcc", "#ffeda0", "#fed976", "#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c", "#bd0026", "#800026"],
  PuRd: ["#f7f4f9", "#e7e1ef", "#d4b9da", "#c994c7", "#df65b0", "#e7298a", "#ce1256", "#980043", "#67001f"],
  Blues: ["#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#08519c", "#08306b"],
  PuBuGn: ["#fff7fb", "#ece2f0", "#d0d1e6", "#a6bddb", "#67a9cf", "#3690c0", "#02818a", "#016c59", "#014636"],
  Viridis: ["#440154", "#482777", "#3f4a8a", "#31678e", "#26838f", "#1f9d8a", "#6cce5a", "#b6de2b", "#fee825"],
  // diverging
  Spectral: ["#9e0142", "#d53e4f", "#f46d43", "#fdae61", "#fee08b", "#ffffbf", "#e6f598", "#abdda4", "#66c2a5", "#3288bd", "#5e4fa2"],
  RdYlGn: ["#a50026", "#d73027", "#f46d43", "#fdae61", "#fee08b", "#ffffbf", "#d9ef8b", "#a6d96a", "#66bd63", "#1a9850", "#006837"],
  RdBu: ["#67001f", "#b2182b", "#d6604d", "#f4a582", "#fddbc7", "#f7f7f7", "#d1e5f0", "#92c5de", "#4393c3", "#2166ac", "#053061"],
  PiYG: ["#8e0152", "#c51b7d", "#de77ae", "#f1b6da", "#fde0ef", "#f7f7f7", "#e6f5d0", "#b8e186", "#7fbc41", "#4d9221", "#276419"],
  PRGn: ["#40004b", "#762a83", "#9970ab", "#c2a5cf", "#e7d4e8", "#f7f7f7", "#d9f0d3", "#a6dba0", "#5aae61", "#1b7837", "#00441b"],
  RdYlBu: ["#a50026", "#d73027", "#f46d43", "#fdae61", "#fee090", "#ffffbf", "#e0f3f8", "#abd9e9", "#74add1", "#4575b4", "#313695"],
  BrBG: ["#543005", "#8c510a", "#bf812d", "#dfc27d", "#f6e8c3", "#f5f5f5", "#c7eae5", "#80cdc1", "#35978f", "#01665e", "#003c30"],
  RdGy: ["#67001f", "#b2182b", "#d6604d", "#f4a582", "#fddbc7", "#ffffff", "#e0e0e0", "#bababa", "#878787", "#4d4d4d", "#1a1a1a"],
  PuOr: ["#7f3b08", "#b35806", "#e08214", "#fdb863", "#fee0b6", "#f7f7f7", "#d8daeb", "#b2abd2", "#8073ac", "#542788", "#2d004b"],
  // qualitative
  Set2: ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854", "#ffd92f", "#e5c494", "#b3b3b3"],
  Accent: ["#7fc97f", "#beaed4", "#fdc086", "#ffff99", "#386cb0", "#f0027f", "#bf5b17", "#666666"],
  Set1: ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#ffff33", "#a65628", "#f781bf", "#999999"],
  Set3: ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd", "#ccebc5", "#ffed6f"],
  Dark2: ["#1b9e77", "#d95f02", "#7570b3", "#e7298a", "#66a61e", "#e6ab02", "#a6761d", "#666666"],
  Paired: ["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c", "#fdbf6f", "#ff7f00", "#cab2d6", "#6a3d9a", "#ffff99", "#b15928"],
  Pastel2: ["#b3e2cd", "#fdcdac", "#cbd5e8", "#f4cae4", "#e6f5c9", "#fff2ae", "#f1e2cc", "#cccccc"],
  Pastel1: ["#fbb4ae", "#b3cde3", "#ccebc5", "#decbe4", "#fed9a6", "#ffffcc", "#e5d8bd", "#fddaec", "#f2f2f2"]
}, Ai = Object.keys(_t), Xt = new Map(Ai.map((e) => [e.toLowerCase(), e])), un = typeof Proxy == "function" ? new Proxy(_t, {
  get(e, t) {
    const i = t.toLowerCase();
    if (Xt.has(i))
      return e[Xt.get(i)];
  },
  getOwnPropertyNames() {
    return Object.getOwnPropertyNames(Ai);
  }
}) : _t, mn = (...e) => {
  e = S(e, "cmyk");
  const [t, i, o, r] = e, a = e.length > 4 ? e[4] : 1;
  return r === 1 ? [0, 0, 0, a] : [
    t >= 1 ? 0 : 255 * (1 - t) * (1 - r),
    // r
    i >= 1 ? 0 : 255 * (1 - i) * (1 - r),
    // g
    o >= 1 ? 0 : 255 * (1 - o) * (1 - r),
    // b
    a
  ];
}, { max: Vt } = Math, dn = (...e) => {
  let [t, i, o] = S(e, "rgb");
  t = t / 255, i = i / 255, o = o / 255;
  const r = 1 - Vt(t, Vt(i, o)), a = r < 1 ? 1 / (1 - r) : 0, l = (1 - t - r) * a, n = (1 - i - r) * a, s = (1 - o - r) * a;
  return [l, n, s, r];
};
d.prototype.cmyk = function() {
  return dn(this._rgb);
};
const pn = (...e) => new d(...e, "cmyk");
Object.assign(N, { cmyk: pn });
z.format.cmyk = mn;
z.autodetect.push({
  p: 2,
  test: (...e) => {
    if (e = S(e, "cmyk"), $(e) === "array" && e.length === 4)
      return "cmyk";
  }
});
const fn = (...e) => {
  const t = S(e, "hsla");
  let i = ze(e) || "lsa";
  return t[0] = W(t[0] || 0) + "deg", t[1] = W(t[1] * 100) + "%", t[2] = W(t[2] * 100) + "%", i === "hsla" || t.length > 3 && t[3] < 1 ? (t[3] = "/ " + (t.length > 3 ? t[3] : 1), i = "hsla") : t.length = 3, `${i.substr(0, 3)}(${t.join(" ")})`;
}, gn = (...e) => {
  const t = S(e, "lab");
  let i = ze(e) || "lab";
  return t[0] = W(t[0]) + "%", t[1] = W(t[1]), t[2] = W(t[2]), i === "laba" || t.length > 3 && t[3] < 1 ? t[3] = "/ " + (t.length > 3 ? t[3] : 1) : t.length = 3, `lab(${t.join(" ")})`;
}, yn = (...e) => {
  const t = S(e, "lch");
  let i = ze(e) || "lab";
  return t[0] = W(t[0]) + "%", t[1] = W(t[1]), t[2] = isNaN(t[2]) ? "none" : W(t[2]) + "deg", i === "lcha" || t.length > 3 && t[3] < 1 ? t[3] = "/ " + (t.length > 3 ? t[3] : 1) : t.length = 3, `lch(${t.join(" ")})`;
}, hn = (...e) => {
  const t = S(e, "lab");
  return t[0] = W(t[0] * 100) + "%", t[1] = ct(t[1]), t[2] = ct(t[2]), t.length > 3 && t[3] < 1 ? t[3] = "/ " + (t.length > 3 ? t[3] : 1) : t.length = 3, `oklab(${t.join(" ")})`;
}, ji = (...e) => {
  const [t, i, o, ...r] = S(e, "rgb"), [a, l, n] = kt(t, i, o), [s, c, u] = $i(a, l, n);
  return [s, c, u, ...r.length > 0 && r[0] < 1 ? [r[0]] : []];
}, vn = (...e) => {
  const t = S(e, "lch");
  return t[0] = W(t[0] * 100) + "%", t[1] = ct(t[1]), t[2] = isNaN(t[2]) ? "none" : W(t[2]) + "deg", t.length > 3 && t[3] < 1 ? t[3] = "/ " + (t.length > 3 ? t[3] : 1) : t.length = 3, `oklch(${t.join(" ")})`;
}, { round: rt } = Math, xn = (...e) => {
  const t = S(e, "rgba");
  let i = ze(e) || "rgb";
  if (i.substr(0, 3) === "hsl")
    return fn(Ei(t), i);
  if (i.substr(0, 3) === "lab") {
    const o = Ae();
    ce("d50");
    const r = gn(ht(t), i);
    return ce(o), r;
  }
  if (i.substr(0, 3) === "lch") {
    const o = Ae();
    ce("d50");
    const r = yn(xt(t), i);
    return ce(o), r;
  }
  return i.substr(0, 5) === "oklab" ? hn(kt(t)) : i.substr(0, 5) === "oklch" ? vn(ji(t)) : (t[0] = rt(t[0]), t[1] = rt(t[1]), t[2] = rt(t[2]), (i === "rgba" || t.length > 3 && t[3] < 1) && (t[3] = "/ " + (t.length > 3 ? t[3] : 1), i = "rgba"), `${i.substr(0, 3)}(${t.slice(0, i === "rgb" ? 3 : 4).join(" ")})`);
}, Ci = (...e) => {
  e = S(e, "lch");
  const [t, i, o, ...r] = e, [a, l, n] = Si(t, i, o), [s, c, u] = wt(a, l, n);
  return [s, c, u, ...r.length > 0 && r[0] < 1 ? [r[0]] : []];
}, be = /((?:-?\d+)|(?:-?\d+(?:\.\d+)?)%|none)/.source, te = /((?:-?(?:\d+(?:\.\d*)?|\.\d+)%?)|none)/.source, He = /((?:-?(?:\d+(?:\.\d*)?|\.\d+)%)|none)/.source, q = /\s*/.source, $e = /\s+/.source, zt = /\s*,\s*/.source, Ge = /((?:-?(?:\d+(?:\.\d*)?|\.\d+)(?:deg)?)|none)/.source, Le = /\s*(?:\/\s*((?:[01]|[01]?\.\d+)|\d+(?:\.\d+)?%))?/.source, Ti = new RegExp(
  "^rgba?\\(" + q + [be, be, be].join($e) + Le + "\\)$"
), Ii = new RegExp(
  "^rgb\\(" + q + [be, be, be].join(zt) + q + "\\)$"
), Pi = new RegExp(
  "^rgba\\(" + q + [be, be, be, te].join(zt) + q + "\\)$"
), Oi = new RegExp(
  "^hsla?\\(" + q + [Ge, He, He].join($e) + Le + "\\)$"
), Bi = new RegExp(
  "^hsl?\\(" + q + [Ge, He, He].join(zt) + q + "\\)$"
), Ui = /^hsla\(\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*,\s*([01]|[01]?\.\d+)\)$/, Hi = new RegExp(
  "^lab\\(" + q + [te, te, te].join($e) + Le + "\\)$"
), Di = new RegExp(
  "^lch\\(" + q + [te, te, Ge].join($e) + Le + "\\)$"
), Yi = new RegExp(
  "^oklab\\(" + q + [te, te, te].join($e) + Le + "\\)$"
), Gi = new RegExp(
  "^oklch\\(" + q + [te, te, Ge].join($e) + Le + "\\)$"
), { round: Zi } = Math, he = (e) => e.map((t, i) => i <= 2 ? pe(Zi(t), 0, 255) : t), B = (e, t = 0, i = 100, o = !1) => (typeof e == "string" && e.endsWith("%") && (e = parseFloat(e.substring(0, e.length - 1)) / 100, o ? e = t + (e + 1) * 0.5 * (i - t) : e = t + e * (i - t)), +e), G = (e, t) => e === "none" ? t : e, St = (e) => {
  if (e = e.toLowerCase().trim(), e === "transparent")
    return [0, 0, 0, 0];
  let t;
  if (z.format.named)
    try {
      return z.format.named(e);
    } catch {
    }
  if ((t = e.match(Ti)) || (t = e.match(Ii))) {
    let i = t.slice(1, 4);
    for (let r = 0; r < 3; r++)
      i[r] = +B(G(i[r], 0), 0, 255);
    i = he(i);
    const o = t[4] !== void 0 ? +B(t[4], 0, 1) : 1;
    return i[3] = o, i;
  }
  if (t = e.match(Pi)) {
    const i = t.slice(1, 5);
    for (let o = 0; o < 4; o++)
      i[o] = +B(i[o], 0, 255);
    return i;
  }
  if ((t = e.match(Oi)) || (t = e.match(Bi))) {
    const i = t.slice(1, 4);
    i[0] = +G(i[0].replace("deg", ""), 0), i[1] = +B(G(i[1], 0), 0, 100) * 0.01, i[2] = +B(G(i[2], 0), 0, 100) * 0.01;
    const o = he(bt(i)), r = t[4] !== void 0 ? +B(t[4], 0, 1) : 1;
    return o[3] = r, o;
  }
  if (t = e.match(Ui)) {
    const i = t.slice(1, 4);
    i[1] *= 0.01, i[2] *= 0.01;
    const o = bt(i);
    for (let r = 0; r < 3; r++)
      o[r] = Zi(o[r]);
    return o[3] = +t[4], o;
  }
  if (t = e.match(Hi)) {
    const i = t.slice(1, 4);
    i[0] = B(G(i[0], 0), 0, 100), i[1] = B(G(i[1], 0), -125, 125, !0), i[2] = B(G(i[2], 0), -125, 125, !0);
    const o = Ae();
    ce("d50");
    const r = he(yt(i));
    ce(o);
    const a = t[4] !== void 0 ? +B(t[4], 0, 1) : 1;
    return r[3] = a, r;
  }
  if (t = e.match(Di)) {
    const i = t.slice(1, 4);
    i[0] = B(i[0], 0, 100), i[1] = B(G(i[1], 0), 0, 150, !1), i[2] = +G(i[2].replace("deg", ""), 0);
    const o = Ae();
    ce("d50");
    const r = he(vt(i));
    ce(o);
    const a = t[4] !== void 0 ? +B(t[4], 0, 1) : 1;
    return r[3] = a, r;
  }
  if (t = e.match(Yi)) {
    const i = t.slice(1, 4);
    i[0] = B(G(i[0], 0), 0, 1), i[1] = B(G(i[1], 0), -0.4, 0.4, !0), i[2] = B(G(i[2], 0), -0.4, 0.4, !0);
    const o = he(wt(i)), r = t[4] !== void 0 ? +B(t[4], 0, 1) : 1;
    return o[3] = r, o;
  }
  if (t = e.match(Gi)) {
    const i = t.slice(1, 4);
    i[0] = B(G(i[0], 0), 0, 1), i[1] = B(G(i[1], 0), 0, 0.4, !1), i[2] = +G(i[2].replace("deg", ""), 0);
    const o = he(Ci(i)), r = t[4] !== void 0 ? +B(t[4], 0, 1) : 1;
    return o[3] = r, o;
  }
};
St.test = (e) => (
  // modern
  Ti.test(e) || Oi.test(e) || Hi.test(e) || Di.test(e) || Yi.test(e) || Gi.test(e) || // legacy
  Ii.test(e) || Pi.test(e) || Bi.test(e) || Ui.test(e) || e === "transparent"
);
d.prototype.css = function(e) {
  return xn(this._rgb, e);
};
const wn = (...e) => new d(...e, "css");
N.css = wn;
z.format.css = St;
z.autodetect.push({
  p: 5,
  test: (e, ...t) => {
    if (!t.length && $(e) === "string" && St.test(e))
      return "css";
  }
});
z.format.gl = (...e) => {
  const t = S(e, "rgba");
  return t[0] *= 255, t[1] *= 255, t[2] *= 255, t;
};
const kn = (...e) => new d(...e, "gl");
N.gl = kn;
d.prototype.gl = function() {
  const e = this._rgb;
  return [e[0] / 255, e[1] / 255, e[2] / 255, e[3]];
};
d.prototype.hex = function(e) {
  return wi(this._rgb, e);
};
const zn = (...e) => new d(...e, "hex");
N.hex = zn;
z.format.hex = xi;
z.autodetect.push({
  p: 4,
  test: (e, ...t) => {
    if (!t.length && $(e) === "string" && [3, 4, 5, 6, 7, 8, 9].indexOf(e.length) >= 0)
      return "hex";
  }
});
const { log: Oe } = Math, Fi = (e) => {
  const t = e / 100;
  let i, o, r;
  return t < 66 ? (i = 255, o = t < 6 ? 0 : -155.25485562709179 - 0.44596950469579133 * (o = t - 2) + 104.49216199393888 * Oe(o), r = t < 20 ? 0 : -254.76935184120902 + 0.8274096064007395 * (r = t - 10) + 115.67994401066147 * Oe(r)) : (i = 351.97690566805693 + 0.114206453784165 * (i = t - 55) - 40.25366309332127 * Oe(i), o = 325.4494125711974 + 0.07943456536662342 * (o = t - 50) - 28.0852963507957 * Oe(o), r = 255), [i, o, r, 1];
}, { round: Sn } = Math, $n = (...e) => {
  const t = S(e, "rgb"), i = t[0], o = t[2];
  let r = 1e3, a = 4e4;
  const l = 0.4;
  let n;
  for (; a - r > l; ) {
    n = (a + r) * 0.5;
    const s = Fi(n);
    s[2] / s[0] >= o / i ? a = n : r = n;
  }
  return Sn(n);
};
d.prototype.temp = d.prototype.kelvin = d.prototype.temperature = function() {
  return $n(this._rgb);
};
const at = (...e) => new d(...e, "temp");
Object.assign(N, { temp: at, kelvin: at, temperature: at });
z.format.temp = z.format.kelvin = z.format.temperature = Fi;
d.prototype.oklch = function() {
  return ji(this._rgb);
};
const Ln = (...e) => new d(...e, "oklch");
Object.assign(N, { oklch: Ln });
z.format.oklch = Ci;
z.autodetect.push({
  p: 2,
  test: (...e) => {
    if (e = S(e, "oklch"), $(e) === "array" && e.length === 3)
      return "oklch";
  }
});
Object.assign(N, {
  analyze: Ri,
  average: Ll,
  bezier: jl,
  blend: ie,
  brewer: un,
  Color: d,
  colors: we,
  contrast: en,
  contrastAPCA: rn,
  cubehelix: Fl,
  deltaE: sn,
  distance: cn,
  input: z,
  interpolate: ke,
  limits: Mi,
  mix: ke,
  random: Wl,
  scale: Ue,
  scales: _n,
  valid: bn
});
function Wt(e) {
  var i;
  if (e == null || Object.keys(e).length === 0)
    return console.warn("css_resolver received empty color config"), "";
  const t = ((i = e.mx_ui_text) == null ? void 0 : i.font) || "system-ui";
  return `
* {
  --mx_ui_text: ${Z(e.mx_ui_text)};
  --mx_ui_font_text: ${t};
  --mx_ui_text_faded: ${Z(e.mx_ui_text_faded)};
  --mx_ui_hidden: ${Z(e.mx_ui_hidden)};
  --mx_ui_border: ${Z(e.mx_ui_border)};
  --mx_ui_background: ${Z(e.mx_ui_background)};
  --mx_ui_background_faded: ${Z(e.mx_ui_background_faded)};
  --mx_ui_background_contrast: ${Z(e.mx_ui_background_contrast)};
  --mx_ui_background_accent: ${Z(e.mx_ui_background_accent)};
  --mx_ui_background_transparent: ${Z(e.mx_ui_background_transparent)};
  --mx_ui_shadow: ${Z(e.mx_ui_shadow)};
  --mx_ui_link: ${Z(e.mx_ui_link)};
  --mx_ui_input_accent: ${Z(e.mx_ui_input_accent)};
  --mx_ui_highlighter: ${Z(e.mx_ui_highlighter)};
  border-color: var(--mx_ui_border);
  color: var(--mx_ui_text);
}`;
}
function Z(e) {
  if (!e) return "transparent";
  const t = !e.visibility || e.visibility !== "visible", i = typeof e == "string", o = i ? e : e.color, r = N(o);
  if (t) return r.alpha(0).css();
  const a = i || e.alpha == null ? r.alpha() : e.alpha;
  return r.alpha(a).css();
}
class En {
  constructor(t) {
    this._map = t, this._pending = null, this._render = this._render.bind(this), t.on("idle", this._render);
  }
  /**
   * Schedule a scale update. Runs immediately if the style is loaded,
   * otherwise deferred to the next idle event.
   * @param {number} [value=1] - Scale factor.
   * @param {string[]} [types=["text","icon"]] - Which sizes to scale.
   */
  update(t = 1, i = ["text", "icon"]) {
    this._pending = { value: t, types: i }, this._map.isStyleLoaded() && this._render();
  }
  /** Scale text-size only. */
  text(t = 1) {
    return this.update(t, ["text"]);
  }
  /** Scale icon-size only. */
  icon(t = 1) {
    return this.update(t, ["icon"]);
  }
  /** Remove the idle listener (call when the map is removed). */
  destroy() {
    this._map.off("idle", this._render), this._map = null;
  }
  _render() {
    if (!this._pending || !this._map) return;
    const { value: t, types: i } = this._pending;
    this._pending = null;
    const o = i.includes("text"), r = i.includes("icon"), a = this._map.getStyle().layers;
    for (const l of a)
      if (l.layout) {
        if (o && l.layout["text-size"]) {
          const n = this._scaleExpr(l.layout["text-size"], t);
          this._map.setLayoutProperty(l.id, "text-size", n);
        }
        if (r && l.layout["icon-size"]) {
          const n = this._scaleExpr(l.layout["icon-size"], t);
          this._map.setLayoutProperty(l.id, "icon-size", n);
        }
      }
  }
  /** Replace the factor in `["*", number, ...]` expressions recursively. */
  _scaleExpr(t, i) {
    return this._isScalable(t) ? (t[2] = i, t) : Array.isArray(t) ? t.map((o) => this._scaleExpr(o, i)) : t;
  }
  /** True for `["*", number, anything]` — the scalable expression pattern. */
  _isScalable(t) {
    return Array.isArray(t) && t.length === 3 && t[0] === "*" && typeof t[1] == "number";
  }
}
const Re = "https://mapx.unepgrid.s3.unige.ch/mapx", Nn = "s3.unige.ch", Rn = "https://mapx.unepgrid.s3.unige.ch/", Mn = "https://tiles.mapterhorn.com/{z}/{x}/{y}.webp", qt = `${Re}/masks/un_2020_countries_mask__v0.geojson`, lt = "mapx-theme-css", M = class M {
  constructor({ maplibregl: t, mlcontour: i } = {}) {
    if (this._glyphs = `${Re}/style/v${Ce}/glyphs/{fontstack}/{range}.pbf`, this._sprite = [
      { id: "default", url: `${Re}/style/v${Ce}/sprites/sprite` },
      { id: "patterns", url: `${Re}/style/v${Ce}/sprites/sprite_patterns` }
    ], this._spriteIndex = null, this._theme = null, this._map = null, this._language = "en", this._terrainEnabled = !1, this._terrainCfg = M.TERRAIN_CFG, this._onPitchEnd = this._handlePitchEnd.bind(this), this._onMapError = (o) => {
      var r;
      String(((r = o == null ? void 0 : o.error) == null ? void 0 : r.message) ?? "").includes("mapterhorn.com") || console.error(o.error ?? o);
    }, this._hillshadeEnabled = !0, this._contoursEnabled = !0, this._satelliteEnabled = !1, this._maskEnabled = !0, this._maskUrl = qt, this._maskGeojson = null, this._maskOriginalFilters = {}, t && !M._rtlRegistered && (M._rtlRegistered = !0, t.setRTLTextPlugin(
      "https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.2.3/mapbox-gl-rtl-text.min.js",
      null,
      !0
      // lazy: only loads when RTL text is encountered
    )), t && !M._registered) {
      M._registered = !0;
      const o = window.fetch.bind(window);
      this._originalFetch = o, window.fetch = (a, l = {}) => {
        if ((typeof a == "string" ? a : a instanceof Request ? a.url : "").includes(Nn)) {
          const s = l.headers instanceof Headers ? Object.fromEntries(l.headers.entries()) : l.headers || {};
          l = {
            ...l,
            headers: { ...s, Authorization: "AWS all_users:" }
          };
        }
        return o(a, l);
      };
      const r = new vo();
      t.addProtocol(
        "pmtiles",
        r.tile.bind(r)
      ), this._maplibregl = t;
    }
    i && t && (this._demSource = new i.DemSource({
      url: Mn,
      encoding: "terrarium",
      maxzoom: 14,
      worker: !0,
      cacheSize: 100
    }), this._demSource.setupMaplibre(t)), this.transformRequest = (o) => {
      if (o.startsWith(Rn))
        return { url: o, headers: { Authorization: "AWS all_users:" } };
    };
  }
  // ── Map lifecycle ────────────────────────────────────────────────────────────
  /** Link a map instance. Applies the current theme immediately if one is set. */
  attachMap(t) {
    this._map = t, this._scaler = new En(t), t.on("pitchend", this._onPitchEnd), t.on("error", this._onMapError);
    const i = () => {
      this._applyLayers(t, this._theme), this._maskEnabled && this._loadAndApplyMask(t);
    };
    t.isStyleLoaded() ? i() : t.once("load", i);
  }
  /** Unlink the attached map. */
  detachMap() {
    this._map && (this._map.off("pitchend", this._onPitchEnd), this._map.off("error", this._onMapError)), this._scaler && (this._scaler.destroy(), this._scaler = null), this._map = null;
  }
  // ── Terrain / 3D ─────────────────────────────────────────────────────────────
  /**
   * Enable 3D terrain on the attached map.
   * Applies the terrain source and eases the pitch to TERRAIN_PITCH if lower.
   * @param {object} [cfg] - Optional override for the terrain config object.
   */
  enableTerrain(t) {
    this._map && (t && (this._terrainCfg = t), this._terrainEnabled = !0, this._map.setTerrain(this._terrainCfg), this._map.getPitch() < M.TERRAIN_PITCH && this._map.easeTo({ pitch: M.TERRAIN_PITCH }));
  }
  /**
   * Disable 3D terrain on the attached map and ease pitch back to 0.
   */
  disableTerrain() {
    this._map && (this._terrainEnabled = !1, this._map.setTerrain(null), this._map.easeTo({ pitch: 0 }));
  }
  /**
   * Toggle 3D terrain on the attached map.
   * @param {object} [cfg] - Optional terrain config passed to enableTerrain().
   */
  toggleTerrain(t) {
    this._terrainEnabled ? this.disableTerrain() : this.enableTerrain(t);
  }
  // ── Hillshade / Contours ─────────────────────────────────────────────────────
  enableHillshade() {
    this._hillshadeEnabled = !0, this._setLayersVisibility(M.HILLSHADE_LAYER, "visible");
  }
  disableHillshade() {
    this._hillshadeEnabled = !1, this._setLayersVisibility(M.HILLSHADE_LAYER, "none");
  }
  toggleHillshade() {
    this._hillshadeEnabled ? this.disableHillshade() : this.enableHillshade();
  }
  enableContours() {
    this._contoursEnabled = !0, this._setLayersVisibility(M.CONTOUR_LAYERS, "visible");
  }
  disableContours() {
    this._contoursEnabled = !1, this._setLayersVisibility(M.CONTOUR_LAYERS, "none");
  }
  toggleContours() {
    this._contoursEnabled ? this.disableContours() : this.enableContours();
  }
  // ── Satellite imagery ────────────────────────────────────────────────────────
  /**
   * Enable satellite imagery layer (EOX Sentinel-2 cloudless).
   * Disables hillshade while active — it makes no visual sense over satellite.
   */
  enableSatellite() {
    this._satelliteEnabled = !0, this._setLayersVisibility(M.SATELLITE_LAYER, "visible"), this.disableHillshade();
  }
  /** Disable satellite imagery and restore hillshade. */
  disableSatellite() {
    this._satelliteEnabled = !1, this._setLayersVisibility(M.SATELLITE_LAYER, "none"), this.enableHillshade();
  }
  /** Toggle satellite imagery on/off. */
  toggleSatellite() {
    this._satelliteEnabled ? this.disableSatellite() : this.enableSatellite();
  }
  // ── Places mask (within expression) ─────────────────────────────────────────
  /**
   * Enable the place-label mask. Fetches the GeoJSON (once, cached) and applies
   * `["!", ["within", geojson]]` to all places_locality_* layers.
   * Enabled by default on load — call only when re-enabling after disableMask().
   */
  async enableMask() {
    this._maskEnabled = !0, this._map && this._map.isStyleLoaded() && await this._loadAndApplyMask(this._map);
  }
  /**
   * Remove the mask and restore original places_locality_* filters.
   */
  disableMask() {
    this._maskEnabled = !1, this._map && this._map.isStyleLoaded() && this._removeMask(this._map);
  }
  /** Toggle mask on/off. */
  toggleMask() {
    this._maskEnabled ? this.disableMask() : this.enableMask();
  }
  /**
   * Override the mask GeoJSON URL (default: MapxStyle.MASK_URL).
   * Clears the cached GeoJSON and re-fetches immediately if mask is currently enabled.
   * @param {string} url
   */
  setMaskUrl(t) {
    this._maskUrl = t, this._maskGeojson = null, this._maskEnabled && this._map && this._map.isStyleLoaded() && this._loadAndApplyMask(this._map);
  }
  // ── Theme management ─────────────────────────────────────────────────────────
  /** Returns all available themes. */
  getThemes() {
    return Tt;
  }
  /** Returns the currently active theme, or null. */
  getTheme() {
    return this._theme;
  }
  /**
   * Apply a theme by id string or theme object.
   * Updates the attached map's layer paint/layout properties and injects CSS
   * custom properties into the document.
   */
  setTheme(t) {
    const i = typeof t == "string" ? Tt.find((o) => o.id === t) : t;
    if (i) {
      if (this._theme = i, this._map) {
        const o = () => this._applyLayers(this._map, i);
        this._map.isStyleLoaded() ? o() : this._map.once("style.load", o);
      }
      this._applyCSS(i);
    }
  }
  // ── Language ─────────────────────────────────────────────────────────────────
  /** Returns the current language code (ISO 639-1, e.g. "en", "fr", "ar"). */
  getLanguage() {
    return this._language;
  }
  /**
   * Set the map label language.
   * Updates text-field on all LABEL_LAYERS to prefer the requested language,
   * falling back to English then to the native name.
   * Supports both colon-format (Protomaps: name:en) and underscore-format
   * (UN borders: name_en) field naming conventions.
   * @param {string} lang - ISO 639-1 language code (e.g. "fr", "ar", "zh").
   */
  setLanguage(t) {
    if (this._language = t, !this._map) return;
    const i = () => {
      let o;
      switch (t) {
        case "en":
          o = [
            "coalesce",
            ["get", "name:en"],
            ["get", "name_en"],
            ["get", "name"]
          ];
          break;
        case "zh":
          o = [
            "coalesce",
            ["get", "name:zh"],
            ["get", "name:zh-Hans"],
            ["get", "name_zh"],
            ["get", "name:en"],
            ["get", "name_en"],
            ["get", "name"]
          ];
          break;
        default:
          o = [
            "coalesce",
            ["get", `name:${t}`],
            ["get", `name_${t}`],
            ["get", "name:en"],
            ["get", "name_en"],
            ["get", "name"]
          ];
      }
      for (const r of M.LABEL_LAYERS)
        this._map.getLayer(r) && this._map.setLayoutProperty(r, "text-field", o);
    };
    this._map.isStyleLoaded() ? i() : this._map.once("style.load", i);
  }
  // ── Map scaling ──────────────────────────────────────────────────────────────
  /**
   * Scale text-size and/or icon-size on all basemap layers.
   * @param {number} [value=1] - Scale factor (1 = original size).
   * @param {string[]} [types=["text","icon"]] - Which sizes to scale.
   */
  scale(t = 1, i = ["text", "icon"]) {
    var o;
    (o = this._scaler) == null || o.update(t, i);
  }
  /** Scale text-size only on basemap layers. */
  scaleText(t = 1) {
    var i;
    (i = this._scaler) == null || i.update(t, ["text"]);
  }
  /** Scale icon-size only on basemap layers. */
  scaleIcon(t = 1) {
    var i;
    (i = this._scaler) == null || i.update(t, ["icon"]);
  }
  /** Returns raw layer update array for the given (or current) theme. */
  getLayers(t = this._theme) {
    return t ? It(t.colors) : [];
  }
  /** Returns CSS custom property string for the given (or current) theme. */
  getCss(t = this._theme) {
    return t ? Wt(t.colors) : "";
  }
  // ── Sprite / icon accessors ──────────────────────────────────────────────────
  /**
   * Returns the sprite-index.json from S3 (fetched once, cached on the instance).
   * The index contains all icon and pattern entries with their sprite sheet
   * coordinates and group metadata.
   * @returns {Promise<object>}
   */
  async getSpriteIndex() {
    if (!this._spriteIndex) {
      const t = `${Re}/style/v${Ce}/sprites/sprite-index.json`;
      this._spriteIndex = await fetch(t).then((i) => i.json());
    }
    return this._spriteIndex;
  }
  /**
   * Returns all icon entries from the sprite index.
   * Each entry: { id, group, sprite, x, y, w, h, sdf }
   * @returns {Promise<Array>}
   */
  async getIcons() {
    return (await this.getSpriteIndex()).icons;
  }
  /**
   * Returns a single icon entry by id, or undefined if not found.
   * @param {string} id
   * @returns {Promise<object|undefined>}
   */
  async getIcon(t) {
    return (await this.getIcons()).find((o) => o.id === t);
  }
  /**
   * Returns icon pixel dimensions from the sprite-index.
   * Fetches and caches the index on first call; subsequent calls use the cache.
   * @param {string} id - bare sprite image id
   * @returns {Promise<{ w: number, h: number } | null>}
   */
  async getIconDimensions(t) {
    const i = await this.getIcon(t);
    return i ? { w: i.w, h: i.h } : null;
  }
  /**
   * Resolves a bare sprite id to the fully-qualified name MapLibre expects in
   * style expressions ("fill-pattern", "icon-image", etc.).
   *
   * In MapLibre GL JS, images from non-default sprites are namespaced:
   * "patterns:t_b_lines_23". View data stores bare ids, so this step is needed
   * before building layer specs.
   *
   * @param {string} id - bare sprite image id (e.g. "t_b_lines_23")
   * @returns {string} resolved id (prefixed if needed, bare id as fallback)
   */
  resolveSpriteName(t) {
    if (!this._map || !t || this._map.hasImage(t)) return t;
    const i = `patterns:${t}`;
    return this._map.hasImage(i) ? i : t;
  }
  /**
   * Renders a sprite image to a PNG data URL for use in legend thumbnails etc.
   * Uses the public map.getImage() API — no access to internal imageManager.
   *
   * For SDF icons: pass rgba to recolor visible pixels (same as MapLibre's
   * runtime icon-color, but applied to a canvas for CSS background-image use).
   * For raster patterns: pass rgba=null to return the raw image.
   *
   * @param {string} id - bare sprite image id
   * @param {[number, number, number, number] | null} rgba - RGBA 0-255, or null
   * @returns {string | null} PNG data URL, or null if image not found
   */
  getImageDataUrl(t, i = null) {
    if (!this._map || !t) return null;
    const o = this._map.getImage(t) ?? this._map.getImage(`patterns:${t}`);
    if (!o) return null;
    const { width: r, height: a } = o.data, l = document.createElement("canvas");
    l.width = r, l.height = a;
    const n = l.getContext("2d"), s = new ImageData(
      new Uint8ClampedArray(o.data.data),
      r,
      a
    );
    if (i && o.sdf) {
      const [c, u, b, _] = i;
      for (let p = 0; p < s.data.length; p += 4)
        s.data[p + 3] > 0 && (s.data[p] = c, s.data[p + 1] = u, s.data[p + 2] = b, s.data[p + 3] = _);
    }
    return n.putImageData(s, 0, 0), l.toDataURL("image/png");
  }
  // ── Style building ───────────────────────────────────────────────────────────
  /**
   * Returns a deep copy of the prod style with sprite URL and DEM sources resolved.
   * Pass the result directly to new maplibregl.Map({ style: ... }).
   */
  getStyle() {
    const t = structuredClone(To);
    return t.glyphs = this._glyphs, t.sprite = this._sprite, this._demSource && Ct(t, this._demSource), t;
  }
  /**
   * Returns a deep copy of the debug style with sprite URL and DEM contour
   * source resolved. No hillshade layer is included.
   */
  getStyleDebug() {
    const t = structuredClone(Do);
    return t.glyphs = this._glyphs, t.sprite = this._sprite, this._demSource && Ct(t, this._demSource), t;
  }
  /** Restore patched globals and remove injected CSS. Call when tearing down (tests, HMR). */
  destroy() {
    var t;
    this.detachMap(), typeof document < "u" && ((t = document.getElementById(lt)) == null || t.remove()), this._originalFetch && (window.fetch = this._originalFetch, this._originalFetch = null), this._maplibregl && (this._maplibregl.removeProtocol("pmtiles"), this._maplibregl = null), M._registered = !1;
  }
  // ── Private helpers ──────────────────────────────────────────────────────────
  async _loadAndApplyMask(t) {
    this._maskGeojson || (this._maskGeojson = await fetch(this._maskUrl).then((i) => i.json())), this._applyMask(t, this._maskGeojson);
  }
  _applyMask(t, i) {
    for (const o of M.PLACES_MASK_LAYERS) {
      if (!t.getLayer(o)) continue;
      o in this._maskOriginalFilters || (this._maskOriginalFilters[o] = t.getFilter(o));
      const r = this._maskOriginalFilters[o], a = Array.isArray(r) && r[0] === "all" ? r.slice(1) : [r].filter(Boolean);
      t.setFilter(o, ["all", ...a, ["!", ["within", i]]]);
    }
  }
  _removeMask(t) {
    for (const i of M.PLACES_MASK_LAYERS)
      t.getLayer(i) && i in this._maskOriginalFilters && t.setFilter(i, this._maskOriginalFilters[i]);
    this._maskOriginalFilters = {};
  }
  _setLayersVisibility(t, i) {
    if (this._map)
      for (const o of [].concat(t))
        this._map.getLayer(o) && this._map.setLayoutProperty(o, "visibility", i);
  }
  /** Sync terrain state when the user tilts the map manually. No pitch side-effects. */
  _handlePitchEnd() {
    if (!this._map) return;
    const t = this._map.getPitch();
    t > M.TERRAIN_THRESH && !this._terrainEnabled ? (this._terrainEnabled = !0, this._map.setTerrain(this._terrainCfg)) : t < M.TERRAIN_THRESH && this._terrainEnabled && (this._terrainEnabled = !1, this._map.setTerrain(null));
  }
  _applyLayers(t, i) {
    for (const { id: o, paint: r, layout: a } of It(i.colors))
      for (const l of o)
        if (t.getLayer(l)) {
          if (r)
            for (const [n, s] of Object.entries(r))
              t.setPaintProperty(l, n, s);
          if (a)
            for (const [n, s] of Object.entries(a))
              t.setLayoutProperty(l, n, s);
        }
  }
  _applyCSS(t) {
    if (typeof document > "u") return;
    let i = document.getElementById(lt);
    i || (i = document.createElement("style"), i.id = lt, document.head.appendChild(i)), i.textContent = Wt(t.colors);
  }
};
X(M, "_registered", !1), X(M, "_rtlRegistered", !1), X(M, "TERRAIN_CFG", { source: "terrain", exaggeration: 1 }), X(M, "TERRAIN_PITCH", 30), // degrees applied when enableTerrain() tilts the map
X(M, "TERRAIN_THRESH", 5), // pitch threshold above which manual tilt enables terrain
X(M, "HILLSHADE_LAYER", "hillshade"), X(M, "CONTOUR_LAYERS", ["contour-lines", "contour-labels"]), X(M, "SATELLITE_LAYER", "satellite"), X(M, "MASK_URL", qt), X(M, "PLACES_MASK_LAYERS", [
  "places_locality_capital",
  "places_locality_regional",
  "places_locality_minor"
]), // All layers with translatable name labels (excludes contour-labels which shows elevation).
X(M, "LABEL_LAYERS", [
  "road-label",
  "water-label-line",
  "water-label-point",
  "waterway-label",
  "places_locality_capital",
  "places_locality_regional",
  "places_locality_minor",
  "country_un_1_label_1",
  "country_un_0_label_99",
  "country_un_0_label_5",
  "country_un_0_label_4",
  "country_un_0_label_3",
  "country_un_0_label_2",
  "country_un_0_label_1",
  "country_un_0_label_0"
]);
let Jt = M;
export {
  En as MapScaler,
  Jt as MapxStyle
};
