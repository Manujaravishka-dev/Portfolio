'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ParticleField({ tier, paused, light }: { tier: string; paused: boolean; light: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: tier === 'High' }); } catch { return; }
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.z = 7;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, tier === 'High' ? 1.8 : 1));
    container.appendChild(renderer.domElement);
    const count = tier === 'Saver' ? 2200 : tier === 'Medium' ? 6500 : 12000;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = i / count * Math.PI * 2 * 31;
      const v = i * 2.399963;
      const radius = 1.34 + 0.38 * Math.cos(v);
      positions[i * 3] = radius * Math.cos(u);
      positions[i * 3 + 1] = radius * Math.sin(u);
      positions[i * 3 + 2] = 0.48 * Math.sin(v) + 0.15 * Math.sin(u * 3);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color: light ? 0x252525 : 0xe9e9e4, size: 0.012, transparent: true, opacity: 0.72, sizeAttenuation: true });
    const points = new THREE.Points(geometry, material);
    points.rotation.set(0.35, -0.55, 0.3);
    scene.add(points);
    let pointerX = 0, pointerY = 0, frame = 0;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const resize = () => { const {width, height} = container.getBoundingClientRect(); renderer.setSize(width, height); camera.aspect = width / Math.max(height, 1); camera.updateProjectionMatrix(); renderer.render(scene, camera); };
    const observer = new ResizeObserver(resize); observer.observe(container); resize();
    const pointer = (e: PointerEvent) => { pointerX = (e.clientX / innerWidth - 0.5) * 0.6; pointerY = (e.clientY / innerHeight - 0.5) * 0.3; };
    window.addEventListener('pointermove', pointer);
    let previous = 0;
    const animate = (time: number) => {
      frame = requestAnimationFrame(animate);
      if (document.hidden || (tier !== 'High' && time - previous < 32)) return;
      const delta = Math.min((time - previous) / 1000, 0.05); previous = time;
      if (!paused && !reduced) { points.rotation.z += delta * 0.045; points.rotation.y += (pointerX - 0.55 - points.rotation.y) * 0.018; points.rotation.x += (pointerY + 0.35 - points.rotation.x) * 0.018; }
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('pointermove', pointer); geometry.dispose(); material.dispose(); renderer.dispose(); renderer.domElement.remove(); };
  }, [tier, paused, light]);
  return <div className="particle-field" ref={host} aria-hidden="true" />;
}
