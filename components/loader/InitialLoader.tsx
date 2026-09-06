'use client';

import { useEffect, useRef, useState } from 'react';
import { usePortfolioAudio } from '@/hooks/usePortfolioAudio';

const MAX_MS = 7000;
const LEAD_MS = 2200;

type Mode = 'on' | 'off';

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

function isCoarsePointer(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches === true;
}

async function requestFullscreenOnMobile(): Promise<void> {
  if (!isCoarsePointer() || typeof document === 'undefined') return;
  try {
    // Real fullscreen for mobile/tablet only; must be called inside the
    // user-interaction handler. If unsupported or denied, entry continues.
    await document.documentElement.requestFullscreen?.();
  } catch {
    /* continue normally */
  }
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
  const [musicChoice, setMusicChoice] = useState<Mode | null>(null);
  const [entering, setEntering] = useState(false);
  const [fading, setFading] = useState(false);
  const [gone, setGone] = useState(false);
  const progressRef = useRef(0);
  const readyRef = useRef(false);
  const enteringRef = useRef(false);
  const onFinishRef = useRef(onFinish);
  const enterRef = useRef<HTMLButtonElement>(null);
  const mobileEnterRef = useRef<HTMLButtonElement>(null);

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
    setMusicChoice(mode);
    if (mode === 'on') {
      // Music ON: enable system sound + background music (deferred play).
      setSound(true, true);
      setMusic(true, true);
    } else {
      // Music OFF: stay silent; the song is never started and sound is muted.
      setSound(false, true);
    }
  };

  useEffect(() => {
    if (musicChoice && !entering) {
      enterRef.current?.focus({ preventScroll: true });
      mobileEnterRef.current?.focus({ preventScroll: true });
    }
  }, [musicChoice, entering]);

  const enter = async () => {
    if (!readyRef.current || musicChoice === null || enteringRef.current) return;
    enteringRef.current = true;
    setEntering(true);
    // Both the song play() and the fullscreen request are issued synchronously
    // inside this same user gesture (before any await suspends the handler),
    // so browsers treat them as real click/tap/touch activation.
    const musicPromise = musicChoice === 'on' ? startMusic() : Promise.resolve(true);
    await requestFullscreenOnMobile();
    await musicPromise;
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
      className={'loader' + (fading ? ' fading' : '') + (ready ? ' loader-ready' : '') + (musicChoice && !entering ? ' gate-ready' : '')}
      role="progressbar"
      aria-label="Loading portfolio"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      onClick={() => {
        if (readyRef.current && musicChoice && !entering) enter();
      }}
      onPointerDown={() => {
        // Responsive entry on coarse-pointer (touch) devices: accept the tap
        // on pointerdown so audio/fullscreen start as early as allowed. Click
        // below is the fallback, guarded by enteringRef against double entry.
        if (isCoarsePointer() && readyRef.current && musicChoice && !entering) enter();
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
        <>
          <div className="loader-gate">
            <div className="loader-modes" role="group" aria-label="Choose sound mode">
              <button type="button" className={'loader-mode' + (musicChoice === 'on' ? ' selected' : '')} aria-pressed={musicChoice === 'on'} onClick={() => chooseMode('on')}>SOUND MODE</button>
              <button type="button" className={'loader-mode' + (musicChoice === 'off' ? ' selected' : '')} aria-pressed={musicChoice === 'off'} onClick={() => chooseMode('off')}>SILENT MODE</button>
            </div>
            {musicChoice && (
              <button type="button" ref={enterRef} className="loader-enter" onClick={enter}>CLICK / TAP TO ENTER</button>
            )}
          </div>
          <div className="loader-gate-mobile">
            <button type="button" ref={mobileEnterRef} className="loader-enter-area" onClick={enter}>
              <b className="loader-enter-click">CLICK</b>
              <i className="loader-enter-divider" aria-hidden="true" />
              <span className="loader-enter-sub">TO ENTER</span>
            </button>
            <div className="loader-music" role="group" aria-label="Choose music mode">
              <button type="button" className={'loader-music-key' + (musicChoice === 'on' ? ' selected' : '')} aria-pressed={musicChoice === 'on'} onClick={() => chooseMode('on')}>ON</button>
              <span className="loader-music-lbl">MUSIC</span>
              <button type="button" className={'loader-music-key' + (musicChoice === 'off' ? ' selected' : '')} aria-pressed={musicChoice === 'off'} onClick={() => chooseMode('off')}>OFF</button>
            </div>
          </div>
        </>
      )}
      <div className="loader-ctl" aria-hidden="true">
        <div className="loader-status"><span>{status}</span><em>{percent}%</em></div>
        <div className="loader-bar">
          <div className="loader-bar-track"><i style={{ width: percent + '%' }} /></div>
          <b><span className="loader-bar-key">{mode}</span><span className="loader-bar-loaded" aria-hidden="true">LOADED</span></b>
        </div>
      </div>
    </div>
  );
}