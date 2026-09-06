'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { Grid2X2, X, Volume2, VolumeX, ArrowUpRight } from 'lucide-react';
import { profile } from '@/lib/profile';
import { usePortfolioAudio } from '@/hooks/usePortfolioAudio';

const pages = ['Home', 'About', 'Projects', 'Contact'] as const;
type Page = (typeof pages)[number];

const pageMap: Record<string, { index: string; label: string }> = {
  '/': { index: '1', label: 'HOME' },
  '/about': { index: '2', label: 'ABOUT' },
  '/projects': { index: '3', label: 'PROJECTS' },
  '/contact': { index: '4', label: 'CONTACT' },
};

const pageEntry: Record<Page, { index: string; label: string }> = {
  Home: { index: '1', label: 'HOME' },
  About: { index: '2', label: 'ABOUT' },
  Projects: { index: '3', label: 'PROJECTS' },
  Contact: { index: '4', label: 'CONTACT' },
};

function entryForPath(path: string) {
  const cleaned = path.replace(/\/+$/, '') || '/';
  if (cleaned === '/projects' || cleaned.startsWith('/projects/')) return pageMap['/projects'];
  return pageMap[cleaned] ?? pageMap['/'];
}

interface PageNavProps {
  page: Page;
  menu: boolean;
  soundOn: boolean;
  menuButtonRef: React.RefObject<HTMLButtonElement | null>;
  onToggleSound: () => void;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onNavigate: (next: Page) => void;
}

function NavLabel({ index, label }: { index: string; label: string }) {
  const [display, setDisplay] = useState({ index, label });
  const [exiting, setExiting] = useState(false);
  const indexRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const first = useRef(true);
  const reduce = useRef(typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (exiting) return;
    if (display.index === index && display.label === label) return;
    setExiting(true);
  }, [index, label, display, exiting]);

  useEffect(() => {
    if (!exiting) return;
    if (reduce.current) {
      setDisplay({ index, label });
      setExiting(false);
      return;
    }
    const tl = gsap.timeline();
    tl.to([indexRef.current, labelRef.current], { opacity: 0, y: -5, duration: 0.12, ease: 'power1.in', onComplete: () => setDisplay({ index, label }) })
      .to([indexRef.current, labelRef.current], { opacity: 1, y: 0, duration: 0.2, delay: 0.04, ease: 'power1.out', onComplete: () => setExiting(false) });
    return () => { tl.kill(); };
  }, [exiting, index, label, reduce]);

  return (
    <>
      <span ref={indexRef} className="nav-index">[{display.index}]</span>
      <span ref={labelRef} className="nav-label">{display.label}</span>
    </>
  );
}

export default function PageNav({ page, menu, soundOn, menuButtonRef, onToggleSound, onToggleMenu, onCloseMenu, onNavigate }: PageNavProps) {
  const { playHover, playClick } = usePortfolioAudio();
  const pathname = usePathname();

  const entry = useMemo(() => {
    const fromPath = entryForPath(pathname);
    const fromPage = pageEntry[page];
    return fromPath.label === fromPage.label ? fromPath : fromPage;
  }, [pathname, page]);

  return (
    <div className="page-nav">
      <button type="button" className={'nav-wave' + (soundOn ? ' on' : '')} aria-pressed={soundOn} aria-label={soundOn ? 'Disable sound effects' : 'Enable sound effects'} onMouseEnter={playHover} onFocus={playHover} onClick={() => { playClick(); onToggleSound(); }}>
        <svg width="26" height="13" viewBox="0 0 26 13" aria-hidden="true">
          <g className="nav-wave-front">
            <path d="M0 6.5Q3.25 2 6.5 6.5T13 6.5" />
            <path d="M13 6.5Q16.25 2 19.5 6.5T26 6.5" />
          </g>
        </svg>
      </button>
      <div className="nav-card">
        <div className="nav-page" aria-live="polite">
          <NavLabel index={entry.index} label={entry.label} />
        </div>
        <div className="navigation">
          {menu && (
            <nav className="menu-panel" id="portal-menu" aria-label="Site navigation">
              <header className="menu-header">
                <div className="menu-header-title"><h2>Menu</h2><small>NAVIGATION</small></div>
                <div className="menu-header-actions">
                  <button className="menu-sound" onClick={onToggleSound} aria-pressed={soundOn} aria-label={soundOn ? 'Disable sound effects' : 'Enable sound effects'} title={soundOn ? 'Sound on' : 'Sound off'}>{soundOn ? <Volume2 size={13} /> : <VolumeX size={13} />}</button>
                  <button className="menu-close" aria-label="Close menu" onClick={onCloseMenu}><X size={16} /></button>
                </div>
              </header>
              <div className="menu-social-grid">
                {[{ key: 'in', label: 'LinkedIn', url: profile.social.linkedin }, { key: 'gh', label: 'Github', url: profile.social.github }, { key: 'up', label: 'Upwork', url: profile.social.upwork }, { key: 'tg', label: 'Telegram', url: profile.social.telegram }].map(s => (
                  <a key={s.key} href={s.url || profile.github} target="_blank" rel="noreferrer" onMouseEnter={playHover} onFocus={playHover} onClick={playClick} aria-label={s.label}><i /> {s.label}</a>
                ))}
              </div>
              <a className="menu-dev-labs" href={profile.repository} target="_blank" rel="noreferrer" onMouseEnter={playHover} onFocus={playHover} onClick={playClick} aria-label="Portfolio source repository">DEV LABS <ArrowUpRight size={15} /></a>
              <div className="menu-links">
                {[...pages].reverse().map(p => {
                  const active = page === p;
                  return (
                    <button key={p} className={'menu-link' + (active ? ' active' : '')} onMouseEnter={playHover} onFocus={playHover} onClick={() => { playClick(); onNavigate(p); }} aria-current={active ? 'page' : undefined}>
                      <small>[{pages.indexOf(p) + 1}]</small><strong>{p}</strong><i className={active ? 'on' : ''} />
                    </button>
                  );
                })}
              </div>
            </nav>
          )}
          <button className="menu-trigger" ref={menuButtonRef} aria-label="Toggle menu" aria-expanded={menu} aria-controls="portal-menu" onMouseEnter={playHover} onFocus={playHover} onClick={() => { playClick(); onToggleMenu(); }}>
            <i>{menu ? <X size={19} /> : <Grid2X2 size={18} />}</i>
          </button>
        </div>
      </div>
    </div>
  );
}