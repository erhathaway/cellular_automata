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

  const className = css`
  background-color: yellow;
  height: 100px;
  width: 200px;
`;
  const app = {
    $cell: true,
    id: "menu",
    class: className
  };

  const className$1 = css`
  background-color: lightcyan;
  height: 50%;
  width: 90%;
  border-radius: 3px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
`;
  const app$1 = {
    $cell: true,
    class: className$1
  };

  const className$2 = css`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  height: 100vh;
  width: 100%;
`;
  const app$2 = {
    $cell: true,
    class: className$2,
    $type: "div",
    $components: [app$1, app]
  };

  return app$2;

})));
//# sourceMappingURL=cellular.js.map
