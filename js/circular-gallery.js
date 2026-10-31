/**
 * CircularGallery - Vanilla JavaScript + WebGL 2 Curved Ribbon Gallery
 * Ported from React Bits <CircularGallery /> Component
 * 
 * Features:
 * - 3D Curved Arc ribbon with customizable bend (-10 to 10)
 * - WebGL 2 high-performance rendering with SDF rounded cards & smooth edge antialiasing
 * - Wave ripple dynamics during drag and inertial spin
 * - Open-on-click modal image expansion with caption display
 * - Dual mouse drag & touch gesture inertia throwing
 * - Keyboard accessibility (Arrow keys, Home, End, Escape, Focus ring)
 * - Auto-scroll with pause-on-hover & idle resume
 * - IntersectionObserver sleep mode (0% CPU when out of viewport)
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CircularGallery = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const DEFAULT_FONT = 'bold 30px Figtree';
  const DEFAULT_FONT_URL = 'https://fonts.googleapis.com/css2?family=Figtree:wght@400;700&display=swap';
  const SEGMENTS_X = 32;
  const SEGMENTS_Y = 24;
  const INTRO_SECONDS = 1.4;
  const WORLD_HEIGHT = 16.57;

  const CLASSES = {
    root: 'circular-gallery',
    canvas: 'circular-gallery-canvas',
    labels: 'circular-gallery-labels',
    label: 'circular-gallery-label',
    caption: 'circular-gallery-caption',
    captionText: 'circular-gallery-caption-text',
    close: 'circular-gallery-close',
    hidden: 'circular-gallery-hidden'
  };

  const STEPS = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

  const DEFAULT_ITEMS = [
    { image: 'https://picsum.photos/seed/1/800/600', text: 'Bridge', description: 'Architectural suspension bridge connecting communities with resilient infrastructure.' },
    { image: 'https://picsum.photos/seed/2/800/600', text: 'Desk Setup', description: 'Modern workspace setup designed for focused productivity and digital access.' },
    { image: 'https://picsum.photos/seed/3/800/600', text: 'Waterfall', description: 'Natural cascades providing sustainable water flow and ecological vitality.' },
    { image: 'https://picsum.photos/seed/4/800/600', text: 'Strawberries', description: 'Fresh organic agriculture supported through micro-credit rural farming grants.' },
    { image: 'https://picsum.photos/seed/5/800/600', text: 'Deep Diving', description: 'Deep ocean exploration and environmental monitoring equipment.' },
    { image: 'https://picsum.photos/seed/16/800/600', text: 'Train Track', description: 'National railway connectivity expanding reach to remote aspirational districts.' },
    { image: 'https://picsum.photos/seed/17/800/600', text: 'Santorini', description: 'Historic architecture integrated with modern accessibility standards.' },
    { image: 'https://picsum.photos/seed/8/800/600', text: 'Blurry Lights', description: 'Urban mobility networks operating round the clock for public welfare.' }
  ];

  const VERTEX = `#version 300 es
in vec2 aPosition;
uniform vec2 uResolution;
uniform vec2 uCenter;
uniform vec2 uSize;
uniform float uAngle;
uniform float uPad;
uniform float uWave;
uniform float uWaveTime;
uniform float uFocal;
out vec2 vLocal;
void main() {
  vec2 local = aPosition * (uSize + 2.0 * uPad);
  vec2 unit = local / max(uSize, vec2(1.0));
  float z = uWave * (sin(unit.x * 4.0 + uWaveTime) + cos(unit.y * 2.0 + uWaveTime)) * 0.5;
  float depth = uFocal / max(uFocal - z, 1.0);
  float c = cos(uAngle);
  float s = sin(uAngle);
  vec2 turned = vec2(c * local.x - s * local.y, s * local.x + c * local.y);
  vLocal = local;
  gl_Position = vec4((uCenter + turned * depth) / (uResolution * 0.5), 0.0, 1.0);
}`;

  const FRAGMENT = `#version 300 es
precision highp float;
uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform vec2 uSize;
uniform float uRadius;
uniform float uImageAspect;
uniform float uReady;
uniform vec3 uPlaceholder;
uniform float uGray;
uniform float uDim;
uniform float uAlpha;
uniform float uRing;
uniform vec3 uRingColor;
uniform float uRingWidth;
uniform float uRingGap;
uniform float uFade;
uniform float uShadow;
uniform float uBlur;
uniform vec2 uShadowOffset;
in vec2 vLocal;
out vec4 outColor;

float roundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float smoother(float x) {
  x = clamp(x, 0.0, 1.0);
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
}

float edgeFade() {
  if (uFade <= 0.0) return 1.0;
  float u = gl_FragCoord.x / uResolution.x;
  return smoother(u / uFade) * smoother((1.0 - u) / uFade);
}

void main() {
  vec2 extent = uSize * 0.5;
  if (uShadow > 0.0) {
    float d = roundBox(vLocal - uShadowOffset, extent, uRadius);
    float a = uShadow * (1.0 - smoothstep(-uBlur, uBlur, d)) * uAlpha * edgeFade();
    outColor = vec4(0.0, 0.0, 0.0, a);
    return;
  }
  float d = roundBox(vLocal, extent, uRadius);
  float pixel = max(length(vec2(dFdx(d), dFdy(d))), 1e-4);
  float cover = clamp(0.5 - d / pixel, 0.0, 1.0);
  vec2 uv = vLocal / uSize + 0.5;
  float aspect = uSize.x / uSize.y;
  vec2 crop = aspect > uImageAspect ? vec2(1.0, uImageAspect / aspect) : vec2(aspect / uImageAspect, 1.0);
  vec3 image = texture(uTexture, (uv - 0.5) * crop + 0.5).rgb;
  vec3 color = mix(uPlaceholder, image, uReady);
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
  color = mix(color, vec3(luma), uGray) * (1.0 - uDim);
  float body = cover * mix(0.08, 1.0, uReady);
  float band = abs(d - uRingGap - uRingWidth * 0.5) - uRingWidth * 0.5;
  float ring = clamp(0.5 - band / pixel, 0.0, 1.0) * uRing;
  vec4 card = vec4(color * body, body);
  vec4 outline = vec4(uRingColor * ring, ring);
  outColor = (card + outline * (1.0 - card.a)) * uAlpha * edgeFade();
}`;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const mix = (a, b, t) => a + (b - a) * t;
  const ease = value => value * value * (3 - 2 * value);
  const wrap = (value, length) => ((value % length) + length) % length;

  function deriveFontFamilyFromUrl(url) {
    const fileName = (url.split('/').pop() || 'custom-font').split('?')[0];
    const base = fileName.replace(/\.(woff2?|ttf|otf|eot)$/i, '');
    return base.replace(/[^a-zA-Z0-9-_ ]/g, '').trim() || 'CircularGalleryFont';
  }

  async function loadFontFromStylesheet(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch font stylesheet (${response.status})`);
    const cssText = await response.text();
    const faceBlocks = cssText.match(/@font-face\s*{[^}]*}/g) || [];
    let family = null;
    const fontFaces = [];
    for (const block of faceBlocks) {
      const familyMatch = block.match(/font-family:\s*['"]?([^;'"]+)['"]?/);
      const urlMatch = block.match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/);
      if (!familyMatch || !urlMatch) continue;
      family = familyMatch[1].trim();
      const descriptors = {};
      const weightMatch = block.match(/font-weight:\s*([^;]+);/);
      const styleMatch = block.match(/font-style:\s*([^;]+);/);
      const rangeMatch = block.match(/unicode-range:\s*([^;]+);/);
      if (weightMatch) descriptors.weight = weightMatch[1].trim();
      if (styleMatch) descriptors.style = styleMatch[1].trim();
      if (rangeMatch) descriptors.unicodeRange = rangeMatch[1].trim();
      fontFaces.push(new FontFace(family, `url(${urlMatch[1]})`, descriptors));
    }
    if (!family) throw new Error('No @font-face rule found in the stylesheet');
    await Promise.allSettled(
      fontFaces.map(async face => {
        await face.load();
        document.fonts.add(face);
      })
    );
    return family;
  }

  async function loadFontFromFile(url) {
    const family = deriveFontFamilyFromUrl(url);
    const fontFace = new FontFace(family, `url(${url})`);
    await fontFace.load();
    document.fonts.add(fontFace);
    return family;
  }

  async function resolveFont(font, fontUrl) {
    const url = fontUrl || (font === DEFAULT_FONT ? DEFAULT_FONT_URL : null);
    if (!url) return font;
    try {
      const isStylesheet = url.includes('fonts.googleapis.com') || /\.css(\?.*)?$/i.test(url);
      const family = isStylesheet ? await loadFontFromStylesheet(url) : await loadFontFromFile(url);
      const sizeMatch = font.match(/^\s*(.*?\d+px)/);
      return `${sizeMatch ? sizeMatch[1].trim() : 'bold 30px'} "${family}"`;
    } catch {
      return font;
    }
  }

  const fontScale = font => {
    const match = String(font).match(/(\d+(?:\.\d+)?)px/);
    return match ? parseFloat(match[1]) / 30 : 1;
  };

  const compile = (gl, type, source) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
    console.warn('[CircularGallery] Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  };

  const link = gl => {
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) return null;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.bindAttribLocation(program, 0, 'aPosition');
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('[CircularGallery] Program link error:', gl.getProgramInfoLog(program));
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

  class CircularGallery {
    constructor(container, options = {}) {
      this.container = typeof container === 'string' ? document.querySelector(container) : container;
      if (!this.container) {
        console.error('[CircularGallery] Container element not found:', container);
        return;
      }

      const list = Array.isArray(options.items) && options.items.length ? options.items : DEFAULT_ITEMS;

      this.settings = {
        items: list,
        bend: options.bend !== undefined ? options.bend : 3,
        textColor: options.textColor || '#ffffff',
        borderRadius: clamp(options.borderRadius !== undefined ? options.borderRadius : 0.05, 0, 0.5),
        scrollSpeed: Math.max(0, options.scrollSpeed !== undefined ? options.scrollSpeed : 2),
        scrollEase: clamp(options.scrollEase !== undefined ? options.scrollEase : 0.05, 0.001, 1),
        itemSize: clamp(options.itemSize !== undefined ? options.itemSize : 1, 0.2, 2),
        itemAspect: clamp(options.itemAspect !== undefined ? options.itemAspect : 0.78, 0.2, 5),
        gap: Math.max(0, options.gap !== undefined ? options.gap : 0.26),
        wave: Math.max(0, options.wave !== undefined ? options.wave : 1),
        fadeEdges: clamp(options.fadeEdges !== undefined ? options.fadeEdges : 0.12, 0, 0.5),
        shadow: clamp(options.shadow !== undefined ? options.shadow : 0.25, 0, 1),
        grayscale: !!options.grayscale,
        showTitles: options.showTitles !== undefined ? options.showTitles : true,
        snap: options.snap !== undefined ? options.snap : true,
        autoScroll: options.autoScroll !== undefined ? options.autoScroll : 0,
        openOnClick: options.openOnClick !== undefined ? options.openOnClick : true,
        intro: options.intro !== undefined ? options.intro : true,
        onItemClick: options.onItemClick || null,
        onActiveChange: options.onActiveChange || null,
        dpr: options.dpr || undefined,
        font: options.font || DEFAULT_FONT,
        fontUrl: options.fontUrl || undefined
      };

      this.active = 0;
      this.openState = false;
      this.buttons = [];
      this.font = this.settings.font;
      this.destroyed = false;

      this._initDOM();
      this._initWebGL();
      this._bindFont();
    }

    _initDOM() {
      const c = this.container;
      c.classList.add(CLASSES.root);
      c.setAttribute('role', 'region');
      c.setAttribute('aria-roledescription', 'carousel');
      c.setAttribute('aria-label', 'Image gallery');
      c.style.color = this.settings.textColor;

      // Canvas
      this.canvas = document.createElement('canvas');
      this.canvas.className = CLASSES.canvas;
      this.canvas.setAttribute('aria-hidden', 'true');
      c.appendChild(this.canvas);

      // Labels Layer
      this.labelLayer = document.createElement('div');
      this.labelLayer.className = CLASSES.labels;
      this.labelLayer.setAttribute('aria-hidden', 'true');
      c.appendChild(this.labelLayer);

      // Caption Overlay
      this.caption = document.createElement('div');
      this.caption.className = CLASSES.caption;
      this.caption.setAttribute('aria-hidden', 'true');
      this.captionText = document.createElement('p');
      this.captionText.className = CLASSES.captionText;
      this.caption.appendChild(this.captionText);
      c.appendChild(this.caption);

      // Close Button
      this.closeBtn = document.createElement('button');
      this.closeBtn.type = 'button';
      this.closeBtn.className = CLASSES.close;
      this.closeBtn.setAttribute('data-gallery-close', '');
      this.closeBtn.tabIndex = -1;
      this.closeBtn.setAttribute('aria-label', 'Close');
      this.closeBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
      `;
      this.closeBtn.addEventListener('click', () => this.close());
      c.appendChild(this.closeBtn);

      // Accessibility Hidden List
      this.hiddenList = document.createElement('ul');
      this.hiddenList.className = CLASSES.hidden;
      this.hiddenList.setAttribute('data-gallery-list', '');
      this._renderHiddenList();
      c.appendChild(this.hiddenList);

      // Live Region for Screen Readers
      this.liveRegion = document.createElement('div');
      this.liveRegion.className = CLASSES.hidden;
      this.liveRegion.setAttribute('aria-live', 'polite');
      c.appendChild(this.liveRegion);
    }

    _renderHiddenList() {
      this.hiddenList.innerHTML = '';
      this.buttons = [];
      const count = this.settings.items.length;
      this.settings.items.forEach((item, index) => {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.tabIndex = index === this.active ? 0 : -1;
        btn.setAttribute('aria-label', `${item.text || item.alt || 'Image'}, ${index + 1} of ${count}`);
        if (index === this.active) btn.setAttribute('aria-current', 'true');
        btn.textContent = item.text || item.alt || `Image ${index + 1}`;
        btn.addEventListener('focus', () => this.focus(index));
        btn.addEventListener('click', () => this.open(index));
        li.appendChild(btn);
        this.hiddenList.appendChild(li);
        this.buttons.push(btn);
      });
    }

    _bindFont() {
      let alive = true;
      this._fontResolver = resolveFont(this.settings.font, this.settings.fontUrl).then(resolved => {
        if (!alive || this.destroyed) return;
        this.font = resolved;
        this.wake();
      });
    }

    _initWebGL() {
      const gl = this.canvas.getContext('webgl2', {
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        depth: false,
        stencil: false
      });

      if (!gl) {
        console.warn('[CircularGallery] WebGL2 not supported in this environment.');
        this._initFallback();
        return;
      }

      this.gl = gl;
      const program = link(gl);
      if (!program) {
        console.warn('[CircularGallery] Shader link failed.');
        this._initFallback();
        return;
      }
      this.program = program;
      const u = program.uniforms;
      this.u = u;

      // Mesh Grid Generation
      const vertices = [];
      for (let y = 0; y <= SEGMENTS_Y; y++) {
        for (let x = 0; x <= SEGMENTS_X; x++) {
          vertices.push(x / SEGMENTS_X - 0.5, y / SEGMENTS_Y - 0.5);
        }
      }
      const indices = [];
      for (let y = 0; y < SEGMENTS_Y; y++) {
        for (let x = 0; x < SEGMENTS_X; x++) {
          const a = y * (SEGMENTS_X + 1) + x;
          const b = a + 1;
          const c = a + SEGMENTS_X + 1;
          const d = c + 1;
          indices.push(a, b, d, a, d, c);
        }
      }

      this.vao = gl.createVertexArray();
      gl.bindVertexArray(this.vao);
      this.vertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

      this.indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

      this.anisotropy = gl.getExtension('EXT_texture_filter_anisotropic');
      this.blank = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.blank);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));

      this.probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
      this.colorCache = new Map();

      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
      this.reduceMotion = reduce;
      this.textures = new Map();
      this.view = { width: 1, height: 1, ratio: 1 };
      this.state = {
        scroll: 0,
        target: 0,
        velocity: 0,
        open: 0,
        openTarget: 0,
        intro: this.settings.intro && !reduce ? 0 : 1,
        waveTime: 0,
        ring: 0,
        keyboard: false,
        hovered: null,
        hover: new Map(),
        focus: new Map(),
        drag: null,
        lastInput: 0,
        active: 0,
        spacing: 1
      };

      this.cards = [];
      this.pool = [];
      this.raf = 0;
      this.last = 0;
      this.visible = true;
      this.snapTimer = 0;
      this.lastItems = null;
      this.typing = false;

      this._bindEvents();
      this.resize();
    }

    _parseColor(value) {
      const key = String(value);
      if (this.colorCache.has(key)) return this.colorCache.get(key);
      let rgb = [1, 1, 1];
      if (this.probe) {
        this.probe.clearRect(0, 0, 1, 1);
        this.probe.fillStyle = '#ffffff';
        this.probe.fillStyle = key;
        this.probe.fillRect(0, 0, 1, 1);
        const [r, g, b] = this.probe.getImageData(0, 0, 1, 1).data;
        rgb = [r / 255, g / 255, b / 255];
      }
      this.colorCache.set(key, rgb);
      return rgb;
    }

    _textureFor(url) {
      const gl = this.gl;
      const existing = this.textures.get(url);
      if (existing) return existing;
      const entry = { texture: null, aspect: 1, ready: 0, loaded: false };
      this.textures.set(url, entry);

      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.decoding = 'async';
      image.onload = () => {
        if (!this.textures.has(url) || this.destroyed) return;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        if (this.anisotropy) {
          const max = gl.getParameter(this.anisotropy.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
          gl.texParameterf(gl.TEXTURE_2D, this.anisotropy.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, max));
        }
        entry.texture = texture;
        entry.aspect = image.naturalWidth / Math.max(1, image.naturalHeight);
        entry.loaded = true;
        this.wake();
      };
      image.src = url;
      return entry;
    }

    _prune(list) {
      const keep = new Set(list.map(item => item.image));
      this.textures.forEach((entry, url) => {
        if (keep.has(url)) return;
        if (entry.texture) this.gl.deleteTexture(entry.texture);
        this.textures.delete(url);
      });
    }

    _measure() {
      const s = this.settings;
      const height = 0.6 * this.view.height * s.itemSize;
      const width = height * s.itemAspect;
      const scale = Math.min(1, (this.view.width * 0.82) / width);
      return { w: width * scale, h: height * scale, spacing: width * scale * (1 + s.gap) };
    }

    _arcOf(x) {
      const s = this.settings;
      if (!s.bend) return { y: 0, angle: 0 };
      const depth = (Math.abs(s.bend) * this.view.height) / WORLD_HEIGHT;
      const half = Math.max(this.view.width, this.view.height * 1.9) / 2;
      const radius = (half * half + depth * depth) / (2 * depth);
      const reach = Math.min(Math.abs(x), half, radius * 0.999);
      const arc = radius - Math.sqrt(radius * radius - reach * reach);
      const angle = Math.sign(x) * Math.asin(reach / radius);
      return s.bend > 0 ? { y: -arc, angle: -angle } : { y: arc, angle };
    }

    _captionSize() {
      return clamp(this.view.height * 0.045, 15, 22);
    }

    _ensurePool(spacing) {
      const size = Math.ceil(this.view.width / Math.max(spacing, 1)) + 8;
      if (this.pool.length === size) return;
      this.labelLayer.replaceChildren();
      this.pool = Array.from({ length: size }, () => {
        const el = document.createElement('span');
        el.className = CLASSES.label;
        el.style.opacity = '0';
        this.labelLayer.appendChild(el);
        return { el, slot: null, font: '', text: '' };
      });
    }

    _layout() {
      const s = this.settings;
      const list = s.items;
      const count = list.length;
      const { w, h, spacing } = this._measure();
      this.state.spacing = spacing;
      const introEase = 1 - Math.pow(1 - this.state.intro, 3);
      const scroll = this.state.scroll + (1 - introEase) * spacing * 1.6;
      const margin = Math.max(20, Math.min(this.view.width, this.view.height) * 0.06);
      const baseLabel = h * 0.072 * fontScale(this.font);

      const openFrame = item => {
        const aspect = this._textureFor(item.image).aspect || w / h;
        const titleSpace = item.text && s.showTitles ? this._captionSize() * 2.4 : 0;
        const captionSpace = titleSpace + (item.description ? 52 : 0);
        const width = Math.min(this.view.width - margin * 2, (this.view.height - margin * 2 - captionSpace) * aspect);
        return { width, height: width / aspect, y: captionSpace / 2, titleSpace };
      };

      const activeFrame = openFrame(list[wrap(this.state.active, count)]);
      const spread = Math.max(0, activeFrame.width / 2 - w / 2);
      const activeX = this.state.active * spacing - scroll;
      const first = Math.floor((scroll - this.view.width / 2 - spacing * 2) / spacing);
      const lastSlot = Math.ceil((scroll + this.view.width / 2 + spacing * 2) / spacing);
      const next = [];
      let lead = null;

      for (let slot = first; slot <= lastSlot; slot++) {
        const index = wrap(slot, count);
        const item = list[index];
        const entry = this._textureFor(item.image);
        const focus = ease(this.state.focus.get(slot) || 0);
        let x = slot * spacing - scroll;
        x += Math.sign(x - activeX) * this.state.open * (1 - focus) * spread;
        const arc = this._arcOf(x);
        const frame = focus > 0 ? openFrame(item) : activeFrame;
        const order = Math.abs(slot * spacing - this.state.scroll) / spacing;
        const shown = ease(clamp(this.state.intro * 2.2 - order * 0.22, 0, 1));
        const hover = this.state.hover.get(slot) || 0;
        const lift = 1 + hover * 0.04 * (1 - focus);
        const card = {
          slot,
          index,
          item,
          entry,
          x: mix(x, 0, focus),
          y: mix(arc.y, frame.y, focus) - (1 - shown) * h * 0.18,
          angle: arc.angle * (1 - focus),
          w: mix(w, frame.width, focus) * lift,
          h: mix(h, frame.height, focus) * lift,
          radius: s.borderRadius * Math.min(w, h),
          alpha: shown * mix(1, 0.12, this.state.open * (1 - focus)),
          dim: this.state.open * (1 - focus) * 0.4,
          gray: s.grayscale ? 1 - Math.max(hover, focus, slot === this.state.active ? this.state.ring : 0) : 0,
          focus,
          labelAlpha: mix(1 - this.state.open, 1, focus),
          labelSize: mix(baseLabel, this._captionSize(), focus),
          frame
        };
        if (!lead || focus > lead.focus) lead = card;
        next.push(card);
      }

      next.sort((a, b) => a.focus - b.focus || Math.abs(b.x) - Math.abs(a.x));
      this.cards = next;
      const frame = lead && lead.focus > 0 ? lead.frame : activeFrame;
      return { w, h, spacing, openH: frame.height, openY: frame.y, titleSpace: frame.titleSpace };
    }

    _draw(metrics) {
      const gl = this.gl;
      const u = this.u;
      const s = this.settings;
      const ratio = this.view.ratio;
      const speed = Math.min(Math.abs(this.state.velocity) / Math.max(metrics.spacing * 4, 1), 1);
      const wavePx = this.reduceMotion ? 0 : s.wave * speed * this.view.height * 0.08 * ratio;

      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(this.program.program);
      gl.bindVertexArray(this.vao);

      gl.uniform2f(u.uResolution, this.canvas.width, this.canvas.height);
      gl.uniform1f(u.uFocal, this.view.height * 1.207 * ratio);
      gl.uniform1f(u.uWaveTime, this.state.waveTime);
      gl.uniform1f(u.uFade, s.fadeEdges);
      gl.uniform3fv(u.uPlaceholder, this._parseColor(s.textColor));
      gl.uniform3fv(u.uRingColor, this._parseColor(s.textColor));
      gl.uniform1f(u.uRingWidth, 2 * ratio);
      gl.uniform1f(u.uRingGap, 5 * ratio);
      gl.activeTexture(gl.TEXTURE0);
      gl.uniform1i(u.uTexture, 0);

      const count = SEGMENTS_X * SEGMENTS_Y * 6;
      const blur = Math.max(10, metrics.h * 0.09) * ratio;

      const place = card => {
        gl.uniform2f(u.uCenter, card.x * ratio, card.y * ratio);
        gl.uniform2f(u.uSize, card.w * ratio, card.h * ratio);
        gl.uniform1f(u.uAngle, card.angle);
        gl.uniform1f(u.uRadius, Math.min(card.radius, card.w / 2, card.h / 2) * ratio);
        gl.uniform1f(u.uWave, wavePx * (1 - card.focus));
        gl.uniform1f(u.uAlpha, card.alpha);
      };

      if (s.shadow > 0) {
        gl.uniform1f(u.uShadow, s.shadow);
        gl.uniform1f(u.uBlur, blur);
        gl.uniform2f(u.uShadowOffset, 0, -blur * 0.45);
        gl.uniform1f(u.uPad, blur * 1.6);
        gl.bindTexture(gl.TEXTURE_2D, this.blank);
        this.cards.forEach(card => {
          place(card);
          gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);
        });
      }

      gl.uniform1f(u.uShadow, 0);
      gl.uniform1f(u.uPad, 10 * ratio);
      this.cards.forEach(card => {
        place(card);
        const entry = card.entry;
        gl.bindTexture(gl.TEXTURE_2D, entry.texture || this.blank);
        gl.uniform1f(u.uImageAspect, entry.aspect);
        gl.uniform1f(u.uReady, entry.ready);
        gl.uniform1f(u.uGray, card.gray);
        gl.uniform1f(u.uDim, card.dim);
        gl.uniform1f(u.uRing, card.slot === this.state.active ? this.state.ring * (1 - card.focus) : 0);
        gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);
      });
    }

    _placeLabels(metrics) {
      const s = this.settings;
      this._ensurePool(metrics.spacing);
      const used = new Set();
      const font = this.font;

      const fade = value => {
        if (s.fadeEdges <= 0) return 1;
        const t = clamp(value / s.fadeEdges, 0, 1);
        return t * t * t * (t * (t * 6 - 15) + 10);
      };

      if (s.showTitles) {
        this.cards.forEach(card => {
          if (!card.item.text) return;
          const entry = this.pool[wrap(card.slot, this.pool.length)];
          used.add(entry);
          if (entry.slot !== card.slot || entry.text !== card.item.text) {
            entry.slot = card.slot;
            entry.text = card.item.text;
            entry.el.textContent = card.item.text;
          }
          if (entry.font !== font) {
            entry.font = font;
            entry.el.style.font = font;
          }
          const size = card.labelSize;
          const offset = card.h / 2 + size * 1.1;
          const x = card.x + Math.sin(card.angle) * offset;
          const y = card.y - Math.cos(card.angle) * offset;
          const cssX = this.view.width / 2 + x;
          const cssY = this.view.height / 2 - y;
          const edge = fade(cssX / this.view.width) * fade(1 - cssX / this.view.width);

          entry.el.style.fontSize = `${size}px`;
          entry.el.style.color = s.textColor;
          entry.el.style.transform = `translate(${cssX}px, ${cssY}px) translate(-50%, -50%) rotate(${-card.angle}rad)`;
          entry.el.style.opacity = String(card.alpha * card.labelAlpha * mix(edge, 1, card.focus));
        });
      }

      this.pool.forEach(entry => {
        if (used.has(entry)) return;
        if (entry.el.style.opacity !== '0') entry.el.style.opacity = '0';
      });

      const top = this.view.height / 2 - (metrics.openY - metrics.openH / 2) + metrics.titleSpace + 4;
      this.caption.style.transform = `translate(-50%, ${top}px)`;
      this.caption.style.opacity = String(ease(clamp((this.state.open - 0.5) / 0.5, 0, 1)));
      this.caption.style.color = s.textColor;

      if (this.caption.dataset.font !== font) {
        this.caption.dataset.font = font;
        this.caption.style.font = font;
        this.caption.style.fontWeight = '400';
      }
      this.caption.style.fontSize = `${this._captionSize() * 0.8}px`;

      // Update caption description if current item exists
      const current = s.items[wrap(this.state.active, s.items.length)];
      if (current && current.description) {
        this.captionText.textContent = current.description;
        this.caption.setAttribute('aria-hidden', String(!this.openState));
      } else {
        this.captionText.textContent = '';
      }
    }

    _nearest() {
      return Math.round(this.state.target / Math.max(this.state.spacing, 1));
    }

    _setSlot(slot, announce = true) {
      const s = this.settings;
      this.state.target = slot * this.state.spacing;
      if (slot !== this.state.active) {
        this.state.active = slot;
        const index = wrap(slot, s.items.length);
        if (announce) {
          this.active = index;
          this.buttons.forEach((btn, i) => {
            btn.tabIndex = i === index ? 0 : -1;
            if (i === index) btn.setAttribute('aria-current', 'true');
            else btn.removeAttribute('aria-current');
          });
        }
        s.onActiveChange?.(index);
      }
      this.wake();
    }

    _openSlot(slot) {
      this._setSlot(slot);
      this.state.openTarget = 1;
      this.openState = true;
      this.closeBtn.setAttribute('data-visible', '');
      this.closeBtn.tabIndex = 0;
      const count = this.settings.items.length;
      const current = this.settings.items[this.active % count];
      if (this.liveRegion && current) {
        this.liveRegion.textContent = `${current.text || current.alt || 'Image'} opened`;
      }
      this.wake();
    }

    open(index) {
      const slot = this._slotFor(index !== undefined ? index : this.active);
      this._openSlot(slot);
    }

    close() {
      this.state.openTarget = 0;
      this.openState = false;
      this.closeBtn.removeAttribute('data-visible');
      this.closeBtn.tabIndex = -1;
      this.wake();
    }

    focus(index) {
      const slot = this._slotFor(index !== undefined ? index : this.active);
      this._setSlot(slot, false);
    }

    next() {
      this._setSlot(this._nearest() + 1);
    }

    prev() {
      this._setSlot(this._nearest() - 1);
    }

    _slotFor(index) {
      const count = this.settings.items.length;
      const slot = this._nearest();
      const base = slot - wrap(slot, count) + index;
      return [base - count, base, base + count].reduce((best, value) =>
        Math.abs(value - slot) < Math.abs(best - slot) ? value : best
      );
    }

    _point(event) {
      const rect = this.container.getBoundingClientRect();
      return { x: event.clientX - rect.left - rect.width / 2, y: rect.height / 2 - (event.clientY - rect.top) };
    }

    _hit({ x, y }) {
      for (let i = this.cards.length - 1; i >= 0; i--) {
        const card = this.cards[i];
        if (card.alpha < 0.05) continue;
        const dx = x - card.x;
        const dy = y - card.y;
        const c = Math.cos(-card.angle);
        const s = Math.sin(-card.angle);
        const lx = c * dx - s * dy;
        const ly = s * dx + c * dy;
        if (Math.abs(lx) <= card.w / 2 && Math.abs(ly) <= card.h / 2) return card;
      }
      return null;
    }

    _setPointer(card) {
      const slot = card ? card.slot : null;
      if (slot !== this.state.hovered) {
        this.state.hovered = slot;
        if (slot !== null && !this.state.hover.has(slot)) this.state.hover.set(slot, 0);
        this.wake();
      }
      if (card) this.container.setAttribute('data-pointer', '');
      else this.container.removeAttribute('data-pointer');
    }

    _snapNow() {
      const s = this.settings;
      if (!s.snap && this.state.open < 0.5) return;
      this._setSlot(this._nearest());
    }

    _frame(now) {
      this.raf = 0;
      if (!this.visible || document.hidden || this.destroyed) return;
      const s = this.settings;
      const dt = this.last ? clamp((now - this.last) / 1000, 0.0005, 0.05) : 1 / 60;
      this.last = now;

      if (s.items !== this.lastItems) {
        this.lastItems = s.items;
        this._prune(s.items);
        s.items.forEach(item => this._textureFor(item.image));
      }

      const idle = now - this.state.lastInput > 1800;
      const auto =
        s.autoScroll &&
        !this.reduceMotion &&
        !this.state.drag &&
        this.state.open < 0.01 &&
        this.state.hovered === null &&
        !this.state.keyboard &&
        idle;

      if (auto) this.state.target += s.autoScroll * this.state.spacing * 0.25 * dt;

      const follow = this.reduceMotion ? 1 : 1 - Math.pow(1 - s.scrollEase, dt * 60);
      const before = this.state.scroll;
      this.state.scroll += (this.state.target - this.state.scroll) * follow;
      if (Math.abs(this.state.target - this.state.scroll) < 0.05) this.state.scroll = this.state.target;
      const velocity = (this.state.scroll - before) / dt;
      this.state.velocity += (velocity - this.state.velocity) * (1 - Math.exp(-dt / 0.08));
      if (Math.abs(this.state.velocity) < 0.5) this.state.velocity = 0;

      this.state.waveTime += dt * 2.4;

      const openFollow = this.reduceMotion ? 1 : 1 - Math.exp(-dt / 0.14);
      this.state.open += (this.state.openTarget - this.state.open) * openFollow;
      if (Math.abs(this.state.openTarget - this.state.open) < 0.001) this.state.open = this.state.openTarget;

      this.state.ring += ((this.state.keyboard ? 1 : 0) - this.state.ring) * (1 - Math.exp(-dt / 0.1));
      if (Math.abs((this.state.keyboard ? 1 : 0) - this.state.ring) < 0.002) this.state.ring = this.state.keyboard ? 1 : 0;

      if (this.state.intro < 1) this.state.intro = Math.min(1, this.state.intro + dt / INTRO_SECONDS);

      let settling = false;
      this.state.hover.forEach((value, slot) => {
        const goal = slot === this.state.hovered ? 1 : 0;
        const next = value + (goal - value) * (1 - Math.exp(-dt / 0.12));
        if (Math.abs(goal - next) < 0.002) {
          if (goal === 0) this.state.hover.delete(slot);
          else this.state.hover.set(slot, 1);
        } else {
          this.state.hover.set(slot, next);
          settling = true;
        }
      });

      if (this.state.openTarget > 0 && !this.state.focus.has(this.state.active)) this.state.focus.set(this.state.active, 0);

      this.state.focus.forEach((value, slot) => {
        const goal = this.state.openTarget > 0 && slot === this.state.active ? 1 : 0;
        const next = this.reduceMotion ? goal : value + (goal - value) * (1 - Math.exp(-dt / 0.16));
        if (Math.abs(goal - next) < 0.001) {
          if (goal === 0) this.state.focus.delete(slot);
          else this.state.focus.set(slot, 1);
        } else {
          this.state.focus.set(slot, next);
          settling = true;
        }
      });

      this.textures.forEach(entry => {
        if (!entry.loaded || entry.ready >= 1) return;
        entry.ready = this.reduceMotion ? 1 : Math.min(1, entry.ready + dt / 0.45);
        settling = true;
      });

      const slot = auto ? Math.round(this.state.scroll / Math.max(this.state.spacing, 1)) : this._nearest();
      if (slot !== this.state.active && !this.state.drag) {
        this.state.active = slot;
        const index = wrap(slot, s.items.length);
        this.active = index;
        s.onActiveChange?.(index);
      }

      const metrics = this._layout();
      this._draw(metrics);
      this._placeLabels(metrics);

      const moving =
        (s.autoScroll && !this.reduceMotion) ||
        this.state.scroll !== this.state.target ||
        this.state.velocity !== 0 ||
        this.state.open !== this.state.openTarget ||
        this.state.intro < 1 ||
        (this.state.ring !== 0 && this.state.ring !== 1) ||
        settling;

      if (moving) this.raf = requestAnimationFrame(t => this._frame(t));
      else this.last = 0;
    }

    wake() {
      if (!this.raf && this.visible && !document.hidden && !this.destroyed) {
        this.raf = requestAnimationFrame(t => this._frame(t));
      }
    }

    resize() {
      if (!this.container || this.destroyed) return;
      const s = this.settings;
      this.view.width = Math.max(1, this.container.clientWidth);
      this.view.height = Math.max(1, this.container.clientHeight);
      this.view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);
      this.canvas.width = Math.max(1, Math.round(this.view.width * this.view.ratio));
      this.canvas.height = Math.max(1, Math.round(this.view.height * this.view.ratio));

      const before = this.state.spacing;
      const { spacing } = this._measure();
      if (before > 1 && spacing !== before) {
        this.state.scroll = (this.state.scroll / before) * spacing;
        this.state.target = (this.state.target / before) * spacing;
      }
      this.state.spacing = spacing;
      this.wake();
    }

    _bindEvents() {
      const c = this.container;

      this._onPointerDown = event => {
        if (event.button !== 0 || event.target.closest('[data-gallery-close]')) return;
        const p = this._point(event);
        this.state.drag = {
          id: event.pointerId,
          x0: event.clientX,
          y0: event.clientY,
          start: this.state.target,
          moved: false,
          samples: [],
          p
        };
        this.state.lastInput = performance.now();
        this.wake();
      };

      this._onPointerMove = event => {
        const drag = this.state.drag;
        if (drag && drag.id === event.pointerId) {
          const dx = event.clientX - drag.x0;
          const dy = event.clientY - drag.y0;
          if (!drag.moved && Math.hypot(dx, dy) > 6) {
            if (Math.abs(dy) > Math.abs(dx) && event.pointerType !== 'mouse') {
              this.state.drag = null;
              return;
            }
            drag.moved = true;
            c.setPointerCapture?.(event.pointerId);
            c.setAttribute('data-dragging', '');
            this._setPointer(null);
          }
          if (drag.moved) {
            this.state.target = drag.start - dx * (this.settings.scrollSpeed / 2);
            drag.samples.push({ x: event.clientX, t: performance.now() });
            if (drag.samples.length > 6) drag.samples.shift();
            this.state.lastInput = performance.now();
            this.wake();
          }
          return;
        }
        if (event.pointerType === 'mouse') this._setPointer(this._hit(this._point(event)));
      };

      this._onPointerUp = event => {
        const drag = this.state.drag;
        if (!drag || drag.id !== event.pointerId) return;
        this.state.drag = null;
        c.removeAttribute('data-dragging');
        if (c.hasPointerCapture?.(event.pointerId)) c.releasePointerCapture(event.pointerId);
        if (drag.moved) {
          const samples = drag.samples;
          if (samples.length > 1) {
            const a = samples[0];
            const b = samples[samples.length - 1];
            const span = Math.max(b.t - a.t, 16);
            const speed = ((b.x - a.x) / span) * 1000;
            this.state.target -= speed * 0.18 * (this.settings.scrollSpeed / 2);
          }
          this._snapNow();
          return;
        }
        const card = this._hit(drag.p);
        const s = this.settings;
        if (!card) {
          if (this.state.open > 0.5) this.close();
          return;
        }
        s.onItemClick?.(card.item, card.index);
        if (!s.openOnClick) {
          this._setSlot(card.slot);
          return;
        }
        if (this.state.open > 0.5 && card.slot === this.state.active) this.close();
        else this._openSlot(card.slot);
      };

      this._onPointerCancel = event => {
        if (this.state.drag && this.state.drag.id === event.pointerId) {
          this.state.drag = null;
          c.removeAttribute('data-dragging');
          this._snapNow();
        }
      };

      this._onPointerLeave = () => {
        this._setPointer(null);
      };

      this._onWheel = event => {
        const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? this.view.height : 1;
        const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
        if (!delta) return;
        event.preventDefault();
        this.state.target += delta * unit * (this.settings.scrollSpeed / 2);
        this.state.lastInput = performance.now();
        clearTimeout(this.snapTimer);
        this.snapTimer = setTimeout(() => this._snapNow(), 140);
        this.wake();
      };

      this._onKeyDown = event => {
        const s = this.settings;
        const step = STEPS[event.key];
        this.state.lastInput = performance.now();
        if (step) {
          event.preventDefault();
          if (c.contains(document.activeElement) && document.activeElement !== c) this.state.keyboard = true;
          this._setSlot(this._nearest() + step);
          const index = wrap(this.state.active, s.items.length);
          if (c.contains(document.activeElement)) this.buttons[index]?.focus({ preventScroll: true });
          return;
        }
        if (event.key === 'Home' || event.key === 'End') {
          event.preventDefault();
          const base = this._nearest() - wrap(this._nearest(), s.items.length);
          this._setSlot(event.key === 'Home' ? base : base + s.items.length - 1);
          return;
        }
        if (event.key === 'Escape' && this.state.openTarget > 0) {
          event.preventDefault();
          this.close();
        }
      };

      this._onFocusIn = event => {
        if (!event.target.closest('[data-gallery-list]')) return;
        this.state.keyboard = this.typing || event.target.matches(':focus-visible');
        this.wake();
      };

      this._onAnyKey = event => {
        if (event.key === 'Tab' || event.key.startsWith('Arrow')) this.typing = true;
      };

      this._onAnyPointer = () => {
        this.typing = false;
      };

      this._onFocusOut = event => {
        if (c.contains(event.relatedTarget)) return;
        this.state.keyboard = false;
        this.wake();
      };

      this._onVisibility = () => {
        this.last = 0;
        this.wake();
      };

      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(c);

      this.intersection = new IntersectionObserver(entries => {
        this.visible = entries.some(entry => entry.isIntersecting);
        if (this.visible) {
          this.last = 0;
          this.wake();
        }
      });
      this.intersection.observe(c);

      c.addEventListener('pointerdown', this._onPointerDown);
      c.addEventListener('pointermove', this._onPointerMove);
      c.addEventListener('pointerup', this._onPointerUp);
      c.addEventListener('pointercancel', this._onPointerCancel);
      c.addEventListener('pointerleave', this._onPointerLeave);
      c.addEventListener('wheel', this._onWheel, { passive: false });
      c.addEventListener('keydown', this._onKeyDown);
      c.addEventListener('focusin', this._onFocusIn);
      c.addEventListener('focusout', this._onFocusOut);
      document.addEventListener('visibilitychange', this._onVisibility);
      document.addEventListener('keydown', this._onAnyKey, true);
      document.addEventListener('pointerdown', this._onAnyPointer, true);

      this.lastItems = this.settings.items;
      this.lastItems.forEach(item => this._textureFor(item.image));
    }

    _initFallback() {
      // Graceful CSS-only fallback if WebGL2 is unsupported
      this.container.classList.add('circular-gallery-fallback');
      const track = document.createElement('div');
      track.className = 'cg-fallback-track';
      track.style.cssText = 'display:flex; gap:16px; overflow-x:auto; padding:24px; scroll-snap-type:x mandatory;';
      this.settings.items.forEach(item => {
        const card = document.createElement('div');
        card.style.cssText = 'flex:0 0 240px; scroll-snap-align:center; background:#1e293b; border-radius:12px; overflow:hidden; border:1px solid rgba(255,255,255,0.1);';
        card.innerHTML = `
          <img src="${item.image}" alt="${item.alt || item.text || ''}" style="width:100%; height:180px; object-fit:cover;">
          <div style="padding:12px; color:#fff;">
            <strong style="display:block; font-size:1.1rem; margin-bottom:4px;">${item.text || ''}</strong>
            <p style="margin:0; font-size:0.85rem; color:#94a3b8;">${item.description || ''}</p>
          </div>
        `;
        track.appendChild(card);
      });
      this.container.appendChild(track);
    }

    setItems(newItems) {
      if (!Array.isArray(newItems) || !newItems.length) return;
      this.settings.items = newItems;
      this._renderHiddenList();
      this.wake();
    }

    destroy() {
      this.destroyed = true;
      cancelAnimationFrame(this.raf);
      clearTimeout(this.snapTimer);

      if (this.resizeObserver) this.resizeObserver.disconnect();
      if (this.intersection) this.intersection.disconnect();

      const c = this.container;
      if (c) {
        c.removeEventListener('pointerdown', this._onPointerDown);
        c.removeEventListener('pointermove', this._onPointerMove);
        c.removeEventListener('pointerup', this._onPointerUp);
        c.removeEventListener('pointercancel', this._onPointerCancel);
        c.removeEventListener('pointerleave', this._onPointerLeave);
        c.removeEventListener('wheel', this._onWheel);
        c.removeEventListener('keydown', this._onKeyDown);
        c.removeEventListener('focusin', this._onFocusIn);
        c.removeEventListener('focusout', this._onFocusOut);
      }

      document.removeEventListener('visibilitychange', this._onVisibility);
      document.removeEventListener('keydown', this._onAnyKey, true);
      document.removeEventListener('pointerdown', this._onAnyPointer, true);

      if (this.labelLayer) this.labelLayer.replaceChildren();

      if (this.gl) {
        const gl = this.gl;
        this.textures.forEach(entry => entry.texture && gl.deleteTexture(entry.texture));
        gl.deleteTexture(this.blank);
        if (this.program?.program) gl.deleteProgram(this.program.program);
        if (this.vertexBuffer) gl.deleteBuffer(this.vertexBuffer);
        if (this.indexBuffer) gl.deleteBuffer(this.indexBuffer);
        if (this.vao) gl.deleteVertexArray(this.vao);
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      }

      if (c) c.innerHTML = '';
    }
  }

  return CircularGallery;
});
