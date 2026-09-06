'use client';

import { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
  t: number;
}

export default function MouseTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (matchMedia('(pointer: coarse)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let points: Point[] = [];
    let raf = 0;
    let stoppedAt = 0;
    const PRESETS: Record<string, { age: number; fade: number; width: number; steps: number; stride: number }> = {
      High: { age: 950, fade: 500, width: 1.8, steps: 10, stride: 1 },
      Medium: { age: 800, fade: 400, width: 1.5, steps: 8, stride: 1 },
      Saver: { age: 420, fade: 200, width: 1, steps: 4, stride: 2 },
    };
    let light = document.querySelector('.portfolio')?.classList.contains('light');
    let tier = (document.querySelector('.portfolio') as HTMLElement | null)?.getAttribute('data-tier') ?? 'Medium';

    const observer = new MutationObserver(() => {
      const el = document.querySelector('.portfolio');
      light = el?.classList.contains('light') ?? false;
      tier = (el as HTMLElement | null)?.getAttribute('data-tier') ?? 'Medium';
    });
    const target = document.querySelector('.portfolio');
    if (target) observer.observe(target, { attributes: true, attributeFilter: ['class', 'data-tier'] });

    const resize = () => {
      const dpr = devicePixelRatio || 1;
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      canvas.style.width = innerWidth + 'px';
      canvas.style.height = innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    addEventListener('resize', resize);

    const onMouse = (e: MouseEvent) => {
      const now = performance.now();
      points.push({ x: e.clientX, y: e.clientY, t: now });
      if (!stoppedAt) stoppedAt = now;
    };
    addEventListener('mousemove', onMouse);

    const catmull = (
      p0: { x: number; y: number },
      p1: { x: number; y: number },
      p2: { x: number; y: number },
      p3: { x: number; y: number },
      t: number
    ) => {
      const t2 = t * t;
      const t3 = t2 * t;
      return {
        x:
          0.5 *
          (2 * p1.x +
            (-p0.x + p2.x) * t +
            (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
            (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y:
          0.5 *
          (2 * p1.y +
            (-p0.y + p2.y) * t +
            (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
            (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
      };
    };

    const draw = () => {
      const now = performance.now();
      ctx.clearRect(0, 0, innerWidth, innerHeight);

      const cfg = PRESETS[tier] ?? PRESETS.Medium;
      points = points.filter((p) => now - p.t < cfg.age);

      if (points.length >= 2) {
        const color = light ? '0,0,0' : '255,255,255';

        for (let i = 1; i < points.length; i += cfg.stride) {
          const age = now - points[i].t;
          const alpha = age < cfg.fade ? 1 : 1 - (age - cfg.fade) / (cfg.age - cfg.fade);
          const progress = i / points.length;
          const finalAlpha = Math.min(alpha, 0.15 + progress * 0.85);

          ctx.beginPath();
          ctx.strokeStyle = `rgba(${color},${finalAlpha})`;
          ctx.lineWidth = cfg.width;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          const prev = points[i - 1];

          if (i < points.length - 1) {
            const next = points[Math.min(i + 1, points.length - 1)];
            const a = i > 1 ? points[i - 2] : prev;
            const c = next;

            ctx.moveTo(prev.x, prev.y);
            for (let step = 0; step <= cfg.steps; step++) {
              const t = step / cfg.steps;
              const pt = catmull(a, prev, points[i], c, t);
              ctx.lineTo(pt.x, pt.y);
            }
          } else {
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(points[i].x, points[i].y);
          }
          ctx.stroke();
        }
      }

      if (points.length === 0) {
        stoppedAt = 0;
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('mousemove', onMouse);
      removeEventListener('resize', resize);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    />
  );
}
