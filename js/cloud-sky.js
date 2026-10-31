/**
 * CloudSky.js (OriginKit WebGL Daytime Cloud Sky)
 * Pure WebGL shader background featuring cumulus clouds drifting across parallax layers
 */

(function (window) {
  'use strict';

  var MAX_DPR = 1.0;
  var NEAR_DRIFT = 0.018;
  var FAR_DRIFT = 0.008;
  var CIRRUS_DRIFT = 0.004;

  var VERT_SRC = `
attribute vec2 a_pos;
void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

  var FRAG_SRC = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 uRes;
uniform float uNearX, uFarX, uCirrusX;
uniform float uCoverage, uSize, uSoftness, uShadow, uCirrus;
uniform vec3 uZenith, uHorizon, uCloud;
uniform vec4 uGlow;
uniform vec2 uSun;
uniform vec2 uParallax;

// No sin() in the hash: fract(sin(x) * k) quantizes hard once the argument gets
// large, and the cell ids run far off the origin as the sky drifts.
vec2 hash22(vec2 p){
  vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  q += dot(q, q.yzx + 33.33);
  return fract((q.xx + q.yz) * q.zy);
}

float hash12(vec2 p){
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float vnoise(vec2 x){
  vec2 i = floor(x), f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), f.x),
             mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), f.x), f.y);
}

float fbm(vec2 p){
  float a = 0.5, s = 0.0;
  for (int i = 0; i < 4; i++){
    s += a * vnoise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return s;
}

// One hashed puff cluster per cell, walked over the neighbourhood so a puff near
// an edge is still drawn by the cell next door. Most cells are empty -- that is
// what leaves real sky between the clouds.
// Returns (coverage, height within the puff). The second component is what shades
// the cloud: -1 at its base, +1 at its crown. Without it the only shading signal
// is "is there cloud above me", which is true almost everywhere inside a puff, so
// the whole body goes grey and only a one-pixel rim stays white.
//
// THE WINDOW is 5x5, not 3x3, with an exact reach test that skips a cell before
// it costs a hash. A 3x3 window only serves puffs up to 1.85 cells wide; past
// that the widest puffs are dropped and their ellipses end on a hard arc. The
// test is |o| <= w + 0.85, so small sizes cost LESS than the old 3x3 (at Size 20
// only the centre cell can reach at all) and only Size 200+ pays for the ring.
//
// THE HEIGHT is a soft-max blend over every puff, not the nearest puff's. Taking
// it from the winner makes it jump the instant two overlapping puffs swap which
// one is nearest -- measured up to 1.43 across a single pixel -- and shadeCloud
// turns that discontinuity into a hard crease straight across the cloud body.
// That is what appears as Size grows: at Size 100 the puffs barely overlap and
// there are none, at 200 there are 458 and at 300 there are 1585.
//
// The soft-max is the ONLINE form, rescaling the running sums whenever a new
// best arrives, so the dominant weight is always exactly 1.0 and the sums stay
// in [1, 25]. The plain exp(K * val) form overflows outright on a mediump
// fragment path, and its smallest weights flush to zero exactly at the cloud
// edge where the height still has to be right.
vec2 blobs(vec2 uv, float seed){
  vec2 id = floor(uv), f = fract(uv);
  // Sentinel stays small: -1e9 is outside mediump's guaranteed range, and val
  // never falls below about -50 here.
  float best = -1e4;
  float wsum = 0.0, ysum = 0.0;
  float wMax = min(2.150, 0.72 * uSize);
  float reach = min(2.0, ceil(wMax + 0.85) - 1.0);
  for (int j = -2; j <= 2; j++){
    for (int i = -2; i <= 2; i++){
      vec2 o = vec2(float(i), float(j));
      if (max(abs(o.x), abs(o.y)) > reach) continue;
      vec2 h = hash22(id + o + seed);
      // Coverage decides how many cells hold a cloud at all.
      if (fract(h.x * 37.1) > uCoverage) continue;
      vec2 c = o + 0.15 + h * 0.7;
      float w = min(2.150, (0.30 + 0.42 * fract(h.y * 19.7)) * uSize);
      vec2 d = f - c;
      // Asymmetric about the centre: tall above, short below. That gap is the
      // flat base a cumulus has and a noise field never produces.
      float ry = (d.y > 0.0 ? 0.340 : 0.190) * uSize * (0.8 + 0.5 * fract(h.y * 7.3));
      float e = length(vec2(d.x / max(w, 1e-3), d.y / max(ry, 1e-3)));
      float val = 1.0 - e;
      float yN = d.y / max(ry, 1e-3);
      if (val > best){
        float k = exp(12.0 * (best - val));
        wsum = wsum * k + 1.0;
        ysum = ysum * k + yN;
        best = val;
      } else {
        float g = exp(12.0 * (val - best));
        wsum += g;
        ysum += g * yN;
      }
    }
  }
  return vec2(best, ysum / max(wsum, 1e-4));
}

// Blobs decide WHERE, noise decides the OUTLINE.
vec2 cloudField(vec2 uv, float seed, float detailScale){
  vec2 b = blobs(uv, seed);
  // Two bands: the coarse one dents the silhouette into lobes, the fine one
  // frays it. One band alone gives either a wobbly outline or fuzz, never the
  // feathered edge a cumulus has.
  float n = fbm(uv * detailScale + seed * 3.1) * 0.72
          + fbm(uv * detailScale * 3.3 + seed * 7.7) * 0.28;
  return vec2(b.x - (1.0 - n) * 0.700, b.y);
}

// A cumulus is lit from above: white crown, grey underside tinted toward the sky
// it sits in. dyNorm is the pixel's height within its own puff, so this is the
// puff's own vertical gradient rather than a flat tint.
vec3 shadeCloud(float dyNorm, vec3 sky){
  float t = smoothstep(-0.95, 0.25, dyNorm);
  vec3 base = mix(uCloud * 0.52, sky, 0.34);
  return mix(mix(uCloud, base, uShadow), uCloud, t);
}

void main(){
  vec2 frag = gl_FragCoord.xy / max(uRes.y, 1.0);
  float aspect = uRes.x / max(uRes.y, 1.0);
  vec2 p = vec2(frag.x, frag.y); // y in [0,1], x in [0,aspect]

  // ---- sky ---------------------------------------------------------------
  vec3 sky = mix(uHorizon, uZenith, smoothstep(-0.15, 1.05, p.y));
  vec2 sunP = vec2(uSun.x * aspect, uSun.y);
  float sd = length(p - sunP);
  // One tight term only. A second broad one reads as a lens wash over the whole
  // sky rather than as a sun, and clips the blue to white halfway across.
  sky += uGlow.rgb * uGlow.a * exp(-sd * 3.4) * 0.30;

  vec3 col = sky;

  // ---- cirrus: a thin high veil, no blobs, pure stretched noise ----------
  if (uCirrus > 0.0) {
    vec2 cuv = vec2(p.x * 1.4 + uCirrusX, p.y * 5.5);
    float veil = fbm(cuv) * fbm(cuv * 2.3 + 9.0);
    veil = smoothstep(0.24, 0.55, veil) * smoothstep(0.15, 0.7, p.y);
    col = mix(col, uCloud, veil * uCirrus * 0.5);
  }

  // ---- far cumulus -------------------------------------------------------
  vec2 fuv = vec2(p.x + uFarX, p.y) * 2.150 + uParallax * 0.4;
  vec2 fd = cloudField(fuv, 17.0, 11.0);
  float fa = clamp(fd.x * uSoftness, 0.0, 1.0);
  if (fa > 0.0) {
    vec3 lit = shadeCloud(fd.y, sky);
    // Aerial perspective is a mix toward the SKY, not a drop in alpha.
    col = mix(col, mix(lit, sky, 0.550), fa);
  }

  // ---- near cumulus ------------------------------------------------------
  vec2 nuv = vec2(p.x + uNearX, p.y) * 1.050 + uParallax;
  vec2 nd = cloudField(nuv, 3.0, 8.5);
  float na = clamp(nd.x * uSoftness, 0.0, 1.0);
  if (na > 0.0) {
    vec3 lit = shadeCloud(nd.y, sky);
    // A second sample one step UP is the inter-cloud shadow: a billow standing
    // over this one dims it beyond its own top-lit gradient.
    float above = clamp(cloudField(nuv + vec2(0.0, 0.085), 3.0, 8.5).x * uSoftness, 0.0, 1.0);
    lit *= 1.0 - 0.18 * uShadow * above;
    // The sun side of a billow picks up the glow.
    lit += uGlow.rgb * uGlow.a * 0.22 * exp(-length(p - sunP) * 1.6);
    col = mix(col, lit, na);
  }

  gl_FragColor = vec4(col, 1.0);
}
`;

  function hexToRgba(hex) {
    var h = hex.replace('#', '').trim();
    if (h.length === 3) {
      h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    }
    if (h.length === 6) {
      var num = parseInt(h, 16);
      return [(num >> 16 & 255) / 255, (num >> 8 & 255) / 255, (num & 255) / 255, 1];
    }
    if (h.length === 8) {
      var num8 = parseInt(h, 16);
      return [(num8 >> 24 & 255) / 255, (num8 >> 16 & 255) / 255, (num8 >> 8 & 255) / 255, (num8 & 255) / 255];
    }
    return [1, 1, 1, 1];
  }

  function parseColor(val, fallback) {
    if (!val) return fallback;
    if (typeof val === 'string') {
      var str = val.trim();
      if (str.startsWith('#')) return hexToRgba(str);
      var m = str.match(/[\d.]+/g);
      if (m && m.length >= 3) {
        return [
          Math.min(255, parseFloat(m[0])) / 255,
          Math.min(255, parseFloat(m[1])) / 255,
          Math.min(255, parseFloat(m[2])) / 255,
          m.length >= 4 ? Math.min(1, parseFloat(m[3])) : 1
        ];
      }
    }
    if (Array.isArray(val) && val.length >= 3) return val;
    return fallback;
  }

  function compile(gl, type, src) {
    var sh = gl.createShader(type);
    if (!sh) return null;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.error('CloudSky shader compile error:', gl.getShaderInfoLog(sh));
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  }

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function CloudSky(container, options) {
    if (!container) return;
    this.container = container;
    this.opts = Object.assign({
      background: '#0075FF',
      baseColor: '#B4D2F0',
      accentColor: '#FFFFFF',
      density: 100,
      speed: 16,
      size: 130,
      clouds: { cirrus: 100, shadow: 70, softness: 200 },
      sun: { x: 100, y: 100, glow: '#FFFFFF' },
      pointer: { wind: 0, damping: 50, parallax: 0 }
    }, options || {});

    this.raf = null;
    this.init();
  }

  CloudSky.prototype.init = function () {
    var self = this;
    var container = this.container;

    // Create Canvas
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'cloud-sky-canvas';
    this.canvas.style.position = 'absolute';
    this.canvas.style.inset = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    this.canvas.style.pointerEvents = 'none';

    container.appendChild(this.canvas);

    var gl = this.canvas.getContext('webgl', { alpha: false, antialias: false, depth: false });
    if (!gl) {
      console.warn('CloudSky: WebGL unavailable, falling back to CSS background');
      container.style.background = self.opts.background;
      return;
    }
    this.gl = gl;

    var vs = compile(gl, gl.VERTEX_SHADER, VERT_SRC);
    var fs = compile(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
    if (!vs || !fs) return;

    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('CloudSky link error:', gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);
    this.prog = prog;

    // Big triangle full-screen quad
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    var uMap = {};
    function getU(name) {
      if (!(name in uMap)) {
        uMap[name] = gl.getUniformLocation(prog, name);
      }
      return uMap[name];
    }

    var nearX = 0;
    var farX = 0;
    var cirrusX = 0;
    var lastT = 0;

    // Completely decoupled from mouse cursor - zero listeners attached
    this._cleanupEvents = function () {};

    var clouds = Object.assign({ cirrus: 100, shadow: 70, softness: 200 }, self.opts.clouds || {});
    var sun = Object.assign({ x: 100, y: 100, glow: '#FFFFFF' }, self.opts.sun || {});

    var coverage = clamp(self.opts.density, 0, 100) / 100;
    var speed = clamp(self.opts.speed, 0, 100) / 50;
    var size = clamp(self.opts.size, 20, 300) / 100;
    var softness = 4.5 / Math.max(0.15, clamp(clouds.softness, 20, 300) / 100);
    var shadow = clamp(clouds.shadow, 0, 200) / 100;
    var cirrus = clamp(clouds.cirrus, 0, 100) / 100;
    var sunX = clamp(sun.x, 0, 100) / 100;
    var sunY = clamp(sun.y, 0, 100) / 100;

    var zen = parseColor(self.opts.background, [0.0, 0.459, 1.0, 1]);
    var hor = parseColor(self.opts.baseColor, [0.706, 0.824, 0.941, 1]);
    var cld = parseColor(self.opts.accentColor, [1.0, 1.0, 1.0, 1]);
    var glow = parseColor(sun.glow, [1.0, 1.0, 1.0, 1]);

    var isIntersecting = true;
    var isDocumentVisible = !document.hidden;

    function shouldRender() {
      return isIntersecting && isDocumentVisible && !self.destroyed;
    }

    function startLoop() {
      if (!self.raf && shouldRender()) {
        lastT = performance.now();
        self.raf = requestAnimationFrame(render);
      }
    }

    function stopLoop() {
      if (self.raf) {
        cancelAnimationFrame(self.raf);
        self.raf = null;
      }
    }

    function render(now) {
      if (!shouldRender()) {
        self.raf = null;
        return;
      }

      var dt = lastT ? Math.min(0.1, (now - lastT) * 0.001) : 0.016;
      lastT = now;

      // Pure autonomous, constant slow drift without mouse acceleration
      var rate = speed * 1.0;
      nearX = (nearX - NEAR_DRIFT * rate * dt) % 1000;
      farX = (farX - FAR_DRIFT * rate * dt) % 1000;
      cirrusX = (cirrusX - CIRRUS_DRIFT * rate * dt) % 1000;

      var dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      var cw = self.canvas.clientWidth || window.innerWidth || 1200;
      var ch = self.canvas.clientHeight || window.innerHeight || 800;
      var bw = Math.max(1, Math.round(cw * dpr));
      var bh = Math.max(1, Math.round(ch * dpr));

      if (self.canvas.width !== bw || self.canvas.height !== bh) {
        self.canvas.width = bw;
        self.canvas.height = bh;
      }
      gl.viewport(0, 0, bw, bh);

      gl.uniform2f(getU('uRes'), bw, bh);
      gl.uniform1f(getU('uNearX'), nearX);
      gl.uniform1f(getU('uFarX'), farX);
      gl.uniform1f(getU('uCirrusX'), cirrusX);
      gl.uniform1f(getU('uCoverage'), coverage);
      gl.uniform1f(getU('uSize'), size);
      gl.uniform1f(getU('uSoftness'), softness);
      gl.uniform1f(getU('uShadow'), shadow);
      gl.uniform1f(getU('uCirrus'), cirrus);
      gl.uniform2f(getU('uSun'), sunX, sunY);
      gl.uniform2f(getU('uParallax'), 0.0, 0.0);
      gl.uniform3f(getU('uZenith'), zen[0], zen[1], zen[2]);
      gl.uniform3f(getU('uHorizon'), hor[0], hor[1], hor[2]);
      gl.uniform3f(getU('uCloud'), cld[0], cld[1], cld[2]);
      gl.uniform4f(getU('uGlow'), glow[0], glow[1], glow[2], glow[3]);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
      self.raf = requestAnimationFrame(render);
    }

    if (window.IntersectionObserver) {
      self.observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          isIntersecting = entry.isIntersecting;
          if (isIntersecting) {
            startLoop();
          } else {
            stopLoop();
          }
        });
      }, { rootMargin: '120px' });
      self.observer.observe(container);
    }

    self.onVisibilityChange = function () {
      isDocumentVisible = !document.hidden;
      if (isDocumentVisible) {
        startLoop();
      } else {
        stopLoop();
      }
    };
    document.addEventListener('visibilitychange', self.onVisibilityChange, { passive: true });

    startLoop();
  };

  CloudSky.prototype.destroy = function () {
    this.destroyed = true;
    if (this.raf) cancelAnimationFrame(this.raf);
    if (this.observer) this.observer.disconnect();
    if (this.onVisibilityChange) {
      document.removeEventListener('visibilitychange', this.onVisibilityChange);
    }
    if (this._cleanupEvents) this._cleanupEvents();
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  };

  window.CloudSky = CloudSky;

})(window);
