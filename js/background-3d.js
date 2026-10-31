/**
 * Samarthya — 3D Spatial Vector Network & Celestial Lattice Engine
 * True 3D perspective math (X' = X * f / Z), 60FPS zero-lag GPU canvas.
 */

(function () {
  'use strict';

  let canvas, ctx;
  let width, height;
  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;
  let scrollY = 0, targetScrollY = 0;
  let angleX = 0, angleY = 0;

  // 3D Spatial Nodes
  const NODES = [];
  const NODE_COUNT = 36;
  const FOV = 320; // Focal length / Field of view

  function init() {
    canvas = document.getElementById('bg3d-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'bg3d-canvas';
      canvas.className = 'bg3d-canvas';
      document.body.prepend(canvas);
    }

    ctx = canvas.getContext('2d', { alpha: true });
    resize();

    // Create 3D Nodes in a bounding spatial cube
    for (let i = 0; i < NODE_COUNT; i++) {
      NODES.push({
        x: (Math.random() - 0.5) * 1200,
        y: (Math.random() - 0.5) * 1000,
        z: (Math.random() - 0.5) * 800,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 1.2
      });
    }

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('mousemove', (e) => {
      targetMouseX = (e.clientX - width / 2) * 0.0003;
      targetMouseY = (e.clientY - height / 2) * 0.0003;
    }, { passive: true });

    window.addEventListener('scroll', () => {
      targetScrollY = window.scrollY;
    }, { passive: true });

    animate();
  }

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function rotateX(point, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const y = point.y * cos - point.z * sin;
    const z = point.y * sin + point.z * cos;
    return { x: point.x, y, z };
  }

  function rotateY(point, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = point.x * cos + point.z * sin;
    const z = -point.x * sin + point.z * cos;
    return { x, y: point.y, z };
  }

  function animate() {
    if (document.hidden) {
      requestAnimationFrame(animate);
      return;
    }

    // Smooth inertia
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;
    scrollY += (targetScrollY - scrollY) * 0.06;

    angleX += 0.0012 + mouseY * 0.05;
    angleY += 0.0018 + mouseX * 0.05;

    ctx.clearRect(0, 0, width, height);

    const projected = [];
    const scrollZ = (scrollY * 0.15) % 800;

    // 1. Move and Project 3D Nodes
    for (let i = 0; i < NODES.length; i++) {
      const node = NODES[i];

      // Update position
      node.x += node.vx;
      node.y += node.vy;
      node.z += node.vz;

      // Wrap boundaries in 3D box
      if (node.x < -600) node.x = 600;
      if (node.x > 600) node.x = -600;
      if (node.y < -500) node.y = 500;
      if (node.y > 500) node.y = -500;
      if (node.z < -400) node.z = 400;
      if (node.z > 400) node.z = -400;

      // Rotate in 3D space
      let pt = rotateY(node, angleY);
      pt = rotateX(pt, angleX);

      // Camera Z depth
      const depth = pt.z + 650 + scrollZ;
      if (depth <= 10) continue;

      // 3D Perspective Projection
      const scale = FOV / depth;
      const projX = width / 2 + pt.x * scale;
      const projY = height / 2 + pt.y * scale;

      projected.push({
        x: projX,
        y: projY,
        z: depth,
        scale: scale,
        size: node.size * scale
      });
    }

    // 2. Draw 3D Connecting Constellation Lines
    ctx.lineWidth = 0.8;
    for (let i = 0; i < projected.length; i++) {
      const p1 = projected[i];
      for (let j = i + 1; j < projected.length; j++) {
        const p2 = projected[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distSq = dx * dx + dy * dy;

        // Draw line if points are close in 2D projection
        if (distSq < 18000) {
          const alpha = (1 - distSq / 18000) * 0.18;
          ctx.strokeStyle = `rgba(129, 140, 248, ${alpha.toFixed(2)})`;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    // 3. Draw 3D Glowing Nodes
    for (let i = 0; i < projected.length; i++) {
      const p = projected[i];
      const alpha = Math.min(0.6, Math.max(0.1, (1000 - p.z) / 800));

      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(1, p.size), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(56, 189, 248, ${alpha.toFixed(2)})`;
      ctx.fill();
    }

    requestAnimationFrame(animate);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
