'use client';
import { X } from 'lucide-react';
import type { CSSProperties } from 'react';
import { usePortfolioAudio } from '@/hooks/usePortfolioAudio';

export interface AccentDef { hex: string; soft: string }
export const ACCENTS: Record<string, AccentDef> = {
  White: { hex: '#eeeeee', soft: 'rgba(238,238,238,.22)' },
  Cyan: { hex: '#45d5e0', soft: 'rgba(69,213,224,.32)' },
  Green: { hex: '#58dd7f', soft: 'rgba(88,221,127,.32)' },
  Yellow: { hex: '#f3d35c', soft: 'rgba(243,211,92,.32)' },
  Red: { hex: '#f56d6d', soft: 'rgba(245,109,109,.32)' },
};

interface Props {
  accent: string;
  soundOn: boolean;
  musicOn: boolean;
  tier: string;
  onAccent: (key: string) => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onTier: (next: string) => void;
  onClose: () => void;
}

export default function SystemPanel({ accent, soundOn, musicOn, tier, onAccent, onToggleSound, onToggleMusic, onTier, onClose }: Props) {
  const { playHover, playClick, musicReady } = usePortfolioAudio();
  const tiers = ['High', 'Medium', 'Saver'];
  return (
    <aside className="system-panel" id="system-panel" aria-label="System settings">
      <header className="system-header">
        <div className="system-header-title">
          <h2>System</h2>
          <small>GLOBAL CONFIG <span className="set-badge">SET</span></small>
        </div>
        <button type="button" className="system-close" aria-label="Close system settings" onMouseEnter={playHover} onFocus={playHover} onClick={() => { playClick(); onClose(); }}><X size={16} /></button>
      </header>
      <section className="system-section">
        <p className="system-section-label">[01] CORE THEME</p>
        <div className="accent-options" role="group" aria-label="Accent colour">
          {Object.keys(ACCENTS).map(k => (
            <button key={k} type="button" className={'accent-dot' + (accent === k ? ' selected' : '')} aria-pressed={accent === k} aria-label={'Accent colour ' + k} title={k} onMouseEnter={playHover} onFocus={playHover} onClick={() => { playClick(); onAccent(k); }} style={{ '--dot': ACCENTS[k].hex } as CSSProperties} />
          ))}
        </div>
      </section>
      <section className="system-section">
        <p className="system-section-label">[02] AUDIO</p>
        <p className="system-caption">BACKGROUND TRACK</p>
        <div className="system-track">
          <strong>LUCIFER</strong>
          <span>PUFINO</span>
          <a className="system-track-credit" href="https://freetouse.com/music/pufino" target="_blank" rel="noreferrer" onMouseEnter={playHover} onFocus={playHover} onClick={playClick}>FREETOUSE ↗</a>
        </div>
        <p className="system-track-status">{musicReady ? 'TRACK_LOADED' : 'PENDING · LOADING /sounds/Pufino - Lucifer (freetouse.com).mp3'}</p>
        <p className="system-caption">SYSTEM AUDIO</p>
        <div className="segmented" role="group" aria-label="System audio">
          <button type="button" className={'seg' + (soundOn ? ' selected' : '')} aria-pressed={soundOn} onMouseEnter={playHover} onFocus={playHover} onClick={() => { playClick(); if (!soundOn) onToggleSound(); }}>ON</button>
          <button type="button" className={'seg' + (!soundOn ? ' selected' : '')} aria-pressed={!soundOn} onMouseEnter={playHover} onFocus={playHover} onClick={() => { playClick(); if (soundOn) onToggleSound(); }}>OFF</button>
        </div>
        <p className="system-caption">BACKGROUND MUSIC</p>
        <div className="segmented" role="group" aria-label="Background music">
          <button type="button" className={'seg' + (musicOn ? ' selected' : '')} aria-pressed={musicOn} onMouseEnter={playHover} onFocus={playHover} onClick={() => { playClick(); if (!musicOn) onToggleMusic(); }}>ON</button>
          <button type="button" className={'seg' + (!musicOn ? ' selected' : '')} aria-pressed={!musicOn} onMouseEnter={playHover} onFocus={playHover} onClick={() => { playClick(); if (musicOn) onToggleMusic(); }}>OFF</button>
        </div>
      </section>
      <section className="system-section">
        <p className="system-section-label">[03] PERFORMANCE TIER</p>
        <div className="segmented" role="group" aria-label="Performance tier">
          {tiers.map(t => (
            <button key={t} type="button" className={'seg' + (tier === t ? ' selected' : '')} aria-pressed={tier === t} onMouseEnter={playHover} onFocus={playHover} onClick={() => { playClick(); onTier(t); }}>{t.toUpperCase()}</button>
          ))}
        </div>
      </section>
      <footer className="system-footer">SYSTEM ACTIVE</footer>
    </aside>
  );
}