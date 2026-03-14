var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/immer/dist/immer.cjs.production.min.js
var require_immer_cjs_production_min = __commonJS({
  "node_modules/immer/dist/immer.cjs.production.min.js"(exports2) {
    function n(n2) {
      for (var r2 = arguments.length, t2 = Array(r2 > 1 ? r2 - 1 : 0), e2 = 1; e2 < r2; e2++) t2[e2 - 1] = arguments[e2];
      throw Error("[Immer] minified error nr: " + n2 + (t2.length ? " " + t2.map((function(n3) {
        return "'" + n3 + "'";
      })).join(",") : "") + ". Find the full error at: https://bit.ly/3cXEKWf");
    }
    function r(n2) {
      return !!n2 && !!n2[H];
    }
    function t(n2) {
      var r2;
      return !!n2 && ((function(n3) {
        if (!n3 || "object" != typeof n3) return false;
        var r3 = Object.getPrototypeOf(n3);
        if (null === r3) return true;
        var t2 = Object.hasOwnProperty.call(r3, "constructor") && r3.constructor;
        return t2 === Object || "function" == typeof t2 && Function.toString.call(t2) === Q;
      })(n2) || Array.isArray(n2) || !!n2[G] || !!(null === (r2 = n2.constructor) || void 0 === r2 ? void 0 : r2[G]) || c(n2) || v(n2));
    }
    function e(n2, r2, t2) {
      void 0 === t2 && (t2 = false), 0 === i(n2) ? (t2 ? Object.keys : T)(n2).forEach((function(e2) {
        t2 && "symbol" == typeof e2 || r2(e2, n2[e2], n2);
      })) : n2.forEach((function(t3, e2) {
        return r2(e2, t3, n2);
      }));
    }
    function i(n2) {
      var r2 = n2[H];
      return r2 ? r2.t > 3 ? r2.t - 4 : r2.t : Array.isArray(n2) ? 1 : c(n2) ? 2 : v(n2) ? 3 : 0;
    }
    function u(n2, r2) {
      return 2 === i(n2) ? n2.has(r2) : Object.prototype.hasOwnProperty.call(n2, r2);
    }
    function o(n2, r2) {
      return 2 === i(n2) ? n2.get(r2) : n2[r2];
    }
    function f(n2, r2, t2) {
      var e2 = i(n2);
      2 === e2 ? n2.set(r2, t2) : 3 === e2 ? n2.add(t2) : n2[r2] = t2;
    }
    function a(n2, r2) {
      return n2 === r2 ? 0 !== n2 || 1 / n2 == 1 / r2 : n2 != n2 && r2 != r2;
    }
    function c(n2) {
      return W && n2 instanceof Map;
    }
    function v(n2) {
      return X && n2 instanceof Set;
    }
    function s(n2) {
      return n2.i || n2.u;
    }
    function p(n2) {
      if (Array.isArray(n2)) return Array.prototype.slice.call(n2);
      var r2 = U(n2);
      delete r2[H];
      for (var t2 = T(r2), e2 = 0; e2 < t2.length; e2++) {
        var i2 = t2[e2], u2 = r2[i2];
        false === u2.writable && (u2.writable = true, u2.configurable = true), (u2.get || u2.set) && (r2[i2] = { configurable: true, writable: true, enumerable: u2.enumerable, value: n2[i2] });
      }
      return Object.create(Object.getPrototypeOf(n2), r2);
    }
    function l(n2, u2) {
      return void 0 === u2 && (u2 = false), h(n2) || r(n2) || !t(n2) || (i(n2) > 1 && (n2.set = n2.add = n2.clear = n2.delete = d), Object.freeze(n2), u2 && e(n2, (function(n3, r2) {
        return l(r2, true);
      }), true)), n2;
    }
    function d() {
      n(2);
    }
    function h(n2) {
      return null == n2 || "object" != typeof n2 || Object.isFrozen(n2);
    }
    function y(r2) {
      var t2 = V[r2];
      return t2 || n(18, r2), t2;
    }
    function _(n2, r2) {
      V[n2] || (V[n2] = r2);
    }
    function b() {
      return I;
    }
    function m(n2, r2) {
      r2 && (y("Patches"), n2.o = [], n2.v = [], n2.s = r2);
    }
    function j(n2) {
      O(n2), n2.p.forEach(w), n2.p = null;
    }
    function O(n2) {
      n2 === I && (I = n2.l);
    }
    function x(n2) {
      return I = { p: [], l: I, h: n2, _: true, m: 0 };
    }
    function w(n2) {
      var r2 = n2[H];
      0 === r2.t || 1 === r2.t ? r2.j() : r2.O = true;
    }
    function S(r2, e2) {
      e2.m = e2.p.length;
      var i2 = e2.p[0], u2 = void 0 !== r2 && r2 !== i2;
      return e2.h.S || y("ES5").P(e2, r2, u2), u2 ? (i2[H].g && (j(e2), n(4)), t(r2) && (r2 = P(e2, r2), e2.l || M(e2, r2)), e2.o && y("Patches").M(i2[H].u, r2, e2.o, e2.v)) : r2 = P(e2, i2, []), j(e2), e2.o && e2.s(e2.o, e2.v), r2 !== B ? r2 : void 0;
    }
    function P(n2, r2, t2) {
      if (h(r2)) return r2;
      var i2 = r2[H];
      if (!i2) return e(r2, (function(e2, u3) {
        return g(n2, i2, r2, e2, u3, t2);
      }), true), r2;
      if (i2.A !== n2) return r2;
      if (!i2.g) return M(n2, i2.u, true), i2.u;
      if (!i2.R) {
        i2.R = true, i2.A.m--;
        var u2 = 4 === i2.t || 5 === i2.t ? i2.i = p(i2.k) : i2.i, o2 = u2, f2 = false;
        3 === i2.t && (o2 = new Set(u2), u2.clear(), f2 = true), e(o2, (function(r3, e2) {
          return g(n2, i2, u2, r3, e2, t2, f2);
        })), M(n2, u2, false), t2 && n2.o && y("Patches").F(i2, t2, n2.o, n2.v);
      }
      return i2.i;
    }
    function g(n2, e2, i2, o2, a2, c2, v2) {
      if (r(a2)) {
        var s2 = P(n2, a2, c2 && e2 && 3 !== e2.t && !u(e2.N, o2) ? c2.concat(o2) : void 0);
        if (f(i2, o2, s2), !r(s2)) return;
        n2._ = false;
      } else v2 && i2.add(a2);
      if (t(a2) && !h(a2)) {
        if (!n2.h.D && n2.m < 1) return;
        P(n2, a2), e2 && e2.A.l || M(n2, a2);
      }
    }
    function M(n2, r2, t2) {
      void 0 === t2 && (t2 = false), !n2.l && n2.h.D && n2._ && l(r2, t2);
    }
    function A(n2, r2) {
      var t2 = n2[H];
      return (t2 ? s(t2) : n2)[r2];
    }
    function z(n2, r2) {
      if (r2 in n2) for (var t2 = Object.getPrototypeOf(n2); t2; ) {
        var e2 = Object.getOwnPropertyDescriptor(t2, r2);
        if (e2) return e2;
        t2 = Object.getPrototypeOf(t2);
      }
    }
    function E(n2) {
      n2.g || (n2.g = true, n2.l && E(n2.l));
    }
    function R(n2) {
      n2.i || (n2.i = p(n2.u));
    }
    function k(n2, r2, t2) {
      var e2 = c(r2) ? y("MapSet").K(r2, t2) : v(r2) ? y("MapSet").$(r2, t2) : n2.S ? (function(n3, r3) {
        var t3 = Array.isArray(n3), e3 = { t: t3 ? 1 : 0, A: r3 ? r3.A : b(), g: false, R: false, N: {}, l: r3, u: n3, k: null, i: null, j: null, C: false }, i2 = e3, u2 = Y;
        t3 && (i2 = [e3], u2 = Z);
        var o2 = Proxy.revocable(i2, u2), f2 = o2.revoke, a2 = o2.proxy;
        return e3.k = a2, e3.j = f2, a2;
      })(r2, t2) : y("ES5").I(r2, t2);
      return (t2 ? t2.A : b()).p.push(e2), e2;
    }
    function F(u2) {
      return r(u2) || n(22, u2), (function n2(r2) {
        if (!t(r2)) return r2;
        var u3, a2 = r2[H], c2 = i(r2);
        if (a2) {
          if (!a2.g && (a2.t < 4 || !y("ES5").J(a2))) return a2.u;
          a2.R = true, u3 = N(r2, c2), a2.R = false;
        } else u3 = N(r2, c2);
        return e(u3, (function(r3, t2) {
          a2 && o(a2.u, r3) === t2 || f(u3, r3, n2(t2));
        })), 3 === c2 ? new Set(u3) : u3;
      })(u2);
    }
    function N(n2, r2) {
      switch (r2) {
        case 2:
          return new Map(n2);
        case 3:
          return Array.from(n2);
      }
      return p(n2);
    }
    function D() {
      function n2(n3, r2) {
        var t3 = f2[n3];
        return t3 ? t3.enumerable = r2 : f2[n3] = t3 = { configurable: true, enumerable: r2, get: function() {
          return Y.get(this[H], n3);
        }, set: function(r3) {
          Y.set(this[H], n3, r3);
        } }, t3;
      }
      function t2(n3) {
        for (var r2 = n3.length - 1; r2 >= 0; r2--) {
          var t3 = n3[r2][H];
          if (!t3.g) switch (t3.t) {
            case 5:
              o2(t3) && E(t3);
              break;
            case 4:
              i2(t3) && E(t3);
          }
        }
      }
      function i2(n3) {
        for (var r2 = n3.u, t3 = n3.k, e2 = T(t3), i3 = e2.length - 1; i3 >= 0; i3--) {
          var o3 = e2[i3];
          if (o3 !== H) {
            var f3 = r2[o3];
            if (void 0 === f3 && !u(r2, o3)) return true;
            var c2 = t3[o3], v2 = c2 && c2[H];
            if (v2 ? v2.u !== f3 : !a(c2, f3)) return true;
          }
        }
        var s2 = !!r2[H];
        return e2.length !== T(r2).length + (s2 ? 0 : 1);
      }
      function o2(n3) {
        var r2 = n3.k;
        if (r2.length !== n3.u.length) return true;
        var t3 = Object.getOwnPropertyDescriptor(r2, r2.length - 1);
        if (t3 && !t3.get) return true;
        for (var e2 = 0; e2 < r2.length; e2++) if (!r2.hasOwnProperty(e2)) return true;
        return false;
      }
      var f2 = {};
      _("ES5", { I: function(r2, t3) {
        var e2 = Array.isArray(r2), i3 = (function(r3, t4) {
          if (r3) {
            for (var e3 = Array(t4.length), i4 = 0; i4 < t4.length; i4++) Object.defineProperty(e3, "" + i4, n2(i4, true));
            return e3;
          }
          var u3 = U(t4);
          delete u3[H];
          for (var o3 = T(u3), f3 = 0; f3 < o3.length; f3++) {
            var a2 = o3[f3];
            u3[a2] = n2(a2, r3 || !!u3[a2].enumerable);
          }
          return Object.create(Object.getPrototypeOf(t4), u3);
        })(e2, r2), u2 = { t: e2 ? 5 : 4, A: t3 ? t3.A : b(), g: false, R: false, N: {}, l: t3, u: r2, k: i3, i: null, O: false, C: false };
        return Object.defineProperty(i3, H, { value: u2, writable: true }), i3;
      }, P: function(n3, i3, f3) {
        f3 ? r(i3) && i3[H].A === n3 && t2(n3.p) : (n3.o && (function n4(r2) {
          if (r2 && "object" == typeof r2) {
            var t3 = r2[H];
            if (t3) {
              var i4 = t3.u, f4 = t3.k, a2 = t3.N, c2 = t3.t;
              if (4 === c2) e(f4, (function(r3) {
                r3 !== H && (void 0 !== i4[r3] || u(i4, r3) ? a2[r3] || n4(f4[r3]) : (a2[r3] = true, E(t3)));
              })), e(i4, (function(n5) {
                void 0 !== f4[n5] || u(f4, n5) || (a2[n5] = false, E(t3));
              }));
              else if (5 === c2) {
                if (o2(t3) && (E(t3), a2.length = true), f4.length < i4.length) for (var v2 = f4.length; v2 < i4.length; v2++) a2[v2] = false;
                else for (var s2 = i4.length; s2 < f4.length; s2++) a2[s2] = true;
                for (var p2 = Math.min(f4.length, i4.length), l2 = 0; l2 < p2; l2++) f4.hasOwnProperty(l2) || (a2[l2] = true), void 0 === a2[l2] && n4(f4[l2]);
              }
            }
          }
        })(n3.p[0]), t2(n3.p));
      }, J: function(n3) {
        return 4 === n3.t ? i2(n3) : o2(n3);
      } });
    }
    function K() {
      function f2(n2) {
        if (!t(n2)) return n2;
        if (Array.isArray(n2)) return n2.map(f2);
        if (c(n2)) return new Map(Array.from(n2.entries()).map((function(n3) {
          return [n3[0], f2(n3[1])];
        })));
        if (v(n2)) return new Set(Array.from(n2).map(f2));
        var r2 = Object.create(Object.getPrototypeOf(n2));
        for (var e2 in n2) r2[e2] = f2(n2[e2]);
        return u(n2, G) && (r2[G] = n2[G]), r2;
      }
      function a2(n2) {
        return r(n2) ? f2(n2) : n2;
      }
      var s2 = "add";
      _("Patches", { W: function(r2, t2) {
        return t2.forEach((function(t3) {
          for (var e2 = t3.path, u2 = t3.op, a3 = r2, c2 = 0; c2 < e2.length - 1; c2++) {
            var v2 = i(a3), p2 = e2[c2];
            "string" != typeof p2 && "number" != typeof p2 && (p2 = "" + p2), 0 !== v2 && 1 !== v2 || "__proto__" !== p2 && "constructor" !== p2 || n(24), "function" == typeof a3 && "prototype" === p2 && n(24), "object" != typeof (a3 = o(a3, p2)) && n(15, e2.join("/"));
          }
          var l2 = i(a3), d2 = f2(t3.value), h2 = e2[e2.length - 1];
          switch (u2) {
            case "replace":
              switch (l2) {
                case 2:
                  return a3.set(h2, d2);
                case 3:
                  n(16);
                default:
                  return a3[h2] = d2;
              }
            case s2:
              switch (l2) {
                case 1:
                  return "-" === h2 ? a3.push(d2) : a3.splice(h2, 0, d2);
                case 2:
                  return a3.set(h2, d2);
                case 3:
                  return a3.add(d2);
                default:
                  return a3[h2] = d2;
              }
            case "remove":
              switch (l2) {
                case 1:
                  return a3.splice(h2, 1);
                case 2:
                  return a3.delete(h2);
                case 3:
                  return a3.delete(t3.value);
                default:
                  return delete a3[h2];
              }
            default:
              n(17, u2);
          }
        })), r2;
      }, F: function(n2, r2, t2, i2) {
        switch (n2.t) {
          case 0:
          case 4:
          case 2:
            return (function(n3, r3, t3, i3) {
              var f3 = n3.u, c2 = n3.i;
              e(n3.N, (function(n4, e2) {
                var v2 = o(f3, n4), p2 = o(c2, n4), l2 = e2 ? u(f3, n4) ? "replace" : s2 : "remove";
                if (v2 !== p2 || "replace" !== l2) {
                  var d2 = r3.concat(n4);
                  t3.push("remove" === l2 ? { op: l2, path: d2 } : { op: l2, path: d2, value: p2 }), i3.push(l2 === s2 ? { op: "remove", path: d2 } : "remove" === l2 ? { op: s2, path: d2, value: a2(v2) } : { op: "replace", path: d2, value: a2(v2) });
                }
              }));
            })(n2, r2, t2, i2);
          case 5:
          case 1:
            return (function(n3, r3, t3, e2) {
              var i3 = n3.u, u2 = n3.N, o2 = n3.i;
              if (o2.length < i3.length) {
                var f3 = [o2, i3];
                i3 = f3[0], o2 = f3[1];
                var c2 = [e2, t3];
                t3 = c2[0], e2 = c2[1];
              }
              for (var v2 = 0; v2 < i3.length; v2++) if (u2[v2] && o2[v2] !== i3[v2]) {
                var p2 = r3.concat([v2]);
                t3.push({ op: "replace", path: p2, value: a2(o2[v2]) }), e2.push({ op: "replace", path: p2, value: a2(i3[v2]) });
              }
              for (var l2 = i3.length; l2 < o2.length; l2++) {
                var d2 = r3.concat([l2]);
                t3.push({ op: s2, path: d2, value: a2(o2[l2]) });
              }
              i3.length < o2.length && e2.push({ op: "replace", path: r3.concat(["length"]), value: i3.length });
            })(n2, r2, t2, i2);
          case 3:
            return (function(n3, r3, t3, e2) {
              var i3 = n3.u, u2 = n3.i, o2 = 0;
              i3.forEach((function(n4) {
                if (!u2.has(n4)) {
                  var i4 = r3.concat([o2]);
                  t3.push({ op: "remove", path: i4, value: n4 }), e2.unshift({ op: s2, path: i4, value: n4 });
                }
                o2++;
              })), o2 = 0, u2.forEach((function(n4) {
                if (!i3.has(n4)) {
                  var u3 = r3.concat([o2]);
                  t3.push({ op: s2, path: u3, value: n4 }), e2.unshift({ op: "remove", path: u3, value: n4 });
                }
                o2++;
              }));
            })(n2, r2, t2, i2);
        }
      }, M: function(n2, r2, t2, e2) {
        t2.push({ op: "replace", path: [], value: r2 === B ? void 0 : r2 }), e2.push({ op: "replace", path: [], value: n2 });
      } });
    }
    function $() {
      function r2(n2, r3) {
        function t2() {
          this.constructor = n2;
        }
        f2(n2, r3), n2.prototype = (t2.prototype = r3.prototype, new t2());
      }
      function i2(n2) {
        n2.i || (n2.N = /* @__PURE__ */ new Map(), n2.i = new Map(n2.u));
      }
      function u2(n2) {
        n2.i || (n2.i = /* @__PURE__ */ new Set(), n2.u.forEach((function(r3) {
          if (t(r3)) {
            var e2 = k(n2.A.h, r3, n2);
            n2.p.set(r3, e2), n2.i.add(e2);
          } else n2.i.add(r3);
        })));
      }
      function o2(r3) {
        r3.O && n(3, JSON.stringify(s(r3)));
      }
      var f2 = function(n2, r3) {
        return (f2 = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(n3, r4) {
          n3.__proto__ = r4;
        } || function(n3, r4) {
          for (var t2 in r4) r4.hasOwnProperty(t2) && (n3[t2] = r4[t2]);
        })(n2, r3);
      }, a2 = (function() {
        function n2(n3, r3) {
          return this[H] = { t: 2, l: r3, A: r3 ? r3.A : b(), g: false, R: false, i: void 0, N: void 0, u: n3, k: this, C: false, O: false }, this;
        }
        r2(n2, Map);
        var u3 = n2.prototype;
        return Object.defineProperty(u3, "size", { get: function() {
          return s(this[H]).size;
        } }), u3.has = function(n3) {
          return s(this[H]).has(n3);
        }, u3.set = function(n3, r3) {
          var t2 = this[H];
          return o2(t2), s(t2).has(n3) && s(t2).get(n3) === r3 || (i2(t2), E(t2), t2.N.set(n3, true), t2.i.set(n3, r3), t2.N.set(n3, true)), this;
        }, u3.delete = function(n3) {
          if (!this.has(n3)) return false;
          var r3 = this[H];
          return o2(r3), i2(r3), E(r3), r3.u.has(n3) ? r3.N.set(n3, false) : r3.N.delete(n3), r3.i.delete(n3), true;
        }, u3.clear = function() {
          var n3 = this[H];
          o2(n3), s(n3).size && (i2(n3), E(n3), n3.N = /* @__PURE__ */ new Map(), e(n3.u, (function(r3) {
            n3.N.set(r3, false);
          })), n3.i.clear());
        }, u3.forEach = function(n3, r3) {
          var t2 = this;
          s(this[H]).forEach((function(e2, i3) {
            n3.call(r3, t2.get(i3), i3, t2);
          }));
        }, u3.get = function(n3) {
          var r3 = this[H];
          o2(r3);
          var e2 = s(r3).get(n3);
          if (r3.R || !t(e2)) return e2;
          if (e2 !== r3.u.get(n3)) return e2;
          var u4 = k(r3.A.h, e2, r3);
          return i2(r3), r3.i.set(n3, u4), u4;
        }, u3.keys = function() {
          return s(this[H]).keys();
        }, u3.values = function() {
          var n3, r3 = this, t2 = this.keys();
          return (n3 = {})[L] = function() {
            return r3.values();
          }, n3.next = function() {
            var n4 = t2.next();
            return n4.done ? n4 : { done: false, value: r3.get(n4.value) };
          }, n3;
        }, u3.entries = function() {
          var n3, r3 = this, t2 = this.keys();
          return (n3 = {})[L] = function() {
            return r3.entries();
          }, n3.next = function() {
            var n4 = t2.next();
            if (n4.done) return n4;
            var e2 = r3.get(n4.value);
            return { done: false, value: [n4.value, e2] };
          }, n3;
        }, u3[L] = function() {
          return this.entries();
        }, n2;
      })(), c2 = (function() {
        function n2(n3, r3) {
          return this[H] = { t: 3, l: r3, A: r3 ? r3.A : b(), g: false, R: false, i: void 0, u: n3, k: this, p: /* @__PURE__ */ new Map(), O: false, C: false }, this;
        }
        r2(n2, Set);
        var t2 = n2.prototype;
        return Object.defineProperty(t2, "size", { get: function() {
          return s(this[H]).size;
        } }), t2.has = function(n3) {
          var r3 = this[H];
          return o2(r3), r3.i ? !!r3.i.has(n3) || !(!r3.p.has(n3) || !r3.i.has(r3.p.get(n3))) : r3.u.has(n3);
        }, t2.add = function(n3) {
          var r3 = this[H];
          return o2(r3), this.has(n3) || (u2(r3), E(r3), r3.i.add(n3)), this;
        }, t2.delete = function(n3) {
          if (!this.has(n3)) return false;
          var r3 = this[H];
          return o2(r3), u2(r3), E(r3), r3.i.delete(n3) || !!r3.p.has(n3) && r3.i.delete(r3.p.get(n3));
        }, t2.clear = function() {
          var n3 = this[H];
          o2(n3), s(n3).size && (u2(n3), E(n3), n3.i.clear());
        }, t2.values = function() {
          var n3 = this[H];
          return o2(n3), u2(n3), n3.i.values();
        }, t2.entries = function() {
          var n3 = this[H];
          return o2(n3), u2(n3), n3.i.entries();
        }, t2.keys = function() {
          return this.values();
        }, t2[L] = function() {
          return this.values();
        }, t2.forEach = function(n3, r3) {
          for (var t3 = this.values(), e2 = t3.next(); !e2.done; ) n3.call(r3, e2.value, e2.value, this), e2 = t3.next();
        }, n2;
      })();
      _("MapSet", { K: function(n2, r3) {
        return new a2(n2, r3);
      }, $: function(n2, r3) {
        return new c2(n2, r3);
      } });
    }
    var C;
    Object.defineProperty(exports2, "__esModule", { value: true });
    var I;
    var J = "undefined" != typeof Symbol && "symbol" == typeof /* @__PURE__ */ Symbol("x");
    var W = "undefined" != typeof Map;
    var X = "undefined" != typeof Set;
    var q = "undefined" != typeof Proxy && void 0 !== Proxy.revocable && "undefined" != typeof Reflect;
    var B = J ? /* @__PURE__ */ Symbol.for("immer-nothing") : ((C = {})["immer-nothing"] = true, C);
    var G = J ? /* @__PURE__ */ Symbol.for("immer-draftable") : "__$immer_draftable";
    var H = J ? /* @__PURE__ */ Symbol.for("immer-state") : "__$immer_state";
    var L = "undefined" != typeof Symbol && Symbol.iterator || "@@iterator";
    var Q = "" + Object.prototype.constructor;
    var T = "undefined" != typeof Reflect && Reflect.ownKeys ? Reflect.ownKeys : void 0 !== Object.getOwnPropertySymbols ? function(n2) {
      return Object.getOwnPropertyNames(n2).concat(Object.getOwnPropertySymbols(n2));
    } : Object.getOwnPropertyNames;
    var U = Object.getOwnPropertyDescriptors || function(n2) {
      var r2 = {};
      return T(n2).forEach((function(t2) {
        r2[t2] = Object.getOwnPropertyDescriptor(n2, t2);
      })), r2;
    };
    var V = {};
    var Y = { get: function(n2, r2) {
      if (r2 === H) return n2;
      var e2 = s(n2);
      if (!u(e2, r2)) return (function(n3, r3, t2) {
        var e3, i3 = z(r3, t2);
        return i3 ? "value" in i3 ? i3.value : null === (e3 = i3.get) || void 0 === e3 ? void 0 : e3.call(n3.k) : void 0;
      })(n2, e2, r2);
      var i2 = e2[r2];
      return n2.R || !t(i2) ? i2 : i2 === A(n2.u, r2) ? (R(n2), n2.i[r2] = k(n2.A.h, i2, n2)) : i2;
    }, has: function(n2, r2) {
      return r2 in s(n2);
    }, ownKeys: function(n2) {
      return Reflect.ownKeys(s(n2));
    }, set: function(n2, r2, t2) {
      var e2 = z(s(n2), r2);
      if (null == e2 ? void 0 : e2.set) return e2.set.call(n2.k, t2), true;
      if (!n2.g) {
        var i2 = A(s(n2), r2), o2 = null == i2 ? void 0 : i2[H];
        if (o2 && o2.u === t2) return n2.i[r2] = t2, n2.N[r2] = false, true;
        if (a(t2, i2) && (void 0 !== t2 || u(n2.u, r2))) return true;
        R(n2), E(n2);
      }
      return n2.i[r2] === t2 && (void 0 !== t2 || r2 in n2.i) || Number.isNaN(t2) && Number.isNaN(n2.i[r2]) || (n2.i[r2] = t2, n2.N[r2] = true), true;
    }, deleteProperty: function(n2, r2) {
      return void 0 !== A(n2.u, r2) || r2 in n2.u ? (n2.N[r2] = false, R(n2), E(n2)) : delete n2.N[r2], n2.i && delete n2.i[r2], true;
    }, getOwnPropertyDescriptor: function(n2, r2) {
      var t2 = s(n2), e2 = Reflect.getOwnPropertyDescriptor(t2, r2);
      return e2 ? { writable: true, configurable: 1 !== n2.t || "length" !== r2, enumerable: e2.enumerable, value: t2[r2] } : e2;
    }, defineProperty: function() {
      n(11);
    }, getPrototypeOf: function(n2) {
      return Object.getPrototypeOf(n2.u);
    }, setPrototypeOf: function() {
      n(12);
    } };
    var Z = {};
    e(Y, (function(n2, r2) {
      Z[n2] = function() {
        return arguments[0] = arguments[0][0], r2.apply(this, arguments);
      };
    })), Z.deleteProperty = function(n2, r2) {
      return Z.set.call(this, n2, r2, void 0);
    }, Z.set = function(n2, r2, t2) {
      return Y.set.call(this, n2[0], r2, t2, n2[0]);
    };
    var nn = (function() {
      function e2(r2) {
        var e3 = this;
        this.S = q, this.D = true, this.produce = function(r3, i3, u2) {
          if ("function" == typeof r3 && "function" != typeof i3) {
            var o2 = i3;
            i3 = r3;
            var f2 = e3;
            return function(n2) {
              var r4 = this;
              void 0 === n2 && (n2 = o2);
              for (var t2 = arguments.length, e4 = Array(t2 > 1 ? t2 - 1 : 0), u3 = 1; u3 < t2; u3++) e4[u3 - 1] = arguments[u3];
              return f2.produce(n2, (function(n3) {
                var t3;
                return (t3 = i3).call.apply(t3, [r4, n3].concat(e4));
              }));
            };
          }
          var a2;
          if ("function" != typeof i3 && n(6), void 0 !== u2 && "function" != typeof u2 && n(7), t(r3)) {
            var c2 = x(e3), v2 = k(e3, r3, void 0), s2 = true;
            try {
              a2 = i3(v2), s2 = false;
            } finally {
              s2 ? j(c2) : O(c2);
            }
            return "undefined" != typeof Promise && a2 instanceof Promise ? a2.then((function(n2) {
              return m(c2, u2), S(n2, c2);
            }), (function(n2) {
              throw j(c2), n2;
            })) : (m(c2, u2), S(a2, c2));
          }
          if (!r3 || "object" != typeof r3) {
            if (void 0 === (a2 = i3(r3)) && (a2 = r3), a2 === B && (a2 = void 0), e3.D && l(a2, true), u2) {
              var p2 = [], d2 = [];
              y("Patches").M(r3, a2, p2, d2), u2(p2, d2);
            }
            return a2;
          }
          n(21, r3);
        }, this.produceWithPatches = function(n2, r3) {
          if ("function" == typeof n2) return function(r4) {
            for (var t3 = arguments.length, i4 = Array(t3 > 1 ? t3 - 1 : 0), u3 = 1; u3 < t3; u3++) i4[u3 - 1] = arguments[u3];
            return e3.produceWithPatches(r4, (function(r5) {
              return n2.apply(void 0, [r5].concat(i4));
            }));
          };
          var t2, i3, u2 = e3.produce(n2, r3, (function(n3, r4) {
            t2 = n3, i3 = r4;
          }));
          return "undefined" != typeof Promise && u2 instanceof Promise ? u2.then((function(n3) {
            return [n3, t2, i3];
          })) : [u2, t2, i3];
        }, "boolean" == typeof (null == r2 ? void 0 : r2.useProxies) && this.setUseProxies(r2.useProxies), "boolean" == typeof (null == r2 ? void 0 : r2.autoFreeze) && this.setAutoFreeze(r2.autoFreeze);
      }
      var i2 = e2.prototype;
      return i2.createDraft = function(e3) {
        t(e3) || n(8), r(e3) && (e3 = F(e3));
        var i3 = x(this), u2 = k(this, e3, void 0);
        return u2[H].C = true, O(i3), u2;
      }, i2.finishDraft = function(n2, r2) {
        var t2 = (n2 && n2[H]).A;
        return m(t2, r2), S(void 0, t2);
      }, i2.setAutoFreeze = function(n2) {
        this.D = n2;
      }, i2.setUseProxies = function(r2) {
        r2 && !q && n(20), this.S = r2;
      }, i2.applyPatches = function(n2, t2) {
        var e3;
        for (e3 = t2.length - 1; e3 >= 0; e3--) {
          var i3 = t2[e3];
          if (0 === i3.path.length && "replace" === i3.op) {
            n2 = i3.value;
            break;
          }
        }
        e3 > -1 && (t2 = t2.slice(e3 + 1));
        var u2 = y("Patches").W;
        return r(n2) ? u2(n2, t2) : this.produce(n2, (function(n3) {
          return u2(n3, t2);
        }));
      }, e2;
    })();
    var rn = new nn();
    var tn = rn.produce;
    var en = rn.produceWithPatches.bind(rn);
    var un = rn.setAutoFreeze.bind(rn);
    var on = rn.setUseProxies.bind(rn);
    var fn = rn.applyPatches.bind(rn);
    var an = rn.createDraft.bind(rn);
    var cn = rn.finishDraft.bind(rn);
    exports2.Immer = nn, exports2.applyPatches = fn, exports2.castDraft = function(n2) {
      return n2;
    }, exports2.castImmutable = function(n2) {
      return n2;
    }, exports2.createDraft = an, exports2.current = F, exports2.default = tn, exports2.enableAllPlugins = function() {
      D(), $(), K();
    }, exports2.enableES5 = D, exports2.enableMapSet = $, exports2.enablePatches = K, exports2.finishDraft = cn, exports2.freeze = l, exports2.immerable = G, exports2.isDraft = r, exports2.isDraftable = t, exports2.nothing = B, exports2.original = function(t2) {
      return r(t2) || n(23, t2), t2[H].u;
    }, exports2.produce = tn, exports2.produceWithPatches = en, exports2.setAutoFreeze = un, exports2.setUseProxies = on;
  }
});

// node_modules/immer/dist/immer.cjs.development.js
var require_immer_cjs_development = __commonJS({
  "node_modules/immer/dist/immer.cjs.development.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var _ref;
    var hasSymbol = typeof Symbol !== "undefined" && typeof /* @__PURE__ */ Symbol("x") === "symbol";
    var hasMap = typeof Map !== "undefined";
    var hasSet = typeof Set !== "undefined";
    var hasProxies = typeof Proxy !== "undefined" && typeof Proxy.revocable !== "undefined" && typeof Reflect !== "undefined";
    var NOTHING = hasSymbol ? /* @__PURE__ */ Symbol.for("immer-nothing") : (_ref = {}, _ref["immer-nothing"] = true, _ref);
    var DRAFTABLE = hasSymbol ? /* @__PURE__ */ Symbol.for("immer-draftable") : "__$immer_draftable";
    var DRAFT_STATE = hasSymbol ? /* @__PURE__ */ Symbol.for("immer-state") : "__$immer_state";
    var iteratorSymbol = typeof Symbol != "undefined" && Symbol.iterator || "@@iterator";
    var errors = {
      0: "Illegal state",
      1: "Immer drafts cannot have computed properties",
      2: "This object has been frozen and should not be mutated",
      3: function _(data) {
        return "Cannot use a proxy that has been revoked. Did you pass an object from inside an immer function to an async process? " + data;
      },
      4: "An immer producer returned a new value *and* modified its draft. Either return a new value *or* modify the draft.",
      5: "Immer forbids circular references",
      6: "The first or second argument to `produce` must be a function",
      7: "The third argument to `produce` must be a function or undefined",
      8: "First argument to `createDraft` must be a plain object, an array, or an immerable object",
      9: "First argument to `finishDraft` must be a draft returned by `createDraft`",
      10: "The given draft is already finalized",
      11: "Object.defineProperty() cannot be used on an Immer draft",
      12: "Object.setPrototypeOf() cannot be used on an Immer draft",
      13: "Immer only supports deleting array indices",
      14: "Immer only supports setting array indices and the 'length' property",
      15: function _(path) {
        return "Cannot apply patch, path doesn't resolve: " + path;
      },
      16: 'Sets cannot have "replace" patches.',
      17: function _(op) {
        return "Unsupported patch operation: " + op;
      },
      18: function _(plugin) {
        return "The plugin for '" + plugin + "' has not been loaded into Immer. To enable the plugin, import and call `enable" + plugin + "()` when initializing your application.";
      },
      20: "Cannot use proxies if Proxy, Proxy.revocable or Reflect are not available",
      21: function _(thing) {
        return "produce can only be called on things that are draftable: plain objects, arrays, Map, Set or classes that are marked with '[immerable]: true'. Got '" + thing + "'";
      },
      22: function _(thing) {
        return "'current' expects a draft, got: " + thing;
      },
      23: function _(thing) {
        return "'original' expects a draft, got: " + thing;
      },
      24: "Patching reserved attributes like __proto__, prototype and constructor is not allowed"
    };
    function die(error) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      {
        var e = errors[error];
        var msg = !e ? "unknown error nr: " + error : typeof e === "function" ? e.apply(null, args) : e;
        throw new Error("[Immer] " + msg);
      }
    }
    function isDraft(value) {
      return !!value && !!value[DRAFT_STATE];
    }
    function isDraftable(value) {
      var _value$constructor;
      if (!value) return false;
      return isPlainObject(value) || Array.isArray(value) || !!value[DRAFTABLE] || !!((_value$constructor = value.constructor) === null || _value$constructor === void 0 ? void 0 : _value$constructor[DRAFTABLE]) || isMap(value) || isSet(value);
    }
    var objectCtorString = /* @__PURE__ */ Object.prototype.constructor.toString();
    function isPlainObject(value) {
      if (!value || typeof value !== "object") return false;
      var proto = Object.getPrototypeOf(value);
      if (proto === null) {
        return true;
      }
      var Ctor = Object.hasOwnProperty.call(proto, "constructor") && proto.constructor;
      if (Ctor === Object) return true;
      return typeof Ctor == "function" && Function.toString.call(Ctor) === objectCtorString;
    }
    function original(value) {
      if (!isDraft(value)) die(23, value);
      return value[DRAFT_STATE].base_;
    }
    var ownKeys = typeof Reflect !== "undefined" && Reflect.ownKeys ? Reflect.ownKeys : typeof Object.getOwnPropertySymbols !== "undefined" ? function(obj) {
      return Object.getOwnPropertyNames(obj).concat(Object.getOwnPropertySymbols(obj));
    } : (
      /* istanbul ignore next */
      Object.getOwnPropertyNames
    );
    var getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors || function getOwnPropertyDescriptors2(target) {
      var res = {};
      ownKeys(target).forEach(function(key) {
        res[key] = Object.getOwnPropertyDescriptor(target, key);
      });
      return res;
    };
    function each(obj, iter, enumerableOnly) {
      if (enumerableOnly === void 0) {
        enumerableOnly = false;
      }
      if (getArchtype(obj) === 0) {
        (enumerableOnly ? Object.keys : ownKeys)(obj).forEach(function(key) {
          if (!enumerableOnly || typeof key !== "symbol") iter(key, obj[key], obj);
        });
      } else {
        obj.forEach(function(entry, index) {
          return iter(index, entry, obj);
        });
      }
    }
    function getArchtype(thing) {
      var state = thing[DRAFT_STATE];
      return state ? state.type_ > 3 ? state.type_ - 4 : state.type_ : Array.isArray(thing) ? 1 : isMap(thing) ? 2 : isSet(thing) ? 3 : 0;
    }
    function has(thing, prop) {
      return getArchtype(thing) === 2 ? thing.has(prop) : Object.prototype.hasOwnProperty.call(thing, prop);
    }
    function get(thing, prop) {
      return getArchtype(thing) === 2 ? thing.get(prop) : thing[prop];
    }
    function set(thing, propOrOldValue, value) {
      var t = getArchtype(thing);
      if (t === 2) thing.set(propOrOldValue, value);
      else if (t === 3) {
        thing.add(value);
      } else thing[propOrOldValue] = value;
    }
    function is(x, y) {
      if (x === y) {
        return x !== 0 || 1 / x === 1 / y;
      } else {
        return x !== x && y !== y;
      }
    }
    function isMap(target) {
      return hasMap && target instanceof Map;
    }
    function isSet(target) {
      return hasSet && target instanceof Set;
    }
    function latest(state) {
      return state.copy_ || state.base_;
    }
    function shallowCopy(base) {
      if (Array.isArray(base)) return Array.prototype.slice.call(base);
      var descriptors = getOwnPropertyDescriptors(base);
      delete descriptors[DRAFT_STATE];
      var keys = ownKeys(descriptors);
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var desc = descriptors[key];
        if (desc.writable === false) {
          desc.writable = true;
          desc.configurable = true;
        }
        if (desc.get || desc.set) descriptors[key] = {
          configurable: true,
          writable: true,
          enumerable: desc.enumerable,
          value: base[key]
        };
      }
      return Object.create(Object.getPrototypeOf(base), descriptors);
    }
    function freeze(obj, deep) {
      if (deep === void 0) {
        deep = false;
      }
      if (isFrozen(obj) || isDraft(obj) || !isDraftable(obj)) return obj;
      if (getArchtype(obj) > 1) {
        obj.set = obj.add = obj.clear = obj.delete = dontMutateFrozenCollections;
      }
      Object.freeze(obj);
      if (deep) each(obj, function(key, value) {
        return freeze(value, true);
      }, true);
      return obj;
    }
    function dontMutateFrozenCollections() {
      die(2);
    }
    function isFrozen(obj) {
      if (obj == null || typeof obj !== "object") return true;
      return Object.isFrozen(obj);
    }
    var plugins = {};
    function getPlugin(pluginKey) {
      var plugin = plugins[pluginKey];
      if (!plugin) {
        die(18, pluginKey);
      }
      return plugin;
    }
    function loadPlugin(pluginKey, implementation) {
      if (!plugins[pluginKey]) plugins[pluginKey] = implementation;
    }
    var currentScope;
    function getCurrentScope() {
      if (!currentScope) die(0);
      return currentScope;
    }
    function createScope(parent_, immer_) {
      return {
        drafts_: [],
        parent_,
        immer_,
        // Whenever the modified draft contains a draft from another scope, we
        // need to prevent auto-freezing so the unowned draft can be finalized.
        canAutoFreeze_: true,
        unfinalizedDrafts_: 0
      };
    }
    function usePatchesInScope(scope, patchListener) {
      if (patchListener) {
        getPlugin("Patches");
        scope.patches_ = [];
        scope.inversePatches_ = [];
        scope.patchListener_ = patchListener;
      }
    }
    function revokeScope(scope) {
      leaveScope(scope);
      scope.drafts_.forEach(revokeDraft);
      scope.drafts_ = null;
    }
    function leaveScope(scope) {
      if (scope === currentScope) {
        currentScope = scope.parent_;
      }
    }
    function enterScope(immer2) {
      return currentScope = createScope(currentScope, immer2);
    }
    function revokeDraft(draft) {
      var state = draft[DRAFT_STATE];
      if (state.type_ === 0 || state.type_ === 1) state.revoke_();
      else state.revoked_ = true;
    }
    function processResult(result, scope) {
      scope.unfinalizedDrafts_ = scope.drafts_.length;
      var baseDraft = scope.drafts_[0];
      var isReplaced = result !== void 0 && result !== baseDraft;
      if (!scope.immer_.useProxies_) getPlugin("ES5").willFinalizeES5_(scope, result, isReplaced);
      if (isReplaced) {
        if (baseDraft[DRAFT_STATE].modified_) {
          revokeScope(scope);
          die(4);
        }
        if (isDraftable(result)) {
          result = finalize(scope, result);
          if (!scope.parent_) maybeFreeze(scope, result);
        }
        if (scope.patches_) {
          getPlugin("Patches").generateReplacementPatches_(baseDraft[DRAFT_STATE].base_, result, scope.patches_, scope.inversePatches_);
        }
      } else {
        result = finalize(scope, baseDraft, []);
      }
      revokeScope(scope);
      if (scope.patches_) {
        scope.patchListener_(scope.patches_, scope.inversePatches_);
      }
      return result !== NOTHING ? result : void 0;
    }
    function finalize(rootScope, value, path) {
      if (isFrozen(value)) return value;
      var state = value[DRAFT_STATE];
      if (!state) {
        each(
          value,
          function(key, childValue) {
            return finalizeProperty(rootScope, state, value, key, childValue, path);
          },
          true
          // See #590, don't recurse into non-enumerable of non drafted objects
        );
        return value;
      }
      if (state.scope_ !== rootScope) return value;
      if (!state.modified_) {
        maybeFreeze(rootScope, state.base_, true);
        return state.base_;
      }
      if (!state.finalized_) {
        state.finalized_ = true;
        state.scope_.unfinalizedDrafts_--;
        var result = (
          // For ES5, create a good copy from the draft first, with added keys and without deleted keys.
          state.type_ === 4 || state.type_ === 5 ? state.copy_ = shallowCopy(state.draft_) : state.copy_
        );
        var resultEach = result;
        var isSet2 = false;
        if (state.type_ === 3) {
          resultEach = new Set(result);
          result.clear();
          isSet2 = true;
        }
        each(resultEach, function(key, childValue) {
          return finalizeProperty(rootScope, state, result, key, childValue, path, isSet2);
        });
        maybeFreeze(rootScope, result, false);
        if (path && rootScope.patches_) {
          getPlugin("Patches").generatePatches_(state, path, rootScope.patches_, rootScope.inversePatches_);
        }
      }
      return state.copy_;
    }
    function finalizeProperty(rootScope, parentState, targetObject, prop, childValue, rootPath, targetIsSet) {
      if (childValue === targetObject) die(5);
      if (isDraft(childValue)) {
        var path = rootPath && parentState && parentState.type_ !== 3 && // Set objects are atomic since they have no keys.
        !has(parentState.assigned_, prop) ? rootPath.concat(prop) : void 0;
        var res = finalize(rootScope, childValue, path);
        set(targetObject, prop, res);
        if (isDraft(res)) {
          rootScope.canAutoFreeze_ = false;
        } else return;
      } else if (targetIsSet) {
        targetObject.add(childValue);
      }
      if (isDraftable(childValue) && !isFrozen(childValue)) {
        if (!rootScope.immer_.autoFreeze_ && rootScope.unfinalizedDrafts_ < 1) {
          return;
        }
        finalize(rootScope, childValue);
        if (!parentState || !parentState.scope_.parent_) maybeFreeze(rootScope, childValue);
      }
    }
    function maybeFreeze(scope, value, deep) {
      if (deep === void 0) {
        deep = false;
      }
      if (!scope.parent_ && scope.immer_.autoFreeze_ && scope.canAutoFreeze_) {
        freeze(value, deep);
      }
    }
    function createProxyProxy(base, parent) {
      var isArray = Array.isArray(base);
      var state = {
        type_: isArray ? 1 : 0,
        // Track which produce call this is associated with.
        scope_: parent ? parent.scope_ : getCurrentScope(),
        // True for both shallow and deep changes.
        modified_: false,
        // Used during finalization.
        finalized_: false,
        // Track which properties have been assigned (true) or deleted (false).
        assigned_: {},
        // The parent draft state.
        parent_: parent,
        // The base state.
        base_: base,
        // The base proxy.
        draft_: null,
        // The base copy with any updated values.
        copy_: null,
        // Called by the `produce` function.
        revoke_: null,
        isManual_: false
      };
      var target = state;
      var traps = objectTraps;
      if (isArray) {
        target = [state];
        traps = arrayTraps;
      }
      var _Proxy$revocable = Proxy.revocable(target, traps), revoke = _Proxy$revocable.revoke, proxy = _Proxy$revocable.proxy;
      state.draft_ = proxy;
      state.revoke_ = revoke;
      return proxy;
    }
    var objectTraps = {
      get: function get2(state, prop) {
        if (prop === DRAFT_STATE) return state;
        var source = latest(state);
        if (!has(source, prop)) {
          return readPropFromProto(state, source, prop);
        }
        var value = source[prop];
        if (state.finalized_ || !isDraftable(value)) {
          return value;
        }
        if (value === peek(state.base_, prop)) {
          prepareCopy(state);
          return state.copy_[prop] = createProxy(state.scope_.immer_, value, state);
        }
        return value;
      },
      has: function has2(state, prop) {
        return prop in latest(state);
      },
      ownKeys: function ownKeys2(state) {
        return Reflect.ownKeys(latest(state));
      },
      set: function set2(state, prop, value) {
        var desc = getDescriptorFromProto(latest(state), prop);
        if (desc === null || desc === void 0 ? void 0 : desc.set) {
          desc.set.call(state.draft_, value);
          return true;
        }
        if (!state.modified_) {
          var current2 = peek(latest(state), prop);
          var currentState = current2 === null || current2 === void 0 ? void 0 : current2[DRAFT_STATE];
          if (currentState && currentState.base_ === value) {
            state.copy_[prop] = value;
            state.assigned_[prop] = false;
            return true;
          }
          if (is(value, current2) && (value !== void 0 || has(state.base_, prop))) return true;
          prepareCopy(state);
          markChanged(state);
        }
        if (state.copy_[prop] === value && // special case: handle new props with value 'undefined'
        (value !== void 0 || prop in state.copy_) || // special case: NaN
        Number.isNaN(value) && Number.isNaN(state.copy_[prop])) return true;
        state.copy_[prop] = value;
        state.assigned_[prop] = true;
        return true;
      },
      deleteProperty: function deleteProperty(state, prop) {
        if (peek(state.base_, prop) !== void 0 || prop in state.base_) {
          state.assigned_[prop] = false;
          prepareCopy(state);
          markChanged(state);
        } else {
          delete state.assigned_[prop];
        }
        if (state.copy_) delete state.copy_[prop];
        return true;
      },
      // Note: We never coerce `desc.value` into an Immer draft, because we can't make
      // the same guarantee in ES5 mode.
      getOwnPropertyDescriptor: function getOwnPropertyDescriptor(state, prop) {
        var owner = latest(state);
        var desc = Reflect.getOwnPropertyDescriptor(owner, prop);
        if (!desc) return desc;
        return {
          writable: true,
          configurable: state.type_ !== 1 || prop !== "length",
          enumerable: desc.enumerable,
          value: owner[prop]
        };
      },
      defineProperty: function defineProperty() {
        die(11);
      },
      getPrototypeOf: function getPrototypeOf(state) {
        return Object.getPrototypeOf(state.base_);
      },
      setPrototypeOf: function setPrototypeOf() {
        die(12);
      }
    };
    var arrayTraps = {};
    each(objectTraps, function(key, fn) {
      arrayTraps[key] = function() {
        arguments[0] = arguments[0][0];
        return fn.apply(this, arguments);
      };
    });
    arrayTraps.deleteProperty = function(state, prop) {
      if (isNaN(parseInt(prop))) die(13);
      return arrayTraps.set.call(this, state, prop, void 0);
    };
    arrayTraps.set = function(state, prop, value) {
      if (prop !== "length" && isNaN(parseInt(prop))) die(14);
      return objectTraps.set.call(this, state[0], prop, value, state[0]);
    };
    function peek(draft, prop) {
      var state = draft[DRAFT_STATE];
      var source = state ? latest(state) : draft;
      return source[prop];
    }
    function readPropFromProto(state, source, prop) {
      var _desc$get;
      var desc = getDescriptorFromProto(source, prop);
      return desc ? "value" in desc ? desc.value : (
        // This is a very special case, if the prop is a getter defined by the
        // prototype, we should invoke it with the draft as context!
        (_desc$get = desc.get) === null || _desc$get === void 0 ? void 0 : _desc$get.call(state.draft_)
      ) : void 0;
    }
    function getDescriptorFromProto(source, prop) {
      if (!(prop in source)) return void 0;
      var proto = Object.getPrototypeOf(source);
      while (proto) {
        var desc = Object.getOwnPropertyDescriptor(proto, prop);
        if (desc) return desc;
        proto = Object.getPrototypeOf(proto);
      }
      return void 0;
    }
    function markChanged(state) {
      if (!state.modified_) {
        state.modified_ = true;
        if (state.parent_) {
          markChanged(state.parent_);
        }
      }
    }
    function prepareCopy(state) {
      if (!state.copy_) {
        state.copy_ = shallowCopy(state.base_);
      }
    }
    var Immer = /* @__PURE__ */ (function() {
      function Immer2(config) {
        var _this = this;
        this.useProxies_ = hasProxies;
        this.autoFreeze_ = true;
        this.produce = function(base, recipe, patchListener) {
          if (typeof base === "function" && typeof recipe !== "function") {
            var defaultBase = recipe;
            recipe = base;
            var self = _this;
            return function curriedProduce(base2) {
              var _this2 = this;
              if (base2 === void 0) {
                base2 = defaultBase;
              }
              for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
              }
              return self.produce(base2, function(draft) {
                var _recipe;
                return (_recipe = recipe).call.apply(_recipe, [_this2, draft].concat(args));
              });
            };
          }
          if (typeof recipe !== "function") die(6);
          if (patchListener !== void 0 && typeof patchListener !== "function") die(7);
          var result;
          if (isDraftable(base)) {
            var scope = enterScope(_this);
            var proxy = createProxy(_this, base, void 0);
            var hasError = true;
            try {
              result = recipe(proxy);
              hasError = false;
            } finally {
              if (hasError) revokeScope(scope);
              else leaveScope(scope);
            }
            if (typeof Promise !== "undefined" && result instanceof Promise) {
              return result.then(function(result2) {
                usePatchesInScope(scope, patchListener);
                return processResult(result2, scope);
              }, function(error) {
                revokeScope(scope);
                throw error;
              });
            }
            usePatchesInScope(scope, patchListener);
            return processResult(result, scope);
          } else if (!base || typeof base !== "object") {
            result = recipe(base);
            if (result === void 0) result = base;
            if (result === NOTHING) result = void 0;
            if (_this.autoFreeze_) freeze(result, true);
            if (patchListener) {
              var p = [];
              var ip = [];
              getPlugin("Patches").generateReplacementPatches_(base, result, p, ip);
              patchListener(p, ip);
            }
            return result;
          } else die(21, base);
        };
        this.produceWithPatches = function(base, recipe) {
          if (typeof base === "function") {
            return function(state) {
              for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                args[_key2 - 1] = arguments[_key2];
              }
              return _this.produceWithPatches(state, function(draft) {
                return base.apply(void 0, [draft].concat(args));
              });
            };
          }
          var patches, inversePatches;
          var result = _this.produce(base, recipe, function(p, ip) {
            patches = p;
            inversePatches = ip;
          });
          if (typeof Promise !== "undefined" && result instanceof Promise) {
            return result.then(function(nextState) {
              return [nextState, patches, inversePatches];
            });
          }
          return [result, patches, inversePatches];
        };
        if (typeof (config === null || config === void 0 ? void 0 : config.useProxies) === "boolean") this.setUseProxies(config.useProxies);
        if (typeof (config === null || config === void 0 ? void 0 : config.autoFreeze) === "boolean") this.setAutoFreeze(config.autoFreeze);
      }
      var _proto = Immer2.prototype;
      _proto.createDraft = function createDraft2(base) {
        if (!isDraftable(base)) die(8);
        if (isDraft(base)) base = current(base);
        var scope = enterScope(this);
        var proxy = createProxy(this, base, void 0);
        proxy[DRAFT_STATE].isManual_ = true;
        leaveScope(scope);
        return proxy;
      };
      _proto.finishDraft = function finishDraft2(draft, patchListener) {
        var state = draft && draft[DRAFT_STATE];
        {
          if (!state || !state.isManual_) die(9);
          if (state.finalized_) die(10);
        }
        var scope = state.scope_;
        usePatchesInScope(scope, patchListener);
        return processResult(void 0, scope);
      };
      _proto.setAutoFreeze = function setAutoFreeze2(value) {
        this.autoFreeze_ = value;
      };
      _proto.setUseProxies = function setUseProxies2(value) {
        if (value && !hasProxies) {
          die(20);
        }
        this.useProxies_ = value;
      };
      _proto.applyPatches = function applyPatches2(base, patches) {
        var i;
        for (i = patches.length - 1; i >= 0; i--) {
          var patch = patches[i];
          if (patch.path.length === 0 && patch.op === "replace") {
            base = patch.value;
            break;
          }
        }
        if (i > -1) {
          patches = patches.slice(i + 1);
        }
        var applyPatchesImpl = getPlugin("Patches").applyPatches_;
        if (isDraft(base)) {
          return applyPatchesImpl(base, patches);
        }
        return this.produce(base, function(draft) {
          return applyPatchesImpl(draft, patches);
        });
      };
      return Immer2;
    })();
    function createProxy(immer2, value, parent) {
      var draft = isMap(value) ? getPlugin("MapSet").proxyMap_(value, parent) : isSet(value) ? getPlugin("MapSet").proxySet_(value, parent) : immer2.useProxies_ ? createProxyProxy(value, parent) : getPlugin("ES5").createES5Proxy_(value, parent);
      var scope = parent ? parent.scope_ : getCurrentScope();
      scope.drafts_.push(draft);
      return draft;
    }
    function current(value) {
      if (!isDraft(value)) die(22, value);
      return currentImpl(value);
    }
    function currentImpl(value) {
      if (!isDraftable(value)) return value;
      var state = value[DRAFT_STATE];
      var copy;
      var archType = getArchtype(value);
      if (state) {
        if (!state.modified_ && (state.type_ < 4 || !getPlugin("ES5").hasChanges_(state))) return state.base_;
        state.finalized_ = true;
        copy = copyHelper(value, archType);
        state.finalized_ = false;
      } else {
        copy = copyHelper(value, archType);
      }
      each(copy, function(key, childValue) {
        if (state && get(state.base_, key) === childValue) return;
        set(copy, key, currentImpl(childValue));
      });
      return archType === 3 ? new Set(copy) : copy;
    }
    function copyHelper(value, archType) {
      switch (archType) {
        case 2:
          return new Map(value);
        case 3:
          return Array.from(value);
      }
      return shallowCopy(value);
    }
    function enableES5() {
      function willFinalizeES5_(scope, result, isReplaced) {
        if (!isReplaced) {
          if (scope.patches_) {
            markChangesRecursively(scope.drafts_[0]);
          }
          markChangesSweep(scope.drafts_);
        } else if (isDraft(result) && result[DRAFT_STATE].scope_ === scope) {
          markChangesSweep(scope.drafts_);
        }
      }
      function createES5Draft(isArray, base) {
        if (isArray) {
          var draft = new Array(base.length);
          for (var i = 0; i < base.length; i++) {
            Object.defineProperty(draft, "" + i, proxyProperty(i, true));
          }
          return draft;
        } else {
          var _descriptors = getOwnPropertyDescriptors(base);
          delete _descriptors[DRAFT_STATE];
          var keys = ownKeys(_descriptors);
          for (var _i = 0; _i < keys.length; _i++) {
            var key = keys[_i];
            _descriptors[key] = proxyProperty(key, isArray || !!_descriptors[key].enumerable);
          }
          return Object.create(Object.getPrototypeOf(base), _descriptors);
        }
      }
      function createES5Proxy_(base, parent) {
        var isArray = Array.isArray(base);
        var draft = createES5Draft(isArray, base);
        var state = {
          type_: isArray ? 5 : 4,
          scope_: parent ? parent.scope_ : getCurrentScope(),
          modified_: false,
          finalized_: false,
          assigned_: {},
          parent_: parent,
          // base is the object we are drafting
          base_: base,
          // draft is the draft object itself, that traps all reads and reads from either the base (if unmodified) or copy (if modified)
          draft_: draft,
          copy_: null,
          revoked_: false,
          isManual_: false
        };
        Object.defineProperty(draft, DRAFT_STATE, {
          value: state,
          // enumerable: false <- the default
          writable: true
        });
        return draft;
      }
      var descriptors = {};
      function proxyProperty(prop, enumerable) {
        var desc = descriptors[prop];
        if (desc) {
          desc.enumerable = enumerable;
        } else {
          descriptors[prop] = desc = {
            configurable: true,
            enumerable,
            get: function get2() {
              var state = this[DRAFT_STATE];
              assertUnrevoked(state);
              return objectTraps.get(state, prop);
            },
            set: function set2(value) {
              var state = this[DRAFT_STATE];
              assertUnrevoked(state);
              objectTraps.set(state, prop, value);
            }
          };
        }
        return desc;
      }
      function markChangesSweep(drafts) {
        for (var i = drafts.length - 1; i >= 0; i--) {
          var state = drafts[i][DRAFT_STATE];
          if (!state.modified_) {
            switch (state.type_) {
              case 5:
                if (hasArrayChanges(state)) markChanged(state);
                break;
              case 4:
                if (hasObjectChanges(state)) markChanged(state);
                break;
            }
          }
        }
      }
      function markChangesRecursively(object) {
        if (!object || typeof object !== "object") return;
        var state = object[DRAFT_STATE];
        if (!state) return;
        var base_ = state.base_, draft_ = state.draft_, assigned_ = state.assigned_, type_ = state.type_;
        if (type_ === 4) {
          each(draft_, function(key) {
            if (key === DRAFT_STATE) return;
            if (base_[key] === void 0 && !has(base_, key)) {
              assigned_[key] = true;
              markChanged(state);
            } else if (!assigned_[key]) {
              markChangesRecursively(draft_[key]);
            }
          });
          each(base_, function(key) {
            if (draft_[key] === void 0 && !has(draft_, key)) {
              assigned_[key] = false;
              markChanged(state);
            }
          });
        } else if (type_ === 5) {
          if (hasArrayChanges(state)) {
            markChanged(state);
            assigned_.length = true;
          }
          if (draft_.length < base_.length) {
            for (var i = draft_.length; i < base_.length; i++) {
              assigned_[i] = false;
            }
          } else {
            for (var _i2 = base_.length; _i2 < draft_.length; _i2++) {
              assigned_[_i2] = true;
            }
          }
          var min = Math.min(draft_.length, base_.length);
          for (var _i3 = 0; _i3 < min; _i3++) {
            if (!draft_.hasOwnProperty(_i3)) {
              assigned_[_i3] = true;
            }
            if (assigned_[_i3] === void 0) markChangesRecursively(draft_[_i3]);
          }
        }
      }
      function hasObjectChanges(state) {
        var base_ = state.base_, draft_ = state.draft_;
        var keys = ownKeys(draft_);
        for (var i = keys.length - 1; i >= 0; i--) {
          var key = keys[i];
          if (key === DRAFT_STATE) continue;
          var baseValue = base_[key];
          if (baseValue === void 0 && !has(base_, key)) {
            return true;
          } else {
            var value = draft_[key];
            var _state = value && value[DRAFT_STATE];
            if (_state ? _state.base_ !== baseValue : !is(value, baseValue)) {
              return true;
            }
          }
        }
        var baseIsDraft = !!base_[DRAFT_STATE];
        return keys.length !== ownKeys(base_).length + (baseIsDraft ? 0 : 1);
      }
      function hasArrayChanges(state) {
        var draft_ = state.draft_;
        if (draft_.length !== state.base_.length) return true;
        var descriptor = Object.getOwnPropertyDescriptor(draft_, draft_.length - 1);
        if (descriptor && !descriptor.get) return true;
        for (var i = 0; i < draft_.length; i++) {
          if (!draft_.hasOwnProperty(i)) return true;
        }
        return false;
      }
      function hasChanges_(state) {
        return state.type_ === 4 ? hasObjectChanges(state) : hasArrayChanges(state);
      }
      function assertUnrevoked(state) {
        if (state.revoked_) die(3, JSON.stringify(latest(state)));
      }
      loadPlugin("ES5", {
        createES5Proxy_,
        willFinalizeES5_,
        hasChanges_
      });
    }
    function enablePatches() {
      var REPLACE = "replace";
      var ADD = "add";
      var REMOVE = "remove";
      function generatePatches_(state, basePath, patches, inversePatches) {
        switch (state.type_) {
          case 0:
          case 4:
          case 2:
            return generatePatchesFromAssigned(state, basePath, patches, inversePatches);
          case 5:
          case 1:
            return generateArrayPatches(state, basePath, patches, inversePatches);
          case 3:
            return generateSetPatches(state, basePath, patches, inversePatches);
        }
      }
      function generateArrayPatches(state, basePath, patches, inversePatches) {
        var base_ = state.base_, assigned_ = state.assigned_;
        var copy_ = state.copy_;
        if (copy_.length < base_.length) {
          var _ref2 = [copy_, base_];
          base_ = _ref2[0];
          copy_ = _ref2[1];
          var _ref22 = [inversePatches, patches];
          patches = _ref22[0];
          inversePatches = _ref22[1];
        }
        for (var i = 0; i < base_.length; i++) {
          if (assigned_[i] && copy_[i] !== base_[i]) {
            var path = basePath.concat([i]);
            patches.push({
              op: REPLACE,
              path,
              // Need to maybe clone it, as it can in fact be the original value
              // due to the base/copy inversion at the start of this function
              value: clonePatchValueIfNeeded(copy_[i])
            });
            inversePatches.push({
              op: REPLACE,
              path,
              value: clonePatchValueIfNeeded(base_[i])
            });
          }
        }
        for (var _i = base_.length; _i < copy_.length; _i++) {
          var _path = basePath.concat([_i]);
          patches.push({
            op: ADD,
            path: _path,
            // Need to maybe clone it, as it can in fact be the original value
            // due to the base/copy inversion at the start of this function
            value: clonePatchValueIfNeeded(copy_[_i])
          });
        }
        if (base_.length < copy_.length) {
          inversePatches.push({
            op: REPLACE,
            path: basePath.concat(["length"]),
            value: base_.length
          });
        }
      }
      function generatePatchesFromAssigned(state, basePath, patches, inversePatches) {
        var base_ = state.base_, copy_ = state.copy_;
        each(state.assigned_, function(key, assignedValue) {
          var origValue = get(base_, key);
          var value = get(copy_, key);
          var op = !assignedValue ? REMOVE : has(base_, key) ? REPLACE : ADD;
          if (origValue === value && op === REPLACE) return;
          var path = basePath.concat(key);
          patches.push(op === REMOVE ? {
            op,
            path
          } : {
            op,
            path,
            value
          });
          inversePatches.push(op === ADD ? {
            op: REMOVE,
            path
          } : op === REMOVE ? {
            op: ADD,
            path,
            value: clonePatchValueIfNeeded(origValue)
          } : {
            op: REPLACE,
            path,
            value: clonePatchValueIfNeeded(origValue)
          });
        });
      }
      function generateSetPatches(state, basePath, patches, inversePatches) {
        var base_ = state.base_, copy_ = state.copy_;
        var i = 0;
        base_.forEach(function(value) {
          if (!copy_.has(value)) {
            var path = basePath.concat([i]);
            patches.push({
              op: REMOVE,
              path,
              value
            });
            inversePatches.unshift({
              op: ADD,
              path,
              value
            });
          }
          i++;
        });
        i = 0;
        copy_.forEach(function(value) {
          if (!base_.has(value)) {
            var path = basePath.concat([i]);
            patches.push({
              op: ADD,
              path,
              value
            });
            inversePatches.unshift({
              op: REMOVE,
              path,
              value
            });
          }
          i++;
        });
      }
      function generateReplacementPatches_(baseValue, replacement, patches, inversePatches) {
        patches.push({
          op: REPLACE,
          path: [],
          value: replacement === NOTHING ? void 0 : replacement
        });
        inversePatches.push({
          op: REPLACE,
          path: [],
          value: baseValue
        });
      }
      function applyPatches_(draft, patches) {
        patches.forEach(function(patch) {
          var path = patch.path, op = patch.op;
          var base = draft;
          for (var i = 0; i < path.length - 1; i++) {
            var parentType = getArchtype(base);
            var p = path[i];
            if (typeof p !== "string" && typeof p !== "number") {
              p = "" + p;
            }
            if ((parentType === 0 || parentType === 1) && (p === "__proto__" || p === "constructor")) die(24);
            if (typeof base === "function" && p === "prototype") die(24);
            base = get(base, p);
            if (typeof base !== "object") die(15, path.join("/"));
          }
          var type = getArchtype(base);
          var value = deepClonePatchValue(patch.value);
          var key = path[path.length - 1];
          switch (op) {
            case REPLACE:
              switch (type) {
                case 2:
                  return base.set(key, value);
                /* istanbul ignore next */
                case 3:
                  die(16);
                default:
                  return base[key] = value;
              }
            case ADD:
              switch (type) {
                case 1:
                  return key === "-" ? base.push(value) : base.splice(key, 0, value);
                case 2:
                  return base.set(key, value);
                case 3:
                  return base.add(value);
                default:
                  return base[key] = value;
              }
            case REMOVE:
              switch (type) {
                case 1:
                  return base.splice(key, 1);
                case 2:
                  return base.delete(key);
                case 3:
                  return base.delete(patch.value);
                default:
                  return delete base[key];
              }
            default:
              die(17, op);
          }
        });
        return draft;
      }
      function deepClonePatchValue(obj) {
        if (!isDraftable(obj)) return obj;
        if (Array.isArray(obj)) return obj.map(deepClonePatchValue);
        if (isMap(obj)) return new Map(Array.from(obj.entries()).map(function(_ref3) {
          var k = _ref3[0], v = _ref3[1];
          return [k, deepClonePatchValue(v)];
        }));
        if (isSet(obj)) return new Set(Array.from(obj).map(deepClonePatchValue));
        var cloned = Object.create(Object.getPrototypeOf(obj));
        for (var key in obj) {
          cloned[key] = deepClonePatchValue(obj[key]);
        }
        if (has(obj, DRAFTABLE)) cloned[DRAFTABLE] = obj[DRAFTABLE];
        return cloned;
      }
      function clonePatchValueIfNeeded(obj) {
        if (isDraft(obj)) {
          return deepClonePatchValue(obj);
        } else return obj;
      }
      loadPlugin("Patches", {
        applyPatches_,
        generatePatches_,
        generateReplacementPatches_
      });
    }
    function enableMapSet() {
      var _extendStatics = function extendStatics(d, b) {
        _extendStatics = Object.setPrototypeOf || {
          __proto__: []
        } instanceof Array && function(d2, b2) {
          d2.__proto__ = b2;
        } || function(d2, b2) {
          for (var p in b2) {
            if (b2.hasOwnProperty(p)) d2[p] = b2[p];
          }
        };
        return _extendStatics(d, b);
      };
      function __extends(d, b) {
        _extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = // @ts-ignore
        (__.prototype = b.prototype, new __());
      }
      var DraftMap = (function(_super) {
        __extends(DraftMap2, _super);
        function DraftMap2(target, parent) {
          this[DRAFT_STATE] = {
            type_: 2,
            parent_: parent,
            scope_: parent ? parent.scope_ : getCurrentScope(),
            modified_: false,
            finalized_: false,
            copy_: void 0,
            assigned_: void 0,
            base_: target,
            draft_: this,
            isManual_: false,
            revoked_: false
          };
          return this;
        }
        var p = DraftMap2.prototype;
        Object.defineProperty(p, "size", {
          get: function get2() {
            return latest(this[DRAFT_STATE]).size;
          }
          // enumerable: false,
          // configurable: true
        });
        p.has = function(key) {
          return latest(this[DRAFT_STATE]).has(key);
        };
        p.set = function(key, value) {
          var state = this[DRAFT_STATE];
          assertUnrevoked(state);
          if (!latest(state).has(key) || latest(state).get(key) !== value) {
            prepareMapCopy(state);
            markChanged(state);
            state.assigned_.set(key, true);
            state.copy_.set(key, value);
            state.assigned_.set(key, true);
          }
          return this;
        };
        p.delete = function(key) {
          if (!this.has(key)) {
            return false;
          }
          var state = this[DRAFT_STATE];
          assertUnrevoked(state);
          prepareMapCopy(state);
          markChanged(state);
          if (state.base_.has(key)) {
            state.assigned_.set(key, false);
          } else {
            state.assigned_.delete(key);
          }
          state.copy_.delete(key);
          return true;
        };
        p.clear = function() {
          var state = this[DRAFT_STATE];
          assertUnrevoked(state);
          if (latest(state).size) {
            prepareMapCopy(state);
            markChanged(state);
            state.assigned_ = /* @__PURE__ */ new Map();
            each(state.base_, function(key) {
              state.assigned_.set(key, false);
            });
            state.copy_.clear();
          }
        };
        p.forEach = function(cb, thisArg) {
          var _this = this;
          var state = this[DRAFT_STATE];
          latest(state).forEach(function(_value, key, _map) {
            cb.call(thisArg, _this.get(key), key, _this);
          });
        };
        p.get = function(key) {
          var state = this[DRAFT_STATE];
          assertUnrevoked(state);
          var value = latest(state).get(key);
          if (state.finalized_ || !isDraftable(value)) {
            return value;
          }
          if (value !== state.base_.get(key)) {
            return value;
          }
          var draft = createProxy(state.scope_.immer_, value, state);
          prepareMapCopy(state);
          state.copy_.set(key, draft);
          return draft;
        };
        p.keys = function() {
          return latest(this[DRAFT_STATE]).keys();
        };
        p.values = function() {
          var _this2 = this, _ref2;
          var iterator = this.keys();
          return _ref2 = {}, _ref2[iteratorSymbol] = function() {
            return _this2.values();
          }, _ref2.next = function next() {
            var r = iterator.next();
            if (r.done) return r;
            var value = _this2.get(r.value);
            return {
              done: false,
              value
            };
          }, _ref2;
        };
        p.entries = function() {
          var _this3 = this, _ref2;
          var iterator = this.keys();
          return _ref2 = {}, _ref2[iteratorSymbol] = function() {
            return _this3.entries();
          }, _ref2.next = function next() {
            var r = iterator.next();
            if (r.done) return r;
            var value = _this3.get(r.value);
            return {
              done: false,
              value: [r.value, value]
            };
          }, _ref2;
        };
        p[iteratorSymbol] = function() {
          return this.entries();
        };
        return DraftMap2;
      })(Map);
      function proxyMap_(target, parent) {
        return new DraftMap(target, parent);
      }
      function prepareMapCopy(state) {
        if (!state.copy_) {
          state.assigned_ = /* @__PURE__ */ new Map();
          state.copy_ = new Map(state.base_);
        }
      }
      var DraftSet = (function(_super) {
        __extends(DraftSet2, _super);
        function DraftSet2(target, parent) {
          this[DRAFT_STATE] = {
            type_: 3,
            parent_: parent,
            scope_: parent ? parent.scope_ : getCurrentScope(),
            modified_: false,
            finalized_: false,
            copy_: void 0,
            base_: target,
            draft_: this,
            drafts_: /* @__PURE__ */ new Map(),
            revoked_: false,
            isManual_: false
          };
          return this;
        }
        var p = DraftSet2.prototype;
        Object.defineProperty(p, "size", {
          get: function get2() {
            return latest(this[DRAFT_STATE]).size;
          }
          // enumerable: true,
        });
        p.has = function(value) {
          var state = this[DRAFT_STATE];
          assertUnrevoked(state);
          if (!state.copy_) {
            return state.base_.has(value);
          }
          if (state.copy_.has(value)) return true;
          if (state.drafts_.has(value) && state.copy_.has(state.drafts_.get(value))) return true;
          return false;
        };
        p.add = function(value) {
          var state = this[DRAFT_STATE];
          assertUnrevoked(state);
          if (!this.has(value)) {
            prepareSetCopy(state);
            markChanged(state);
            state.copy_.add(value);
          }
          return this;
        };
        p.delete = function(value) {
          if (!this.has(value)) {
            return false;
          }
          var state = this[DRAFT_STATE];
          assertUnrevoked(state);
          prepareSetCopy(state);
          markChanged(state);
          return state.copy_.delete(value) || (state.drafts_.has(value) ? state.copy_.delete(state.drafts_.get(value)) : (
            /* istanbul ignore next */
            false
          ));
        };
        p.clear = function() {
          var state = this[DRAFT_STATE];
          assertUnrevoked(state);
          if (latest(state).size) {
            prepareSetCopy(state);
            markChanged(state);
            state.copy_.clear();
          }
        };
        p.values = function() {
          var state = this[DRAFT_STATE];
          assertUnrevoked(state);
          prepareSetCopy(state);
          return state.copy_.values();
        };
        p.entries = function entries() {
          var state = this[DRAFT_STATE];
          assertUnrevoked(state);
          prepareSetCopy(state);
          return state.copy_.entries();
        };
        p.keys = function() {
          return this.values();
        };
        p[iteratorSymbol] = function() {
          return this.values();
        };
        p.forEach = function forEach(cb, thisArg) {
          var iterator = this.values();
          var result = iterator.next();
          while (!result.done) {
            cb.call(thisArg, result.value, result.value, this);
            result = iterator.next();
          }
        };
        return DraftSet2;
      })(Set);
      function proxySet_(target, parent) {
        return new DraftSet(target, parent);
      }
      function prepareSetCopy(state) {
        if (!state.copy_) {
          state.copy_ = /* @__PURE__ */ new Set();
          state.base_.forEach(function(value) {
            if (isDraftable(value)) {
              var draft = createProxy(state.scope_.immer_, value, state);
              state.drafts_.set(value, draft);
              state.copy_.add(draft);
            } else {
              state.copy_.add(value);
            }
          });
        }
      }
      function assertUnrevoked(state) {
        if (state.revoked_) die(3, JSON.stringify(latest(state)));
      }
      loadPlugin("MapSet", {
        proxyMap_,
        proxySet_
      });
    }
    function enableAllPlugins() {
      enableES5();
      enableMapSet();
      enablePatches();
    }
    var immer = /* @__PURE__ */ new Immer();
    var produce = immer.produce;
    var produceWithPatches = /* @__PURE__ */ immer.produceWithPatches.bind(immer);
    var setAutoFreeze = /* @__PURE__ */ immer.setAutoFreeze.bind(immer);
    var setUseProxies = /* @__PURE__ */ immer.setUseProxies.bind(immer);
    var applyPatches = /* @__PURE__ */ immer.applyPatches.bind(immer);
    var createDraft = /* @__PURE__ */ immer.createDraft.bind(immer);
    var finishDraft = /* @__PURE__ */ immer.finishDraft.bind(immer);
    function castDraft(value) {
      return value;
    }
    function castImmutable(value) {
      return value;
    }
    exports2.Immer = Immer;
    exports2.applyPatches = applyPatches;
    exports2.castDraft = castDraft;
    exports2.castImmutable = castImmutable;
    exports2.createDraft = createDraft;
    exports2.current = current;
    exports2.default = produce;
    exports2.enableAllPlugins = enableAllPlugins;
    exports2.enableES5 = enableES5;
    exports2.enableMapSet = enableMapSet;
    exports2.enablePatches = enablePatches;
    exports2.finishDraft = finishDraft;
    exports2.freeze = freeze;
    exports2.immerable = DRAFTABLE;
    exports2.isDraft = isDraft;
    exports2.isDraftable = isDraftable;
    exports2.nothing = NOTHING;
    exports2.original = original;
    exports2.produce = produce;
    exports2.produceWithPatches = produceWithPatches;
    exports2.setAutoFreeze = setAutoFreeze;
    exports2.setUseProxies = setUseProxies;
  }
});

// node_modules/immer/dist/index.js
var require_dist = __commonJS({
  "node_modules/immer/dist/index.js"(exports2, module2) {
    "use strict";
    if (process.env.NODE_ENV === "production") {
      module2.exports = require_immer_cjs_production_min();
    } else {
      module2.exports = require_immer_cjs_development();
    }
  }
});

// node_modules/boardgame.io/dist/cjs/plugin-random-7425844d.js
var require_plugin_random_7425844d = __commonJS({
  "node_modules/boardgame.io/dist/cjs/plugin-random-7425844d.js"(exports2) {
    "use strict";
    var Alea = class {
      constructor(seed) {
        const mash = Mash();
        this.c = 1;
        this.s0 = mash(" ");
        this.s1 = mash(" ");
        this.s2 = mash(" ");
        this.s0 -= mash(seed);
        if (this.s0 < 0) {
          this.s0 += 1;
        }
        this.s1 -= mash(seed);
        if (this.s1 < 0) {
          this.s1 += 1;
        }
        this.s2 -= mash(seed);
        if (this.s2 < 0) {
          this.s2 += 1;
        }
      }
      next() {
        const t = 2091639 * this.s0 + this.c * 23283064365386963e-26;
        this.s0 = this.s1;
        this.s1 = this.s2;
        return this.s2 = t - (this.c = Math.trunc(t));
      }
    };
    function Mash() {
      let n = 4022871197;
      const mash = function(data) {
        const str = data.toString();
        for (let i = 0; i < str.length; i++) {
          n += str.charCodeAt(i);
          let h = 0.02519603282416938 * n;
          n = h >>> 0;
          h -= n;
          h *= n;
          n = h >>> 0;
          h -= n;
          n += h * 4294967296;
        }
        return (n >>> 0) * 23283064365386963e-26;
      };
      return mash;
    }
    function copy(f, t) {
      t.c = f.c;
      t.s0 = f.s0;
      t.s1 = f.s1;
      t.s2 = f.s2;
      return t;
    }
    function alea(seed, state) {
      const xg = new Alea(seed);
      const prng = xg.next.bind(xg);
      if (state)
        copy(state, xg);
      prng.state = () => copy(xg, {});
      return prng;
    }
    var Random = class {
      /**
       * constructor
       * @param {object} ctx - The ctx object to initialize from.
       */
      constructor(state) {
        this.state = state || { seed: "0" };
        this.used = false;
      }
      /**
       * Generates a new seed from the current date / time.
       */
      static seed() {
        return Date.now().toString(36).slice(-10);
      }
      isUsed() {
        return this.used;
      }
      getState() {
        return this.state;
      }
      /**
       * Generate a random number.
       */
      _random() {
        this.used = true;
        const R = this.state;
        const seed = R.prngstate ? "" : R.seed;
        const rand = alea(seed, R.prngstate);
        const number = rand();
        this.state = {
          ...R,
          prngstate: rand.state()
        };
        return number;
      }
      api() {
        const random = this._random.bind(this);
        const SpotValue = {
          D4: 4,
          D6: 6,
          D8: 8,
          D10: 10,
          D12: 12,
          D20: 20
        };
        const predefined = {};
        for (const key in SpotValue) {
          const spotvalue = SpotValue[key];
          predefined[key] = (diceCount) => {
            return diceCount === void 0 ? Math.floor(random() * spotvalue) + 1 : Array.from({ length: diceCount }).map(() => Math.floor(random() * spotvalue) + 1);
          };
        }
        function Die(spotvalue = 6, diceCount) {
          return diceCount === void 0 ? Math.floor(random() * spotvalue) + 1 : Array.from({ length: diceCount }).map(() => Math.floor(random() * spotvalue) + 1);
        }
        return {
          /**
           * Similar to Die below, but with fixed spot values.
           * Supports passing a diceCount
           *    if not defined, defaults to 1 and returns the value directly.
           *    if defined, returns an array containing the random dice values.
           *
           * D4: (diceCount) => value
           * D6: (diceCount) => value
           * D8: (diceCount) => value
           * D10: (diceCount) => value
           * D12: (diceCount) => value
           * D20: (diceCount) => value
           */
          ...predefined,
          /**
           * Roll a die of specified spot value.
           *
           * @param {number} spotvalue - The die dimension (default: 6).
           * @param {number} diceCount - number of dice to throw.
           *                             if not defined, defaults to 1 and returns the value directly.
           *                             if defined, returns an array containing the random dice values.
           */
          Die,
          /**
           * Generate a random number between 0 and 1.
           */
          Number: () => {
            return random();
          },
          /**
           * Shuffle an array.
           *
           * @param {Array} deck - The array to shuffle. Does not mutate
           *                       the input, but returns the shuffled array.
           */
          Shuffle: (deck) => {
            const clone = [...deck];
            let sourceIndex = deck.length;
            let destinationIndex = 0;
            const shuffled = Array.from({ length: sourceIndex });
            while (sourceIndex) {
              const randomIndex = Math.trunc(sourceIndex * random());
              shuffled[destinationIndex++] = clone[randomIndex];
              clone[randomIndex] = clone[--sourceIndex];
            }
            return shuffled;
          },
          _private: this
        };
      }
    };
    var RandomPlugin = {
      name: "random",
      noClient: ({ api }) => {
        return api._private.isUsed();
      },
      flush: ({ api }) => {
        return api._private.getState();
      },
      api: ({ data }) => {
        const random = new Random(data);
        return random.api();
      },
      setup: ({ game }) => {
        let { seed } = game;
        if (seed === void 0) {
          seed = Random.seed();
        }
        return { seed };
      },
      playerView: () => void 0
    };
    exports2.RandomPlugin = RandomPlugin;
    exports2.alea = alea;
  }
});

// node_modules/lodash.isplainobject/index.js
var require_lodash = __commonJS({
  "node_modules/lodash.isplainobject/index.js"(exports2, module2) {
    var objectTag = "[object Object]";
    function isHostObject(value) {
      var result = false;
      if (value != null && typeof value.toString != "function") {
        try {
          result = !!(value + "");
        } catch (e) {
        }
      }
      return result;
    }
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }
    var funcProto = Function.prototype;
    var objectProto = Object.prototype;
    var funcToString = funcProto.toString;
    var hasOwnProperty = objectProto.hasOwnProperty;
    var objectCtorString = funcToString.call(Object);
    var objectToString = objectProto.toString;
    var getPrototype = overArg(Object.getPrototypeOf, Object);
    function isObjectLike(value) {
      return !!value && typeof value == "object";
    }
    function isPlainObject(value) {
      if (!isObjectLike(value) || objectToString.call(value) != objectTag || isHostObject(value)) {
        return false;
      }
      var proto = getPrototype(value);
      if (proto === null) {
        return true;
      }
      var Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
      return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
    }
    module2.exports = isPlainObject;
  }
});

// node_modules/boardgame.io/dist/cjs/turn-order-4ab12333.js
var require_turn_order_4ab12333 = __commonJS({
  "node_modules/boardgame.io/dist/cjs/turn-order-4ab12333.js"(exports2) {
    "use strict";
    function _interopDefault(ex) {
      return ex && typeof ex === "object" && "default" in ex ? ex["default"] : ex;
    }
    var produce = _interopDefault(require_dist());
    var pluginRandom = require_plugin_random_7425844d();
    var isPlainObject = _interopDefault(require_lodash());
    var MAKE_MOVE = "MAKE_MOVE";
    var GAME_EVENT = "GAME_EVENT";
    var REDO = "REDO";
    var RESET = "RESET";
    var SYNC = "SYNC";
    var UNDO = "UNDO";
    var UPDATE = "UPDATE";
    var PATCH = "PATCH";
    var PLUGIN = "PLUGIN";
    var STRIP_TRANSIENTS = "STRIP_TRANSIENTS";
    var makeMove = (type, args, playerID, credentials) => ({
      type: MAKE_MOVE,
      payload: { type, args, playerID, credentials }
    });
    var gameEvent = (type, args, playerID, credentials) => ({
      type: GAME_EVENT,
      payload: { type, args, playerID, credentials }
    });
    var automaticGameEvent = (type, args, playerID, credentials) => ({
      type: GAME_EVENT,
      payload: { type, args, playerID, credentials },
      automatic: true
    });
    var sync = (info2) => ({
      type: SYNC,
      state: info2.state,
      log: info2.log,
      initialState: info2.initialState,
      clientOnly: true
    });
    var patch = (prevStateID, stateID, patch2, deltalog) => ({
      type: PATCH,
      prevStateID,
      stateID,
      patch: patch2,
      deltalog,
      clientOnly: true
    });
    var update = (state, deltalog) => ({
      type: UPDATE,
      state,
      deltalog,
      clientOnly: true
    });
    var reset = (state) => ({
      type: RESET,
      state,
      clientOnly: true
    });
    var undo = (playerID, credentials) => ({
      type: UNDO,
      payload: { type: null, args: null, playerID, credentials }
    });
    var redo = (playerID, credentials) => ({
      type: REDO,
      payload: { type: null, args: null, playerID, credentials }
    });
    var plugin = (type, args, playerID, credentials) => ({
      type: PLUGIN,
      payload: { type, args, playerID, credentials }
    });
    var stripTransients = () => ({
      type: STRIP_TRANSIENTS
    });
    var ActionCreators = /* @__PURE__ */ Object.freeze({
      __proto__: null,
      makeMove,
      gameEvent,
      automaticGameEvent,
      sync,
      patch,
      update,
      reset,
      undo,
      redo,
      plugin,
      stripTransients
    });
    var INVALID_MOVE2 = "INVALID_MOVE";
    var ImmerPlugin = {
      name: "plugin-immer",
      fnWrap: (move) => (context, ...args) => {
        let isInvalid = false;
        const newG = produce(context.G, (G) => {
          const result = move({ ...context, G }, ...args);
          if (result === INVALID_MOVE2) {
            isInvalid = true;
            return;
          }
          return result;
        });
        if (isInvalid)
          return INVALID_MOVE2;
        return newG;
      }
    };
    (function(GameMethod) {
      GameMethod["MOVE"] = "MOVE";
      GameMethod["GAME_ON_END"] = "GAME_ON_END";
      GameMethod["PHASE_ON_BEGIN"] = "PHASE_ON_BEGIN";
      GameMethod["PHASE_ON_END"] = "PHASE_ON_END";
      GameMethod["TURN_ON_BEGIN"] = "TURN_ON_BEGIN";
      GameMethod["TURN_ON_MOVE"] = "TURN_ON_MOVE";
      GameMethod["TURN_ON_END"] = "TURN_ON_END";
    })(exports2.GameMethod || (exports2.GameMethod = {}));
    var Errors;
    (function(Errors2) {
      Errors2["CalledOutsideHook"] = "Events must be called from moves or the `onBegin`, `onEnd`, and `onMove` hooks.\nThis error probably means you called an event from other game code, like an `endIf` trigger or one of the `turn.order` methods.";
      Errors2["EndTurnInOnEnd"] = "`endTurn` is disallowed in `onEnd` hooks \u2014 the turn is already ending.";
      Errors2["MaxTurnEndings"] = "Maximum number of turn endings exceeded for this update.\nThis likely means game code is triggering an infinite loop.";
      Errors2["PhaseEventInOnEnd"] = "`setPhase` & `endPhase` are disallowed in a phase\u2019s `onEnd` hook \u2014 the phase is already ending.\nIf you\u2019re trying to dynamically choose the next phase when a phase ends, use the phase\u2019s `next` trigger.";
      Errors2["StageEventInOnEnd"] = "`setStage`, `endStage` & `setActivePlayers` are disallowed in `onEnd` hooks.";
      Errors2["StageEventInPhaseBegin"] = "`setStage`, `endStage` & `setActivePlayers` are disallowed in a phase\u2019s `onBegin` hook.\nUse `setActivePlayers` in a `turn.onBegin` hook or declare stages with `turn.activePlayers` instead.";
      Errors2["StageEventInTurnBegin"] = "`setStage` & `endStage` are disallowed in `turn.onBegin`.\nUse `setActivePlayers` or declare stages with `turn.activePlayers` instead.";
    })(Errors || (Errors = {}));
    var Events = class {
      constructor(flow, ctx, playerID) {
        this.flow = flow;
        this.playerID = playerID;
        this.dispatch = [];
        this.initialTurn = ctx.turn;
        this.updateTurnContext(ctx, void 0);
        this.maxEndedTurnsPerAction = ctx.numPlayers * 100;
      }
      api() {
        const events = {
          _private: this
        };
        for (const type of this.flow.eventNames) {
          events[type] = (...args) => {
            this.dispatch.push({
              type,
              args,
              phase: this.currentPhase,
              turn: this.currentTurn,
              calledFrom: this.currentMethod,
              // Used to capture a stack trace in case it is needed later.
              error: new Error("Events Plugin Error")
            });
          };
        }
        return events;
      }
      isUsed() {
        return this.dispatch.length > 0;
      }
      updateTurnContext(ctx, methodType) {
        this.currentPhase = ctx.phase;
        this.currentTurn = ctx.turn;
        this.currentMethod = methodType;
      }
      unsetCurrentMethod() {
        this.currentMethod = void 0;
      }
      /**
       * Updates ctx with the triggered events.
       * @param {object} state - The state object { G, ctx }.
       */
      update(state) {
        const initialState = state;
        const stateWithError = ({ stack }, message) => ({
          ...initialState,
          plugins: {
            ...initialState.plugins,
            events: {
              ...initialState.plugins.events,
              data: { error: message + "\n" + stack }
            }
          }
        });
        EventQueue: for (let i = 0; i < this.dispatch.length; i++) {
          const event = this.dispatch[i];
          const turnHasEnded = event.turn !== state.ctx.turn;
          const endedTurns = this.currentTurn - this.initialTurn;
          if (endedTurns >= this.maxEndedTurnsPerAction) {
            return stateWithError(event.error, Errors.MaxTurnEndings);
          }
          if (event.calledFrom === void 0) {
            return stateWithError(event.error, Errors.CalledOutsideHook);
          }
          if (state.ctx.gameover)
            break EventQueue;
          switch (event.type) {
            case "endStage":
            case "setStage":
            case "setActivePlayers": {
              switch (event.calledFrom) {
                // Disallow all stage events in onEnd and phase.onBegin hooks.
                case exports2.GameMethod.TURN_ON_END:
                case exports2.GameMethod.PHASE_ON_END:
                  return stateWithError(event.error, Errors.StageEventInOnEnd);
                case exports2.GameMethod.PHASE_ON_BEGIN:
                  return stateWithError(event.error, Errors.StageEventInPhaseBegin);
                // Disallow setStage & endStage in turn.onBegin hooks.
                case exports2.GameMethod.TURN_ON_BEGIN:
                  if (event.type === "setActivePlayers")
                    break;
                  return stateWithError(event.error, Errors.StageEventInTurnBegin);
              }
              if (turnHasEnded)
                continue EventQueue;
              break;
            }
            case "endTurn": {
              if (event.calledFrom === exports2.GameMethod.TURN_ON_END || event.calledFrom === exports2.GameMethod.PHASE_ON_END) {
                return stateWithError(event.error, Errors.EndTurnInOnEnd);
              }
              if (turnHasEnded)
                continue EventQueue;
              break;
            }
            case "endPhase":
            case "setPhase": {
              if (event.calledFrom === exports2.GameMethod.PHASE_ON_END) {
                return stateWithError(event.error, Errors.PhaseEventInOnEnd);
              }
              if (event.phase !== state.ctx.phase)
                continue EventQueue;
              break;
            }
          }
          const action = automaticGameEvent(event.type, event.args, this.playerID);
          state = this.flow.processEvent(state, action);
        }
        return state;
      }
    };
    var EventsPlugin = {
      name: "events",
      noClient: ({ api }) => api._private.isUsed(),
      isInvalid: ({ data }) => data.error || false,
      // Update the events plugin’s internal turn context each time a move
      // or hook is called. This allows events called after turn or phase
      // endings to dispatch the current turn and phase correctly.
      fnWrap: (method, methodType) => (context, ...args) => {
        const api = context.events;
        if (api)
          api._private.updateTurnContext(context.ctx, methodType);
        const G = method(context, ...args);
        if (api)
          api._private.unsetCurrentMethod();
        return G;
      },
      dangerouslyFlushRawState: ({ state, api }) => api._private.update(state),
      api: ({ game, ctx, playerID }) => new Events(game.flow, ctx, playerID).api()
    };
    var LogPlugin = {
      name: "log",
      flush: () => ({}),
      api: ({ data }) => {
        return {
          setMetadata: (metadata) => {
            data.metadata = metadata;
          }
        };
      },
      setup: () => ({})
    };
    function isSerializable(value) {
      if (value === void 0 || value === null || typeof value === "boolean" || typeof value === "number" || typeof value === "string") {
        return true;
      }
      if (!isPlainObject(value) && !Array.isArray(value)) {
        return false;
      }
      for (const key in value) {
        if (!isSerializable(value[key]))
          return false;
      }
      return true;
    }
    var SerializablePlugin = {
      name: "plugin-serializable",
      fnWrap: (move) => (context, ...args) => {
        const result = move(context, ...args);
        if (process.env.NODE_ENV !== "production" && !isSerializable(result)) {
          throw new Error("Move state is not JSON-serialiazable.\nSee https://boardgame.io/documentation/#/?id=state for more information.");
        }
        return result;
      }
    };
    var production = process.env.NODE_ENV === "production";
    var logfn = production ? () => {
    } : (...msg) => console.log(...msg);
    var errorfn = (...msg) => console.error(...msg);
    function info(msg) {
      logfn(`INFO: ${msg}`);
    }
    function error(error2) {
      errorfn("ERROR:", error2);
    }
    var CORE_PLUGINS = [ImmerPlugin, pluginRandom.RandomPlugin, LogPlugin, SerializablePlugin];
    var DEFAULT_PLUGINS = [...CORE_PLUGINS, EventsPlugin];
    var ProcessAction = (state, action, opts) => {
      opts.game.plugins.filter((plugin2) => plugin2.action !== void 0).filter((plugin2) => plugin2.name === action.payload.type).forEach((plugin2) => {
        const name = plugin2.name;
        const pluginState = state.plugins[name] || { data: {} };
        const data = plugin2.action(pluginState.data, action.payload);
        state = {
          ...state,
          plugins: {
            ...state.plugins,
            [name]: { ...pluginState, data }
          }
        };
      });
      return state;
    };
    var GetAPIs = ({ plugins }) => Object.entries(plugins || {}).reduce((apis, [name, { api }]) => {
      apis[name] = api;
      return apis;
    }, {});
    var FnWrap = (methodToWrap, methodType, plugins) => {
      return [...CORE_PLUGINS, ...plugins, EventsPlugin].filter((plugin2) => plugin2.fnWrap !== void 0).reduce((method, { fnWrap }) => fnWrap(method, methodType), methodToWrap);
    };
    var Setup = (state, opts) => {
      [...DEFAULT_PLUGINS, ...opts.game.plugins].filter((plugin2) => plugin2.setup !== void 0).forEach((plugin2) => {
        const name = plugin2.name;
        const data = plugin2.setup({
          G: state.G,
          ctx: state.ctx,
          game: opts.game
        });
        state = {
          ...state,
          plugins: {
            ...state.plugins,
            [name]: { data }
          }
        };
      });
      return state;
    };
    var Enhance = (state, opts) => {
      [...DEFAULT_PLUGINS, ...opts.game.plugins].filter((plugin2) => plugin2.api !== void 0).forEach((plugin2) => {
        const name = plugin2.name;
        const pluginState = state.plugins[name] || { data: {} };
        const api = plugin2.api({
          G: state.G,
          ctx: state.ctx,
          data: pluginState.data,
          game: opts.game,
          playerID: opts.playerID
        });
        state = {
          ...state,
          plugins: {
            ...state.plugins,
            [name]: { ...pluginState, api }
          }
        };
      });
      return state;
    };
    var Flush = (state, opts) => {
      [...CORE_PLUGINS, ...opts.game.plugins, EventsPlugin].reverse().forEach((plugin2) => {
        const name = plugin2.name;
        const pluginState = state.plugins[name] || { data: {} };
        if (plugin2.flush) {
          const newData = plugin2.flush({
            G: state.G,
            ctx: state.ctx,
            game: opts.game,
            api: pluginState.api,
            data: pluginState.data
          });
          state = {
            ...state,
            plugins: {
              ...state.plugins,
              [plugin2.name]: { data: newData }
            }
          };
        } else if (plugin2.dangerouslyFlushRawState) {
          state = plugin2.dangerouslyFlushRawState({
            state,
            game: opts.game,
            api: pluginState.api,
            data: pluginState.data
          });
          const data = state.plugins[name].data;
          state = {
            ...state,
            plugins: {
              ...state.plugins,
              [plugin2.name]: { data }
            }
          };
        }
      });
      return state;
    };
    var NoClient = (state, opts) => {
      return [...DEFAULT_PLUGINS, ...opts.game.plugins].filter((plugin2) => plugin2.noClient !== void 0).map((plugin2) => {
        const name = plugin2.name;
        const pluginState = state.plugins[name];
        if (pluginState) {
          return plugin2.noClient({
            G: state.G,
            ctx: state.ctx,
            game: opts.game,
            api: pluginState.api,
            data: pluginState.data
          });
        }
        return false;
      }).includes(true);
    };
    var IsInvalid = (state, opts) => {
      const firstInvalidReturn = [...DEFAULT_PLUGINS, ...opts.game.plugins].filter((plugin2) => plugin2.isInvalid !== void 0).map((plugin2) => {
        const { name } = plugin2;
        const pluginState = state.plugins[name];
        const message = plugin2.isInvalid({
          G: state.G,
          ctx: state.ctx,
          game: opts.game,
          data: pluginState && pluginState.data
        });
        return message ? { plugin: name, message } : false;
      }).find((value) => value);
      return firstInvalidReturn || false;
    };
    var FlushAndValidate = (state, opts) => {
      const updatedState = Flush(state, opts);
      const isInvalid = IsInvalid(updatedState, opts);
      if (!isInvalid)
        return [updatedState];
      const { plugin: plugin2, message } = isInvalid;
      error(`${plugin2} plugin declared action invalid:
${message}`);
      return [state, isInvalid];
    };
    var PlayerView = ({ G, ctx, plugins = {} }, { game, playerID }) => {
      [...DEFAULT_PLUGINS, ...game.plugins].forEach(({ name, playerView }) => {
        if (!playerView)
          return;
        const { data } = plugins[name] || { data: {} };
        const newData = playerView({ G, ctx, game, data, playerID });
        plugins = {
          ...plugins,
          [name]: { data: newData }
        };
      });
      return plugins;
    };
    function supportDeprecatedMoveLimit(options, enforceMinMoves = false) {
      if (options.moveLimit) {
        if (enforceMinMoves) {
          options.minMoves = options.moveLimit;
        }
        options.maxMoves = options.moveLimit;
        delete options.moveLimit;
      }
    }
    function SetActivePlayers(ctx, arg) {
      let activePlayers = {};
      let _prevActivePlayers = [];
      let _nextActivePlayers = null;
      let _activePlayersMinMoves = {};
      let _activePlayersMaxMoves = {};
      if (Array.isArray(arg)) {
        const value = {};
        arg.forEach((v) => value[v] = Stage.NULL);
        activePlayers = value;
      } else {
        supportDeprecatedMoveLimit(arg);
        if (arg.next) {
          _nextActivePlayers = arg.next;
        }
        if (arg.revert) {
          _prevActivePlayers = [
            ...ctx._prevActivePlayers,
            {
              activePlayers: ctx.activePlayers,
              _activePlayersMinMoves: ctx._activePlayersMinMoves,
              _activePlayersMaxMoves: ctx._activePlayersMaxMoves,
              _activePlayersNumMoves: ctx._activePlayersNumMoves
            }
          ];
        }
        if (arg.currentPlayer !== void 0) {
          ApplyActivePlayerArgument(activePlayers, _activePlayersMinMoves, _activePlayersMaxMoves, ctx.currentPlayer, arg.currentPlayer);
        }
        if (arg.others !== void 0) {
          for (let i = 0; i < ctx.playOrder.length; i++) {
            const id = ctx.playOrder[i];
            if (id !== ctx.currentPlayer) {
              ApplyActivePlayerArgument(activePlayers, _activePlayersMinMoves, _activePlayersMaxMoves, id, arg.others);
            }
          }
        }
        if (arg.all !== void 0) {
          for (let i = 0; i < ctx.playOrder.length; i++) {
            const id = ctx.playOrder[i];
            ApplyActivePlayerArgument(activePlayers, _activePlayersMinMoves, _activePlayersMaxMoves, id, arg.all);
          }
        }
        if (arg.value) {
          for (const id in arg.value) {
            ApplyActivePlayerArgument(activePlayers, _activePlayersMinMoves, _activePlayersMaxMoves, id, arg.value[id]);
          }
        }
        if (arg.minMoves) {
          for (const id in activePlayers) {
            if (_activePlayersMinMoves[id] === void 0) {
              _activePlayersMinMoves[id] = arg.minMoves;
            }
          }
        }
        if (arg.maxMoves) {
          for (const id in activePlayers) {
            if (_activePlayersMaxMoves[id] === void 0) {
              _activePlayersMaxMoves[id] = arg.maxMoves;
            }
          }
        }
      }
      if (Object.keys(activePlayers).length === 0) {
        activePlayers = null;
      }
      if (Object.keys(_activePlayersMinMoves).length === 0) {
        _activePlayersMinMoves = null;
      }
      if (Object.keys(_activePlayersMaxMoves).length === 0) {
        _activePlayersMaxMoves = null;
      }
      const _activePlayersNumMoves = {};
      for (const id in activePlayers) {
        _activePlayersNumMoves[id] = 0;
      }
      return {
        ...ctx,
        activePlayers,
        _activePlayersMinMoves,
        _activePlayersMaxMoves,
        _activePlayersNumMoves,
        _prevActivePlayers,
        _nextActivePlayers
      };
    }
    function UpdateActivePlayersOnceEmpty(ctx) {
      let { activePlayers, _activePlayersMinMoves, _activePlayersMaxMoves, _activePlayersNumMoves, _prevActivePlayers, _nextActivePlayers } = ctx;
      if (activePlayers && Object.keys(activePlayers).length === 0) {
        if (_nextActivePlayers) {
          ctx = SetActivePlayers(ctx, _nextActivePlayers);
          ({
            activePlayers,
            _activePlayersMinMoves,
            _activePlayersMaxMoves,
            _activePlayersNumMoves,
            _prevActivePlayers
          } = ctx);
        } else if (_prevActivePlayers.length > 0) {
          const lastIndex = _prevActivePlayers.length - 1;
          ({
            activePlayers,
            _activePlayersMinMoves,
            _activePlayersMaxMoves,
            _activePlayersNumMoves
          } = _prevActivePlayers[lastIndex]);
          _prevActivePlayers = _prevActivePlayers.slice(0, lastIndex);
        } else {
          activePlayers = null;
          _activePlayersMinMoves = null;
          _activePlayersMaxMoves = null;
        }
      }
      return {
        ...ctx,
        activePlayers,
        _activePlayersMinMoves,
        _activePlayersMaxMoves,
        _activePlayersNumMoves,
        _prevActivePlayers
      };
    }
    function ApplyActivePlayerArgument(activePlayers, _activePlayersMinMoves, _activePlayersMaxMoves, playerID, arg) {
      if (typeof arg !== "object" || arg === Stage.NULL) {
        arg = { stage: arg };
      }
      if (arg.stage !== void 0) {
        supportDeprecatedMoveLimit(arg);
        activePlayers[playerID] = arg.stage;
        if (arg.minMoves)
          _activePlayersMinMoves[playerID] = arg.minMoves;
        if (arg.maxMoves)
          _activePlayersMaxMoves[playerID] = arg.maxMoves;
      }
    }
    function getCurrentPlayer(playOrder, playOrderPos) {
      return playOrder[playOrderPos] + "";
    }
    function InitTurnOrderState(state, turn) {
      let { G, ctx } = state;
      const { numPlayers } = ctx;
      const pluginAPIs = GetAPIs(state);
      const context = { ...pluginAPIs, G, ctx };
      const order = turn.order;
      let playOrder = [...Array.from({ length: numPlayers })].map((_, i) => i + "");
      if (order.playOrder !== void 0) {
        playOrder = order.playOrder(context);
      }
      const playOrderPos = order.first(context);
      const posType = typeof playOrderPos;
      if (posType !== "number") {
        error(`invalid value returned by turn.order.first \u2014 expected number got ${posType} \u201C${playOrderPos}\u201D.`);
      }
      const currentPlayer = getCurrentPlayer(playOrder, playOrderPos);
      ctx = { ...ctx, currentPlayer, playOrderPos, playOrder };
      ctx = SetActivePlayers(ctx, turn.activePlayers || {});
      return ctx;
    }
    function UpdateTurnOrderState(state, currentPlayer, turn, endTurnArg) {
      const order = turn.order;
      let { G, ctx } = state;
      let playOrderPos = ctx.playOrderPos;
      let endPhase = false;
      if (endTurnArg && endTurnArg !== true) {
        if (typeof endTurnArg !== "object") {
          error(`invalid argument to endTurn: ${endTurnArg}`);
        }
        Object.keys(endTurnArg).forEach((arg) => {
          switch (arg) {
            case "remove":
              currentPlayer = getCurrentPlayer(ctx.playOrder, playOrderPos);
              break;
            case "next":
              playOrderPos = ctx.playOrder.indexOf(endTurnArg.next);
              currentPlayer = endTurnArg.next;
              break;
            default:
              error(`invalid argument to endTurn: ${arg}`);
          }
        });
      } else {
        const pluginAPIs = GetAPIs(state);
        const context = { ...pluginAPIs, G, ctx };
        const t = order.next(context);
        const type = typeof t;
        if (t !== void 0 && type !== "number") {
          error(`invalid value returned by turn.order.next \u2014 expected number or undefined got ${type} \u201C${t}\u201D.`);
        }
        if (t === void 0) {
          endPhase = true;
        } else {
          playOrderPos = t;
          currentPlayer = getCurrentPlayer(ctx.playOrder, playOrderPos);
        }
      }
      ctx = {
        ...ctx,
        playOrderPos,
        currentPlayer
      };
      return { endPhase, ctx };
    }
    var TurnOrder = {
      /**
       * DEFAULT
       *
       * The default round-robin turn order.
       */
      DEFAULT: {
        first: ({ ctx }) => ctx.turn === 0 ? ctx.playOrderPos : (ctx.playOrderPos + 1) % ctx.playOrder.length,
        next: ({ ctx }) => (ctx.playOrderPos + 1) % ctx.playOrder.length
      },
      /**
       * RESET
       *
       * Similar to DEFAULT, but starts from 0 each time.
       */
      RESET: {
        first: () => 0,
        next: ({ ctx }) => (ctx.playOrderPos + 1) % ctx.playOrder.length
      },
      /**
       * CONTINUE
       *
       * Similar to DEFAULT, but starts with the player who ended the last phase.
       */
      CONTINUE: {
        first: ({ ctx }) => ctx.playOrderPos,
        next: ({ ctx }) => (ctx.playOrderPos + 1) % ctx.playOrder.length
      },
      /**
       * ONCE
       *
       * Another round-robin turn order, but goes around just once.
       * The phase ends after all players have played.
       */
      ONCE: {
        first: () => 0,
        next: ({ ctx }) => {
          if (ctx.playOrderPos < ctx.playOrder.length - 1) {
            return ctx.playOrderPos + 1;
          }
        }
      },
      /**
       * CUSTOM
       *
       * Identical to DEFAULT, but also sets playOrder at the
       * beginning of the phase.
       *
       * @param {Array} playOrder - The play order.
       */
      CUSTOM: (playOrder) => ({
        playOrder: () => playOrder,
        first: () => 0,
        next: ({ ctx }) => (ctx.playOrderPos + 1) % ctx.playOrder.length
      }),
      /**
       * CUSTOM_FROM
       *
       * Identical to DEFAULT, but also sets playOrder at the
       * beginning of the phase to a value specified by a field
       * in G.
       *
       * @param {string} playOrderField - Field in G.
       */
      CUSTOM_FROM: (playOrderField) => ({
        playOrder: ({ G }) => G[playOrderField],
        first: () => 0,
        next: ({ ctx }) => (ctx.playOrderPos + 1) % ctx.playOrder.length
      })
    };
    var Stage = {
      NULL: null
    };
    var ActivePlayers = {
      /**
       * ALL
       *
       * The turn stays with one player, but any player can play (in any order)
       * until the phase ends.
       */
      ALL: { all: Stage.NULL },
      /**
       * ALL_ONCE
       *
       * The turn stays with one player, but any player can play (once, and in any order).
       * This is typically used in a phase where you want to elicit a response
       * from every player in the game.
       */
      ALL_ONCE: { all: Stage.NULL, minMoves: 1, maxMoves: 1 },
      /**
       * OTHERS
       *
       * The turn stays with one player, and every *other* player can play (in any order)
       * until the phase ends.
       */
      OTHERS: { others: Stage.NULL },
      /**
       * OTHERS_ONCE
       *
       * The turn stays with one player, and every *other* player can play (once, and in any order).
       * This is typically used in a phase where you want to elicit a response
       * from every *other* player in the game.
       */
      OTHERS_ONCE: { others: Stage.NULL, minMoves: 1, maxMoves: 1 }
    };
    exports2.ActionCreators = ActionCreators;
    exports2.ActivePlayers = ActivePlayers;
    exports2.Enhance = Enhance;
    exports2.FlushAndValidate = FlushAndValidate;
    exports2.FnWrap = FnWrap;
    exports2.GAME_EVENT = GAME_EVENT;
    exports2.GetAPIs = GetAPIs;
    exports2.INVALID_MOVE = INVALID_MOVE2;
    exports2.InitTurnOrderState = InitTurnOrderState;
    exports2.MAKE_MOVE = MAKE_MOVE;
    exports2.NoClient = NoClient;
    exports2.PATCH = PATCH;
    exports2.PLUGIN = PLUGIN;
    exports2.PlayerView = PlayerView;
    exports2.ProcessAction = ProcessAction;
    exports2.REDO = REDO;
    exports2.RESET = RESET;
    exports2.STRIP_TRANSIENTS = STRIP_TRANSIENTS;
    exports2.SYNC = SYNC;
    exports2.SetActivePlayers = SetActivePlayers;
    exports2.Setup = Setup;
    exports2.Stage = Stage;
    exports2.TurnOrder = TurnOrder;
    exports2.UNDO = UNDO;
    exports2.UPDATE = UPDATE;
    exports2.UpdateActivePlayersOnceEmpty = UpdateActivePlayersOnceEmpty;
    exports2.UpdateTurnOrderState = UpdateTurnOrderState;
    exports2.error = error;
    exports2.gameEvent = gameEvent;
    exports2.info = info;
    exports2.makeMove = makeMove;
    exports2.patch = patch;
    exports2.redo = redo;
    exports2.reset = reset;
    exports2.stripTransients = stripTransients;
    exports2.supportDeprecatedMoveLimit = supportDeprecatedMoveLimit;
    exports2.sync = sync;
    exports2.undo = undo;
    exports2.update = update;
  }
});

// node_modules/boardgame.io/dist/cjs/core.js
var require_core = __commonJS({
  "node_modules/boardgame.io/dist/cjs/core.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var turnOrder = require_turn_order_4ab12333();
    require_dist();
    require_plugin_random_7425844d();
    require_lodash();
    var PlayerView = {
      /**
       * STRIP_SECRETS
       *
       * Reducer which removes a key named `secret` and
       * removes all the keys in `players`, except for the one
       * corresponding to the current playerID.
       */
      STRIP_SECRETS: ({ G, playerID }) => {
        const r = { ...G };
        if (r.secret !== void 0) {
          delete r.secret;
        }
        if (r.players) {
          r.players = playerID ? {
            [playerID]: r.players[playerID]
          } : {};
        }
        return r;
      }
    };
    exports2.ActivePlayers = turnOrder.ActivePlayers;
    Object.defineProperty(exports2, "GameMethod", {
      enumerable: true,
      get: function() {
        return turnOrder.GameMethod;
      }
    });
    exports2.INVALID_MOVE = turnOrder.INVALID_MOVE;
    exports2.Stage = turnOrder.Stage;
    exports2.TurnOrder = turnOrder.TurnOrder;
    exports2.PlayerView = PlayerView;
  }
});

// game/GameDefinition.ts
var GameDefinition_exports = {};
__export(GameDefinition_exports, {
  EnergyGame: () => EnergyGame
});
module.exports = __toCommonJS(GameDefinition_exports);
var import_core = __toESM(require_core(), 1);
var DAY_PERIODS = ["morning", "afternoon", "evening"];
var COUNTRIES = [
  "DE",
  "FR",
  "ES",
  "PT",
  "IT",
  "NL",
  "BE",
  "DK",
  "NO",
  "SE",
  "FI",
  "PL",
  "CZ",
  "AT",
  "CH"
];
var ENERGY_TYPES = [
  "Wind",
  "Solar",
  "Water",
  "Fossil",
  "Nuclear"
];
var generateMockContracts = () => {
  const contracts = {};
  let id = 1;
  COUNTRIES.slice(0, 5).forEach((country) => {
    ENERGY_TYPES.forEach((type) => {
      const contractId = `c${id++}`;
      contracts[contractId] = {
        contract_id: contractId,
        origin_country: country,
        energy_type: type,
        available_volume: Math.floor(Math.random() * 500) + 100,
        base_price: Math.floor(Math.random() * 50) + 20,
        bids: [],
        delivery_country: "DE"
      };
    });
  });
  return contracts;
};
var generateMockConducts = () => {
  return [
    {
      origin: "DE",
      destination: "FR",
      base_cost: 5,
      volume_capacity: 1e3,
      is_broken: false
    },
    {
      origin: "DE",
      destination: "DK",
      base_cost: 3,
      volume_capacity: 800,
      is_broken: false
    },
    {
      origin: "FR",
      destination: "ES",
      base_cost: 4,
      volume_capacity: 600,
      is_broken: false
    },
    {
      origin: "NO",
      destination: "DK",
      base_cost: 2,
      volume_capacity: 1200,
      is_broken: false
    },
    {
      origin: "IT",
      destination: "AT",
      base_cost: 6,
      volume_capacity: 400,
      is_broken: false
    }
  ];
};
var ACTION_CARD_TYPES = [
  "POLAR_VORTEX",
  "HEAT_DOME",
  "MONSOON",
  "DEAD_CALM",
  "BOOST_ENERGY",
  "NERF_ENERGY",
  "CUT_CONDUCT",
  "FIX_CONDUCT",
  "DISCOUNT_CONDUCT",
  "NOPE_CARD"
];
var phaseConfig = (nextPhase) => ({
  ...nextPhase ? { next: nextPhase } : {},
  onBegin: ({ G, ctx }) => {
    G.ready_players = [];
  },
  endIf: ({ G, ctx }) => G.ready_players.length >= ctx.numPlayers,
  turn: {
    activePlayers: { all: "stage" }
  }
});
var EnergyGame = {
  name: "energy-market",
  setup: ({ ctx }) => {
    const player_balances = {};
    const action_cards = {};
    for (let i = 0; i < ctx.numPlayers; i++) {
      const playerId = i.toString();
      player_balances[playerId] = 1e5;
      const numCards = i === 0 ? 5 : 2;
      action_cards[playerId] = Array.from({ length: numCards }).map(
        (_, cardIndex) => ({
          card_id: `card-${playerId}-${cardIndex}`,
          type: ACTION_CARD_TYPES[Math.floor(Math.random() * ACTION_CARD_TYPES.length)],
          face_down: false
        })
      );
    }
    const contracts = generateMockContracts();
    return {
      phase_number: 1,
      contracts,
      player_balances,
      ready_players: [],
      conducts: generateMockConducts(),
      action_cards,
      played_cards: [],
      forecast: {
        description: "High winds expected in the North Sea",
        affected_country: "DK",
        probability: 0.8,
        weather_feature: "wind_speed_10m (km/h)",
        direction: "increase"
      },
      current_period: "morning",
      periods_completed: [],
      phase_deadline: null
    };
  },
  phases: {
    // forecasting: {
    //   start: true,
    //   ...phaseConfig("actionDeployment"),
    //   onBegin: ({ G, ctx }: { G: GameState; ctx: Ctx }) => {
    //     G.ready_players = [];
    //     G.current_period = "morning";
    //     G.periods_completed = [];
    //   },
    // },
    bidding: {
      ...phaseConfig(),
      // next is dynamic, so we handle it separately
      next: ({ G }) => {
        const nextIndex = DAY_PERIODS.indexOf(G.current_period) + 1;
        return nextIndex < DAY_PERIODS.length ? "actionDeployment" : "resolution";
      },
      onEnd: ({ G }) => {
        G.periods_completed.push(G.current_period);
        const nextIndex = DAY_PERIODS.indexOf(G.current_period) + 1;
        if (nextIndex < DAY_PERIODS.length) {
          G.current_period = DAY_PERIODS[nextIndex];
        }
      },
      start: true
    },
    actionDeployment: phaseConfig("bidding"),
    resolution: phaseConfig()
  },
  moves: {
    submitBid: ({ G, playerID }, tradeId, price, volume) => {
      if (!G.contracts[tradeId]) return import_core.INVALID_MOVE;
      G.contracts[tradeId].bids.push({ player_id: playerID, price, volume });
    },
    playActionCard: ({ G, playerID }, cardId, targetCountryId, faceDown) => {
      const playerCards = G.action_cards[playerID] || [];
      const cardIndex = playerCards.findIndex((c) => c.card_id === cardId);
      if (cardIndex === -1) return import_core.INVALID_MOVE;
      const [card] = playerCards.splice(cardIndex, 1);
      G.played_cards.push({
        player_id: playerID,
        card: { ...card, face_down: !!faceDown },
        target_country: targetCountryId,
        rounds_remaining: 3
      });
    },
    routeEnergy: ({ G, playerID }, contractId, route) => {
      console.warn("routeEnergy move is not fully implemented yet");
    },
    buyActionCard: ({ G, playerID }) => {
      const CARD_COST = 5e3;
      if (G.player_balances[playerID] < CARD_COST) return import_core.INVALID_MOVE;
      G.player_balances[playerID] -= CARD_COST;
      if (!G.action_cards[playerID]) G.action_cards[playerID] = [];
      G.action_cards[playerID].push({
        card_id: `card-${playerID}-${Date.now()}`,
        type: ACTION_CARD_TYPES[Math.floor(Math.random() * ACTION_CARD_TYPES.length)],
        face_down: false
      });
    },
    markReady: ({ G, playerID }) => {
      if (!G.ready_players.includes(playerID)) {
        G.ready_players.push(playerID);
      }
    }
  },
  turn: {
    activePlayers: { all: "stage" }
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EnergyGame
});
