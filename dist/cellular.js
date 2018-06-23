(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.cellular = factory());
}(this, (function () { 'use strict';

  function memoize(fn) {
    var cache = {};
    return function (arg) {
      if (cache[arg] === undefined) cache[arg] = fn(arg);
      return cache[arg];
    };
  }

  var index = {
    animationIterationCount: 1,
    borderImageOutset: 1,
    borderImageSlice: 1,
    borderImageWidth: 1,
    boxFlex: 1,
    boxFlexGroup: 1,
    boxOrdinalGroup: 1,
    columnCount: 1,
    columns: 1,
    flex: 1,
    flexGrow: 1,
    flexPositive: 1,
    flexShrink: 1,
    flexNegative: 1,
    flexOrder: 1,
    gridRow: 1,
    gridRowEnd: 1,
    gridRowSpan: 1,
    gridRowStart: 1,
    gridColumn: 1,
    gridColumnEnd: 1,
    gridColumnSpan: 1,
    gridColumnStart: 1,
    fontWeight: 1,
    lineHeight: 1,
    opacity: 1,
    order: 1,
    orphans: 1,
    tabSize: 1,
    widows: 1,
    zIndex: 1,
    zoom: 1,
    WebkitLineClamp: 1,
    // SVG-related properties
    fillOpacity: 1,
    floodOpacity: 1,
    stopOpacity: 1,
    strokeDasharray: 1,
    strokeDashoffset: 1,
    strokeMiterlimit: 1,
    strokeOpacity: 1,
    strokeWidth: 1
  };

  /* eslint-disable */
  // murmurhash2 via https://github.com/garycourt/murmurhash-js/blob/master/murmurhash2_gc.js
  function murmurhash2_32_gc(str) {
    var l = str.length,
        h = l ^ l,
        i = 0,
        k;

    while (l >= 4) {
      k = str.charCodeAt(i) & 0xff | (str.charCodeAt(++i) & 0xff) << 8 | (str.charCodeAt(++i) & 0xff) << 16 | (str.charCodeAt(++i) & 0xff) << 24;
      k = (k & 0xffff) * 0x5bd1e995 + (((k >>> 16) * 0x5bd1e995 & 0xffff) << 16);
      k ^= k >>> 24;
      k = (k & 0xffff) * 0x5bd1e995 + (((k >>> 16) * 0x5bd1e995 & 0xffff) << 16);
      h = (h & 0xffff) * 0x5bd1e995 + (((h >>> 16) * 0x5bd1e995 & 0xffff) << 16) ^ k;
      l -= 4;
      ++i;
    }

    switch (l) {
      case 3:
        h ^= (str.charCodeAt(i + 2) & 0xff) << 16;

      case 2:
        h ^= (str.charCodeAt(i + 1) & 0xff) << 8;

      case 1:
        h ^= str.charCodeAt(i) & 0xff;
        h = (h & 0xffff) * 0x5bd1e995 + (((h >>> 16) * 0x5bd1e995 & 0xffff) << 16);
    }

    h ^= h >>> 13;
    h = (h & 0xffff) * 0x5bd1e995 + (((h >>> 16) * 0x5bd1e995 & 0xffff) << 16);
    h ^= h >>> 15;
    return (h >>> 0).toString(36);
  }

  var V = function ca(W) {
    function M(d, c, f, h, a) {
      for (var k = 0, b = 0, u = 0, l = 0, q, m, e, D = 0, y = 0, r, E = r = q = 0, n = 0, J = m = 0, t = 0, K = f.length, F = K - 1, w, g = "", p = "", G = "", H = "", A; n < K;) {
        e = f.charCodeAt(n);
        n === F && 0 !== b + l + u + k && (0 !== b && (e = 47 === b ? 10 : 47), l = u = k = 0, K++, F++);

        if (0 === b + l + u + k) {
          if (n === F && (0 < m && (g = g.replace(N, "")), 0 < g.trim().length)) {
            switch (e) {
              case 32:
              case 9:
              case 59:
              case 13:
              case 10:
                break;

              default:
                g += f.charAt(n);
            }

            e = 59;
          }

          switch (e) {
            case 123:
              g = g.trim();
              q = g.charCodeAt(0);
              r = 1;

              for (t = ++n; n < K;) {
                e = f.charCodeAt(n);

                switch (e) {
                  case 123:
                    r++;
                    break;

                  case 125:
                    r--;
                }

                if (0 === r) break;
                n++;
              }

              e = f.substring(t, n);
              0 === q && (q = (g = g.replace(da, "").trim()).charCodeAt(0));

              switch (q) {
                case 64:
                  0 < m && (g = g.replace(N, ""));
                  m = g.charCodeAt(1);

                  switch (m) {
                    case 100:
                    case 109:
                    case 115:
                    case 45:
                      r = c;
                      break;

                    default:
                      r = O;
                  }

                  e = M(c, r, e, m, a + 1);
                  t = e.length;
                  0 < z && (r = X(O, g, J), A = I(3, e, r, c, B, x, t, m, a, h), g = r.join(""), void 0 !== A && 0 === (t = (e = A.trim()).length) && (m = 0, e = ""));
                  if (0 < t) switch (m) {
                    case 115:
                      g = g.replace(ea, fa);

                    case 100:
                    case 109:
                    case 45:
                      e = g + "{" + e + "}";
                      break;

                    case 107:
                      g = g.replace(ha, "$1 $2");
                      e = g + "{" + e + "}";
                      e = 1 === v || 2 === v && L("@" + e, 3) ? "@-webkit-" + e + "@" + e : "@" + e;
                      break;

                    default:
                      e = g + e, 112 === h && (e = (p += e, ""));
                  } else e = "";
                  break;

                default:
                  e = M(c, X(c, g, J), e, h, a + 1);
              }

              G += e;
              r = J = m = E = q = 0;
              g = "";
              e = f.charCodeAt(++n);
              break;

            case 125:
            case 59:
              g = (0 < m ? g.replace(N, "") : g).trim();
              if (1 < (t = g.length)) switch (0 === E && (q = g.charCodeAt(0), 45 === q || 96 < q && 123 > q) && (t = (g = g.replace(" ", ":")).length), 0 < z && void 0 !== (A = I(1, g, c, d, B, x, p.length, h, a, h)) && 0 === (t = (g = A.trim()).length) && (g = "\x00\x00"), q = g.charCodeAt(0), m = g.charCodeAt(1), q + m) {
                case 0:
                  break;

                case 169:
                case 163:
                  H += g + f.charAt(n);
                  break;

                default:
                  58 !== g.charCodeAt(t - 1) && (p += P(g, q, m, g.charCodeAt(2)));
              }
              J = m = E = q = 0;
              g = "";
              e = f.charCodeAt(++n);
          }
        }

        switch (e) {
          case 13:
          case 10:
            47 === b ? b = 0 : 0 === 1 + q && (m = 1, g += "\x00");
            0 < z * Y && I(0, g, c, d, B, x, p.length, h, a, h);
            x = 1;
            B++;
            break;

          case 59:
          case 125:
            if (0 === b + l + u + k) {
              x++;
              break;
            }

          default:
            x++;
            w = f.charAt(n);

            switch (e) {
              case 9:
              case 32:
                if (0 === l + k + b) switch (D) {
                  case 44:
                  case 58:
                  case 9:
                  case 32:
                    w = "";
                    break;

                  default:
                    32 !== e && (w = " ");
                }
                break;

              case 0:
                w = "\\0";
                break;

              case 12:
                w = "\\f";
                break;

              case 11:
                w = "\\v";
                break;

              case 38:
                0 === l + b + k && (m = J = 1, w = "\f" + w);
                break;

              case 108:
                if (0 === l + b + k + C && 0 < E) switch (n - E) {
                  case 2:
                    112 === D && 58 === f.charCodeAt(n - 3) && (C = D);

                  case 8:
                    111 === y && (C = y);
                }
                break;

              case 58:
                0 === l + b + k && (E = n);
                break;

              case 44:
                0 === b + u + l + k && (m = 1, w += "\r");
                break;

              case 34:
              case 39:
                0 === b && (l = l === e ? 0 : 0 === l ? e : l);
                break;

              case 91:
                0 === l + b + u && k++;
                break;

              case 93:
                0 === l + b + u && k--;
                break;

              case 41:
                0 === l + b + k && u--;
                break;

              case 40:
                if (0 === l + b + k) {
                  if (0 === q) switch (2 * D + 3 * y) {
                    case 533:
                      break;

                    default:
                      q = 1;
                  }
                  u++;
                }

                break;

              case 64:
                0 === b + u + l + k + E + r && (r = 1);
                break;

              case 42:
              case 47:
                if (!(0 < l + k + u)) switch (b) {
                  case 0:
                    switch (2 * e + 3 * f.charCodeAt(n + 1)) {
                      case 235:
                        b = 47;
                        break;

                      case 220:
                        t = n, b = 42;
                    }

                    break;

                  case 42:
                    47 === e && 42 === D && (33 === f.charCodeAt(t + 2) && (p += f.substring(t, n + 1)), w = "", b = 0);
                }
            }

            0 === b && (g += w);
        }

        y = D;
        D = e;
        n++;
      }

      t = p.length;

      if (0 < t) {
        r = c;
        if (0 < z && (A = I(2, p, r, d, B, x, t, h, a, h), void 0 !== A && 0 === (p = A).length)) return H + p + G;
        p = r.join(",") + "{" + p + "}";

        if (0 !== v * C) {
          2 !== v || L(p, 2) || (C = 0);

          switch (C) {
            case 111:
              p = p.replace(ia, ":-moz-$1") + p;
              break;

            case 112:
              p = p.replace(Q, "::-webkit-input-$1") + p.replace(Q, "::-moz-$1") + p.replace(Q, ":-ms-input-$1") + p;
          }

          C = 0;
        }
      }

      return H + p + G;
    }

    function X(d, c, f) {
      var h = c.trim().split(ja);
      c = h;
      var a = h.length,
          k = d.length;

      switch (k) {
        case 0:
        case 1:
          var b = 0;

          for (d = 0 === k ? "" : d[0] + " "; b < a; ++b) {
            c[b] = Z(d, c[b], f, k).trim();
          }

          break;

        default:
          var u = b = 0;

          for (c = []; b < a; ++b) {
            for (var l = 0; l < k; ++l) {
              c[u++] = Z(d[l] + " ", h[b], f, k).trim();
            }
          }

      }

      return c;
    }

    function Z(d, c, f) {
      var h = c.charCodeAt(0);
      33 > h && (h = (c = c.trim()).charCodeAt(0));

      switch (h) {
        case 38:
          return c.replace(F, "$1" + d.trim());

        case 58:
          switch (c.charCodeAt(1)) {
            case 103:
              break;

            default:
              return d.trim() + c.replace(F, "$1" + d.trim());
          }

        default:
          if (0 < 1 * f && 0 < c.indexOf("\f")) return c.replace(F, (58 === d.charCodeAt(0) ? "" : "$1") + d.trim());
      }

      return d + c;
    }

    function P(d, c, f, h) {
      var a = d + ";",
          k = 2 * c + 3 * f + 4 * h;

      if (944 === k) {
        d = a.indexOf(":", 9) + 1;
        var b = a.substring(d, a.length - 1).trim();
        b = a.substring(0, d).trim() + b + ";";
        return 1 === v || 2 === v && L(b, 1) ? "-webkit-" + b + b : b;
      }

      if (0 === v || 2 === v && !L(a, 1)) return a;

      switch (k) {
        case 1015:
          return 97 === a.charCodeAt(10) ? "-webkit-" + a + a : a;

        case 951:
          return 116 === a.charCodeAt(3) ? "-webkit-" + a + a : a;

        case 963:
          return 110 === a.charCodeAt(5) ? "-webkit-" + a + a : a;

        case 1009:
          if (100 !== a.charCodeAt(4)) break;

        case 969:
        case 942:
          return "-webkit-" + a + a;

        case 978:
          return "-webkit-" + a + "-moz-" + a + a;

        case 1019:
        case 983:
          return "-webkit-" + a + "-moz-" + a + "-ms-" + a + a;

        case 883:
          return 45 === a.charCodeAt(8) ? "-webkit-" + a + a : a;

        case 932:
          if (45 === a.charCodeAt(4)) switch (a.charCodeAt(5)) {
            case 103:
              return "-webkit-box-" + a.replace("-grow", "") + "-webkit-" + a + "-ms-" + a.replace("grow", "positive") + a;

            case 115:
              return "-webkit-" + a + "-ms-" + a.replace("shrink", "negative") + a;

            case 98:
              return "-webkit-" + a + "-ms-" + a.replace("basis", "preferred-size") + a;
          }
          return "-webkit-" + a + "-ms-" + a + a;

        case 964:
          return "-webkit-" + a + "-ms-flex-" + a + a;

        case 1023:
          if (99 !== a.charCodeAt(8)) break;
          b = a.substring(a.indexOf(":", 15)).replace("flex-", "").replace("space-between", "justify");
          return "-webkit-box-pack" + b + "-webkit-" + a + "-ms-flex-pack" + b + a;

        case 1005:
          return ka.test(a) ? a.replace(aa, ":-webkit-") + a.replace(aa, ":-moz-") + a : a;

        case 1e3:
          b = a.substring(13).trim();
          c = b.indexOf("-") + 1;

          switch (b.charCodeAt(0) + b.charCodeAt(c)) {
            case 226:
              b = a.replace(G, "tb");
              break;

            case 232:
              b = a.replace(G, "tb-rl");
              break;

            case 220:
              b = a.replace(G, "lr");
              break;

            default:
              return a;
          }

          return "-webkit-" + a + "-ms-" + b + a;

        case 1017:
          if (-1 === a.indexOf("sticky", 9)) break;

        case 975:
          c = (a = d).length - 10;
          b = (33 === a.charCodeAt(c) ? a.substring(0, c) : a).substring(d.indexOf(":", 7) + 1).trim();

          switch (k = b.charCodeAt(0) + (b.charCodeAt(7) | 0)) {
            case 203:
              if (111 > b.charCodeAt(8)) break;

            case 115:
              a = a.replace(b, "-webkit-" + b) + ";" + a;
              break;

            case 207:
            case 102:
              a = a.replace(b, "-webkit-" + (102 < k ? "inline-" : "") + "box") + ";" + a.replace(b, "-webkit-" + b) + ";" + a.replace(b, "-ms-" + b + "box") + ";" + a;
          }

          return a + ";";

        case 938:
          if (45 === a.charCodeAt(5)) switch (a.charCodeAt(6)) {
            case 105:
              return b = a.replace("-items", ""), "-webkit-" + a + "-webkit-box-" + b + "-ms-flex-" + b + a;

            case 115:
              return "-webkit-" + a + "-ms-flex-item-" + a.replace(ba, "") + a;

            default:
              return "-webkit-" + a + "-ms-flex-line-pack" + a.replace("align-content", "").replace(ba, "") + a;
          }
          break;

        case 973:
        case 989:
          if (45 !== a.charCodeAt(3) || 122 === a.charCodeAt(4)) break;

        case 931:
        case 953:
          if (!0 === la.test(d)) return 115 === (b = d.substring(d.indexOf(":") + 1)).charCodeAt(0) ? P(d.replace("stretch", "fill-available"), c, f, h).replace(":fill-available", ":stretch") : a.replace(b, "-webkit-" + b) + a.replace(b, "-moz-" + b.replace("fill-", "")) + a;
          break;

        case 962:
          if (a = "-webkit-" + a + (102 === a.charCodeAt(5) ? "-ms-" + a : "") + a, 211 === f + h && 105 === a.charCodeAt(13) && 0 < a.indexOf("transform", 10)) return a.substring(0, a.indexOf(";", 27) + 1).replace(ma, "$1-webkit-$2") + a;
      }

      return a;
    }

    function L(d, c) {
      var f = d.indexOf(1 === c ? ":" : "{"),
          h = d.substring(0, 3 !== c ? f : 10);
      f = d.substring(f + 1, d.length - 1);
      return H(2 !== c ? h : h.replace(na, "$1"), f, c);
    }

    function fa(d, c) {
      var f = P(c, c.charCodeAt(0), c.charCodeAt(1), c.charCodeAt(2));
      return f !== c + ";" ? f.replace(oa, " or ($1)").substring(4) : "(" + c + ")";
    }

    function I(d, c, f, h, a, k, b, u, l, q) {
      for (var m = 0, e = c, v; m < z; ++m) {
        switch (v = R[m].call(y, d, e, f, h, a, k, b, u, l, q)) {
          case void 0:
          case !1:
          case !0:
          case null:
            break;

          default:
            e = v;
        }
      }

      if (e !== c) return e;
    }

    function S(d) {
      switch (d) {
        case void 0:
        case null:
          z = R.length = 0;
          break;

        default:
          switch (d.constructor) {
            case Array:
              for (var c = 0, f = d.length; c < f; ++c) {
                S(d[c]);
              }

              break;

            case Function:
              R[z++] = d;
              break;

            case Boolean:
              Y = !!d | 0;
          }

      }

      return S;
    }

    function T(d) {
      d = d.prefix;
      void 0 !== d && (H = null, d ? "function" !== typeof d ? v = 1 : (v = 2, H = d) : v = 0);
      return T;
    }

    function y(d, c) {
      if (void 0 !== this && this.constructor === y) return ca(d);
      var f = d;
      33 > f.charCodeAt(0) && (f = f.trim());
      U = f;
      f = [U];

      if (0 < z) {
        var h = I(-1, c, f, f, B, x, 0, 0, 0, 0);
        void 0 !== h && "string" === typeof h && (c = h);
      }

      var a = M(O, f, c, 0, 0);
      0 < z && (h = I(-2, a, f, f, B, x, a.length, 0, 0, 0), void 0 !== h && (a = h));
      U = "";
      C = 0;
      x = B = 1;
      return a;
    }

    var da = /^\0+/g,
        N = /[\0\r\f]/g,
        aa = /: */g,
        ka = /zoo|gra/,
        ma = /([,: ])(transform)/g,
        ja = /,\r+?/g,
        F = /([\t\r\n ])*\f?&/g,
        ha = /@(k\w+)\s*(\S*)\s*/,
        Q = /::(place)/g,
        ia = /:(read-only)/g,
        G = /[svh]\w+-[tblr]{2}/,
        ea = /\(\s*(.*)\s*\)/g,
        oa = /([\s\S]*?);/g,
        ba = /-self|flex-/g,
        na = /[^]*?(:[rp][el]a[\w-]+)[^]*/,
        la = /stretch|:\s*\w+\-(?:conte|avail)/,
        x = 1,
        B = 1,
        C = 0,
        v = 1,
        O = [],
        R = [],
        z = 0,
        H = null,
        Y = 0,
        U = "";
    y.use = S;
    y.set = T;
    void 0 !== W && T(W);
    return y;
  };

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var stylisRuleSheet = createCommonjsModule(function (module, exports) {
  (function (factory) {
  	module['exports'] = factory();
  }(function () {

  	return function (insertRule) {
  		var delimiter = '/*|*/';
  		var needle = delimiter+'}';

  		function toSheet (block) {
  			if (block)
  				try {
  					insertRule(block + '}');
  				} catch (e) {}
  		}

  		return function ruleSheet (context, content, selectors, parents, line, column, length, ns, depth, at) {
  			switch (context) {
  				// property
  				case 1:
  					// @import
  					if (depth === 0 && content.charCodeAt(0) === 64)
  						return insertRule(content+';'), ''
  					break
  				// selector
  				case 2:
  					if (ns === 0)
  						return content + delimiter
  					break
  				// at-rule
  				case 3:
  					switch (ns) {
  						// @font-face, @page
  						case 102:
  						case 112:
  							return insertRule(selectors[0]+content), ''
  						default:
  							return content + (at === 0 ? delimiter : '')
  					}
  				case -2:
  					content.split(needle).forEach(toSheet);
  			}
  		}
  	}
  }));
  });

  var hyphenateRegex = /[A-Z]|^ms/g;
  var processStyleName = memoize(function (styleName) {
    return styleName.replace(hyphenateRegex, '-$&').toLowerCase();
  });
  var processStyleValue = function processStyleValue(key, value) {
    if (value == null || typeof value === 'boolean') {
      return '';
    }

    if (index[key] !== 1 && key.charCodeAt(1) !== 45 && // custom properties
    !isNaN(value) && value !== 0) {
      return value + 'px';
    }

    return value;
  };



  var classnames = function classnames(args) {
    var len = args.length;
    var i = 0;
    var cls = '';

    for (; i < len; i++) {
      var arg = args[i];
      if (arg == null) continue;
      var toAdd = void 0;

      switch (typeof arg) {
        case 'boolean':
          break;

        case 'function':

          toAdd = classnames([arg()]);
          break;

        case 'object':
          {
            if (Array.isArray(arg)) {
              toAdd = classnames(arg);
            } else {
              toAdd = '';

              for (var k in arg) {
                if (arg[k] && k) {
                  toAdd && (toAdd += ' ');
                  toAdd += k;
                }
              }
            }

            break;
          }

        default:
          {
            toAdd = arg;
          }
      }

      if (toAdd) {
        cls && (cls += ' ');
        cls += toAdd;
      }
    }

    return cls;
  };
  var isBrowser = typeof document !== 'undefined';

  /*

  high performance StyleSheet for css-in-js systems

  - uses multiple style tags behind the scenes for millions of rules
  - uses `insertRule` for appending in production for *much* faster performance
  - 'polyfills' on server side

  // usage

  import StyleSheet from 'glamor/lib/sheet'
  let styleSheet = new StyleSheet()

  styleSheet.inject()
  - 'injects' the stylesheet into the page (or into memory if on server)

  styleSheet.insert('#box { border: 1px solid red; }')
  - appends a css rule into the stylesheet

  styleSheet.flush()
  - empties the stylesheet of all its contents

  */
  // $FlowFixMe
  function sheetForTag(tag) {
    if (tag.sheet) {
      // $FlowFixMe
      return tag.sheet;
    } // this weirdness brought to you by firefox


    for (var i = 0; i < document.styleSheets.length; i++) {
      if (document.styleSheets[i].ownerNode === tag) {
        // $FlowFixMe
        return document.styleSheets[i];
      }
    }
  }

  function makeStyleTag(opts) {
    var tag = document.createElement('style');
    tag.setAttribute('data-emotion', opts.key || '');

    if (opts.nonce !== undefined) {
      tag.setAttribute('nonce', opts.nonce);
    }

    tag.appendChild(document.createTextNode('')) // $FlowFixMe
    ;
    (opts.container !== undefined ? opts.container : document.head).appendChild(tag);
    return tag;
  }

  function _StyleSheet(options) {
    this.isSpeedy = "production" === 'production'; // the big drawback here is that the css won't be editable in devtools

    this.tags = [];
    this.ctr = 0;
    this.opts = options;
  }

  function _inject() {
    if (this.injected) {
      throw new Error('already injected!');
    }

    this.tags[0] = makeStyleTag(this.opts);
    this.injected = true;
  }

  function _speedy(bool) {
    if (this.ctr !== 0) {
      // cannot change speedy mode after inserting any rule to sheet. Either call speedy(${bool}) earlier in your app, or call flush() before speedy(${bool})
      throw new Error("cannot change speedy now");
    }

    this.isSpeedy = !!bool;
  }

  function _insert(rule, sourceMap) {
    // this is the ultrafast version, works across browsers
    if (this.isSpeedy) {
      var tag = this.tags[this.tags.length - 1];
      var sheet = sheetForTag(tag);

      try {
        sheet.insertRule(rule, sheet.cssRules.length);
      } catch (e) {
      }
    } else {
      var _tag = makeStyleTag(this.opts);

      this.tags.push(_tag);

      _tag.appendChild(document.createTextNode(rule + (sourceMap || '')));
    }

    this.ctr++;

    if (this.ctr % 65000 === 0) {
      this.tags.push(makeStyleTag(this.opts));
    }
  }

  function _ref(tag) {
    return tag.parentNode.removeChild(tag);
  }

  function _flush() {
    // $FlowFixMe
    this.tags.forEach(_ref);
    this.tags = [];
    this.ctr = 0; // todo - look for remnants in document.styleSheets

    this.injected = false;
  }

  var StyleSheet =
  /*#__PURE__*/
  function () {
    var _proto = _StyleSheet.prototype;
    _proto.inject = _inject;
    _proto.speedy = _speedy;
    _proto.insert = _insert;
    _proto.flush = _flush;
    return _StyleSheet;
  }();

  function createEmotion(context, options) {
    if (context.__SECRET_EMOTION__ !== undefined) {
      return context.__SECRET_EMOTION__;
    }

    if (options === undefined) options = {};
    var key = options.key || 'css';

    var current;

    function insertRule(rule) {
      current += rule;

      if (isBrowser) {
        sheet.insert(rule, currentSourceMap);
      }
    }

    var insertionPlugin = stylisRuleSheet(insertRule);
    var stylisOptions;

    if (options.prefix !== undefined) {
      stylisOptions = {
        prefix: options.prefix
      };
    }

    var caches = {
      registered: {},
      inserted: {},
      nonce: options.nonce,
      key: key
    };
    var sheet = new StyleSheet(options);

    if (isBrowser) {
      // 🚀
      sheet.inject();
    }

    var stylis = new V(stylisOptions);
    stylis.use(options.stylisPlugins)(insertionPlugin);
    var currentSourceMap = '';

    function handleInterpolation(interpolation, couldBeSelectorInterpolation) {
      if (interpolation == null) {
        return '';
      }

      switch (typeof interpolation) {
        case 'boolean':
          return '';

        case 'function':
          if (interpolation.__emotion_styles !== undefined) {
            var selector = interpolation.toString();

            if (selector === 'NO_COMPONENT_SELECTOR' && "production" !== 'production') {
              throw new Error('Component selectors can only be used in conjunction with babel-plugin-emotion.');
            }

            return selector;
          }

          if (this === undefined && "production" !== 'production') {
            console.error('Interpolating functions in css calls is deprecated and will be removed in the next major version of Emotion.\n' + 'If you want to have a css call based on props, create a function that returns a css call like this\n' + 'let dynamicStyle = (props) => css`color: ${props.color}`\n' + 'It can be called directly with props or interpolated in a styled call like this\n' + "let SomeComponent = styled('div')`${dynamicStyle}`");
          }

          return handleInterpolation.call(this, this === undefined ? interpolation() : // $FlowFixMe
          interpolation(this.mergedProps, this.context), couldBeSelectorInterpolation);

        case 'object':
          return createStringFromObject.call(this, interpolation);

        default:
          var cached = caches.registered[interpolation];
          return couldBeSelectorInterpolation === false && cached !== undefined ? cached : interpolation;
      }
    }

    var objectToStringCache = new WeakMap();

    function createStringFromObject(obj) {
      if (objectToStringCache.has(obj)) {
        // $FlowFixMe
        return objectToStringCache.get(obj);
      }

      var string = '';

      function _ref(interpolation) {
        string += handleInterpolation.call(this, interpolation, false);
      }

      function _ref3(key) {
        function _ref2(value) {
          string += processStyleName(key) + ":" + processStyleValue(key, value) + ";";
        }

        if (typeof obj[key] !== 'object') {
          if (caches.registered[obj[key]] !== undefined) {
            string += key + "{" + caches.registered[obj[key]] + "}";
          } else {
            string += processStyleName(key) + ":" + processStyleValue(key, obj[key]) + ";";
          }
        } else {
          if (key === 'NO_COMPONENT_SELECTOR' && "production" !== 'production') {
            throw new Error('Component selectors can only be used in conjunction with babel-plugin-emotion.');
          }

          if (Array.isArray(obj[key]) && typeof obj[key][0] === 'string' && caches.registered[obj[key][0]] === undefined) {
            obj[key].forEach(_ref2);
          } else {
            string += key + "{" + handleInterpolation.call(this, obj[key], false) + "}";
          }
        }
      }

      if (Array.isArray(obj)) {
        obj.forEach(_ref, this);
      } else {
        Object.keys(obj).forEach(_ref3, this);
      }

      objectToStringCache.set(obj, string);
      return string;
    }

    var name;
    var stylesWithLabel;
    var labelPattern = /label:\s*([^\s;\n{]+)\s*;/g;

    var createStyles = function createStyles(strings) {
      var stringMode = true;
      var styles = '';
      var identifierName = '';

      if (strings == null || strings.raw === undefined) {
        stringMode = false;
        styles += handleInterpolation.call(this, strings, false);
      } else {
        styles += strings[0];
      }

      for (var _len = arguments.length, interpolations = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        interpolations[_key - 1] = arguments[_key];
      }

      interpolations.forEach(function (interpolation, i) {
        styles += handleInterpolation.call(this, interpolation, styles.charCodeAt(styles.length - 1) === 46 // .
        );

        if (stringMode === true && strings[i + 1] !== undefined) {
          styles += strings[i + 1];
        }
      }, this);
      stylesWithLabel = styles;
      styles = styles.replace(labelPattern, function (match, p1) {
        identifierName += "-" + p1;
        return '';
      });
      name = murmurhash2_32_gc(styles + identifierName) + identifierName;
      return styles;
    };

    

    function insert(scope, styles) {
      if (caches.inserted[name] === undefined) {
        current = '';
        stylis(scope, styles);
        caches.inserted[name] = current;
      }
    }

    var css = function css() {
      var styles = createStyles.apply(this, arguments);
      var selector = key + "-" + name;

      if (caches.registered[selector] === undefined) {
        caches.registered[selector] = stylesWithLabel;
      }

      insert("." + selector, styles);
      return selector;
    };

    var keyframes = function keyframes() {
      var styles = createStyles.apply(this, arguments);
      var animation = "animation-" + name;
      insert('', "@keyframes " + animation + "{" + styles + "}");
      return animation;
    };

    var injectGlobal = function injectGlobal() {
      var styles = createStyles.apply(this, arguments);
      insert('', styles);
    };

    function getRegisteredStyles(registeredStyles, classNames) {
      var rawClassName = '';
      classNames.split(' ').forEach(function (className) {
        if (caches.registered[className] !== undefined) {
          registeredStyles.push(className);
        } else {
          rawClassName += className + " ";
        }
      });
      return rawClassName;
    }

    function merge(className, sourceMap) {
      var registeredStyles = [];
      var rawClassName = getRegisteredStyles(registeredStyles, className);

      if (registeredStyles.length < 2) {
        return className;
      }

      return rawClassName + css(registeredStyles, sourceMap);
    }

    function cx() {
      for (var _len2 = arguments.length, classNames = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        classNames[_key2] = arguments[_key2];
      }

      return merge(classnames(classNames));
    }

    function hydrateSingleId(id) {
      caches.inserted[id] = true;
    }

    function hydrate(ids) {
      ids.forEach(hydrateSingleId);
    }

    function flush() {
      if (isBrowser) {
        sheet.flush();
        sheet.inject();
      }

      caches.inserted = {};
      caches.registered = {};
    }

    function _ref4(node) {
      // $FlowFixMe
      sheet.tags[0].parentNode.insertBefore(node, sheet.tags[0]); // $FlowFixMe

      node.getAttribute("data-emotion-" + key).split(' ').forEach(hydrateSingleId);
    }

    if (isBrowser) {
      var chunks = document.querySelectorAll("[data-emotion-" + key + "]");
      Array.prototype.forEach.call(chunks, _ref4);
    }

    var emotion = {
      flush: flush,
      hydrate: hydrate,
      cx: cx,
      merge: merge,
      getRegisteredStyles: getRegisteredStyles,
      injectGlobal: injectGlobal,
      keyframes: keyframes,
      css: css,
      sheet: sheet,
      caches: caches
    };
    context.__SECRET_EMOTION__ = emotion;
    return emotion;
  }

  var context = typeof global !== 'undefined' ? global : {};

  var _createEmotion = createEmotion(context),
      flush = _createEmotion.flush,
      hydrate = _createEmotion.hydrate,
      cx = _createEmotion.cx,
      merge = _createEmotion.merge,
      getRegisteredStyles = _createEmotion.getRegisteredStyles,
      injectGlobal = _createEmotion.injectGlobal,
      keyframes = _createEmotion.keyframes,
      css = _createEmotion.css,
      sheet = _createEmotion.sheet,
      caches = _createEmotion.caches;

  /**
   * @license
   * Copyright 2016 Google Inc.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * @template A
   */
  class MDCFoundation {
    /** @return enum{cssClasses} */
    static get cssClasses() {
      // Classes extending MDCFoundation should implement this method to return an object which exports every
      // CSS class the foundation class needs as a property. e.g. {ACTIVE: 'mdc-component--active'}
      return {};
    }

    /** @return enum{strings} */
    static get strings() {
      // Classes extending MDCFoundation should implement this method to return an object which exports all
      // semantic strings as constants. e.g. {ARIA_ROLE: 'tablist'}
      return {};
    }

    /** @return enum{numbers} */
    static get numbers() {
      // Classes extending MDCFoundation should implement this method to return an object which exports all
      // of its semantic numbers as constants. e.g. {ANIMATION_DELAY_MS: 350}
      return {};
    }

    /** @return {!Object} */
    static get defaultAdapter() {
      // Classes extending MDCFoundation may choose to implement this getter in order to provide a convenient
      // way of viewing the necessary methods of an adapter. In the future, this could also be used for adapter
      // validation.
      return {};
    }

    /**
     * @param {A=} adapter
     */
    constructor(adapter = {}) {
      /** @protected {!A} */
      this.adapter_ = adapter;
    }

    init() {
      // Subclasses should override this method to perform initialization routines (registering events, etc.)
    }

    destroy() {
      // Subclasses should override this method to perform de-initialization routines (de-registering events, etc.)
    }
  }

  /**
   * @license
   * Copyright 2016 Google Inc.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * @template F
   */
  class MDCComponent {
    /**
     * @param {!Element} root
     * @return {!MDCComponent}
     */
    static attachTo(root) {
      // Subclasses which extend MDCBase should provide an attachTo() method that takes a root element and
      // returns an instantiated component with its root set to that element. Also note that in the cases of
      // subclasses, an explicit foundation class will not have to be passed in; it will simply be initialized
      // from getDefaultFoundation().
      return new MDCComponent(root, new MDCFoundation());
    }

    /**
     * @param {!Element} root
     * @param {F=} foundation
     * @param {...?} args
     */
    constructor(root, foundation = undefined, ...args) {
      /** @protected {!Element} */
      this.root_ = root;
      this.initialize(...args);
      // Note that we initialize foundation here and not within the constructor's default param so that
      // this.root_ is defined and can be used within the foundation class.
      /** @protected {!F} */
      this.foundation_ = foundation === undefined ? this.getDefaultFoundation() : foundation;
      this.foundation_.init();
      this.initialSyncWithDOM();
    }

    initialize(/* ...args */) {
      // Subclasses can override this to do any additional setup work that would be considered part of a
      // "constructor". Essentially, it is a hook into the parent constructor before the foundation is
      // initialized. Any additional arguments besides root and foundation will be passed in here.
    }

    /**
     * @return {!F} foundation
     */
    getDefaultFoundation() {
      // Subclasses must override this method to return a properly configured foundation class for the
      // component.
      throw new Error('Subclasses must override getDefaultFoundation to return a properly configured ' +
        'foundation class');
    }

    initialSyncWithDOM() {
      // Subclasses should override this method if they need to perform work to synchronize with a host DOM
      // object. An example of this would be a form control wrapper that needs to synchronize its internal state
      // to some property or attribute of the host DOM. Please note: this is *not* the place to perform DOM
      // reads/writes that would cause layout / paint, as this is called synchronously from within the constructor.
    }

    destroy() {
      // Subclasses may implement this method to release any resources / deregister any listeners they have
      // attached. An example of this might be deregistering a resize event from the window object.
      this.foundation_.destroy();
    }

    /**
     * Wrapper method to add an event listener to the component's root element. This is most useful when
     * listening for custom events.
     * @param {string} evtType
     * @param {!Function} handler
     */
    listen(evtType, handler) {
      this.root_.addEventListener(evtType, handler);
    }

    /**
     * Wrapper method to remove an event listener to the component's root element. This is most useful when
     * unlistening for custom events.
     * @param {string} evtType
     * @param {!Function} handler
     */
    unlisten(evtType, handler) {
      this.root_.removeEventListener(evtType, handler);
    }

    /**
     * Fires a cross-browser-compatible custom event from the component root of the given type,
     * with the given data.
     * @param {string} evtType
     * @param {!Object} evtData
     * @param {boolean=} shouldBubble
     */
    emit(evtType, evtData, shouldBubble = false) {
      let evt;
      if (typeof CustomEvent === 'function') {
        evt = new CustomEvent(evtType, {
          detail: evtData,
          bubbles: shouldBubble,
        });
      } else {
        evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(evtType, shouldBubble, false, evtData);
      }

      this.root_.dispatchEvent(evt);
    }
  }

  /**
   * @license
   * Copyright 2017 Google Inc. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * @license
   * Copyright 2016 Google Inc. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /** @enum {string} */
  const strings = {
    ARIA_HIDDEN: 'aria-hidden',
    ROLE: 'role',
  };

  /** @enum {string} */
  const cssClasses = {
    HELPER_TEXT_PERSISTENT: 'mdc-text-field-helper-text--persistent',
    HELPER_TEXT_VALIDATION_MSG: 'mdc-text-field-helper-text--validation-msg',
  };

  /**
   * @license
   * Copyright 2017 Google Inc. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */


  /**
   * @extends {MDCFoundation<!MDCTextFieldHelperTextAdapter>}
   * @final
   */
  class MDCTextFieldHelperTextFoundation extends MDCFoundation {
    /** @return enum {string} */
    static get cssClasses() {
      return cssClasses;
    }

    /** @return enum {string} */
    static get strings() {
      return strings;
    }

    /**
     * {@see MDCTextFieldHelperTextAdapter} for typing information on parameters and return
     * types.
     * @return {!MDCTextFieldHelperTextAdapter}
     */
    static get defaultAdapter() {
      return /** @type {!MDCTextFieldHelperTextAdapter} */ ({
        addClass: () => {},
        removeClass: () => {},
        hasClass: () => {},
        setAttr: () => {},
        removeAttr: () => {},
        setContent: () => {},
      });
    }

    /**
     * @param {!MDCTextFieldHelperTextAdapter} adapter
     */
    constructor(adapter) {
      super(Object.assign(MDCTextFieldHelperTextFoundation.defaultAdapter, adapter));
    }

    /**
     * Sets the content of the helper text field.
     * @param {string} content
     */
    setContent(content) {
      this.adapter_.setContent(content);
    }

    /** @param {boolean} isPersistent Sets the persistency of the helper text. */
    setPersistent(isPersistent) {
      if (isPersistent) {
        this.adapter_.addClass(cssClasses.HELPER_TEXT_PERSISTENT);
      } else {
        this.adapter_.removeClass(cssClasses.HELPER_TEXT_PERSISTENT);
      }
    }

    /**
     * @param {boolean} isValidation True to make the helper text act as an
     *   error validation message.
     */
    setValidation(isValidation) {
      if (isValidation) {
        this.adapter_.addClass(cssClasses.HELPER_TEXT_VALIDATION_MSG);
      } else {
        this.adapter_.removeClass(cssClasses.HELPER_TEXT_VALIDATION_MSG);
      }
    }

    /** Makes the helper text visible to the screen reader. */
    showToScreenReader() {
      this.adapter_.removeAttr(strings.ARIA_HIDDEN);
    }

    /**
     * Sets the validity of the helper text based on the input validity.
     * @param {boolean} inputIsValid
     */
    setValidity(inputIsValid) {
      const helperTextIsPersistent = this.adapter_.hasClass(cssClasses.HELPER_TEXT_PERSISTENT);
      const helperTextIsValidationMsg = this.adapter_.hasClass(cssClasses.HELPER_TEXT_VALIDATION_MSG);
      const validationMsgNeedsDisplay = helperTextIsValidationMsg && !inputIsValid;

      if (validationMsgNeedsDisplay) {
        this.adapter_.setAttr(strings.ROLE, 'alert');
      } else {
        this.adapter_.removeAttr(strings.ROLE);
      }

      if (!helperTextIsPersistent && !validationMsgNeedsDisplay) {
        this.hide_();
      }
    }

    /**
     * Hides the help text from screen readers.
     * @private
     */
    hide_() {
      this.adapter_.setAttr(strings.ARIA_HIDDEN, 'true');
    }
  }

  /**
   * @license
   * Copyright 2017 Google Inc. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * @extends {MDCComponent<!MDCTextFieldHelperTextFoundation>}
   * @final
   */
  class MDCTextFieldHelperText extends MDCComponent {
    /**
     * @param {!Element} root
     * @return {!MDCTextFieldHelperText}
     */
    static attachTo(root) {
      return new MDCTextFieldHelperText(root);
    }

    /**
     * @return {!MDCTextFieldHelperTextFoundation}
     */
    get foundation() {
      return this.foundation_;
    }

    /**
     * @return {!MDCTextFieldHelperTextFoundation}
     */
    getDefaultFoundation() {
      return new MDCTextFieldHelperTextFoundation(/** @type {!MDCTextFieldHelperTextAdapter} */ (Object.assign({
        addClass: (className) => this.root_.classList.add(className),
        removeClass: (className) => this.root_.classList.remove(className),
        hasClass: (className) => this.root_.classList.contains(className),
        setAttr: (attr, value) => this.root_.setAttribute(attr, value),
        removeAttr: (attr) => this.root_.removeAttribute(attr),
        setContent: (content) => {
          this.root_.textContent = content;
        },
      })));
    }
  }

  /**
   * @license
   * Copyright 2018 Google Inc. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * @license
   * Copyright 2018 Google Inc. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /** @enum {string} */
  const cssClasses$1 = {
    LINE_RIPPLE_ACTIVE: 'mdc-line-ripple--active',
    LINE_RIPPLE_DEACTIVATING: 'mdc-line-ripple--deactivating',
  };

  /**
   * @license
   * Copyright 2018 Google Inc. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */


  /**
   * @extends {MDCFoundation<!MDCLineRippleAdapter>}
   * @final
   */
  class MDCLineRippleFoundation extends MDCFoundation {
    /** @return enum {string} */
    static get cssClasses() {
      return cssClasses$1;
    }

    /**
     * {@see MDCLineRippleAdapter} for typing information on parameters and return
     * types.
     * @return {!MDCLineRippleAdapter}
     */
    static get defaultAdapter() {
      return /** @type {!MDCLineRippleAdapter} */ ({
        addClass: () => {},
        removeClass: () => {},
        hasClass: () => {},
        setStyle: () => {},
        registerEventHandler: () => {},
        deregisterEventHandler: () => {},
      });
    }

    /**
     * @param {!MDCLineRippleAdapter=} adapter
     */
    constructor(adapter = /** @type {!MDCLineRippleAdapter} */ ({})) {
      super(Object.assign(MDCLineRippleFoundation.defaultAdapter, adapter));

      /** @private {function(!Event): undefined} */
      this.transitionEndHandler_ = (evt) => this.handleTransitionEnd(evt);
    }

    init() {
      this.adapter_.registerEventHandler('transitionend', this.transitionEndHandler_);
    }

    destroy() {
      this.adapter_.deregisterEventHandler('transitionend', this.transitionEndHandler_);
    }

    /**
     * Activates the line ripple
     */
    activate() {
      this.adapter_.removeClass(cssClasses$1.LINE_RIPPLE_DEACTIVATING);
      this.adapter_.addClass(cssClasses$1.LINE_RIPPLE_ACTIVE);
    }

    /**
     * Sets the center of the ripple animation to the given X coordinate.
     * @param {number} xCoordinate
     */
    setRippleCenter(xCoordinate) {
      this.adapter_.setStyle('transform-origin', `${xCoordinate}px center`);
    }

    /**
     * Deactivates the line ripple
     */
    deactivate() {
      this.adapter_.addClass(cssClasses$1.LINE_RIPPLE_DEACTIVATING);
    }

    /**
     * Handles a transition end event
     * @param {!Event} evt
     */
    handleTransitionEnd(evt) {
      // Wait for the line ripple to be either transparent or opaque
      // before emitting the animation end event
      const isDeactivating = this.adapter_.hasClass(cssClasses$1.LINE_RIPPLE_DEACTIVATING);

      if (evt.propertyName === 'opacity') {
        if (isDeactivating) {
          this.adapter_.removeClass(cssClasses$1.LINE_RIPPLE_ACTIVE);
          this.adapter_.removeClass(cssClasses$1.LINE_RIPPLE_DEACTIVATING);
        }
      }
    }
  }

  /**
   * @license
   * Copyright 2018 Google Inc. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * @extends {MDCComponent<!MDCLineRippleFoundation>}
   * @final
   */
  class MDCLineRipple extends MDCComponent {
    /**
     * @param {!Element} root
     * @return {!MDCLineRipple}
     */
    static attachTo(root) {
      return new MDCLineRipple(root);
    }

    /**
     * Activates the line ripple
     */
    activate() {
      this.foundation_.activate();
    }

    /**
     * Deactivates the line ripple
     */
    deactivate() {
      this.foundation_.deactivate();
    }

    /**
     * Sets the transform origin given a user's click location. The `rippleCenter` is the
     * x-coordinate of the middle of the ripple.
     * @param {number} xCoordinate
     */
    setRippleCenter(xCoordinate) {
      this.foundation_.setRippleCenter(xCoordinate);
    }

    /**
     * @return {!MDCLineRippleFoundation}
     */
    getDefaultFoundation() {
      return new MDCLineRippleFoundation(/** @type {!MDCLineRippleAdapter} */ (Object.assign({
        addClass: (className) => this.root_.classList.add(className),
        removeClass: (className) => this.root_.classList.remove(className),
        hasClass: (className) => this.root_.classList.contains(className),
        setStyle: (propertyName, value) => this.root_.style[propertyName] = value,
        registerEventHandler: (evtType, handler) => this.root_.addEventListener(evtType, handler),
        deregisterEventHandler: (evtType, handler) => this.root_.removeEventListener(evtType, handler),
      })));
    }
  }

  /**
   * @license
   * Copyright 2016 Google Inc. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * @license
   * Copyright 2016 Google Inc. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  const cssClasses$2 = {
    // Ripple is a special case where the "root" component is really a "mixin" of sorts,
    // given that it's an 'upgrade' to an existing component. That being said it is the root
    // CSS class that all other CSS classes derive from.
    ROOT: 'mdc-ripple-upgraded',
    UNBOUNDED: 'mdc-ripple-upgraded--unbounded',
    BG_FOCUSED: 'mdc-ripple-upgraded--background-focused',
    FG_ACTIVATION: 'mdc-ripple-upgraded--foreground-activation',
    FG_DEACTIVATION: 'mdc-ripple-upgraded--foreground-deactivation',
  };

  const strings$1 = {
    VAR_LEFT: '--mdc-ripple-left',
    VAR_TOP: '--mdc-ripple-top',
    VAR_FG_SIZE: '--mdc-ripple-fg-size',
    VAR_FG_SCALE: '--mdc-ripple-fg-scale',
    VAR_FG_TRANSLATE_START: '--mdc-ripple-fg-translate-start',
    VAR_FG_TRANSLATE_END: '--mdc-ripple-fg-translate-end',
  };

  const numbers = {
    PADDING: 10,
    INITIAL_ORIGIN_SCALE: 0.6,
    DEACTIVATION_TIMEOUT_MS: 225, // Corresponds to $mdc-ripple-translate-duration (i.e. activation animation duration)
    FG_DEACTIVATION_MS: 150, // Corresponds to $mdc-ripple-fade-out-duration (i.e. deactivation animation duration)
    TAP_DELAY_MS: 300, // Delay between touch and simulated mouse events on touch devices
  };

  /**
   * @license
   * Copyright 2016 Google Inc. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * Stores result from supportsCssVariables to avoid redundant processing to detect CSS custom variable support.
   * @private {boolean|undefined}
   */
  let supportsCssVariables_;

  /**
   * Stores result from applyPassive to avoid redundant processing to detect passive event listener support.
   * @private {boolean|undefined}
   */
  let supportsPassive_;

  /**
   * @param {!Window} windowObj
   * @return {boolean}
   */
  function detectEdgePseudoVarBug(windowObj) {
    // Detect versions of Edge with buggy var() support
    // See: https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/11495448/
    const document = windowObj.document;
    const node = document.createElement('div');
    node.className = 'mdc-ripple-surface--test-edge-var-bug';
    document.body.appendChild(node);

    // The bug exists if ::before style ends up propagating to the parent element.
    // Additionally, getComputedStyle returns null in iframes with display: "none" in Firefox,
    // but Firefox is known to support CSS custom properties correctly.
    // See: https://bugzilla.mozilla.org/show_bug.cgi?id=548397
    const computedStyle = windowObj.getComputedStyle(node);
    const hasPseudoVarBug = computedStyle !== null && computedStyle.borderTopStyle === 'solid';
    node.remove();
    return hasPseudoVarBug;
  }

  /**
   * @param {!Window} windowObj
   * @param {boolean=} forceRefresh
   * @return {boolean|undefined}
   */

  function supportsCssVariables(windowObj, forceRefresh = false) {
    let supportsCssVariables = supportsCssVariables_;
    if (typeof supportsCssVariables_ === 'boolean' && !forceRefresh) {
      return supportsCssVariables;
    }

    const supportsFunctionPresent = windowObj.CSS && typeof windowObj.CSS.supports === 'function';
    if (!supportsFunctionPresent) {
      return;
    }

    const explicitlySupportsCssVars = windowObj.CSS.supports('--css-vars', 'yes');
    // See: https://bugs.webkit.org/show_bug.cgi?id=154669
    // See: README section on Safari
    const weAreFeatureDetectingSafari10plus = (
      windowObj.CSS.supports('(--css-vars: yes)') &&
      windowObj.CSS.supports('color', '#00000000')
    );

    if (explicitlySupportsCssVars || weAreFeatureDetectingSafari10plus) {
      supportsCssVariables = !detectEdgePseudoVarBug(windowObj);
    } else {
      supportsCssVariables = false;
    }

    if (!forceRefresh) {
      supportsCssVariables_ = supportsCssVariables;
    }
    return supportsCssVariables;
  }

  //
  /**
   * Determine whether the current browser supports passive event listeners, and if so, use them.
   * @param {!Window=} globalObj
   * @param {boolean=} forceRefresh
   * @return {boolean|{passive: boolean}}
   */
  function applyPassive(globalObj = window, forceRefresh = false) {
    if (supportsPassive_ === undefined || forceRefresh) {
      let isSupported = false;
      try {
        globalObj.document.addEventListener('test', null, {get passive() {
          isSupported = true;
        }});
      } catch (e) { }

      supportsPassive_ = isSupported;
    }

    return supportsPassive_ ? {passive: true} : false;
  }

  /**
   * @param {!Object} HTMLElementPrototype
   * @return {!Array<string>}
   */
  function getMatchesProperty(HTMLElementPrototype) {
    return [
      'webkitMatchesSelector', 'msMatchesSelector', 'matches',
    ].filter((p) => p in HTMLElementPrototype).pop();
  }

  /**
   * @param {!Event} ev
   * @param {{x: number, y: number}} pageOffset
   * @param {!ClientRect} clientRect
   * @return {{x: number, y: number}}
   */
  function getNormalizedEventCoords(ev, pageOffset, clientRect) {
    const {x, y} = pageOffset;
    const documentX = x + clientRect.left;
    const documentY = y + clientRect.top;

    let normalizedX;
    let normalizedY;
    // Determine touch point relative to the ripple container.
    if (ev.type === 'touchstart') {
      normalizedX = ev.changedTouches[0].pageX - documentX;
      normalizedY = ev.changedTouches[0].pageY - documentY;
    } else {
      normalizedX = ev.pageX - documentX;
      normalizedY = ev.pageY - documentY;
    }

    return {x: normalizedX, y: normalizedY};
  }

  /**
   * @license
   * Copyright 2016 Google Inc. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  // Activation events registered on the root element of each instance for activation
  const ACTIVATION_EVENT_TYPES = ['touchstart', 'pointerdown', 'mousedown', 'keydown'];

  // Deactivation events registered on documentElement when a pointer-related down event occurs
  const POINTER_DEACTIVATION_EVENT_TYPES = ['touchend', 'pointerup', 'mouseup'];

  // Tracks activations that have occurred on the current frame, to avoid simultaneous nested activations
  /** @type {!Array<!EventTarget>} */
  let activatedTargets = [];

  /**
   * @extends {MDCFoundation<!MDCRippleAdapter>}
   */
  class MDCRippleFoundation extends MDCFoundation {
    static get cssClasses() {
      return cssClasses$2;
    }

    static get strings() {
      return strings$1;
    }

    static get numbers() {
      return numbers;
    }

    static get defaultAdapter() {
      return {
        browserSupportsCssVars: () => /* boolean - cached */ {},
        isUnbounded: () => /* boolean */ {},
        isSurfaceActive: () => /* boolean */ {},
        isSurfaceDisabled: () => /* boolean */ {},
        addClass: (/* className: string */) => {},
        removeClass: (/* className: string */) => {},
        containsEventTarget: (/* target: !EventTarget */) => {},
        registerInteractionHandler: (/* evtType: string, handler: EventListener */) => {},
        deregisterInteractionHandler: (/* evtType: string, handler: EventListener */) => {},
        registerDocumentInteractionHandler: (/* evtType: string, handler: EventListener */) => {},
        deregisterDocumentInteractionHandler: (/* evtType: string, handler: EventListener */) => {},
        registerResizeHandler: (/* handler: EventListener */) => {},
        deregisterResizeHandler: (/* handler: EventListener */) => {},
        updateCssVariable: (/* varName: string, value: string */) => {},
        computeBoundingRect: () => /* ClientRect */ {},
        getWindowPageOffset: () => /* {x: number, y: number} */ {},
      };
    }

    constructor(adapter) {
      super(Object.assign(MDCRippleFoundation.defaultAdapter, adapter));

      /** @private {number} */
      this.layoutFrame_ = 0;

      /** @private {!ClientRect} */
      this.frame_ = /** @type {!ClientRect} */ ({width: 0, height: 0});

      /** @private {!ActivationStateType} */
      this.activationState_ = this.defaultActivationState_();

      /** @private {number} */
      this.initialSize_ = 0;

      /** @private {number} */
      this.maxRadius_ = 0;

      /** @private {function(!Event)} */
      this.activateHandler_ = (e) => this.activate_(e);

      /** @private {function(!Event)} */
      this.deactivateHandler_ = (e) => this.deactivate_(e);

      /** @private {function(?Event=)} */
      this.focusHandler_ = () => requestAnimationFrame(
        () => this.adapter_.addClass(MDCRippleFoundation.cssClasses.BG_FOCUSED)
      );

      /** @private {function(?Event=)} */
      this.blurHandler_ = () => requestAnimationFrame(
        () => this.adapter_.removeClass(MDCRippleFoundation.cssClasses.BG_FOCUSED)
      );

      /** @private {!Function} */
      this.resizeHandler_ = () => this.layout();

      /** @private {{left: number, top:number}} */
      this.unboundedCoords_ = {
        left: 0,
        top: 0,
      };

      /** @private {number} */
      this.fgScale_ = 0;

      /** @private {number} */
      this.activationTimer_ = 0;

      /** @private {number} */
      this.fgDeactivationRemovalTimer_ = 0;

      /** @private {boolean} */
      this.activationAnimationHasEnded_ = false;

      /** @private {!Function} */
      this.activationTimerCallback_ = () => {
        this.activationAnimationHasEnded_ = true;
        this.runDeactivationUXLogicIfReady_();
      };

      /** @private {?Event} */
      this.previousActivationEvent_ = null;
    }

    /**
     * We compute this property so that we are not querying information about the client
     * until the point in time where the foundation requests it. This prevents scenarios where
     * client-side feature-detection may happen too early, such as when components are rendered on the server
     * and then initialized at mount time on the client.
     * @return {boolean}
     * @private
     */
    isSupported_() {
      return this.adapter_.browserSupportsCssVars();
    }

    /**
     * @return {!ActivationStateType}
     */
    defaultActivationState_() {
      return {
        isActivated: false,
        hasDeactivationUXRun: false,
        wasActivatedByPointer: false,
        wasElementMadeActive: false,
        activationEvent: null,
        isProgrammatic: false,
      };
    }

    init() {
      if (!this.isSupported_()) {
        return;
      }
      this.registerRootHandlers_();

      const {ROOT, UNBOUNDED} = MDCRippleFoundation.cssClasses;
      requestAnimationFrame(() => {
        this.adapter_.addClass(ROOT);
        if (this.adapter_.isUnbounded()) {
          this.adapter_.addClass(UNBOUNDED);
          // Unbounded ripples need layout logic applied immediately to set coordinates for both shade and ripple
          this.layoutInternal_();
        }
      });
    }

    destroy() {
      if (!this.isSupported_()) {
        return;
      }

      if (this.activationTimer_) {
        clearTimeout(this.activationTimer_);
        this.activationTimer_ = 0;
        const {FG_ACTIVATION} = MDCRippleFoundation.cssClasses;
        this.adapter_.removeClass(FG_ACTIVATION);
      }

      this.deregisterRootHandlers_();
      this.deregisterDeactivationHandlers_();

      const {ROOT, UNBOUNDED} = MDCRippleFoundation.cssClasses;
      requestAnimationFrame(() => {
        this.adapter_.removeClass(ROOT);
        this.adapter_.removeClass(UNBOUNDED);
        this.removeCssVars_();
      });
    }

    /** @private */
    registerRootHandlers_() {
      ACTIVATION_EVENT_TYPES.forEach((type) => {
        this.adapter_.registerInteractionHandler(type, this.activateHandler_);
      });
      this.adapter_.registerInteractionHandler('focus', this.focusHandler_);
      this.adapter_.registerInteractionHandler('blur', this.blurHandler_);

      if (this.adapter_.isUnbounded()) {
        this.adapter_.registerResizeHandler(this.resizeHandler_);
      }
    }

    /**
     * @param {!Event} e
     * @private
     */
    registerDeactivationHandlers_(e) {
      if (e.type === 'keydown') {
        this.adapter_.registerInteractionHandler('keyup', this.deactivateHandler_);
      } else {
        POINTER_DEACTIVATION_EVENT_TYPES.forEach((type) => {
          this.adapter_.registerDocumentInteractionHandler(type, this.deactivateHandler_);
        });
      }
    }

    /** @private */
    deregisterRootHandlers_() {
      ACTIVATION_EVENT_TYPES.forEach((type) => {
        this.adapter_.deregisterInteractionHandler(type, this.activateHandler_);
      });
      this.adapter_.deregisterInteractionHandler('focus', this.focusHandler_);
      this.adapter_.deregisterInteractionHandler('blur', this.blurHandler_);

      if (this.adapter_.isUnbounded()) {
        this.adapter_.deregisterResizeHandler(this.resizeHandler_);
      }
    }

    /** @private */
    deregisterDeactivationHandlers_() {
      this.adapter_.deregisterInteractionHandler('keyup', this.deactivateHandler_);
      POINTER_DEACTIVATION_EVENT_TYPES.forEach((type) => {
        this.adapter_.deregisterDocumentInteractionHandler(type, this.deactivateHandler_);
      });
    }

    /** @private */
    removeCssVars_() {
      const {strings} = MDCRippleFoundation;
      Object.keys(strings).forEach((k) => {
        if (k.indexOf('VAR_') === 0) {
          this.adapter_.updateCssVariable(strings[k], null);
        }
      });
    }

    /**
     * @param {?Event} e
     * @private
     */
    activate_(e) {
      if (this.adapter_.isSurfaceDisabled()) {
        return;
      }

      const activationState = this.activationState_;
      if (activationState.isActivated) {
        return;
      }

      // Avoid reacting to follow-on events fired by touch device after an already-processed user interaction
      const previousActivationEvent = this.previousActivationEvent_;
      const isSameInteraction = previousActivationEvent && e && previousActivationEvent.type !== e.type;
      if (isSameInteraction) {
        return;
      }

      activationState.isActivated = true;
      activationState.isProgrammatic = e === null;
      activationState.activationEvent = e;
      activationState.wasActivatedByPointer = activationState.isProgrammatic ? false : (
        e.type === 'mousedown' || e.type === 'touchstart' || e.type === 'pointerdown'
      );

      const hasActivatedChild =
        e && activatedTargets.length > 0 && activatedTargets.some((target) => this.adapter_.containsEventTarget(target));
      if (hasActivatedChild) {
        // Immediately reset activation state, while preserving logic that prevents touch follow-on events
        this.resetActivationState_();
        return;
      }

      if (e) {
        activatedTargets.push(/** @type {!EventTarget} */ (e.target));
        this.registerDeactivationHandlers_(e);
      }

      activationState.wasElementMadeActive = this.checkElementMadeActive_(e);
      if (activationState.wasElementMadeActive) {
        this.animateActivation_();
      }

      requestAnimationFrame(() => {
        // Reset array on next frame after the current event has had a chance to bubble to prevent ancestor ripples
        activatedTargets = [];

        if (!activationState.wasElementMadeActive && (e.key === ' ' || e.keyCode === 32)) {
          // If space was pressed, try again within an rAF call to detect :active, because different UAs report
          // active states inconsistently when they're called within event handling code:
          // - https://bugs.chromium.org/p/chromium/issues/detail?id=635971
          // - https://bugzilla.mozilla.org/show_bug.cgi?id=1293741
          // We try first outside rAF to support Edge, which does not exhibit this problem, but will crash if a CSS
          // variable is set within a rAF callback for a submit button interaction (#2241).
          activationState.wasElementMadeActive = this.checkElementMadeActive_(e);
          if (activationState.wasElementMadeActive) {
            this.animateActivation_();
          }
        }

        if (!activationState.wasElementMadeActive) {
          // Reset activation state immediately if element was not made active.
          this.activationState_ = this.defaultActivationState_();
        }
      });
    }

    /**
     * @param {?Event} e
     * @private
     */
    checkElementMadeActive_(e) {
      return (e && e.type === 'keydown') ? this.adapter_.isSurfaceActive() : true;
    }

    /**
     * @param {?Event=} event Optional event containing position information.
     */
    activate(event = null) {
      this.activate_(event);
    }

    /** @private */
    animateActivation_() {
      const {VAR_FG_TRANSLATE_START, VAR_FG_TRANSLATE_END} = MDCRippleFoundation.strings;
      const {FG_DEACTIVATION, FG_ACTIVATION} = MDCRippleFoundation.cssClasses;
      const {DEACTIVATION_TIMEOUT_MS} = MDCRippleFoundation.numbers;

      this.layoutInternal_();

      let translateStart = '';
      let translateEnd = '';

      if (!this.adapter_.isUnbounded()) {
        const {startPoint, endPoint} = this.getFgTranslationCoordinates_();
        translateStart = `${startPoint.x}px, ${startPoint.y}px`;
        translateEnd = `${endPoint.x}px, ${endPoint.y}px`;
      }

      this.adapter_.updateCssVariable(VAR_FG_TRANSLATE_START, translateStart);
      this.adapter_.updateCssVariable(VAR_FG_TRANSLATE_END, translateEnd);
      // Cancel any ongoing activation/deactivation animations
      clearTimeout(this.activationTimer_);
      clearTimeout(this.fgDeactivationRemovalTimer_);
      this.rmBoundedActivationClasses_();
      this.adapter_.removeClass(FG_DEACTIVATION);

      // Force layout in order to re-trigger the animation.
      this.adapter_.computeBoundingRect();
      this.adapter_.addClass(FG_ACTIVATION);
      this.activationTimer_ = setTimeout(() => this.activationTimerCallback_(), DEACTIVATION_TIMEOUT_MS);
    }

    /**
     * @private
     * @return {{startPoint: PointType, endPoint: PointType}}
     */
    getFgTranslationCoordinates_() {
      const {activationEvent, wasActivatedByPointer} = this.activationState_;

      let startPoint;
      if (wasActivatedByPointer) {
        startPoint = getNormalizedEventCoords(
          /** @type {!Event} */ (activationEvent),
          this.adapter_.getWindowPageOffset(), this.adapter_.computeBoundingRect()
        );
      } else {
        startPoint = {
          x: this.frame_.width / 2,
          y: this.frame_.height / 2,
        };
      }
      // Center the element around the start point.
      startPoint = {
        x: startPoint.x - (this.initialSize_ / 2),
        y: startPoint.y - (this.initialSize_ / 2),
      };

      const endPoint = {
        x: (this.frame_.width / 2) - (this.initialSize_ / 2),
        y: (this.frame_.height / 2) - (this.initialSize_ / 2),
      };

      return {startPoint, endPoint};
    }

    /** @private */
    runDeactivationUXLogicIfReady_() {
      // This method is called both when a pointing device is released, and when the activation animation ends.
      // The deactivation animation should only run after both of those occur.
      const {FG_DEACTIVATION} = MDCRippleFoundation.cssClasses;
      const {hasDeactivationUXRun, isActivated} = this.activationState_;
      const activationHasEnded = hasDeactivationUXRun || !isActivated;

      if (activationHasEnded && this.activationAnimationHasEnded_) {
        this.rmBoundedActivationClasses_();
        this.adapter_.addClass(FG_DEACTIVATION);
        this.fgDeactivationRemovalTimer_ = setTimeout(() => {
          this.adapter_.removeClass(FG_DEACTIVATION);
        }, numbers.FG_DEACTIVATION_MS);
      }
    }

    /** @private */
    rmBoundedActivationClasses_() {
      const {FG_ACTIVATION} = MDCRippleFoundation.cssClasses;
      this.adapter_.removeClass(FG_ACTIVATION);
      this.activationAnimationHasEnded_ = false;
      this.adapter_.computeBoundingRect();
    }

    resetActivationState_() {
      this.previousActivationEvent_ = this.activationState_.activationEvent;
      this.activationState_ = this.defaultActivationState_();
      // Touch devices may fire additional events for the same interaction within a short time.
      // Store the previous event until it's safe to assume that subsequent events are for new interactions.
      setTimeout(() => this.previousActivationEvent_ = null, MDCRippleFoundation.numbers.TAP_DELAY_MS);
    }

    /**
     * @param {?Event} e
     * @private
     */
    deactivate_(e) {
      const activationState = this.activationState_;
      // This can happen in scenarios such as when you have a keyup event that blurs the element.
      if (!activationState.isActivated) {
        return;
      }

      const state = /** @type {!ActivationStateType} */ (Object.assign({}, activationState));

      if (activationState.isProgrammatic) {
        const evtObject = null;
        requestAnimationFrame(() => this.animateDeactivation_(evtObject, state));
        this.resetActivationState_();
      } else {
        this.deregisterDeactivationHandlers_();
        requestAnimationFrame(() => {
          this.activationState_.hasDeactivationUXRun = true;
          this.animateDeactivation_(e, state);
          this.resetActivationState_();
        });
      }
    }

    /**
     * @param {?Event=} event Optional event containing position information.
     */
    deactivate(event = null) {
      this.deactivate_(event);
    }

    /**
     * @param {Event} e
     * @param {!ActivationStateType} options
     * @private
     */
    animateDeactivation_(e, {wasActivatedByPointer, wasElementMadeActive}) {
      if (wasActivatedByPointer || wasElementMadeActive) {
        this.runDeactivationUXLogicIfReady_();
      }
    }

    layout() {
      if (this.layoutFrame_) {
        cancelAnimationFrame(this.layoutFrame_);
      }
      this.layoutFrame_ = requestAnimationFrame(() => {
        this.layoutInternal_();
        this.layoutFrame_ = 0;
      });
    }

    /** @private */
    layoutInternal_() {
      this.frame_ = this.adapter_.computeBoundingRect();
      const maxDim = Math.max(this.frame_.height, this.frame_.width);

      // Surface diameter is treated differently for unbounded vs. bounded ripples.
      // Unbounded ripple diameter is calculated smaller since the surface is expected to already be padded appropriately
      // to extend the hitbox, and the ripple is expected to meet the edges of the padded hitbox (which is typically
      // square). Bounded ripples, on the other hand, are fully expected to expand beyond the surface's longest diameter
      // (calculated based on the diagonal plus a constant padding), and are clipped at the surface's border via
      // `overflow: hidden`.
      const getBoundedRadius = () => {
        const hypotenuse = Math.sqrt(Math.pow(this.frame_.width, 2) + Math.pow(this.frame_.height, 2));
        return hypotenuse + MDCRippleFoundation.numbers.PADDING;
      };

      this.maxRadius_ = this.adapter_.isUnbounded() ? maxDim : getBoundedRadius();

      // Ripple is sized as a fraction of the largest dimension of the surface, then scales up using a CSS scale transform
      this.initialSize_ = maxDim * MDCRippleFoundation.numbers.INITIAL_ORIGIN_SCALE;
      this.fgScale_ = this.maxRadius_ / this.initialSize_;

      this.updateLayoutCssVars_();
    }

    /** @private */
    updateLayoutCssVars_() {
      const {
        VAR_FG_SIZE, VAR_LEFT, VAR_TOP, VAR_FG_SCALE,
      } = MDCRippleFoundation.strings;

      this.adapter_.updateCssVariable(VAR_FG_SIZE, `${this.initialSize_}px`);
      this.adapter_.updateCssVariable(VAR_FG_SCALE, this.fgScale_);

      if (this.adapter_.isUnbounded()) {
        this.unboundedCoords_ = {
          left: Math.round((this.frame_.width / 2) - (this.initialSize_ / 2)),
          top: Math.round((this.frame_.height / 2) - (this.initialSize_ / 2)),
        };

        this.adapter_.updateCssVariable(VAR_LEFT, `${this.unboundedCoords_.left}px`);
        this.adapter_.updateCssVariable(VAR_TOP, `${this.unboundedCoords_.top}px`);
      }
    }

    /** @param {boolean} unbounded */
    setUnbounded(unbounded) {
      const {UNBOUNDED} = MDCRippleFoundation.cssClasses;
      if (unbounded) {
        this.adapter_.addClass(UNBOUNDED);
      } else {
        this.adapter_.removeClass(UNBOUNDED);
      }
    }
  }

  /**
   * @license
   * Copyright 2016 Google Inc. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * @extends MDCComponent<!MDCRippleFoundation>
   */
  class MDCRipple extends MDCComponent {
    /** @param {...?} args */
    constructor(...args) {
      super(...args);

      /** @type {boolean} */
      this.disabled = false;

      /** @private {boolean} */
      this.unbounded_;
    }

    /**
     * @param {!Element} root
     * @param {{isUnbounded: (boolean|undefined)}=} options
     * @return {!MDCRipple}
     */
    static attachTo(root, {isUnbounded = undefined} = {}) {
      const ripple = new MDCRipple(root);
      // Only override unbounded behavior if option is explicitly specified
      if (isUnbounded !== undefined) {
        ripple.unbounded = /** @type {boolean} */ (isUnbounded);
      }
      return ripple;
    }

    /**
     * @param {!RippleCapableSurface} instance
     * @return {!MDCRippleAdapter}
     */
    static createAdapter(instance) {
      const MATCHES = getMatchesProperty(HTMLElement.prototype);

      return {
        browserSupportsCssVars: () => supportsCssVariables(window),
        isUnbounded: () => instance.unbounded,
        isSurfaceActive: () => instance.root_[MATCHES](':active'),
        isSurfaceDisabled: () => instance.disabled,
        addClass: (className) => instance.root_.classList.add(className),
        removeClass: (className) => instance.root_.classList.remove(className),
        containsEventTarget: (target) => instance.root_.contains(target),
        registerInteractionHandler: (evtType, handler) =>
          instance.root_.addEventListener(evtType, handler, applyPassive()),
        deregisterInteractionHandler: (evtType, handler) =>
          instance.root_.removeEventListener(evtType, handler, applyPassive()),
        registerDocumentInteractionHandler: (evtType, handler) =>
          document.documentElement.addEventListener(evtType, handler, applyPassive()),
        deregisterDocumentInteractionHandler: (evtType, handler) =>
          document.documentElement.removeEventListener(evtType, handler, applyPassive()),
        registerResizeHandler: (handler) => window.addEventListener('resize', handler),
        deregisterResizeHandler: (handler) => window.removeEventListener('resize', handler),
        updateCssVariable: (varName, value) => instance.root_.style.setProperty(varName, value),
        computeBoundingRect: () => instance.root_.getBoundingClientRect(),
        getWindowPageOffset: () => ({x: window.pageXOffset, y: window.pageYOffset}),
      };
    }

    /** @return {boolean} */
    get unbounded() {
      return this.unbounded_;
    }

    /** @param {boolean} unbounded */
    set unbounded(unbounded) {
      this.unbounded_ = Boolean(unbounded);
      this.setUnbounded_();
    }

    /**
     * Closure Compiler throws an access control error when directly accessing a
     * protected or private property inside a getter/setter, like unbounded above.
     * By accessing the protected property inside a method, we solve that problem.
     * That's why this function exists.
     * @private
     */
    setUnbounded_() {
      this.foundation_.setUnbounded(this.unbounded_);
    }

    activate() {
      this.foundation_.activate();
    }

    deactivate() {
      this.foundation_.deactivate();
    }

    layout() {
      this.foundation_.layout();
    }

    /** @return {!MDCRippleFoundation} */
    getDefaultFoundation() {
      return new MDCRippleFoundation(MDCRipple.createAdapter(this));
    }

    initialSyncWithDOM() {
      this.unbounded = 'mdcRippleIsUnbounded' in this.root_.dataset;
    }
  }

  /**
   * See Material Design spec for more details on when to use ripples.
   * https://material.io/guidelines/motion/choreography.html#choreography-creation
   * @record
   */
  class RippleCapableSurface {}

  /** @protected {!Element} */
  RippleCapableSurface.prototype.root_;

  /**
   * Whether or not the ripple bleeds out of the bounds of the element.
   * @type {boolean|undefined}
   */
  RippleCapableSurface.prototype.unbounded;

  /**
   * Whether or not the ripple is attached to a disabled component.
   * @type {boolean|undefined}
   */
  RippleCapableSurface.prototype.disabled;

  /**
   * @license
   * Copyright 2016 Google Inc. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /** @enum {string} */
  const strings$2 = {
    ARIA_CONTROLS: 'aria-controls',
    INPUT_SELECTOR: '.mdc-text-field__input',
    LABEL_SELECTOR: '.mdc-floating-label',
    ICON_SELECTOR: '.mdc-text-field__icon',
    OUTLINE_SELECTOR: '.mdc-notched-outline',
    LINE_RIPPLE_SELECTOR: '.mdc-line-ripple',
  };

  /** @enum {string} */
  const cssClasses$3 = {
    ROOT: 'mdc-text-field',
    UPGRADED: 'mdc-text-field--upgraded',
    DISABLED: 'mdc-text-field--disabled',
    DENSE: 'mdc-text-field--dense',
    FOCUSED: 'mdc-text-field--focused',
    INVALID: 'mdc-text-field--invalid',
    BOX: 'mdc-text-field--box',
    OUTLINED: 'mdc-text-field--outlined',
  };

  /** @enum {number} */
  const numbers$1 = {
    LABEL_SCALE: 0.75,
    DENSE_LABEL_SCALE: 0.923,
  };

  // whitelist based off of https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5/Constraint_validation
  // under section: `Validation-related attributes`
  const VALIDATION_ATTR_WHITELIST = [
    'pattern', 'min', 'max', 'required', 'step', 'minlength', 'maxlength',
  ];

  /**
   * @license
   * Copyright 2017 Google Inc. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * @license
   * Copyright 2016 Google Inc. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /** @enum {string} */
  const strings$3 = {
    ICON_EVENT: 'MDCTextField:icon',
    ICON_ROLE: 'button',
  };

  /**
   * @license
   * Copyright 2017 Google Inc. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */


  /**
   * @extends {MDCFoundation<!MDCTextFieldIconAdapter>}
   * @final
   */
  class MDCTextFieldIconFoundation extends MDCFoundation {
    /** @return enum {string} */
    static get strings() {
      return strings$3;
    }

    /**
     * {@see MDCTextFieldIconAdapter} for typing information on parameters and return
     * types.
     * @return {!MDCTextFieldIconAdapter}
     */
    static get defaultAdapter() {
      return /** @type {!MDCTextFieldIconAdapter} */ ({
        getAttr: () => {},
        setAttr: () => {},
        removeAttr: () => {},
        setContent: () => {},
        registerInteractionHandler: () => {},
        deregisterInteractionHandler: () => {},
        notifyIconAction: () => {},
      });
    }

    /**
     * @param {!MDCTextFieldIconAdapter} adapter
     */
    constructor(adapter) {
      super(Object.assign(MDCTextFieldIconFoundation.defaultAdapter, adapter));

      /** @private {string?} */
      this.savedTabIndex_ = null;

      /** @private {function(!Event): undefined} */
      this.interactionHandler_ = (evt) => this.handleInteraction(evt);
    }

    init() {
      this.savedTabIndex_ = this.adapter_.getAttr('tabindex');

      ['click', 'keydown'].forEach((evtType) => {
        this.adapter_.registerInteractionHandler(evtType, this.interactionHandler_);
      });
    }

    destroy() {
      ['click', 'keydown'].forEach((evtType) => {
        this.adapter_.deregisterInteractionHandler(evtType, this.interactionHandler_);
      });
    }

    /** @param {boolean} disabled */
    setDisabled(disabled) {
      if (!this.savedTabIndex_) {
        return;
      }

      if (disabled) {
        this.adapter_.setAttr('tabindex', '-1');
        this.adapter_.removeAttr('role');
      } else {
        this.adapter_.setAttr('tabindex', this.savedTabIndex_);
        this.adapter_.setAttr('role', strings$3.ICON_ROLE);
      }
    }

    /** @param {string} label */
    setAriaLabel(label) {
      this.adapter_.setAttr('aria-label', label);
    }

    /** @param {string} content */
    setContent(content) {
      this.adapter_.setContent(content);
    }

    /**
     * Handles an interaction event
     * @param {!Event} evt
     */
    handleInteraction(evt) {
      if (evt.type === 'click' || evt.key === 'Enter' || evt.keyCode === 13) {
        this.adapter_.notifyIconAction();
      }
    }
  }

  /**
   * @license
   * Copyright 2017 Google Inc. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * @license
   * Copyright 2016 Google Inc. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */


  /**
   * @extends {MDCFoundation<!MDCTextFieldAdapter>}
   * @final
   */
  class MDCTextFieldFoundation extends MDCFoundation {
    /** @return enum {string} */
    static get cssClasses() {
      return cssClasses$3;
    }

    /** @return enum {string} */
    static get strings() {
      return strings$2;
    }

    /** @return enum {string} */
    static get numbers() {
      return numbers$1;
    }

    /** @return {boolean} */
    get shouldShake() {
      return !this.isValid() && !this.isFocused_;
    }

    /** @return {boolean} */
    get shouldFloat() {
      return this.isFocused_ || !!this.getValue() || this.isBadInput_();
    }

    /**
     * {@see MDCTextFieldAdapter} for typing information on parameters and return
     * types.
     * @return {!MDCTextFieldAdapter}
     */
    static get defaultAdapter() {
      return /** @type {!MDCTextFieldAdapter} */ ({
        addClass: () => {},
        removeClass: () => {},
        hasClass: () => {},
        registerTextFieldInteractionHandler: () => {},
        deregisterTextFieldInteractionHandler: () => {},
        registerInputInteractionHandler: () => {},
        deregisterInputInteractionHandler: () => {},
        registerValidationAttributeChangeHandler: () => {},
        deregisterValidationAttributeChangeHandler: () => {},
        getNativeInput: () => {},
        isFocused: () => {},
        isRtl: () => {},
        activateLineRipple: () => {},
        deactivateLineRipple: () => {},
        setLineRippleTransformOrigin: () => {},
        shakeLabel: () => {},
        floatLabel: () => {},
        hasLabel: () => {},
        getLabelWidth: () => {},
        hasOutline: () => {},
        notchOutline: () => {},
        closeOutline: () => {},
      });
    }

    /**
     * @param {!MDCTextFieldAdapter} adapter
     * @param {!FoundationMapType=} foundationMap Map from subcomponent names to their subfoundations.
     */
    constructor(adapter, foundationMap = /** @type {!FoundationMapType} */ ({})) {
      super(Object.assign(MDCTextFieldFoundation.defaultAdapter, adapter));

      /** @type {!MDCTextFieldHelperTextFoundation|undefined} */
      this.helperText_ = foundationMap.helperText;
      /** @type {!MDCTextFieldIconFoundation|undefined} */
      this.icon_ = foundationMap.icon;

      /** @private {boolean} */
      this.isFocused_ = false;
      /** @private {boolean} */
      this.receivedUserInput_ = false;
      /** @private {boolean} */
      this.useCustomValidityChecking_ = false;
      /** @private {boolean} */
      this.isValid_ = true;
      /** @private {function(): undefined} */
      this.inputFocusHandler_ = () => this.activateFocus();
      /** @private {function(): undefined} */
      this.inputBlurHandler_ = () => this.deactivateFocus();
      /** @private {function(): undefined} */
      this.inputInputHandler_ = () => this.autoCompleteFocus();
      /** @private {function(!Event): undefined} */
      this.setPointerXOffset_ = (evt) => this.setTransformOrigin(evt);
      /** @private {function(!Event): undefined} */
      this.textFieldInteractionHandler_ = () => this.handleTextFieldInteraction();
      /** @private {function(!Array): undefined} */
      this.validationAttributeChangeHandler_ = (attributesList) => this.handleValidationAttributeChange(attributesList);

      /** @private {!MutationObserver} */
      this.validationObserver_;
    }

    init() {
      this.adapter_.addClass(MDCTextFieldFoundation.cssClasses.UPGRADED);
      // Ensure label does not collide with any pre-filled value.
      if (this.adapter_.hasLabel() && (this.getValue() || this.isBadInput_())) {
        this.adapter_.floatLabel(this.shouldFloat);
        this.notchOutline(this.shouldFloat);
      }

      if (this.adapter_.isFocused()) {
        this.inputFocusHandler_();
      }

      this.adapter_.registerInputInteractionHandler('focus', this.inputFocusHandler_);
      this.adapter_.registerInputInteractionHandler('blur', this.inputBlurHandler_);
      this.adapter_.registerInputInteractionHandler('input', this.inputInputHandler_);
      ['mousedown', 'touchstart'].forEach((evtType) => {
        this.adapter_.registerInputInteractionHandler(evtType, this.setPointerXOffset_);
      });
      ['click', 'keydown'].forEach((evtType) => {
        this.adapter_.registerTextFieldInteractionHandler(evtType, this.textFieldInteractionHandler_);
      });
      this.validationObserver_ =
          this.adapter_.registerValidationAttributeChangeHandler(this.validationAttributeChangeHandler_);
    }

    destroy() {
      this.adapter_.removeClass(MDCTextFieldFoundation.cssClasses.UPGRADED);
      this.adapter_.deregisterInputInteractionHandler('focus', this.inputFocusHandler_);
      this.adapter_.deregisterInputInteractionHandler('blur', this.inputBlurHandler_);
      this.adapter_.deregisterInputInteractionHandler('input', this.inputInputHandler_);
      ['mousedown', 'touchstart'].forEach((evtType) => {
        this.adapter_.deregisterInputInteractionHandler(evtType, this.setPointerXOffset_);
      });
      ['click', 'keydown'].forEach((evtType) => {
        this.adapter_.deregisterTextFieldInteractionHandler(evtType, this.textFieldInteractionHandler_);
      });
      this.adapter_.deregisterValidationAttributeChangeHandler(this.validationObserver_);
    }

    /**
     * Handles user interactions with the Text Field.
     */
    handleTextFieldInteraction() {
      if (this.adapter_.getNativeInput().disabled) {
        return;
      }
      this.receivedUserInput_ = true;
    }

    /**
     * Handles validation attribute changes
     * @param {!Array<string>} attributesList
     */
    handleValidationAttributeChange(attributesList) {
      attributesList.some((attributeName) => {
        if (VALIDATION_ATTR_WHITELIST.indexOf(attributeName) > -1) {
          this.styleValidity_(true);
          return true;
        }
      });
    }

    /**
     * Opens/closes the notched outline.
     * @param {boolean} openNotch
     */
    notchOutline(openNotch) {
      if (!this.adapter_.hasOutline() || !this.adapter_.hasLabel()) {
        return;
      }

      if (openNotch) {
        const isDense = this.adapter_.hasClass(cssClasses$3.DENSE);
        const labelScale = isDense ? numbers$1.DENSE_LABEL_SCALE : numbers$1.LABEL_SCALE;
        const labelWidth = this.adapter_.getLabelWidth() * labelScale;
        const isRtl = this.adapter_.isRtl();
        this.adapter_.notchOutline(labelWidth, isRtl);
      } else {
        this.adapter_.closeOutline();
      }
    }

    /**
     * Activates the text field focus state.
     */
    activateFocus() {
      this.isFocused_ = true;
      this.styleFocused_(this.isFocused_);
      this.adapter_.activateLineRipple();
      this.notchOutline(this.shouldFloat);
      if (this.adapter_.hasLabel()) {
        this.adapter_.shakeLabel(this.shouldShake);
        this.adapter_.floatLabel(this.shouldFloat);
      }
      if (this.helperText_) {
        this.helperText_.showToScreenReader();
      }
    }

    /**
     * Sets the line ripple's transform origin, so that the line ripple activate
     * animation will animate out from the user's click location.
     * @param {!Event} evt
     */
    setTransformOrigin(evt) {
      const targetClientRect = evt.target.getBoundingClientRect();
      const evtCoords = {x: evt.clientX, y: evt.clientY};
      const normalizedX = evtCoords.x - targetClientRect.left;
      this.adapter_.setLineRippleTransformOrigin(normalizedX);
    }

    /**
     * Activates the Text Field's focus state in cases when the input value
     * changes without user input (e.g. programatically).
     */
    autoCompleteFocus() {
      if (!this.receivedUserInput_) {
        this.activateFocus();
      }
    }

    /**
     * Deactivates the Text Field's focus state.
     */
    deactivateFocus() {
      this.isFocused_ = false;
      this.adapter_.deactivateLineRipple();
      const input = this.getNativeInput_();
      const shouldRemoveLabelFloat = !input.value && !this.isBadInput_();
      const isValid = this.isValid();
      this.styleValidity_(isValid);
      this.styleFocused_(this.isFocused_);
      if (this.adapter_.hasLabel()) {
        this.adapter_.shakeLabel(this.shouldShake);
        this.adapter_.floatLabel(this.shouldFloat);
        this.notchOutline(this.shouldFloat);
      }
      if (shouldRemoveLabelFloat) {
        this.receivedUserInput_ = false;
      }
    }

    /**
     * @return {string} The value of the input Element.
     */
    getValue() {
      return this.getNativeInput_().value;
    }

    /**
     * @param {string} value The value to set on the input Element.
     */
    setValue(value) {
      this.getNativeInput_().value = value;
      const isValid = this.isValid();
      this.styleValidity_(isValid);
      if (this.adapter_.hasLabel()) {
        this.adapter_.shakeLabel(this.shouldShake);
        this.adapter_.floatLabel(this.shouldFloat);
        this.notchOutline(this.shouldFloat);
      }
    }

    /**
     * @return {boolean} If a custom validity is set, returns that value.
     *     Otherwise, returns the result of native validity checks.
     */
    isValid() {
      return this.useCustomValidityChecking_
        ? this.isValid_ : this.isNativeInputValid_();
    }

    /**
     * @param {boolean} isValid Sets the validity state of the Text Field.
     */
    setValid(isValid) {
      this.useCustomValidityChecking_ = true;
      this.isValid_ = isValid;
      // Retrieve from the getter to ensure correct logic is applied.
      isValid = this.isValid();
      this.styleValidity_(isValid);
      if (this.adapter_.hasLabel()) {
        this.adapter_.shakeLabel(this.shouldShake);
      }
    }

    /**
     * @return {boolean} True if the Text Field is disabled.
     */
    isDisabled() {
      return this.getNativeInput_().disabled;
    }

    /**
     * @param {boolean} disabled Sets the text-field disabled or enabled.
     */
    setDisabled(disabled) {
      this.getNativeInput_().disabled = disabled;
      this.styleDisabled_(disabled);
    }

    /**
     * @param {string} content Sets the content of the helper text.
     */
    setHelperTextContent(content) {
      if (this.helperText_) {
        this.helperText_.setContent(content);
      }
    }

    /**
     * Sets the aria label of the icon.
     * @param {string} label
     */
    setIconAriaLabel(label) {
      if (this.icon_) {
        this.icon_.setAriaLabel(label);
      }
    }

    /**
     * Sets the text content of the icon.
     * @param {string} content
     */
    setIconContent(content) {
      if (this.icon_) {
        this.icon_.setContent(content);
      }
    }

    /**
     * @return {boolean} True if the Text Field input fails in converting the
     *     user-supplied value.
     * @private
     */
    isBadInput_() {
      return this.getNativeInput_().validity.badInput;
    }

    /**
     * @return {boolean} The result of native validity checking
     *     (ValidityState.valid).
     */
    isNativeInputValid_() {
      return this.getNativeInput_().validity.valid;
    }

    /**
     * Styles the component based on the validity state.
     * @param {boolean} isValid
     * @private
     */
    styleValidity_(isValid) {
      const {INVALID} = MDCTextFieldFoundation.cssClasses;
      if (isValid) {
        this.adapter_.removeClass(INVALID);
      } else {
        this.adapter_.addClass(INVALID);
      }
      if (this.helperText_) {
        this.helperText_.setValidity(isValid);
      }
    }

    /**
     * Styles the component based on the focused state.
     * @param {boolean} isFocused
     * @private
     */
    styleFocused_(isFocused) {
      const {FOCUSED} = MDCTextFieldFoundation.cssClasses;
      if (isFocused) {
        this.adapter_.addClass(FOCUSED);
      } else {
        this.adapter_.removeClass(FOCUSED);
      }
    }

    /**
     * Styles the component based on the disabled state.
     * @param {boolean} isDisabled
     * @private
     */
    styleDisabled_(isDisabled) {
      const {DISABLED, INVALID} = MDCTextFieldFoundation.cssClasses;
      if (isDisabled) {
        this.adapter_.addClass(DISABLED);
        this.adapter_.removeClass(INVALID);
      } else {
        this.adapter_.removeClass(DISABLED);
      }
      if (this.icon_) {
        this.icon_.setDisabled(isDisabled);
      }
    }

    /**
     * @return {!Element|!NativeInputType} The native text input from the
     * host environment, or a dummy if none exists.
     * @private
     */
    getNativeInput_() {
      return this.adapter_.getNativeInput() ||
      /** @type {!NativeInputType} */ ({
        value: '',
        disabled: false,
        validity: {
          badInput: false,
          valid: true,
        },
      });
    }
  }

  /**
   * @license
   * Copyright 2017 Google Inc. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * @extends {MDCComponent<!MDCTextFieldIconFoundation>}
   * @final
   */
  class MDCTextFieldIcon extends MDCComponent {
    /**
     * @param {!Element} root
     * @return {!MDCTextFieldIcon}
     */
    static attachTo(root) {
      return new MDCTextFieldIcon(root);
    }

    /**
     * @return {!MDCTextFieldIconFoundation}
     */
    get foundation() {
      return this.foundation_;
    }

    /**
     * @return {!MDCTextFieldIconFoundation}
     */
    getDefaultFoundation() {
      return new MDCTextFieldIconFoundation(/** @type {!MDCTextFieldIconAdapter} */ (Object.assign({
        getAttr: (attr) => this.root_.getAttribute(attr),
        setAttr: (attr, value) => this.root_.setAttribute(attr, value),
        removeAttr: (attr) => this.root_.removeAttribute(attr),
        setContent: (content) => {
          this.root_.textContent = content;
        },
        registerInteractionHandler: (evtType, handler) => this.root_.addEventListener(evtType, handler),
        deregisterInteractionHandler: (evtType, handler) => this.root_.removeEventListener(evtType, handler),
        notifyIconAction: () => this.emit(
          MDCTextFieldIconFoundation.strings.ICON_EVENT, {} /* evtData */, true /* shouldBubble */),
      })));
    }
  }

  /**
   * @license
   * Copyright 2017 Google Inc. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * @license
   * Copyright 2016 Google Inc. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /** @enum {string} */
  const cssClasses$4 = {
    LABEL_FLOAT_ABOVE: 'mdc-floating-label--float-above',
    LABEL_SHAKE: 'mdc-floating-label--shake',
  };

  /**
   * @license
   * Copyright 2016 Google Inc. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * @extends {MDCFoundation<!MDCFloatingLabelAdapter>}
   * @final
   */
  class MDCFloatingLabelFoundation extends MDCFoundation {
    /** @return enum {string} */
    static get cssClasses() {
      return cssClasses$4;
    }

    /**
     * {@see MDCFloatingLabelAdapter} for typing information on parameters and return
     * types.
     * @return {!MDCFloatingLabelAdapter}
     */
    static get defaultAdapter() {
      return /** @type {!MDCFloatingLabelAdapter} */ ({
        addClass: () => {},
        removeClass: () => {},
        getWidth: () => {},
        registerInteractionHandler: () => {},
        deregisterInteractionHandler: () => {},
      });
    }

    /**
     * @param {!MDCFloatingLabelAdapter} adapter
     */
    constructor(adapter) {
      super(Object.assign(MDCFloatingLabelFoundation.defaultAdapter, adapter));

      /** @private {function(!Event): undefined} */
      this.shakeAnimationEndHandler_ = () => this.handleShakeAnimationEnd_();
    }

    init() {
      this.adapter_.registerInteractionHandler('animationend', this.shakeAnimationEndHandler_);
    }

    destroy() {
      this.adapter_.deregisterInteractionHandler('animationend', this.shakeAnimationEndHandler_);
    }

    /**
     * Returns the width of the label element.
     * @return {number}
     */
    getWidth() {
      return this.adapter_.getWidth();
    }

    /**
     * Styles the label to produce the label shake for errors.
     * @param {boolean} shouldShake adds shake class if true,
     * otherwise removes shake class.
     */
    shake(shouldShake) {
      const {LABEL_SHAKE} = MDCFloatingLabelFoundation.cssClasses;
      if (shouldShake) {
        this.adapter_.addClass(LABEL_SHAKE);
      } else {
        this.adapter_.removeClass(LABEL_SHAKE);
      }
    }

    /**
     * Styles the label to float or dock.
     * @param {boolean} shouldFloat adds float class if true, otherwise remove
     * float and shake class to dock label.
     */
    float(shouldFloat) {
      const {LABEL_FLOAT_ABOVE, LABEL_SHAKE} = MDCFloatingLabelFoundation.cssClasses;
      if (shouldFloat) {
        this.adapter_.addClass(LABEL_FLOAT_ABOVE);
      } else {
        this.adapter_.removeClass(LABEL_FLOAT_ABOVE);
        this.adapter_.removeClass(LABEL_SHAKE);
      }
    }

    /**
     * Handles an interaction event on the root element.
     */
    handleShakeAnimationEnd_() {
      const {LABEL_SHAKE} = MDCFloatingLabelFoundation.cssClasses;
      this.adapter_.removeClass(LABEL_SHAKE);
    }
  }

  /**
   * @license
   * Copyright 2016 Google Inc. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * @extends {MDCComponent<!MDCFloatingLabelFoundation>}
   * @final
   */
  class MDCFloatingLabel extends MDCComponent {
    /**
     * @param {!Element} root
     * @return {!MDCFloatingLabel}
     */
    static attachTo(root) {
      return new MDCFloatingLabel(root);
    }

    /**
     * Styles the label to produce the label shake for errors.
     * @param {boolean} shouldShake styles the label to shake by adding shake class
     * if true, otherwise will stop shaking by removing shake class.
     */
    shake(shouldShake) {
      this.foundation_.shake(shouldShake);
    }

    /**
     * Styles label to float/dock.
     * @param {boolean} shouldFloat styles the label to float by adding float class
     * if true, otherwise docks the label by removing the float class.
     */
    float(shouldFloat) {
      this.foundation_.float(shouldFloat);
    }

    /**
     * @return {number}
     */
    getWidth() {
      return this.foundation_.getWidth();
    }

    /**
     * @return {!MDCFloatingLabelFoundation}
     */
    getDefaultFoundation() {
      return new MDCFloatingLabelFoundation({
        addClass: (className) => this.root_.classList.add(className),
        removeClass: (className) => this.root_.classList.remove(className),
        getWidth: () => this.root_.offsetWidth,
        registerInteractionHandler: (evtType, handler) => this.root_.addEventListener(evtType, handler),
        deregisterInteractionHandler: (evtType, handler) => this.root_.removeEventListener(evtType, handler),
      });
    }
  }

  /**
   * @license
   * Copyright 2017 Google Inc. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * @license
   * Copyright 2018 Google Inc. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /** @enum {string} */
  const strings$4 = {
    PATH_SELECTOR: '.mdc-notched-outline__path',
    IDLE_OUTLINE_SELECTOR: '.mdc-notched-outline__idle',
  };

  /** @enum {string} */
  const cssClasses$5 = {
    OUTLINE_NOTCHED: 'mdc-notched-outline--notched',
  };

  /**
   * @license
   * Copyright 2017 Google Inc. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * @extends {MDCFoundation<!MDCNotchedOutlineAdapter>}
   * @final
   */
  class MDCNotchedOutlineFoundation extends MDCFoundation {
    /** @return enum {string} */
    static get strings() {
      return strings$4;
    }

    /** @return enum {string} */
    static get cssClasses() {
      return cssClasses$5;
    }

    /**
     * {@see MDCNotchedOutlineAdapter} for typing information on parameters and return
     * types.
     * @return {!MDCNotchedOutlineAdapter}
     */
    static get defaultAdapter() {
      return /** @type {!MDCNotchedOutlineAdapter} */ ({
        getWidth: () => {},
        getHeight: () => {},
        addClass: () => {},
        removeClass: () => {},
        setOutlinePathAttr: () => {},
        getIdleOutlineStyleValue: () => {},
      });
    }

    /**
     * @param {!MDCNotchedOutlineAdapter} adapter
     */
    constructor(adapter) {
      super(Object.assign(MDCNotchedOutlineFoundation.defaultAdapter, adapter));
    }

    /**
     * Adds the outline notched selector and updates the notch width
     * calculated based off of notchWidth and isRtl.
     * @param {number} notchWidth
     * @param {boolean=} isRtl
     */
    notch(notchWidth, isRtl = false) {
      const {OUTLINE_NOTCHED} = MDCNotchedOutlineFoundation.cssClasses;
      this.adapter_.addClass(OUTLINE_NOTCHED);
      this.updateSvgPath_(notchWidth, isRtl);
    }

    /**
     * Removes notched outline selector to close the notch in the outline.
     */
    closeNotch() {
      const {OUTLINE_NOTCHED} = MDCNotchedOutlineFoundation.cssClasses;
      this.adapter_.removeClass(OUTLINE_NOTCHED);
    }

    /**
     * Updates the SVG path of the focus outline element based on the notchWidth
     * and the RTL context.
     * @param {number} notchWidth
     * @param {boolean=} isRtl
     * @private
     */
    updateSvgPath_(notchWidth, isRtl) {
      // Fall back to reading a specific corner's style because Firefox doesn't report the style on border-radius.
      const radiusStyleValue = this.adapter_.getIdleOutlineStyleValue('border-radius') ||
          this.adapter_.getIdleOutlineStyleValue('border-top-left-radius');
      const radius = parseFloat(radiusStyleValue);
      const width = this.adapter_.getWidth();
      const height = this.adapter_.getHeight();
      const cornerWidth = radius + 1.2;
      const leadingStrokeLength = Math.abs(11 - cornerWidth);
      const paddedNotchWidth = notchWidth + 8;

      // The right, bottom, and left sides of the outline follow the same SVG path.
      const pathMiddle = 'a' + radius + ',' + radius + ' 0 0 1 ' + radius + ',' + radius
        + 'v' + (height - (2 * cornerWidth))
        + 'a' + radius + ',' + radius + ' 0 0 1 ' + -radius + ',' + radius
        + 'h' + (-width + (2 * cornerWidth))
        + 'a' + radius + ',' + radius + ' 0 0 1 ' + -radius + ',' + -radius
        + 'v' + (-height + (2 * cornerWidth))
        + 'a' + radius + ',' + radius + ' 0 0 1 ' + radius + ',' + -radius;

      let path;
      if (!isRtl) {
        path = 'M' + (cornerWidth + leadingStrokeLength + paddedNotchWidth) + ',' + 1
          + 'h' + (width - (2 * cornerWidth) - paddedNotchWidth - leadingStrokeLength)
          + pathMiddle
          + 'h' + leadingStrokeLength;
      } else {
        path = 'M' + (width - cornerWidth - leadingStrokeLength) + ',' + 1
          + 'h' + leadingStrokeLength
          + pathMiddle
          + 'h' + (width - (2 * cornerWidth) - paddedNotchWidth - leadingStrokeLength);
      }

      this.adapter_.setOutlinePathAttr(path);
    }
  }

  /**
   * @license
   * Copyright 2017 Google Inc. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * @extends {MDCComponent<!MDCNotchedOutlineFoundation>}
   * @final
   */
  class MDCNotchedOutline extends MDCComponent {
    /**
     * @param {!Element} root
     * @return {!MDCNotchedOutline}
     */
    static attachTo(root) {
      return new MDCNotchedOutline(root);
    }

    /**
      * Updates outline selectors and SVG path to open notch.
      * @param {number} notchWidth The notch width in the outline.
      * @param {boolean=} isRtl Determines if outline is rtl. If rtl is true, notch
      * will be right justified in outline path, otherwise left justified.
      */
    notch(notchWidth, isRtl) {
      this.foundation_.notch(notchWidth, isRtl);
    }

    /**
     * Updates the outline selectors to close notch and return it to idle state.
     */
    closeNotch() {
      this.foundation_.closeNotch();
    }

    /**
     * @return {!MDCNotchedOutlineFoundation}
     */
    getDefaultFoundation() {
      return new MDCNotchedOutlineFoundation({
        getWidth: () => this.root_.offsetWidth,
        getHeight: () => this.root_.offsetHeight,
        addClass: (className) => this.root_.classList.add(className),
        removeClass: (className) => this.root_.classList.remove(className),
        setOutlinePathAttr: (value) => {
          const path = this.root_.querySelector(strings$4.PATH_SELECTOR);
          path.setAttribute('d', value);
        },
        getIdleOutlineStyleValue: (propertyName) => {
          const idleOutlineElement = this.root_.parentNode.querySelector(strings$4.IDLE_OUTLINE_SELECTOR);
          return window.getComputedStyle(idleOutlineElement).getPropertyValue(propertyName);
        },
      });
    }
  }

  /**
   * @license
   * Copyright 2016 Google Inc. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  /* eslint-enable no-unused-vars */

  /**
   * @extends {MDCComponent<!MDCTextFieldFoundation>}
   * @final
   */
  class MDCTextField extends MDCComponent {
    /**
     * @param {...?} args
     */
    constructor(...args) {
      super(...args);
      /** @private {?Element} */
      this.input_;
      /** @type {?MDCRipple} */
      this.ripple;
      /** @private {?MDCLineRipple} */
      this.lineRipple_;
      /** @private {?MDCTextFieldHelperText} */
      this.helperText_;
      /** @private {?MDCTextFieldIcon} */
      this.icon_;
      /** @private {?MDCFloatingLabel} */
      this.label_;
      /** @private {?MDCNotchedOutline} */
      this.outline_;
    }

    /**
     * @param {!Element} root
     * @return {!MDCTextField}
     */
    static attachTo(root) {
      return new MDCTextField(root);
    }

    /**
     * @param {(function(!Element): !MDCRipple)=} rippleFactory A function which
     * creates a new MDCRipple.
     * @param {(function(!Element): !MDCLineRipple)=} lineRippleFactory A function which
     * creates a new MDCLineRipple.
     * @param {(function(!Element): !MDCTextFieldHelperText)=} helperTextFactory A function which
     * creates a new MDCTextFieldHelperText.
     * @param {(function(!Element): !MDCTextFieldIcon)=} iconFactory A function which
     * creates a new MDCTextFieldIcon.
     * @param {(function(!Element): !MDCFloatingLabel)=} labelFactory A function which
     * creates a new MDCFloatingLabel.
     * @param {(function(!Element): !MDCNotchedOutline)=} outlineFactory A function which
     * creates a new MDCNotchedOutline.
     */
    initialize(
      rippleFactory = (el, foundation) => new MDCRipple(el, foundation),
      lineRippleFactory = (el) => new MDCLineRipple(el),
      helperTextFactory = (el) => new MDCTextFieldHelperText(el),
      iconFactory = (el) => new MDCTextFieldIcon(el),
      labelFactory = (el) => new MDCFloatingLabel(el),
      outlineFactory = (el) => new MDCNotchedOutline(el)) {
      this.input_ = this.root_.querySelector(strings$2.INPUT_SELECTOR);
      const labelElement = this.root_.querySelector(strings$2.LABEL_SELECTOR);
      if (labelElement) {
        this.label_ = labelFactory(labelElement);
      }
      const lineRippleElement = this.root_.querySelector(strings$2.LINE_RIPPLE_SELECTOR);
      if (lineRippleElement) {
        this.lineRipple_ = lineRippleFactory(lineRippleElement);
      }
      const outlineElement = this.root_.querySelector(strings$2.OUTLINE_SELECTOR);
      if (outlineElement) {
        this.outline_ = outlineFactory(outlineElement);
      }
      if (this.input_.hasAttribute(strings$2.ARIA_CONTROLS)) {
        const helperTextElement = document.getElementById(this.input_.getAttribute(strings$2.ARIA_CONTROLS));
        if (helperTextElement) {
          this.helperText_ = helperTextFactory(helperTextElement);
        }
      }
      const iconElement = this.root_.querySelector(strings$2.ICON_SELECTOR);
      if (iconElement) {
        this.icon_ = iconFactory(iconElement);
      }

      this.ripple = null;
      if (this.root_.classList.contains(cssClasses$3.BOX)) {
        const MATCHES = getMatchesProperty(HTMLElement.prototype);
        const adapter =
          Object.assign(MDCRipple.createAdapter(/** @type {!RippleCapableSurface} */ (this)), {
            isSurfaceActive: () => this.input_[MATCHES](':active'),
            registerInteractionHandler: (type, handler) => this.input_.addEventListener(type, handler),
            deregisterInteractionHandler: (type, handler) => this.input_.removeEventListener(type, handler),
          });
        const foundation = new MDCRippleFoundation(adapter);
        this.ripple = rippleFactory(this.root_, foundation);
      }
    }

    destroy() {
      if (this.ripple) {
        this.ripple.destroy();
      }
      if (this.lineRipple_) {
        this.lineRipple_.destroy();
      }
      if (this.helperText_) {
        this.helperText_.destroy();
      }
      if (this.icon_) {
        this.icon_.destroy();
      }
      if (this.label_) {
        this.label_.destroy();
      }
      if (this.outline_) {
        this.outline_.destroy();
      }
      super.destroy();
    }

    /**
     * Initiliazes the Text Field's internal state based on the environment's
     * state.
     */
    initialSyncWithDom() {
      this.disabled = this.input_.disabled;
    }

    /**
     * @return {string} The value of the input.
     */
    get value() {
      return this.foundation_.getValue();
    }

    /**
     * @param {string} value The value to set on the input.
     */
    set value(value) {
      this.foundation_.setValue(value);
    }

    /**
     * @return {boolean} True if the Text Field is disabled.
     */
    get disabled() {
      return this.foundation_.isDisabled();
    }

    /**
     * @param {boolean} disabled Sets the Text Field disabled or enabled.
     */
    set disabled(disabled) {
      this.foundation_.setDisabled(disabled);
    }

    /**
     * @return {boolean} valid True if the Text Field is valid.
     */
    get valid() {
      return this.foundation_.isValid();
    }

    /**
     * @param {boolean} valid Sets the Text Field valid or invalid.
     */
    set valid(valid) {
      this.foundation_.setValid(valid);
    }

    /**
     * @return {boolean} True if the Text Field is required.
     */
    get required() {
      return this.input_.required;
    }

    /**
     * @param {boolean} required Sets the Text Field to required.
     */
    set required(required) {
      this.input_.required = required;
    }

    /**
     * @return {string} The input element's validation pattern.
     */
    get pattern() {
      return this.input_.pattern;
    }

    /**
     * @param {string} pattern Sets the input element's validation pattern.
     */
    set pattern(pattern) {
      this.input_.pattern = pattern;
    }

    /**
     * @return {number} The input element's minLength.
     */
    get minLength() {
      return this.input_.minLength;
    }

    /**
     * @param {number} minLength Sets the input element's minLength.
     */
    set minLength(minLength) {
      this.input_.minLength = minLength;
    }

    /**
     * @return {number} The input element's maxLength.
     */
    get maxLength() {
      return this.input_.maxLength;
    }

    /**
     * @param {number} maxLength Sets the input element's maxLength.
     */
    set maxLength(maxLength) {
      // Chrome throws exception if maxLength is set < 0
      if (maxLength < 0) {
        this.input_.removeAttribute('maxLength');
      } else {
        this.input_.maxLength = maxLength;
      }
    }

    /**
     * @return {string} The input element's min.
     */
    get min() {
      return this.input_.min;
    }

    /**
     * @param {string} min Sets the input element's min.
     */
    set min(min) {
      this.input_.min = min;
    }

    /**
     * @return {string} The input element's max.
     */
    get max() {
      return this.input_.max;
    }

    /**
     * @param {string} max Sets the input element's max.
     */
    set max(max) {
      this.input_.max = max;
    }

    /**
     * @return {string} The input element's step.
     */
    get step() {
      return this.input_.step;
    }

    /**
     * @param {string} step Sets the input element's step.
     */
    set step(step) {
      this.input_.step = step;
    }

    /**
     * Sets the helper text element content.
     * @param {string} content
     */
    set helperTextContent(content) {
      this.foundation_.setHelperTextContent(content);
    }

    /**
     * Sets the aria label of the icon.
     * @param {string} label
     */
    set iconAriaLabel(label) {
      this.foundation_.setIconAriaLabel(label);
    }

    /**
     * Sets the text content of the icon.
     * @param {string} content
     */
    set iconContent(content) {
      this.foundation_.setIconContent(content);
    }

    /**
     * Recomputes the outline SVG path for the outline element.
     */
    layout() {
      const openNotch = this.foundation_.shouldFloat;
      this.foundation_.notchOutline(openNotch);
    }

    /**
     * @return {!MDCTextFieldFoundation}
     */
    getDefaultFoundation() {
      return new MDCTextFieldFoundation(
        /** @type {!MDCTextFieldAdapter} */ (Object.assign({
          addClass: (className) => this.root_.classList.add(className),
          removeClass: (className) => this.root_.classList.remove(className),
          hasClass: (className) => this.root_.classList.contains(className),
          registerTextFieldInteractionHandler: (evtType, handler) => this.root_.addEventListener(evtType, handler),
          deregisterTextFieldInteractionHandler: (evtType, handler) => this.root_.removeEventListener(evtType, handler),
          registerValidationAttributeChangeHandler: (handler) => {
            const getAttributesList = (mutationsList) => mutationsList.map((mutation) => mutation.attributeName);
            const observer = new MutationObserver((mutationsList) => handler(getAttributesList(mutationsList)));
            const targetNode = this.root_.querySelector(strings$2.INPUT_SELECTOR);
            const config = {attributes: true};
            observer.observe(targetNode, config);
            return observer;
          },
          deregisterValidationAttributeChangeHandler: (observer) => observer.disconnect(),
          isFocused: () => {
            return document.activeElement === this.root_.querySelector(strings$2.INPUT_SELECTOR);
          },
          isRtl: () => window.getComputedStyle(this.root_).getPropertyValue('direction') === 'rtl',
        },
        this.getInputAdapterMethods_(),
        this.getLabelAdapterMethods_(),
        this.getLineRippleAdapterMethods_(),
        this.getOutlineAdapterMethods_())),
        this.getFoundationMap_());
    }

    /**
     * @return {!{
     *   shakeLabel: function(boolean): undefined,
     *   floatLabel: function(boolean): undefined,
     *   hasLabel: function(): boolean,
     *   getLabelWidth: function(): number,
     * }}
     */
    getLabelAdapterMethods_() {
      return {
        shakeLabel: (shouldShake) => this.label_.shake(shouldShake),
        floatLabel: (shouldFloat) => this.label_.float(shouldFloat),
        hasLabel: () => !!this.label_,
        getLabelWidth: () => this.label_.getWidth(),
      };
    }

    /**
     * @return {!{
     *   activateLineRipple: function(): undefined,
     *   deactivateLineRipple: function(): undefined,
     *   setLineRippleTransformOrigin: function(number): undefined,
     * }}
     */
    getLineRippleAdapterMethods_() {
      return {
        activateLineRipple: () => {
          if (this.lineRipple_) {
            this.lineRipple_.activate();
          }
        },
        deactivateLineRipple: () => {
          if (this.lineRipple_) {
            this.lineRipple_.deactivate();
          }
        },
        setLineRippleTransformOrigin: (normalizedX) => {
          if (this.lineRipple_) {
            this.lineRipple_.setRippleCenter(normalizedX);
          }
        },
      };
    }

    /**
     * @return {!{
     *   notchOutline: function(number, boolean): undefined,
     *   hasOutline: function(): boolean,
     * }}
     */
    getOutlineAdapterMethods_() {
      return {
        notchOutline: (labelWidth, isRtl) => this.outline_.notch(labelWidth, isRtl),
        closeOutline: () => this.outline_.closeNotch(),
        hasOutline: () => !!this.outline_,
      };
    }

    /**
     * @return {!{
     *   registerInputInteractionHandler: function(string, function()): undefined,
     *   deregisterInputInteractionHandler: function(string, function()): undefined,
     *   getNativeInput: function(): ?Element,
     * }}
     */
    getInputAdapterMethods_() {
      return {
        registerInputInteractionHandler: (evtType, handler) => this.input_.addEventListener(evtType, handler),
        deregisterInputInteractionHandler: (evtType, handler) => this.input_.removeEventListener(evtType, handler),
        getNativeInput: () => this.input_,
      };
    }

    /**
     * Returns a map of all subcomponents to subfoundations.
     * @return {!FoundationMapType}
     */
    getFoundationMap_() {
      return {
        helperText: this.helperText_ ? this.helperText_.foundation : undefined,
        icon: this.icon_ ? this.icon_.foundation : undefined,
      };
    }
  }

  

  const createApp = inputName => {
    const validations = [{
      validate: v => v >= 0 && v <= 255,
      error: 'Must be between 0 to 255'
    }, {
      validate: v => v % 1 === 0,
      error: 'Must be a whole number'
    }];
    const input = {
      $type: 'input',
      id: `menu-rule-${inputName}__input`,
      class: 'mdc-text-field__input',
      required: true,
      value: 110,
      type: 'number',
      min: 0,
      max: 255,
      _setValidationState: function (e) {
        const value = e.target.value;
        const errors = validations.reduce((acc, v) => {
          const isValid = v.validate(value);

          if (isValid === false) {
            acc.push(v.error);
          }

          return acc;
        }, []);

        if (errors.length > 0) {
          const msg = errors[0];
          e.target.setCustomValidity(msg);

          this._setHelperText(msg);
        } else {
          this._removeHelperText();
        }
      },
      $init: function () {
        this.addEventListener('input', this._setValidationState);
      }
    };
    const label = {
      $type: 'label',
      class: 'mdc-floating-label',
      for: 'my-text-field',
      $text: inputName
    };
    const ripple = {
      $type: 'div',
      id: `menu-rule-${inputName}__line_ripple`,
      class: 'mdc-line-ripple'
    };
    const helper = {
      $type: 'p',
      id: `menu-rule-${inputName}__helper-text`,
      class: 'mdc-text-field-helper-text',
      'aria-hidden': 'true'
    };
    const container = {
      $type: 'div',
      id: `menu-rule-${inputName}__container`,
      class: "mdc-text-field",
      $components: [input, label, ripple]
    };
    const app = {
      $cell: true,
      $type: 'div',
      id: `menu-rule-${inputName}`,
      class: 'menu-input-selection',
      $components: [container, helper],
      _helperTextAdapter: undefined,
      _helperTextFoundation: undefined,
      _setHelperText: function (text) {
        this._helperTextAdapter.setContent(text);

        this._helperTextFoundation.setPersistent(true);

        this._helperTextFoundation.setValidity(false);
      },
      _removeHelperText: function () {
        this._helperTextAdapter.setContent('');

        this._helperTextFoundation.setValidity(true);

        this._helperTextFoundation.setPersistent(false);
      },
      $init: function () {
        const helperText = new MDCTextFieldHelperText(document.querySelector(`#menu-rule-${inputName}__helper-text`));
        this._helperTextAdapter = helperText.foundation_.adapter_;
        this._helperTextFoundation = helperText.foundation_;
        const lineRipple = new MDCLineRipple(document.querySelector(`#menu-rule-${inputName}__line_ripple`));
        const textField = new MDCTextField(document.querySelector(`#menu-rule-${inputName}__container`));
      }
    };
    return app;
  };

  

  const selectorStyle = css`
  width: 100%;
  height: 30px;
  border: 1px solid rgba(0, 0, 0, 0.42);
  margin-right: 10px;
  border-radius: 1px;
`;
  const selectorContainerStyle = css`
  display: flex;
  width: 200px;
`;

  const selector = name => ({
    $type: 'div',
    id: `menu-dimension-selection__selector-${name}`,
    class: selectorStyle
  });

  const selectorContainer = {
    $type: 'div',
    id: 'menu-dimension-selection__container',
    class: selectorContainerStyle,
    $components: [selector('1D'), selector('2D')]
  };
  const label = {
    $type: 'label',
    class: 'mdc-floating-label mdc-floating-label--float-above',
    style: 'margin-bottom: 10px; color: rgba(0, 0, 0, 0.6);',
    for: 'menu-dimension-selection__container',
    $text: 'Dimension'
  };
  const ripple = {
    $type: 'div',
    class: 'mdc-line-ripple'
  };
  const container = {
    $type: 'div',
    id: "menu-dimension-selection__container",
    style: 'position: relative;',
    $components: [selectorContainer, label, ripple]
  };
  const app = {
    $cell: true,
    $type: 'div',
    id: 'menu-dimension-selection',
    $components: [container]
  };

  const neighborhoodRule = (ruleNumber, neighborhood) => {
    /* example:
      If rule = 110 and neighborhood = 7 (seven being the largest index - since there are 8 total),
      we want to mask the 6 earlier neighborhoods and
      see if the remaining neighborhood rule in 110 is >1 or = 0 (indicating rule)
    */
    const mask = 2 ** neighborhood;
    return (ruleNumber & mask) === 0 ? 0 : 1; // represent the two rule states for a neighborhood
  };

  const ruleObject = ruleNumber => {
    /* returns an object
      the keys are the neighborhood index
      the value is a state (1 or 0)
    */
    const neighborhodVarieties = [...Array(8).keys()]; // [0,1,2,3,4,5,6,7] the eight possible neighborhoods

    return neighborhodVarieties.reduce((acc, state) => {
      acc[state] = neighborhoodRule(ruleNumber, state);
      return acc;
    }, {});
  };

  const NEIGHBORS = [{
    name: 'leftNeighboor',
    value: (index, arr) => arr[index - 1],
    bitShift: value => value << 2
  }, {
    name: 'cell',
    value: (index, arr) => arr[index],
    bitShift: value => value << 1
  }, {
    name: 'rightNeighboor',
    value: (index, arr) => arr[index + 1],
    bitShift: value => value
  }];

  const nextGeneration = (currentGeneration, ruleObject) => currentGeneration.map((val, index, arr) => {
    const neighborhoodState = NEIGHBORS.reduce((acc, {
      value,
      bitShift
    }) => {
      const v = value(index, arr);
      return acc | bitShift(v);
    }, 0);
    return ruleObject[neighborhoodState];
  });
  // const r = ruleObject(110)
  //
  // nextGeneration(testGeneration, r)

  const className = css`
  background-color: lightcyan;
  position: absolute;
  z-index: -1;
  left: 0px;
  top: 0px;
  height: 100%;
  width: 100%;
  border-radius: 3px;
  // box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
  box-shadow: #000000b8 3px 4px 18px 1px;
  // overflow-y: auto;
`;
  const generationClassName = css`
  display: flex;
  width: 100%;
`;

  const firstGeneration = cellCount => [...new Array(cellCount)].map(() => Math.round(Math.random()));

  function Cell(state) {
    return {
      $type: 'div',
      style: `
      background-color: ${state === 0 ? "transparent" : "black"};
      height: ${this._cellDimension}px;
      width: ${this._cellDimension}px;
      // border-radius: ${this._cellDimension / 2}px;
    `
    };
  }

  function Generation(generation) {
    return {
      $type: 'div',
      class: generationClassName,
      $components: generation.map(this._cellComponent)
    };
  }

  const app$1 = {
    $cell: true,
    class: className,
    _ruleObject: ruleObject(110),
    _cellCount: 100,
    _gen: undefined,
    _cellDimension: 10,
    _sizeHandler: function (e) {
      const {
        height,
        width
      } = this.getBoundingClientRect();
      this._cellDimension = width / this._cellCount;
    },
    _cellComponent: Cell,
    _generationCompnent: Generation,
    onclick: function () {
      const lastGen = this._gen.slice(-1)[0];

      const nextGen = nextGeneration(lastGen, this._ruleObject);

      this._gen.push(nextGen);
    },
    $components: undefined,
    $update: function () {
      this.$components = this._gen.map(this._generationCompnent);
    },
    $init: function () {
      this._sizeHandler(); // this.sizeObserver = window.addEventListener("resize", this._sizeHandler)


      this._gen = [firstGeneration(this._cellCount)];
      const arr = new Array(40).fill(null);
      arr.forEach(this.onclick);
    }
  };

  

  const tabHTML = `
  {{tabName}}
  <span class="mdc-tab__indicator"></span>
`;

  const tab = function (tabName) {
    return {
      $type: 'a',
      id: `${tabName}-scene-tab`,
      class: 'mdc-tab scene-tab',
      $text: tabName,
      _tabName: tabName,
      onclick: function () {
        this._setActiveTab(this._tabName);
      },
      $html: Handlebars.compile(tabHTML)({
        tabName
      }),
      $init: function () {
        this._updateActiveState();
      },
      _updateActiveState: function () {
        if (this._activeTab === this._tabName) {
          const classes = this.classList.add('mdc-tab--active');
        } else {
          this.classList.remove('mdc-tab--active');
        }
      }
    };
  };

  const app$2 = {
    $cell: true,
    $type: 'nav',
    class: 'mdc-tab-bar',
    _activeTab: 'View',
    _setActiveTab: function (tabName) {
      this._activeTab = tabName;
    },
    id: "sceneTabs",
    _updateComponents: function () {
      this.$components.forEach(c => c._updateActiveState());
    },
    $update: function () {
      this._updateComponents();
    },
    $components: [tab('View'), tab('Explore')]
  };

  

  const icon = iconName => ({
    $type: 'span',
    class: 'mdc-fab__icon material-icons',
    $text: iconName
  });

  const app$3 = {
    $cell: true,
    $type: 'button',
    class: 'mdc-fab',
    id: 'play-button',
    _active: false,
    _iconName: 'play_arrow',
    onclick: function () {
      this._active = !this._active;
    },
    _updateIcon: function () {
      if (this._active) {
        this._iconName = 'pause';
      } else {
        this._iconName = 'play_arrow';
      }

      this.$components = [icon(this._iconName)];
    },
    $update: function () {
      this._updateIcon();
    },
    $components: [icon('play_arrow')],
    $init: function () {
      const fabRipple = new MDCRipple(document.querySelector('.mdc-fab'));

      this._updateIcon();
    }
  };

  

  const app$4 = {
    $cell: true,
    $type: 'button',
    class: 'mdc-icon-button material-icons',
    id: 'share-button',
    $text: 'share',
    onclick: function () {
      console.log('sharing');
    },
    $init: function () {
      const iconButtonRipple = new MDCRipple(document.querySelector('.mdc-icon-button'));
      iconButtonRipple.unbounded = true;
    }
  };

  

  const app$5 = {
    $cell: true,
    $type: 'button',
    class: 'mdc-icon-button material-icons',
    id: 'fullscreen-button',
    $text: 'fullscreen',
    onclick: function () {
      console.log('fullscreen');
    },
    $init: function () {
      const iconButtonRipple = new MDCRipple(document.querySelector('.mdc-icon-button'));
      iconButtonRipple.unbounded = true;
    }
  };

  /**
   * Copyright 2016 Google Inc. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  const TAB_DATA = 'data-mdc-tabindex';
  const TAB_DATA_HANDLED = 'data-mdc-tabindex-handled';

  let storedTransformPropertyName_;
  let supportsPassive_$1;

  // Remap touch events to pointer events, if the browser doesn't support touch events.
  function remapEvent(eventName, globalObj = window) {
    if (!('ontouchstart' in globalObj.document)) {
      switch (eventName) {
      case 'touchstart':
        return 'pointerdown';
      case 'touchmove':
        return 'pointermove';
      case 'touchend':
        return 'pointerup';
      default:
        return eventName;
      }
    }

    return eventName;
  }

  // Choose the correct transform property to use on the current browser.
  function getTransformPropertyName(globalObj = window, forceRefresh = false) {
    if (storedTransformPropertyName_ === undefined || forceRefresh) {
      const el = globalObj.document.createElement('div');
      const transformPropertyName = ('transform' in el.style ? 'transform' : '-webkit-transform');
      storedTransformPropertyName_ = transformPropertyName;
    }

    return storedTransformPropertyName_;
  }

  // Determine whether the current browser supports CSS properties.
  function supportsCssCustomProperties(globalObj = window) {
    if ('CSS' in globalObj) {
      return globalObj.CSS.supports('(--color: red)');
    }
    return false;
  }

  // Determine whether the current browser supports passive event listeners, and if so, use them.
  function applyPassive$1(globalObj = window, forceRefresh = false) {
    if (supportsPassive_$1 === undefined || forceRefresh) {
      let isSupported = false;
      try {
        globalObj.document.addEventListener('test', null, {get passive() {
          isSupported = true;
        }});
      } catch (e) { }

      supportsPassive_$1 = isSupported;
    }

    return supportsPassive_$1 ? {passive: true} : false;
  }

  // Save the tab state for an element.
  function saveElementTabState(el) {
    if (el.hasAttribute('tabindex')) {
      el.setAttribute(TAB_DATA, el.getAttribute('tabindex'));
    }
    el.setAttribute(TAB_DATA_HANDLED, true);
  }

  // Restore the tab state for an element, if it was saved.
  function restoreElementTabState(el) {
    // Only modify elements we've already handled, in case anything was dynamically added since we saved state.
    if (el.hasAttribute(TAB_DATA_HANDLED)) {
      if (el.hasAttribute(TAB_DATA)) {
        el.setAttribute('tabindex', el.getAttribute(TAB_DATA));
        el.removeAttribute(TAB_DATA);
      } else {
        el.removeAttribute('tabindex');
      }
      el.removeAttribute(TAB_DATA_HANDLED);
    }
  }

  /**
   * @license
   * Copyright 2016 Google Inc.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * Copyright 2016 Google Inc. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  const FOCUSABLE_ELEMENTS =
    'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), ' +
    'button:not([disabled]), iframe, object, embed, [tabindex], [contenteditable]';

  /**
   * Copyright 2016 Google Inc. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  class MDCSlidableDrawerFoundation extends MDCFoundation {
    static get defaultAdapter() {
      return {
        addClass: (/* className: string */) => {},
        removeClass: (/* className: string */) => {},
        hasClass: (/* className: string */) => {},
        hasNecessaryDom: () => /* boolean */ false,
        registerInteractionHandler: (/* evt: string, handler: EventListener */) => {},
        deregisterInteractionHandler: (/* evt: string, handler: EventListener */) => {},
        registerDrawerInteractionHandler: (/* evt: string, handler: EventListener */) => {},
        deregisterDrawerInteractionHandler: (/* evt: string, handler: EventListener */) => {},
        registerTransitionEndHandler: (/* handler: EventListener */) => {},
        deregisterTransitionEndHandler: (/* handler: EventListener */) => {},
        registerDocumentKeydownHandler: (/* handler: EventListener */) => {},
        deregisterDocumentKeydownHandler: (/* handler: EventListener */) => {},
        setTranslateX: (/* value: number | null */) => {},
        getFocusableElements: () => /* NodeList */ {},
        saveElementTabState: (/* el: Element */) => {},
        restoreElementTabState: (/* el: Element */) => {},
        makeElementUntabbable: (/* el: Element */) => {},
        notifyOpen: () => {},
        notifyClose: () => {},
        isRtl: () => /* boolean */ false,
        getDrawerWidth: () => /* number */ 0,
      };
    }

    constructor(adapter, rootCssClass, animatingCssClass, openCssClass) {
      super(Object.assign(MDCSlidableDrawerFoundation.defaultAdapter, adapter));

      this.rootCssClass_ = rootCssClass;
      this.animatingCssClass_ = animatingCssClass;
      this.openCssClass_ = openCssClass;

      this.transitionEndHandler_ = (evt) => this.handleTransitionEnd_(evt);

      this.inert_ = false;

      this.componentTouchStartHandler_ = (evt) => this.handleTouchStart_(evt);
      this.componentTouchMoveHandler_ = (evt) => this.handleTouchMove_(evt);
      this.componentTouchEndHandler_ = (evt) => this.handleTouchEnd_(evt);
      this.documentKeydownHandler_ = (evt) => {
        if (evt.key && evt.key === 'Escape' || evt.keyCode === 27) {
          this.close();
        }
      };
    }

    init() {
      const ROOT = this.rootCssClass_;
      const OPEN = this.openCssClass_;

      if (!this.adapter_.hasClass(ROOT)) {
        throw new Error(`${ROOT} class required in root element.`);
      }

      if (!this.adapter_.hasNecessaryDom()) {
        throw new Error(`Required DOM nodes missing in ${ROOT} component.`);
      }

      if (this.adapter_.hasClass(OPEN)) {
        this.isOpen_ = true;
      } else {
        this.detabinate_();
        this.isOpen_ = false;
      }

      this.adapter_.registerDrawerInteractionHandler('touchstart', this.componentTouchStartHandler_);
      this.adapter_.registerInteractionHandler('touchmove', this.componentTouchMoveHandler_);
      this.adapter_.registerInteractionHandler('touchend', this.componentTouchEndHandler_);
    }

    destroy() {
      this.adapter_.deregisterDrawerInteractionHandler('touchstart', this.componentTouchStartHandler_);
      this.adapter_.deregisterInteractionHandler('touchmove', this.componentTouchMoveHandler_);
      this.adapter_.deregisterInteractionHandler('touchend', this.componentTouchEndHandler_);
      // Deregister the document keydown handler just in case the component is destroyed while the menu is open.
      this.adapter_.deregisterDocumentKeydownHandler(this.documentKeydownHandler_);
    }

    open() {
      this.adapter_.registerTransitionEndHandler(this.transitionEndHandler_);
      this.adapter_.registerDocumentKeydownHandler(this.documentKeydownHandler_);
      this.adapter_.addClass(this.animatingCssClass_);
      this.adapter_.addClass(this.openCssClass_);
      this.retabinate_();
      // Debounce multiple calls
      if (!this.isOpen_) {
        this.adapter_.notifyOpen();
      }
      this.isOpen_ = true;
    }

    close() {
      this.adapter_.deregisterDocumentKeydownHandler(this.documentKeydownHandler_);
      this.adapter_.registerTransitionEndHandler(this.transitionEndHandler_);
      this.adapter_.addClass(this.animatingCssClass_);
      this.adapter_.removeClass(this.openCssClass_);
      this.detabinate_();
      // Debounce multiple calls
      if (this.isOpen_) {
        this.adapter_.notifyClose();
      }
      this.isOpen_ = false;
    }

    isOpen() {
      return this.isOpen_;
    }

    /**
     *  Render all children of the drawer inert when it's closed.
     */
    detabinate_() {
      if (this.inert_) {
        return;
      }

      const elements = this.adapter_.getFocusableElements();
      if (elements) {
        for (let i = 0; i < elements.length; i++) {
          this.adapter_.saveElementTabState(elements[i]);
          this.adapter_.makeElementUntabbable(elements[i]);
        }
      }

      this.inert_ = true;
    }

    /**
     *  Make all children of the drawer tabbable again when it's open.
     */
    retabinate_() {
      if (!this.inert_) {
        return;
      }

      const elements = this.adapter_.getFocusableElements();
      if (elements) {
        for (let i = 0; i < elements.length; i++) {
          this.adapter_.restoreElementTabState(elements[i]);
        }
      }

      this.inert_ = false;
    }

    handleTouchStart_(evt) {
      if (!this.adapter_.hasClass(this.openCssClass_)) {
        return;
      }
      if (evt.pointerType && evt.pointerType !== 'touch') {
        return;
      }

      this.direction_ = this.adapter_.isRtl() ? -1 : 1;
      this.drawerWidth_ = this.adapter_.getDrawerWidth();
      this.startX_ = evt.touches ? evt.touches[0].pageX : evt.pageX;
      this.currentX_ = this.startX_;

      this.updateRaf_ = requestAnimationFrame(this.updateDrawer_.bind(this));
    }

    handleTouchMove_(evt) {
      if (evt.pointerType && evt.pointerType !== 'touch') {
        return;
      }

      this.currentX_ = evt.touches ? evt.touches[0].pageX : evt.pageX;
    }

    handleTouchEnd_(evt) {
      if (evt.pointerType && evt.pointerType !== 'touch') {
        return;
      }

      this.prepareForTouchEnd_();

      // Did the user close the drawer by more than 50%?
      if (Math.abs(this.newPosition_ / this.drawerWidth_) >= 0.5) {
        this.close();
      } else {
        // Triggering an open here means we'll get a nice animation back to the fully open state.
        this.open();
      }
    }

    prepareForTouchEnd_() {
      cancelAnimationFrame(this.updateRaf_);
      this.adapter_.setTranslateX(null);
    }

    updateDrawer_() {
      this.updateRaf_ = requestAnimationFrame(this.updateDrawer_.bind(this));
      this.adapter_.setTranslateX(this.newPosition_);
    }

    get newPosition_() {
      let newPos = null;

      if (this.direction_ === 1) {
        newPos = Math.min(0, this.currentX_ - this.startX_);
      } else {
        newPos = Math.max(0, this.currentX_ - this.startX_);
      }

      return newPos;
    }

    isRootTransitioningEventTarget_() {
      // Classes extending MDCSlidableDrawerFoundation should implement this method to return true or false
      // if the event target is the root event target currently transitioning.
      return false;
    }

    handleTransitionEnd_(evt) {
      if (this.isRootTransitioningEventTarget_(evt.target)) {
        this.adapter_.removeClass(this.animatingCssClass_);
        this.adapter_.deregisterTransitionEndHandler(this.transitionEndHandler_);
      }
    };
  }

  /**
   * Copyright 2016 Google Inc. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * Copyright 2016 Google Inc. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  const cssClasses$6 = {
    ROOT: 'mdc-drawer--temporary',
    OPEN: 'mdc-drawer--open',
    ANIMATING: 'mdc-drawer--animating',
    SCROLL_LOCK: 'mdc-drawer-scroll-lock',
  };

  const strings$5 = {
    DRAWER_SELECTOR: '.mdc-drawer--temporary .mdc-drawer__drawer',
    OPACITY_VAR_NAME: '--mdc-temporary-drawer-opacity',
    FOCUSABLE_ELEMENTS,
    OPEN_EVENT: 'MDCTemporaryDrawer:open',
    CLOSE_EVENT: 'MDCTemporaryDrawer:close',
  };

  /**
   * Copyright 2016 Google Inc. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  class MDCTemporaryDrawerFoundation extends MDCSlidableDrawerFoundation {
    static get cssClasses() {
      return cssClasses$6;
    }

    static get strings() {
      return strings$5;
    }

    static get defaultAdapter() {
      return Object.assign(MDCSlidableDrawerFoundation.defaultAdapter, {
        addBodyClass: (/* className: string */) => {},
        removeBodyClass: (/* className: string */) => {},
        isDrawer: () => false,
        updateCssVariable: (/* value: string */) => {},
        eventTargetHasClass: (/* target: EventTarget, className: string */) => /* boolean */ false,
      });
    }

    constructor(adapter) {
      super(
        Object.assign(MDCTemporaryDrawerFoundation.defaultAdapter, adapter),
        MDCTemporaryDrawerFoundation.cssClasses.ROOT,
        MDCTemporaryDrawerFoundation.cssClasses.ANIMATING,
        MDCTemporaryDrawerFoundation.cssClasses.OPEN);

      this.componentClickHandler_ = (evt) => {
        if (this.adapter_.eventTargetHasClass(evt.target, cssClasses$6.ROOT)) {
          this.close(true);
        }
      };
    }

    init() {
      super.init();

      // Make browser aware of custom property being used in this element.
      // Workaround for certain types of hard-to-reproduce heisenbugs.
      this.adapter_.updateCssVariable(0);
      this.adapter_.registerInteractionHandler('click', this.componentClickHandler_);
    }

    destroy() {
      super.destroy();

      this.adapter_.deregisterInteractionHandler('click', this.componentClickHandler_);
      this.enableScroll_();
    }

    open() {
      this.disableScroll_();
      // Make sure custom property values are cleared before starting.
      this.adapter_.updateCssVariable('');

      super.open();
    }

    close() {
      // Make sure custom property values are cleared before making any changes.
      this.adapter_.updateCssVariable('');

      super.close();
    }

    prepareForTouchEnd_() {
      super.prepareForTouchEnd_();

      this.adapter_.updateCssVariable('');
    }

    updateDrawer_() {
      super.updateDrawer_();

      const newOpacity = Math.max(0, 1 + this.direction_ * (this.newPosition_ / this.drawerWidth_));
      this.adapter_.updateCssVariable(newOpacity);
    }

    isRootTransitioningEventTarget_(el) {
      return this.adapter_.isDrawer(el);
    }

    handleTransitionEnd_(evt) {
      super.handleTransitionEnd_(evt);
      if (!this.isOpen_) {
        this.enableScroll_();
      }
    };

    disableScroll_() {
      this.adapter_.addBodyClass(cssClasses$6.SCROLL_LOCK);
    }

    enableScroll_() {
      this.adapter_.removeBodyClass(cssClasses$6.SCROLL_LOCK);
    }
  }

  /**
   * Copyright 2016 Google Inc. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  class MDCTemporaryDrawer extends MDCComponent {
    static attachTo(root) {
      return new MDCTemporaryDrawer(root);
    }

    get open() {
      return this.foundation_.isOpen();
    }

    set open(value) {
      if (value) {
        this.foundation_.open();
      } else {
        this.foundation_.close();
      }
    }

    /* Return the drawer element inside the component. */
    get drawer() {
      return this.root_.querySelector(MDCTemporaryDrawerFoundation.strings.DRAWER_SELECTOR);
    }

    getDefaultFoundation() {
      const {FOCUSABLE_ELEMENTS, OPACITY_VAR_NAME} = MDCTemporaryDrawerFoundation.strings;

      return new MDCTemporaryDrawerFoundation({
        addClass: (className) => this.root_.classList.add(className),
        removeClass: (className) => this.root_.classList.remove(className),
        hasClass: (className) => this.root_.classList.contains(className),
        addBodyClass: (className) => document.body.classList.add(className),
        removeBodyClass: (className) => document.body.classList.remove(className),
        eventTargetHasClass: (target, className) => target.classList.contains(className),
        hasNecessaryDom: () => Boolean(this.drawer),
        registerInteractionHandler: (evt, handler) =>
          this.root_.addEventListener(remapEvent(evt), handler, applyPassive$1()),
        deregisterInteractionHandler: (evt, handler) =>
          this.root_.removeEventListener(remapEvent(evt), handler, applyPassive$1()),
        registerDrawerInteractionHandler: (evt, handler) =>
          this.drawer.addEventListener(remapEvent(evt), handler),
        deregisterDrawerInteractionHandler: (evt, handler) =>
          this.drawer.removeEventListener(remapEvent(evt), handler),
        registerTransitionEndHandler: (handler) => this.drawer.addEventListener('transitionend', handler),
        deregisterTransitionEndHandler: (handler) => this.drawer.removeEventListener('transitionend', handler),
        registerDocumentKeydownHandler: (handler) => document.addEventListener('keydown', handler),
        deregisterDocumentKeydownHandler: (handler) => document.removeEventListener('keydown', handler),
        getDrawerWidth: () => this.drawer.offsetWidth,
        setTranslateX: (value) => this.drawer.style.setProperty(
          getTransformPropertyName(), value === null ? null : `translateX(${value}px)`),
        updateCssVariable: (value) => {
          if (supportsCssCustomProperties()) {
            this.root_.style.setProperty(OPACITY_VAR_NAME, value);
          }
        },
        getFocusableElements: () => this.drawer.querySelectorAll(FOCUSABLE_ELEMENTS),
        saveElementTabState: (el) => saveElementTabState(el),
        restoreElementTabState: (el) => restoreElementTabState(el),
        makeElementUntabbable: (el) => el.setAttribute('tabindex', -1),
        notifyOpen: () => this.emit(MDCTemporaryDrawerFoundation.strings.OPEN_EVENT),
        notifyClose: () => this.emit(MDCTemporaryDrawerFoundation.strings.CLOSE_EVENT),
        isRtl: () => getComputedStyle(this.root_).getPropertyValue('direction') === 'rtl',
        isDrawer: (el) => el === this.drawer,
      });
    }
  }

  /**
   * Copyright 2016 Google Inc. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * Copyright 2016 Google Inc. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * Copyright 2016 Google Inc. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * Copyright 2016 Google Inc. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  

  const header = {
    $type: 'header',
    class: 'mdc-drawer__header'
  };
  const contents = {
    $type: 'nav',
    class: 'mdc-drawer__content',
    $components: [createApp('Rule'), app, createApp('Other')]
  };
  const drawerContainer = {
    $type: 'nav',
    class: 'mdc-drawer__drawer',
    $components: [header, contents]
  };
  const app$6 = {
    $cell: true,
    $type: 'aside',
    class: 'mdc-drawer mdc-drawer--temporary',
    id: 'drawer-root',
    _drawer: undefined,
    _openDrawer: function () {
      this._drawer.open = true;
    },
    $components: [drawerContainer],
    onclick: function () {
      console.log('sharing');
    },
    $init: function () {
      this._drawer = new MDCTemporaryDrawer(document.querySelector('.mdc-drawer--temporary'));

      this._openDrawer();

      document.querySelector('#fullscreen-button').addEventListener('click', this._openDrawer);
    }
  };

  

  const rootClassName = css`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  // height: 100vh;
  height: 100%;
  width: 100%;
  // overflow-y: hidden;
`;
  const bodyClassName = css`
  display: flex;
  flex-grow: 1;
  width: 100%;
  height: 100%;
  justify-content: space-between;
`;
  const leftMenuClassName = css`

`;
  const rightMenuClassName = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-right: 60px;

  > * {
    margin-bottom: 30px;
  }
`;
  const leftMenu = {
    class: leftMenuClassName,
    $components: [app$6]
  };
  const rightMenu = {
    class: rightMenuClassName,
    $components: [app$3, app$4, app$5]
  };
  const body = {
    class: bodyClassName,
    $components: [leftMenu, rightMenu, app$1]
  };
  const app$7 = {
    id: "root",
    $cell: true,
    class: rootClassName,
    $type: "div",
    $init: () => {// const helperText = new MDCTextFieldHelperText(document.querySelector('.mdc-text-field-helper-text'));
      // const lineRipple = new MDCLineRipple(document.querySelector('.mdc-line-ripple'));
      // const textField = new MDCTextField(document.querySelector('.mdc-text-field'));
    },
    $components: [app$2, body]
  };

  return app$7;

})));
//# sourceMappingURL=cellular.js.map
