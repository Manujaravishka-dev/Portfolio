'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ParticleField({ tier, paused, light }: { tier: string; paused: boolean; light: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let disposed = false, frame = 0;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); } catch { return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, tier === 'High' ? 2 : 1));
    container.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, .1, 30);
    camera.position.z = 7.2;
    const group = new THREE.Group(); scene.add(group);
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.PointsMaterial({size: tier === 'Saver' ? .018 : .012, vertexColors: true, transparent: true, opacity: .95, depthWrite: false, blending: light ? THREE.NormalBlending : THREE.AdditiveBlending});
    const picture = new Image();
    picture.src = '/manuja-portrait.webp';
    picture.onload = () => {
      if (disposed) return;
      const canvas = document.createElement('canvas');
      canvas.width = 400; canvas.height = 560;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) return;
      context.drawImage(picture, 70, 15, 700, 980, 0, 0, 400, 560);
      const { data } = context.getImageData(0, 0, 400, 560);
      const positions: number[] = [], colors: number[] = [];
      const step = tier === 'High' ? 1.5 : tier === 'Saver' ? 3 : 2;
      for (let y = 0; y < 560; y += step) for (let x = 0; x < 400; x += step) {
        const i = (Math.floor(y) * 400 + Math.floor(x)) * 4;
        const value = data[i] / 255;
        const edge = Math.abs(value - data[Math.min(i + 8, data.length - 4)] / 255);
        const fade = Math.min(1, x / 35, (400-x) / 35, y / 20, (560-y) / 80);
        if (value < .065 || fade <= 0) continue;
        const brightness = Math.min(1, Math.pow(value, .65) * .82 + edge * 2.8) * fade;
        positions.push((x / 400 - .5) * 2.75, (.5-y / 560) * 3.85, value * .42);
        const tone = light ? .12 : brightness;
        colors.push(tone, tone, tone);
      }
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      group.add(new THREE.Points(geometry, material));
      renderer.render(scene, camera);
    };
    let targetX = 0, targetY = 0, previous = 0;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pointer = (event: PointerEvent) => { targetY = (event.clientX / innerWidth - .5) * .16; targetX = (event.clientY / innerHeight - .5) * .08; };
    const resize = () => { const r = container.getBoundingClientRect(); renderer.setSize(r.width, r.height); camera.aspect = r.width / Math.max(r.height,1); camera.updateProjectionMatrix(); renderer.render(scene,camera); };
    const observer = new ResizeObserver(resize); observer.observe(container); resize();
    window.addEventListener('pointermove', pointer);
    function animate(time: number) {
      frame = requestAnimationFrame(animate);
      if (document.hidden || time-previous < (tier==='High'?16:32)) return;
      previous = time;
      if (!paused && !reduced) { group.rotation.y += (targetY-group.rotation.y)*.04; group.rotation.x += (targetX-group.rotation.x)*.04; group.position.y = Math.sin(time*.0005)*.018; }
      renderer.render(scene,camera);
    }
    frame = requestAnimationFrame(animate);
    return () => { disposed = true; picture.onload = null; cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('pointermove',pointer); geometry.dispose(); material.dispose(); renderer.dispose(); renderer.domElement.remove(); };
  },[tier,paused,light]);
  return <div className="portrait-field"><img className="portrait-fallback" src="/manuja-portrait.webp" alt="Manuja Ravishka" /><div className="portrait-canvas" ref={host} aria-hidden="true" /></div>;
}
