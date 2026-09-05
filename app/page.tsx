'use client';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { ArrowUpRight, Github, Grid2X2, Settings2, X, Volume2, VolumeX, Pause, Play, Sun, Moon } from 'lucide-react';
import { profile } from '@/lib/profile';
const ParticleField = dynamic(() => import('@/components/ParticleField'), { ssr: false });
const pages = ['Home', 'About', 'Projects', 'Contact'] as const;
type Page = typeof pages[number];

export default function Portfolio() {
  const [page, setPage] = useState<Page>('Home');
  const [menu, setMenu] = useState(false), [settings, setSettings] = useState(false);
  const [light, setLight] = useState(false), [paused, setPaused] = useState(false), [sound, setSound] = useState(false);
  const [tier, setTier] = useState('Medium'), [time, setTime] = useState('');
  const content = useRef<HTMLElement>(null);
  const audio = useRef<AudioContext | null>(null);
  const menuButton = useRef<HTMLButtonElement>(null), settingsButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const update = () => setTime(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Colombo', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date()));
    update(); const timer = setInterval(update, 10000);
    const readHash = () => { if (location.hash === '#content') return; const match = pages.find(p => p.toLowerCase() === location.hash.slice(1)); setPage(match || 'Home'); };
    readHash(); window.addEventListener('hashchange', readHash);
    try { setLight(localStorage.getItem('portfolio-theme') === 'light'); const saved = localStorage.getItem('portfolio-tier'); if (saved && ['High','Medium','Saver'].includes(saved)) setTier(saved); } catch {}
    return () => { clearInterval(timer); window.removeEventListener('hashchange', readHash); };
  }, []);
  useEffect(() => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const ctx = gsap.context(() => { gsap.fromTo('.reveal', { y: 25, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.075, duration: 0.7, ease: 'power3.out' }); }, content);
      return () => ctx.revert();
    }
  }, [page]);
  useEffect(() => { const escape = (e: KeyboardEvent) => { if (e.key === 'Escape') { if (menu) { setMenu(false); menuButton.current?.focus(); } if (settings) { setSettings(false); settingsButton.current?.focus(); } } }; window.addEventListener('keydown', escape); return () => window.removeEventListener('keydown', escape); }, [menu, settings]);
  useEffect(() => { return () => { void audio.current?.close(); }; }, []);
  function navigate(next: Page) { setPage(next); setMenu(false); location.hash = next.toLowerCase(); menuButton.current?.focus(); }
  function changeTheme() { setLight(!light); try { localStorage.setItem('portfolio-theme', !light ? 'light' : 'dark'); } catch {} }
  function changeTier(next: string) { setTier(next); try { localStorage.setItem('portfolio-tier', next); } catch {} }
  async function toggleSound() {
    if (sound) { await audio.current?.suspend(); setSound(false); return; }
    try {
      if (!audio.current) {
        const ctx = new AudioContext(); audio.current = ctx;
        const gain = ctx.createGain(); gain.gain.value = 0.018; gain.connect(ctx.destination);
        [130.81, 196, 261.63].forEach(frequency => { const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = frequency; osc.connect(gain); osc.start(); });
      }
      await audio.current.resume(); setSound(true);
    } catch { setSound(false); }
  }
  return <div className={`portfolio ${light ? 'light' : ''}`}>
    <a className="skip-link" href="#content">Skip to content</a>
    <div className="grid-overlay" aria-hidden="true" />
    <header className="site-header">
      <a className="wordmark" href="#home" onClick={() => navigate('Home')} aria-label="Manuja Ravishka home"><span>{profile.firstName}<br />{profile.lastName}</span><span className="wordmark-meta">Portfolio<br />2026</span></a>
      <div className="header-status"><span className="status-dot" /> INDEPENDENT DEVELOPER <span className="header-coordinates">DESIGN + CODE / 2026</span></div>
      <a className="github-link" href={profile.github} target="_blank" rel="noreferrer" aria-label="Visit GitHub profile"><Github size={19} /><ArrowUpRight size={14} /></a>
    </header>
    <main id="content" ref={content} tabIndex={-1}>
      {page === 'Home' ? <section className="home-screen" aria-label="Introduction">
        <div className="hero-copy">
          <p className="eyebrow reveal"><span className="tiny-cross">+</span> CODE. DESIGN. EXPERIMENT.</p>
          <h1 className="reveal">CREATIVE<br /><span>DEVELOPER</span><span className="title-period">.</span></h1>
          <div className="intro-log reveal"><span className="rule" /><div><p className="micro-label">[ INFO_LOG ]</p><p>{profile.intro}</p></div></div>
          <button className="text-link reveal" onClick={() => navigate('Projects')}>EXPLORE MY WORK <ArrowUpRight size={18} /></button>
        </div>
        <div className="hero-visual"><ParticleField tier={tier} paused={paused} light={light} /><span className="visual-label">FIG. 001 — CONTINUOUS EXPLORATION</span><span className="visual-corner">+<br /><br />+</span></div>
        <aside className="developer-stats reveal"><p className="micro-label">DEVELOPER SYSTEM</p><p className="system-status"><span className="status-dot" /> ONLINE</p><div className="stat-row"><span>PRIMARY_FOCUS</span><strong>WEB EXPERIENCES</strong></div><div className="stat-row"><span>CREATIVE_ENGINE</span><strong>ALWAYS CURIOUS</strong></div><div className="terminal-lines"><p>&gt; STACK: NEXT / THREE / GSAP</p><p>&gt; APPROACH: DESIGN + CODE</p><p>&gt; RENDER_TIER: {tier.toUpperCase()}</p></div></aside>
        <div className="home-bottom reveal"><span className="section-index">01 / 04</span><span>DESIGNED WITH INTENT.<br />BUILT WITH CURIOSITY.</span></div>
      </section> : page === 'About' ? <section className="inner-screen"><p className="eyebrow reveal">[ 02 / ABOUT ]</p><h1 className="inner-title reveal">CURIOUS MIND.<br /><span>CREATIVE CODE.</span></h1><div className="about-grid"><p className="large-copy reveal">{profile.bio}</p><div className="about-details reveal"><span className="micro-label">[ TOOLKIT ]</span>{['Next.js / React', 'TypeScript / JavaScript', 'Three.js / WebGL', 'GSAP / CSS'].map((s,i) => <div className="tool-row" key={s}><span>0{i+1}</span>{s}<ArrowUpRight size={17}/></div>)}<a className="text-link" href={profile.github} target="_blank" rel="noreferrer">EXPLORE MY GITHUB <ArrowUpRight size={17}/></a></div></div></section> : page === 'Projects' ? <section className="inner-screen"><p className="eyebrow reveal">[ 03 / SELECTED WORK ]</p><h1 className="inner-title reveal">IDEAS INTO<br /><span>EXPERIENCES.</span></h1><div className="project-list">{profile.projects.map((project,i) => <a className="project-card reveal" href={project.url} target="_blank" rel="noreferrer" key={project.title}><div className="project-art" aria-hidden="true"><span>MR<span className="project-art-period">.</span></span><small>PORTFOLIO / 2026</small></div><div className="project-info"><span className="micro-label">0{i+1} — {project.category}</span><h2>{project.title}</h2><p>{project.description}</p><div className="tags">{project.stack.map(s => <span key={s}>{s}</span>)}</div></div><ArrowUpRight className="project-arrow" size={30}/></a>)}</div><a className="text-link reveal" href={profile.github + '?tab=repositories'} target="_blank" rel="noreferrer">ALL REPOSITORIES <ArrowUpRight size={17}/></a></section> : <section className="inner-screen contact-screen"><p className="eyebrow reveal">[ 04 / CONTACT ]</p><h1 className="inner-title reveal">LET’S MAKE<br /><span>SOMETHING</span><br />MEANINGFUL.</h1><div className="contact-bottom reveal"><p>Have an idea in mind?<br />Find me on GitHub.</p><a className="contact-cta" href={profile.email ? `mailto:${profile.email}` : profile.github} target={profile.email ? undefined : '_blank'} rel="noreferrer">{profile.email || 'Say hello on GitHub'}<ArrowUpRight size={30}/></a></div></section>}
    </main>
    <button ref={settingsButton} className="settings-trigger" aria-label="Open system settings" aria-expanded={settings} aria-controls="settings-panel" onClick={() => { setSettings(!settings); setMenu(false); }}><Settings2 size={20}/></button>
    {settings && <aside className="settings-panel floating-panel" id="settings-panel" aria-label="System settings"><div className="panel-heading"><div><h2>System</h2><span className="micro-label">GLOBAL CONFIG / SET</span></div><button aria-label="Close settings" onClick={() => { setSettings(false); settingsButton.current?.focus(); }}><X size={20}/></button></div><div className="setting-row"><span>[01] Core theme</span><button onClick={changeTheme}>{light ? <Sun size={17}/> : <Moon size={17}/>} {light ? 'Light' : 'Dark'}</button></div><div className="setting-row"><span>[02] Audio engine</span><button onClick={toggleSound} aria-pressed={sound}>{sound ? <Volume2 size={17}/> : <VolumeX size={17}/>} {sound ? 'On' : 'Off'}</button></div><div className="setting-row"><span>[03] Motion</span><button onClick={() => setPaused(!paused)} aria-pressed={paused}>{paused ? <Play size={16}/> : <Pause size={16}/>} {paused ? 'Paused' : 'Playing'}</button></div><p className="micro-label tier-label">[04] PERFORMANCE TIER</p><div className="tier-options">{['High','Medium','Saver'].map(t => <button aria-pressed={tier===t} className={tier===t?'selected':''} onClick={() => changeTier(t)} key={t}>{t}</button>)}</div><p className="panel-footnote">Ambient tones · sound starts only when enabled</p></aside>}
    <footer className="site-footer"><div className="footer-contact"><span>WANNA SAY HELLO?</span><a href={profile.github} target="_blank" rel="noreferrer">Let’s connect <ArrowUpRight size={14}/></a></div><div className="local-time"><span>LOCAL TIME / COLOMBO</span><strong>{time || '--:--'} <span className="status-dot" /></strong></div><button className="sound-toggle" aria-label={sound?'Mute ambient audio':'Play ambient audio'} onClick={toggleSound}>{sound?<Volume2 size={20}/>:<VolumeX size={20}/>}</button><div className="navigation-wrap">{menu && <nav className="nav-panel floating-panel" id="navigation-panel" aria-label="Main navigation"><div className="panel-heading"><div><h2>Menu</h2><span className="micro-label">NAVIGATION / DIR</span></div><a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={21}/></a></div>{pages.map((p,i)=><button className={page===p?'active':''} onClick={()=>navigate(p)} key={p} aria-current={page===p?'page':undefined}><span>[{i+1}]</span>{p}<ArrowUpRight size={22}/></button>)}</nav>}<button ref={menuButton} className="menu-trigger" onClick={()=>{setMenu(!menu);setSettings(false);}} aria-expanded={menu} aria-controls="navigation-panel"><span>[{pages.indexOf(page)+1}]</span><strong>{page}</strong><span className="menu-icon">{menu?<X size={22}/>:<Grid2X2 size={20}/>}</span></button></div></footer>
  </div>;
}
