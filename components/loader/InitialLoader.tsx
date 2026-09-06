'use client';

import { useEffect, useRef, useState } from 'react';
import { usePortfolioAudio } from '@/hooks/usePortfolioAudio';

const MAX_MS = 7000;
const LEAD_MS = 2200;

type Mode = 'sound' | 'silent';

function labelFor(progress: number): string {
  if (progress >= 100) return 'SYSTEM_READY';
  if (progress >= 92) return 'PREPARING_MODULES';
  if (progress >= 70) return 'FETCHING_ASSETS';
  if (progress >= 38) return 'LOADING_INTERFACE';
  return 'INITIALIZING_SYSTEM';
}

function waitForWindowLoad(): Promise<void> {
  return new Promise((resolve) => {
    if (document.readyState === 'complete') {
      resolve();
      return;
    }
    const onLoad = () => {
      window.removeEventListener('load', onLoad);
      resolve();
    };
    window.addEventListener('load', onLoad);
  });
}

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

export default function InitialLoader({ onFinish }: { onFinish?: () => void }) {
  const { setSound, setMusic, startMusic } = usePortfolioAudio();
  const [progress, setProgress] = useState(0);
  const [tier, setTier] = useState('MEDIUM');
  const [ready, setReady] = useState(false);
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null);
  const [entering, setEntering] = useState(false);
  const [fading, setFading] = useState(false);
  const [gone, setGone] = useState(false);
  const progressRef = useRef(0);
  const readyRef = useRef(false);
  const enteringRef = useRef(false);
  const onFinishRef = useRef(onFinish);
  const enterRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('portfolio-tier');
      if (saved && ['High', 'Medium', 'Saver'].includes(saved)) setTier(saved.toUpperCase());
    } catch {}
  }, []);

  useEffect(() => {
    const started = performance.now();
    let rafId = 0;
    let cancelled = false;
    let assetsResolvedAt = 0;
    let resolvePct = 0;

    const assets = Promise.all([
      waitForWindowLoad(),
      preloadImage('/image.png'),
      preloadImage('/manuja-portrait.webp'),
      new Promise((resolve) => setTimeout(resolve, LEAD_MS)),
    ]);

    assets.then(() => {
      if (cancelled) return;
      assetsResolvedAt = performance.now();
      resolvePct = progressRef.current;
    });

    const finish = () => {
      if (cancelled || readyRef.current) return;
      readyRef.current = true;
      cancelAnimationFrame(rafId);
      setProgress(100);
      setReady(true);
    };

    const loop = () => {
      if (cancelled) return;
      const elapsed = performance.now() - started;
      let target: number;
      if (assetsResolvedAt) {
        const sweep = elapsed - assetsResolvedAt;
        target = resolvePct + (Math.min(sweep, 600) / 600) * (100 - resolvePct);
      } else {
        target = 86 * (1 - Math.exp(-elapsed / 1100));
      }
      const next = Math.min(100, Math.max(0, target));
      progressRef.current = next;
      setProgress(next);
      if (next >= 100 || elapsed > MAX_MS) {
        finish();
        return;
      }
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, []);

  const chooseMode = (mode: Mode) => {
    if (!readyRef.current || entering) return;
    setSelectedMode(mode);
    if (mode === 'sound') {
      setSound(true, true);
      setMusic(true, true);
    } else {
      setSound(false, true);
    }
  };

  useEffect(() => {
    if (selectedMode && !entering) {
      enterRef.current?.focus({ preventScroll: true });
    }
  }, [selectedMode, entering]);

  const enter = async () => {
    if (!readyRef.current || selectedMode === null || enteringRef.current) return;
    enteringRef.current = true;
    setEntering(true);
    if (selectedMode === 'sound') {
      // Direct play() from this real click/tap/touch. If the browser still
      // blocks it, the audio manager arms a one-shot retry for the next
      // interaction; entry proceeds regardless so the site never traps.
      await startMusic();
    }
    setFading(true);
    setTimeout(() => {
      setGone(true);
      onFinishRef.current?.();
    }, 620);
  };

  if (gone) return null;

  const percent = Math.round(progress);
  const status = ready ? 'SYSTEM_READY' : labelFor(progress);
  const mode = ready ? 'READY' : 'LOADING';

  return (
    <div
      className={'loader' + (fading ? ' fading' : '') + (selectedMode && !entering ? ' gate-ready' : '')}
      role="progressbar"
      aria-label="Loading portfolio"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      onClick={() => {
        if (readyRef.current && selectedMode && !entering) enter();
      }}
    >
      <div className="loader-grid" aria-hidden="true" />
      <span className="loader-cell loader-cell-a" aria-hidden="true" />
      <span className="loader-cell loader-cell-b" aria-hidden="true" />
      <span className="loader-blob loader-blob-a" aria-hidden="true" />
      <span className="loader-blob loader-blob-b" aria-hidden="true" />
      <span className="loader-label loader-label-a" aria-hidden="true">GRID_L1_R1</span>
      <span className="loader-label loader-label-b" aria-hidden="true">GRID_L2_MASTER</span>
      <span className="loader-label loader-label-c" aria-hidden="true">GRID_RIGHT_SIMPLE</span>
      <div className="loader-percent" aria-hidden="true"><b>{percent}</b><small>%</small></div>
      <div className="loader-tier" aria-hidden="true"><small>PERFORMANCE TIER</small><strong>[{tier}]</strong></div>
      {ready && !entering && (
        <div className="loader-gate">
          <div className="loader-modes" role="group" aria-label="Choose sound mode">
            <button type="button" className={'loader-mode' + (selectedMode === 'sound' ? ' selected' : '')} aria-pressed={selectedMode === 'sound'} onClick={() => chooseMode('sound')}>SOUND MODE</button>
            <button type="button" className={'loader-mode' + (selectedMode === 'silent' ? ' selected' : '')} aria-pressed={selectedMode === 'silent'} onClick={() => chooseMode('silent')}>SILENT MODE</button>
          </div>
          {selectedMode && (
            <button type="button" ref={enterRef} className="loader-enter" onClick={enter}>CLICK / TAP TO ENTER</button>
          )}
        </div>
      )}
      <div className="loader-ctl" aria-hidden="true">
        <div className="loader-status"><span>{status}</span><em>{percent}%</em></div>
        <div className="loader-bar">
          <div className="loader-bar-track"><i style={{ width: percent + '%' }} /></div>
          <b>{mode}</b>
        </div>
      </div>
    </div>
  );
}