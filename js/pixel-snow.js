/**
 * PixelSnow - Vanilla JS Implementation of React Bits PixelSnow
 * Interactive WebGL2 Pixelated Snowflake Background with Cursor Deflection
 */

(function () {
  const SPRITES = {
    square: [
      ['@'],
      ['oo', 'oo'],
      ['xox', 'o@o', 'xox'],
      ['xoox', 'o@@o', 'o@@o', 'xoox'],
      ['xooox', 'oo@oo', 'o@@@o', 'oo@oo', 'xooox'],
      ['xox', 'o@o', 'xox'],
      ['xoox', 'o@@o', 'o@@o', 'xoox'],
      ['xooox', 'oo@oo', 'o@@@o', 'oo@oo', 'xooox']
    ],
    round: [
      ['@'],
      ['.x.', 'x@x', '.x.'],
      ['.xx.', 'x@@x', 'x@@x', '.xx.'],
      ['.xxx.', 'xo@ox', 'x@@@x', 'xo@ox', '.xxx.'],
      ['..xxx..', '.xooox.', 'xoo@oox', 'xo@@@ox', 'xoo@oox', '.xooox.', '..xxx..'],
      ['.xx.', 'x@@x', 'x@@x', '.xx.'],
      ['.xxx.', 'xo@ox', 'x@@@x', 'xo@ox', '.xxx.'],
      ['..xxx..', '.xooox.', 'xoo@oox', 'xo@@@ox', 'xoo@oox', '.xooox.', '..xxx..']
    ],
    snowflake: [
      ['@'],
      ['.x.', 'x@x', '.x.'],
      ['..x..', 'x.o.x', '.o@o.', 'x.o.x', '..x..'],
      ['...x...', '.x.o.x.', '..ooo..', 'xoo@oox', '..ooo..', '.x.o.x.', '...x...'],
      [
        '....x....',
        '.x..o..x.',
        '..o.o.o..',
        '...ooo...',
        'xooo@ooox',
        '...ooo...',
        '..o.o.o..',
        '.x..o..x.',
        '....x....'
      ],
      ['x...x', '.o.o.', '..@..', '.o.o.', 'x...x'],
      ['x..x..x', '.o.o.o.', '..ooo..', 'xoo@oox', '..ooo..', '.o.o.o.', 'x..x..x'],
      [
        'x...x...x',
        '.o..o..o.',
        '..o.o.o..',
        '...ooo...',
        'xooo@ooox',
        '...ooo...',
        '..o.o.o..',
        '.o..o..o.',
        'x...x...x'
      ]
    ]
  };

  const VARIANTS = ['square', 'round', 'snowflake'];
  const CELL = 9;
  const LEVELS = 5;
  const SLOTS = 8;
  const MAX_FLAKES = 4000;
  const LEVEL_WEIGHTS = [0.46, 0.27, 0.15, 0.08, 0.04];
  const LEVEL_FALL = [16, 24, 34, 48, 66];
  const LEVEL_LIGHT = [0.42, 0.58, 0.76, 0.92, 1];
  const INTRO_SECONDS = 1.4;

  const QUAD_VERTEX = `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

  const FLAKE_VERTEX = `#version 300 es
in vec2 aCorner;
in vec4 aFlake;
uniform vec2 uGrid;
uniform vec4 uSizes;
uniform float uLargest;
flat out ivec2 vOrigin;
flat out ivec2 vCell;
flat out int vSize;
flat out float vLight;
void main() {
  int index = int(aFlake.z + 0.5);
  int slot = index % ${SLOTS};
  int variant = index / ${SLOTS};
  int level = slot < ${LEVELS} ? slot : slot - 3;
  float size = level == 0 ? 1.0 : (level == 1 ? uSizes.x : (level == 2 ? uSizes.y : (level == 3 ? uSizes.z : uLargest)));
  vec2 origin = floor(aFlake.xy) - floor(size * 0.5);
  origin.y = uGrid.y - origin.y - size;
  vec2 corner = origin + (aCorner * 0.5 + 0.5) * size;
  gl_Position = vec4(corner / uGrid * 2.0 - 1.0, 0.0, 1.0);
  vOrigin = ivec2(origin);
  vCell = ivec2(slot * ${CELL}, variant * ${CELL});
  vSize = int(size);
  vLight = aFlake.w;
}`;

  const FLAKE_FRAGMENT = `#version 300 es
precision highp float;
precision highp int;
uniform sampler2D uAtlas;
flat in ivec2 vOrigin;
flat in ivec2 vCell;
flat in int vSize;
flat in float vLight;
out vec4 outColor;
void main() {
  ivec2 local = ivec2(gl_FragCoord.xy) - vOrigin;
  if (local.x < 0 || local.y < 0 || local.x >= vSize || local.y >= vSize) discard;
  vec4 texel = texelFetch(uAtlas, vCell + local, 0);
  if (texel.r < 0.5) discard;
  outColor = vec4(vLight, texel.g * vLight, 0.0, 1.0);
}`;

  const PILE = `#version 300 es
precision highp float;
precision highp int;
uniform sampler2D uPile;
uniform float uTime;
uniform float uLight;
out vec4 outColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  ivec2 cell = ivec2(gl_FragCoord.xy);
  float height = texelFetch(uPile, ivec2(cell.x, 0), 0).r;
  float row = float(cell.y);
  if (row >= floor(height + 0.5)) discard;
  float below = floor(height + 0.5) - row;
  float crest = below <= 1.0 ? 1.0 : 0.0;
  ivec2 bayerCell = cell & 3;
  int bayerIndex = bayerCell.x + bayerCell.y * 4;
  float bayer[16] = float[16](0.0, 8.0, 2.0, 10.0, 12.0, 4.0, 14.0, 6.0, 3.0, 11.0, 1.0, 9.0, 15.0, 7.0, 13.0, 5.0);
  float threshold = (bayer[bayerIndex] + 0.5) / 16.0;
  float shade = clamp((below - 1.0) / 9.0, 0.0, 1.0) * 3.0;
  float step3 = floor(shade) + step(threshold, fract(shade));
  float body = 0.94 - step3 * 0.13;
  float glint = below <= 3.0 ? step(0.992, hash(vec2(cell) + floor(uTime * 1.1 + hash(vec2(cell.yx)) * 9.0))) : 0.0;
  float core = crest * 0.6 + glint;
  outColor = vec4(body, core, 0.0, 1.0) * uLight;
}`;

  const DOWN = `#version 300 es
precision highp float;
uniform sampler2D uSource;
uniform vec2 uTexel;
uniform vec2 uTarget;
out vec4 outColor;
void main() {
  vec2 uv = gl_FragCoord.xy / uTarget;
  vec4 sum = texture(uSource, uv) * 4.0;
  sum += texture(uSource, uv - uTexel);
  sum += texture(uSource, uv + uTexel);
  sum += texture(uSource, uv + vec2(uTexel.x, -uTexel.y));
  sum += texture(uSource, uv - vec2(uTexel.x, -uTexel.y));
  outColor = sum / 8.0;
}`;

  const UP = `#version 300 es
precision highp float;
uniform sampler2D uSource;
uniform sampler2D uBase;
uniform vec2 uTexel;
uniform vec2 uTarget;
out vec4 outColor;
void main() {
  vec2 uv = gl_FragCoord.xy / uTarget;
  vec2 h = uTexel * 0.5;
  vec4 sum = texture(uSource, uv + vec2(-h.x * 2.0, 0.0));
  sum += texture(uSource, uv + vec2(h.x * 2.0, 0.0));
  sum += texture(uSource, uv + vec2(0.0, -h.y * 2.0));
  sum += texture(uSource, uv + vec2(0.0, h.y * 2.0));
  sum += texture(uSource, uv + vec2(-h.x, h.y)) * 2.0;
  sum += texture(uSource, uv + h) * 2.0;
  sum += texture(uSource, uv + vec2(h.x, -h.y)) * 2.0;
  sum += texture(uSource, uv - h) * 2.0;
  outColor = (sum / 12.0 + texture(uBase, uv)) * 0.5;
}`;

  const COMPOSITE = `#version 300 es
precision highp float;
uniform sampler2D uSnow;
uniform sampler2D uGlowMap;
uniform vec2 uResolution;
uniform vec2 uGrid;
uniform float uPixel;
uniform vec3 uColor;
uniform float uBrightness;
uniform float uGlow;
uniform float uFade;
uniform float uOpacity;
uniform float uLightMode;
out vec4 outColor;

float smootherstep(float edge, float x) {
  float t = clamp(x / max(edge, 0.0001), 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  ivec2 cell = ivec2(floor(gl_FragCoord.xy / uPixel));
  vec4 snow = texelFetch(uSnow, clamp(cell, ivec2(0), ivec2(uGrid) - 1), 0);
  vec2 glow = texture(uGlowMap, gl_FragCoord.xy / (uGrid * uPixel)).rg;
  float edge = uFade * 0.5;
  float mask = smootherstep(edge, uv.x) * smootherstep(edge, 1.0 - uv.x) * smootherstep(edge, uv.y) * smootherstep(edge, 1.0 - uv.y);
  mask *= uOpacity;
  float body = clamp(snow.r * uBrightness, 0.0, 1.0);
  float core = clamp(snow.g * uBrightness, 0.0, 1.0);
  float halo = clamp(glow.r * uGlow * uBrightness, 0.0, 1.0);
  if (uLightMode > 0.5) {
    vec3 tint = mix(uColor, vec3(1.0), clamp(core / max(body, 0.001), 0.0, 1.0) * 0.45);
    float alpha = body * 0.95;
    vec4 color = vec4(tint * alpha, alpha);
    float soft = halo * 0.22 * (1.0 - alpha);
    color += vec4(uColor * soft, soft);
    outColor = color * mask;
  } else {
    vec3 color = uColor * (body * 0.82 + core * 0.18) + uColor * halo * 0.55;
    color = 1.0 - exp(-color * 1.6);
    color *= mask;
    outColor = vec4(color, max(color.r, max(color.g, color.b)));
  }
}`;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const seeded = (seed) => {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  const compile = (gl, type, source) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
    console.warn('PixelSnow shader compilation error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  };

  const link = (gl, vertexSource, fragmentSource, attributes) => {
    const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) return null;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    attributes.forEach((name, index) => gl.bindAttribLocation(program, index, name));
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('PixelSnow program linking error:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }
    const uniforms = {};
    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < count; i++) {
      const info = gl.getActiveUniform(program, i);
      if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);
    }
    return { program, uniforms };
  };

  const buildAtlas = () => {
    const width = CELL * SLOTS;
    const height = CELL * VARIANTS.length;
    const data = new Uint8Array(width * height * 4);
    VARIANTS.forEach((variant, row) => {
      SPRITES[variant].forEach((rows, level) => {
        rows.forEach((line, y) => {
          for (let x = 0; x < line.length; x++) {
            const mark = line[x];
            if (mark === '.') continue;
            const offset = ((row * CELL + y) * width + level * CELL + x) * 4;
            data[offset] = 255;
            data[offset + 1] = mark === '@' ? 255 : mark === 'o' ? 128 : 0;
            data[offset + 3] = 255;
          }
        });
      });
    });
    return { data, width, height };
  };

  class PixelSnow {
    constructor(container, options = {}) {
      if (typeof container === 'string') {
        container = document.querySelector(container);
      }
      if (!container) {
        console.warn('PixelSnow: container not found');
        return;
      }
      this.container = container;
      this.initOptions(options);
      this.init();
    }

    initOptions(options) {
      this.settings = {
        color: options.color || '#ffffff',
        variant: Math.max(0, VARIANTS.indexOf(options.variant || 'snowflake')),
        density: clamp(options.density !== undefined ? options.density : 0.5, 0, 1),
        speed: options.speed !== undefined ? options.speed : 1,
        wind: clamp(options.wind !== undefined ? options.wind : 0.25, -2, 2),
        sway: Math.max(0, options.sway !== undefined ? options.sway : 0.5),
        flakeSize: clamp(options.flakeSize !== undefined ? options.flakeSize : 1, 0, 2),
        pixelSize: Math.round(clamp(options.pixelSize !== undefined ? options.pixelSize : 3, 1, 12)),
        depth: clamp(options.depth !== undefined ? options.depth : 0.6, 0, 1),
        brightness: Math.max(0, options.brightness !== undefined ? options.brightness : 1),
        glow: Math.max(0, options.glow !== undefined ? options.glow : 0.8),
        twinkle: clamp(options.twinkle !== undefined ? options.twinkle : 0.35, 0, 1),
        accumulate: options.accumulate || false,
        mouseInteraction: options.mouseInteraction !== undefined ? options.mouseInteraction : true,
        intro: options.intro !== undefined ? options.intro : true,
        fade: clamp(options.fade !== undefined ? options.fade : 0, 0, 1),
        opacity: clamp(options.opacity !== undefined ? options.opacity : 1, 0, 1),
        lightMode: options.lightMode || false,
        paused: options.paused || false,
        dpr: options.dpr
      };
    }

    init() {
      // Ensure container styling
      this.container.classList.add('pixel-snow-container');
      if (getComputedStyle(this.container).position === 'static') {
        this.container.style.position = 'relative';
      }

      this.canvas = document.createElement('canvas');
      this.canvas.className = 'pixel-snow-canvas';
      this.canvas.setAttribute('aria-hidden', 'true');
      this.canvas.style.position = 'absolute';
      this.canvas.style.inset = '0';
      this.canvas.style.display = 'block';
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.style.pointerEvents = 'none';
      this.container.appendChild(this.canvas);

      const gl = this.canvas.getContext('webgl2', {
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        depth: false,
        stencil: false
      });

      if (!gl) {
        console.warn('PixelSnow: WebGL2 not supported, falling back to 2D canvas');
        this.init2DFallback();
        return;
      }
      this.gl = gl;

      this.programs = {
        flake: link(gl, FLAKE_VERTEX, FLAKE_FRAGMENT, ['aCorner', 'aFlake']),
        pile: link(gl, QUAD_VERTEX, PILE, ['aPosition']),
        down: link(gl, QUAD_VERTEX, DOWN, ['aPosition']),
        up: link(gl, QUAD_VERTEX, UP, ['aPosition']),
        composite: link(gl, QUAD_VERTEX, COMPOSITE, ['aPosition'])
      };

      if (Object.values(this.programs).some((entry) => !entry)) {
        console.warn('PixelSnow: failed to link WebGL2 programs, using fallback');
        this.init2DFallback();
        return;
      }

      const atlas = buildAtlas();
      this.atlasTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.atlasTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, atlas.width, atlas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, atlas.data);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

      this.quadBuffer = gl.createBuffer();
      this.quadVao = gl.createVertexArray();
      gl.bindVertexArray(this.quadVao);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

      this.cornerBuffer = gl.createBuffer();
      this.instanceBuffer = gl.createBuffer();
      this.flakeVao = gl.createVertexArray();
      gl.bindVertexArray(this.flakeVao);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.cornerBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
      gl.enableVertexAttribArray(1);
      gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(1, 1);
      gl.bindVertexArray(null);

      const createTarget = (filter) => {
        const target = { texture: gl.createTexture(), framebuffer: gl.createFramebuffer(), width: 0, height: 0 };
        gl.bindTexture(gl.TEXTURE_2D, target.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        return target;
      };

      this.createTarget = createTarget;
      this.sizeTarget = (target, width, height) => {
        if (target.width === width && target.height === height) return;
        target.width = width;
        target.height = height;
        gl.bindTexture(gl.TEXTURE_2D, target.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.texture, 0);
      };

      this.snow = createTarget(gl.NEAREST);
      this.pileTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.pileTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      this.pile = new Float32Array(0);
      this.pileWidth = 0;
      this.down = [createTarget(gl.LINEAR), createTarget(gl.LINEAR), createTarget(gl.LINEAR)];
      this.up = [createTarget(gl.LINEAR), createTarget(gl.LINEAR)];

      this.probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
      this.reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
      this.colorCache = new Map();

      this.rng = seeded(4271);
      this.flakes = [];
      this.view = { width: 1, height: 1, ratio: 1, pixel: 1, gridWidth: 1, gridHeight: 1 };
      this.pointer = { x: 0, y: 0, vx: 0, vy: 0, inside: false, time: 0 };
      this.state = { time: 0, intro: this.settings.intro && !this.reduce ? 0 : 1, push: 0 };
      this.instances = new Float32Array(MAX_FLAKES * 4);
      this.raf = 0;
      this.last = 0;
      this.visible = true;

      // Event listeners
      this.onPointerMove = (event) => {
        const rect = this.container.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const now = performance.now();
        if (this.pointer.inside && this.pointer.time) {
          const elapsed = Math.max(1, now - this.pointer.time) / 1000;
          this.pointer.vx = clamp((x - this.pointer.x) / elapsed, -3000, 3000);
          this.pointer.vy = clamp((y - this.pointer.y) / elapsed, -3000, 3000);
        }
        this.pointer.x = x;
        this.pointer.y = y;
        this.pointer.time = now;
        this.pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
        this.wake();
      };

      this.onPointerLeave = () => {
        this.pointer.inside = false;
        this.wake();
      };

      this.onVisibility = () => {
        this.last = 0;
        this.wake();
      };

      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this.container);

      this.intersectionObserver = new IntersectionObserver((entries) => {
        this.visible = entries.some((entry) => entry.isIntersecting);
        if (this.visible) {
          this.last = 0;
          this.wake();
        }
      });
      this.intersectionObserver.observe(this.container);

      window.addEventListener('pointermove', this.onPointerMove, { passive: true });
      document.documentElement.addEventListener('pointerleave', this.onPointerLeave);
      document.addEventListener('visibilitychange', this.onVisibility);

      this.resize();
    }

    toRgb(value) {
      if (this.colorCache.has(value)) return this.colorCache.get(value);
      let rgb = [1, 1, 1];
      if (this.probe) {
        this.probe.clearRect(0, 0, 1, 1);
        this.probe.fillStyle = '#ffffff';
        this.probe.fillStyle = value;
        this.probe.fillRect(0, 0, 1, 1);
        const [r, g, b] = this.probe.getImageData(0, 0, 1, 1).data;
        rgb = [r / 255, g / 255, b / 255];
      }
      this.colorCache.set(value, rgb);
      return rgb;
    }

    pickLevel(r, s) {
      const shift = s.flakeSize - 1;
      let total = 0;
      const weights = LEVEL_WEIGHTS.map((weight, level) => weight * Math.pow(2.2, shift * (level - 1.5)));
      const sum = weights.reduce((a, b) => a + b, 0);
      for (let level = 0; level < LEVELS; level++) {
        total += weights[level] / sum;
        if (r <= total) return level;
      }
      return LEVELS - 1;
    }

    spawn(flake, s, top) {
      flake.level = this.pickLevel(this.rng(), s);
      flake.x = this.rng() * (this.view.width + 40) - 20;
      flake.y = top ? -10 - this.rng() * 30 : this.rng() * this.view.height;
      flake.vx = 0;
      flake.vy = LEVEL_FALL[flake.level];
      flake.phase = this.rng() * Math.PI * 2;
      flake.rate = 0.6 + this.rng() * 0.9;
      flake.sparkle = this.rng() * 100;
      flake.drift = 0.7 + this.rng() * 0.6;
      flake.alt = this.rng() < 0.5;
      flake.reveal = this.rng();
      flake.levelSize = s.flakeSize;
    }

    populate(s) {
      const target = Math.round(clamp((this.view.width * this.view.height * s.density) / 1100, 0, MAX_FLAKES));
      while (this.flakes.length < target) {
        const flake = {};
        this.spawn(flake, s, false);
        this.flakes.push(flake);
      }
      if (this.flakes.length > target) this.flakes.length = target;
    }

    simulate(s, dt) {
      const fall = s.speed;
      const windSpeed = s.wind * 46;
      const radius = 120;
      const pushing = this.state.push > 0.001 && this.pointer.inside;
      const margin = 24;
      const settle = s.accumulate && fall > 0 && this.pile.length > 0;
      for (const flake of this.flakes) {
        if (flake.levelSize !== s.flakeSize) {
          flake.level = this.pickLevel(this.rng(), s);
          flake.levelSize = s.flakeSize;
        }
        const level = flake.level;
        const parallax = 1 - s.depth * (1 - (level + 1) / LEVELS) * 0.75;
        const swing = Math.sin(this.state.time * flake.rate + flake.phase) * s.sway * (6 + level * 7);
        const targetX = (windSpeed * parallax + swing) * flake.drift;
        const targetY = LEVEL_FALL[level] * parallax * fall * flake.drift;
        const ease = 1 - Math.exp(-dt * 2.2);
        flake.vx += (targetX - flake.vx) * ease;
        flake.vy += (targetY - flake.vy) * ease;
        if (pushing) {
          const dx = flake.x - this.pointer.x;
          const dy = flake.y - this.pointer.y;
          const distance = Math.hypot(dx, dy);
          if (distance < radius && distance > 0.001) {
            const near = 1 - distance / radius;
            const repel = near * near * near * this.state.push * 1500 * dt;
            const carry = near * near * this.state.push * dt * 5;
            flake.vx += (dx / distance) * repel + this.pointer.vx * carry;
            flake.vy += (dy / distance) * repel + this.pointer.vy * carry;
          }
        }
        flake.x += flake.vx * dt;
        flake.y += flake.vy * dt;
        if (settle) {
          const column = Math.floor(flake.x / this.view.pixel);
          if (column >= 0 && column < this.pile.length) {
            const surface = this.view.height - this.pile[column] * this.view.pixel;
            if (flake.y >= surface && this.pile[column] > 0.5) {
              const reach = level;
              for (let k = -reach; k <= reach; k++) {
                const index = column + k;
                if (index >= 0 && index < this.pile.length)
                  this.pile[index] += (0.35 + level * 0.15) * (1 - Math.abs(k) / (reach + 1));
              }
              this.spawn(flake, s, true);
              flake.reveal = -1;
              continue;
            }
          }
        }
        if (fall >= 0 ? flake.y > this.view.height + margin : flake.y < -margin) {
          this.spawn(flake, s, true);
          flake.reveal = -1;
          if (fall < 0) flake.y = this.view.height + 10 + this.rng() * 30;
        }
        if (flake.x < -margin) flake.x += this.view.width + margin * 2;
        else if (flake.x > this.view.width + margin) flake.x -= this.view.width + margin * 2;
      }
    }

    settlePile(s, dt) {
      if (!this.pile.length) return;
      const cap = Math.max(4, this.view.gridHeight * 0.08);
      if (s.accumulate && s.speed > 0) {
        const grow = (0.25 + s.density * 0.9) * dt * Math.min(1, s.speed);
        for (let i = 0; i < this.pile.length; i++) {
          const dune = 0.55 + 0.45 * Math.sin(i * 0.045 + Math.sin(i * 0.013) * 2.1) * Math.sin(i * 0.021 + 1.3);
          if (this.pile[i] < cap * dune) this.pile[i] += grow * (0.6 + 0.8 * dune);
        }
      }
      for (let pass = 0; pass < 2; pass++) {
        const forward = pass === 0;
        for (let k = 0; k < this.pile.length - 1; k++) {
          const i = forward ? k : this.pile.length - 2 - k;
          const difference = this.pile[i] - this.pile[i + 1];
          if (Math.abs(difference) > 1.2) {
            const move = (Math.abs(difference) - 1.2) * 0.5 * Math.sign(difference);
            this.pile[i] -= move;
            this.pile[i + 1] += move;
          }
        }
      }
      for (let i = 0; i < this.pile.length; i++) {
        const excess = Math.max(0, this.pile[i] - cap);
        const rate = s.accumulate && s.speed > 0 ? excess * 0.8 : 2 + this.pile[i] * 0.6;
        this.pile[i] = Math.max(0, this.pile[i] - rate * dt);
      }
    }

    run(entry, target, width, height) {
      const gl = this.gl;
      gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.framebuffer : null);
      gl.viewport(0, 0, width, height);
      gl.useProgram(entry.program);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    bindTexture(entry, name, unit, texture) {
      const gl = this.gl;
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(entry.uniforms[name], unit);
    }

    render() {
      const gl = this.gl;
      const s = this.settings;
      this.sizeTarget(this.snow, this.view.gridWidth, this.view.gridHeight);
      let count = 0;
      const sizes = SPRITES[VARIANTS[s.variant]].map((rows) => rows.length);
      const sweep = this.state.intro * 1.75;
      for (const flake of this.flakes) {
        const level = flake.level;
        const depthLight = 1 - s.depth * (1 - LEVEL_LIGHT[level]);
        const spark = Math.pow(Math.max(0, Math.sin(this.state.time * 0.9 + flake.sparkle)), 60) * s.twinkle;
        const reveal =
          flake.reveal < 0 || this.state.intro >= 1
            ? 1
            : clamp((sweep - flake.y / this.view.height - flake.reveal * 0.25) / 0.35, 0, 1);
        if (reveal <= 0) continue;
        const slot = level >= 2 && flake.alt ? level + 3 : level;
        const o = count * 4;
        this.instances[o] = flake.x / this.view.pixel;
        this.instances[o + 1] = flake.y / this.view.pixel;
        this.instances[o + 2] = s.variant * SLOTS + slot;
        this.instances[o + 3] = Math.min(1, depthLight * (0.85 + spark * 0.6)) * reveal * reveal;
        count++;
      }

      gl.bindFramebuffer(gl.FRAMEBUFFER, this.snow.framebuffer);
      gl.viewport(0, 0, this.snow.width, this.snow.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      if (this.pile.length && this.pile.some((height) => height > 0.4)) {
        gl.bindTexture(gl.TEXTURE_2D, this.pileTexture);
        if (this.pileWidth !== this.pile.length) {
          this.pileWidth = this.pile.length;
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, this.pileWidth, 1, 0, gl.RED, gl.FLOAT, this.pile);
        } else {
          gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, this.pileWidth, 1, gl.RED, gl.FLOAT, this.pile);
        }
        const pileProgram = this.programs.pile;
        gl.useProgram(pileProgram.program);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.pileTexture);
        gl.uniform1i(pileProgram.uniforms.uPile, 0);
        gl.uniform1f(pileProgram.uniforms.uTime, this.state.time);
        gl.uniform1f(pileProgram.uniforms.uLight, 1 - s.depth * 0.1);
        gl.bindVertexArray(this.quadVao);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }

      if (count > 0) {
        const flake = this.programs.flake;
        gl.useProgram(flake.program);
        gl.uniform2f(flake.uniforms.uGrid, this.snow.width, this.snow.height);
        gl.uniform4f(flake.uniforms.uSizes, sizes[1], sizes[2], sizes[3], 0);
        gl.uniform1f(flake.uniforms.uLargest, sizes[4]);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.atlasTexture);
        gl.uniform1i(flake.uniforms.uAtlas, 0);
        gl.enable(gl.BLEND);
        gl.blendEquation(gl.MAX);
        gl.bindVertexArray(this.flakeVao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.instances.subarray(0, count * 4), gl.DYNAMIC_DRAW);
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count);
        gl.blendEquation(gl.FUNC_ADD);
        gl.disable(gl.BLEND);
      }

      gl.bindVertexArray(this.quadVao);
      let source = this.snow;
      for (let level = 0; level < this.down.length; level++) {
        const target = this.down[level];
        this.sizeTarget(target, Math.max(1, Math.ceil(source.width / 2)), Math.max(1, Math.ceil(source.height / 2)));
        gl.useProgram(this.programs.down.program);
        gl.uniform2f(this.programs.down.uniforms.uTexel, 1 / source.width, 1 / source.height);
        gl.uniform2f(this.programs.down.uniforms.uTarget, target.width, target.height);
        this.bindTexture(this.programs.down, 'uSource', 0, source.texture);
        this.run(this.programs.down, target, target.width, target.height);
        source = target;
      }

      for (let level = this.up.length - 1; level >= 0; level--) {
        const from = level === this.up.length - 1 ? this.down[this.down.length - 1] : this.up[level + 1];
        const target = this.up[level];
        this.sizeTarget(target, this.down[level].width, this.down[level].height);
        gl.useProgram(this.programs.up.program);
        gl.uniform2f(this.programs.up.uniforms.uTexel, 1 / from.width, 1 / from.height);
        gl.uniform2f(this.programs.up.uniforms.uTarget, target.width, target.height);
        this.bindTexture(this.programs.up, 'uSource', 0, from.texture);
        this.bindTexture(this.programs.up, 'uBase', 1, this.down[level].texture);
        this.run(this.programs.up, target, target.width, target.height);
      }

      const composite = this.programs.composite;
      const c = composite.uniforms;
      gl.useProgram(composite.program);
      gl.uniform2f(c.uResolution, this.canvas.width, this.canvas.height);
      gl.uniform2f(c.uGrid, this.snow.width, this.snow.height);
      gl.uniform1f(c.uPixel, this.view.pixel * this.view.ratio);
      gl.uniform3fv(c.uColor, this.toRgb(s.color));
      gl.uniform1f(c.uBrightness, s.brightness);
      gl.uniform1f(c.uGlow, s.glow);
      gl.uniform1f(c.uFade, s.fade);
      gl.uniform1f(c.uOpacity, s.opacity);
      gl.uniform1f(c.uLightMode, s.lightMode ? 1 : 0);
      this.bindTexture(composite, 'uSnow', 0, this.snow.texture);
      this.bindTexture(composite, 'uGlowMap', 1, this.up[0].texture);
      this.run(composite, null, this.canvas.width, this.canvas.height);
    }

    frame(now) {
      this.raf = 0;
      if (!this.visible || document.hidden) return;
      const s = this.settings;
      const dt = this.last ? Math.min(0.05, (now - this.last) / 1000) : 1 / 60;
      this.last = now;
      const moving = !s.paused && !this.reduce;
      if (!s.intro || this.reduce) this.state.intro = 1;
      else if (this.state.intro < 1) this.state.intro = Math.min(1, this.state.intro + dt / INTRO_SECONDS);
      const goal = s.mouseInteraction && this.pointer.inside && !this.reduce ? 1 : 0;
      this.state.push += (goal - this.state.push) * (1 - Math.exp(-dt * (goal ? 6 : 3)));
      this.pointer.vx *= Math.exp(-dt * 6);
      this.pointer.vy *= Math.exp(-dt * 6);
      this.populate(s);
      if (moving) {
        this.state.time += dt;
        this.simulate(s, dt);
        this.settlePile(s, dt);
      }
      this.render();
      if (moving || Math.abs(goal - this.state.push) > 0.001) {
        this.raf = requestAnimationFrame((n) => this.frame(n));
      } else {
        this.last = 0;
      }
    }

    wake() {
      if (!this.raf && this.visible && !document.hidden) {
        this.raf = requestAnimationFrame((n) => this.frame(n));
      }
    }

    resize() {
      const s = this.settings;
      const width = Math.max(1, this.container.clientWidth);
      const height = Math.max(1, this.container.clientHeight);
      const ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);
      this.view.width = width;
      this.view.height = height;
      this.view.ratio = ratio;
      this.view.pixel = Math.max(1, Math.round(s.pixelSize * ratio)) / ratio;
      this.canvas.width = Math.max(1, Math.round(width * ratio));
      this.canvas.height = Math.max(1, Math.round(height * ratio));
      this.view.gridWidth = Math.max(1, Math.ceil(width / this.view.pixel));
      this.view.gridHeight = Math.max(1, Math.ceil(height / this.view.pixel));
      if (this.pile.length !== this.view.gridWidth) this.pile = new Float32Array(this.view.gridWidth);
      this.populate(s);
      if (!this.raf) this.render();
      this.wake();
    }

    init2DFallback() {
      const ctx = this.canvas.getContext('2d');
      if (!ctx) return;
      const flakes = [];
      const count = 120;
      for (let i = 0; i < count; i++) {
        flakes.push({
          x: Math.random() * this.container.clientWidth,
          y: Math.random() * this.container.clientHeight,
          size: Math.random() * 3 + 2,
          speed: Math.random() * 1.5 + 0.8,
          drift: Math.random() * 0.5 - 0.25
        });
      }
      const animate = () => {
        const w = (this.canvas.width = this.container.clientWidth);
        const h = (this.canvas.height = this.container.clientHeight);
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#ffffff';
        flakes.forEach((f) => {
          f.y += f.speed;
          f.x += f.drift;
          if (f.y > h) f.y = -10;
          if (f.x > w) f.x = 0;
          if (f.x < 0) f.x = w;
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
          ctx.fill();
        });
        requestAnimationFrame(animate);
      };
      animate();
    }

    destroy() {
      if (this.raf) cancelAnimationFrame(this.raf);
      if (this.resizeObserver) this.resizeObserver.disconnect();
      if (this.intersectionObserver) this.intersectionObserver.disconnect();
      window.removeEventListener('pointermove', this.onPointerMove);
      document.documentElement.removeEventListener('pointerleave', this.onPointerLeave);
      document.removeEventListener('visibilitychange', this.onVisibility);
      if (this.canvas && this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas);
      }
    }
  }

  window.PixelSnow = PixelSnow;
})();
