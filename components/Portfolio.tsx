'use client';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { Github, Grid2X2, Settings, X, ArrowUpRight, Volume2, VolumeX, Sun, Moon, Pause, Play } from 'lucide-react';
import { profile } from '@/lib/profile';
import { projects } from '@/lib/projects';
const Portrait = dynamic(() => import('@/components/ParticleField'), { ssr: false });
const pages = ['Home','About','Projects','Contact'] as const;
type Page = typeof pages[number];
const sectors = [
  ['Core & Frameworks','JavaScript','TypeScript','React / Next.js','Vue / Nuxt.js','Angular','Remix'],
  ['Immersive & Creative','Three.js / R3F','WebXR','GLSL Shaders','WebGL','Cannon.js','GSAP','Framer Motion','Pixi.js','P5.js'],
  ['Mobile & Native','React Native','Expo'],
  ['Backend & Systems','Node.js','PHP / Laravel','GraphQL','Supabase','MySQL','PostgreSQL','REST APIs'],
  ['CMS & E-commerce','Strapi','Prismic','Contentful','Sanity','HyGraph','WordPress','Shopify','Webflow','Framer'],
  ['Web3 & Blockchain','Web3.js','Ethers.js','wagmi'],
  ['Tooling & Architecture','Vite','Webpack','Tailwind CSS','Redux','Jest','Cypress','Storybook','Figma','Git / GitHub'],
  ['AI Systems & Intelligence','OpenAI API','Anthropic API','Claude Code','Codex','AI IDEs','LangChain']
];
export default function Portfolio({initialPage = 'Home', initialProject = null}: {initialPage?: Page; initialProject?: number | null}) {
  const [page,setPage]=useState<Page>(initialPage);
  const [menu,setMenu]=useState(false),[settings,setSettings]=useState(false);
  const [light,setLight]=useState(false),[paused,setPaused]=useState(false),[sound,setSound]=useState(false);
  const [tier,setTier]=useState('Medium'),[track,setTrack]=useState('Default');
  const [entered,setEntered]=useState(false),[ready,setReady]=useState(false),[time,setTime]=useState('');
  const [selected,setSelected]=useState<number|null>(initialProject),[scroll,setScroll]=useState(0);
  const content=useRef<HTMLDivElement>(null),menuButton=useRef<HTMLButtonElement>(null),settingsButton=useRef<HTMLButtonElement>(null);
  const audio=useRef<AudioContext|null>(null);
  const oscillator=useRef<OscillatorNode[]>([]);
  useEffect(()=>{
    const update=()=>setTime(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Colombo',hour:'numeric',minute:'2-digit',hour12:true}).format(new Date()));
    update(); const clock=setInterval(update,10000);
    const hash=()=>{if(location.hash==='#content')return;const route=location.pathname.split('/').filter(Boolean);const match=pages.find(p=>p.toLowerCase()===(location.hash.slice(1)||route[0]));setPage(match||'Home');const item=route[1]?projects.findIndex(p=>p.slug===route[1]):-1;setSelected(item>=0?item:null);};
    hash();window.addEventListener('hashchange',hash);window.addEventListener('popstate',hash);
    try{setEntered(sessionStorage.getItem('portfolio-entered')==='yes');setLight(localStorage.getItem('portfolio-theme')==='light');const saved=localStorage.getItem('portfolio-tier');if(saved&&['High','Medium','Saver'].includes(saved))setTier(saved);}catch{}
    const image=new Image();image.onload=()=>setReady(true);image.onerror=()=>setReady(true);image.src='/manuja-portrait.webp';
    return()=>{clearInterval(clock);window.removeEventListener('hashchange',hash);window.removeEventListener('popstate',hash);image.onload=null;image.onerror=null;};
  },[]);
  useEffect(()=>{
    if(!entered||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const context=gsap.context(()=>{gsap.fromTo('.reveal',{opacity:0,y:18,filter:'blur(6px)'},{opacity:1,y:0,filter:'blur(0px)',duration:.85,stagger:.08,ease:'power3.out'});},content);
    return()=>context.revert();
  },[page,entered,selected]);
  useEffect(()=>{const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){setMenu(false);setSettings(false);setSelected(null);menuButton.current?.focus();}};window.addEventListener('keydown',escape);return()=>window.removeEventListener('keydown',escape);},[]);
  useEffect(()=>()=>{void audio.current?.close();},[]);
  function navigate(next:Page){setPage(next);setMenu(false);setSelected(null);setScroll(0);history.pushState({},'',next==='Home'?'/':'/'+next.toLowerCase());content.current?.scrollTo(0,0);}
  function theme(){setLight(!light);try{localStorage.setItem('portfolio-theme',!light?'light':'dark');}catch{}}
  function performance(next:string){setTier(next);try{localStorage.setItem('portfolio-tier',next);}catch{}}
  async function toggleSound(){
    try{
      if(sound){await audio.current?.suspend();setSound(false);return;}
      if(!audio.current){const ctx=new AudioContext();audio.current=ctx;const gain=ctx.createGain();gain.gain.value=.014;gain.connect(ctx.destination);oscillator.current=[130.81,196,261.63].map(f=>{const osc=ctx.createOscillator();osc.frequency.value=f;osc.connect(gain);osc.start();return osc;});}
      await audio.current.resume();setSound(true);
    }catch{setSound(false);}
  }
  function changeTrack(next:string){setTrack(next);const notes=next==='Synthwave / Retro'?[110,164.81,220]:next==='Digital Minimalism'?[146.83,220,293.66]:[130.81,196,261.63];oscillator.current.forEach((osc,i)=>{if(audio.current)osc.frequency.setTargetAtTime(notes[i],audio.current.currentTime,.8);});}
  function enter(){setEntered(true);try{sessionStorage.setItem('portfolio-entered','yes');}catch{}}
  return <div className={'portfolio '+(light?'light ':'')+'page-'+page.toLowerCase()+(selected!==null?' detail-view':'')}>
    <a className="skip-link" href="#content">Skip to content</a>
    <div className="mesh-background" aria-hidden="true"/>
    {page==='Home'&&<div className="left-glass" aria-hidden="true"/>}
    <header className="wordmark"><a href="#home" onClick={()=>navigate('Home')} aria-label="Manuja Ravishka home"><span>Manuja<br/>Ravishka</span><span>Portfolio<br/>2026</span></a></header>
    {page!=='Home'&&selected===null&&<div className="page-heading"><p><button onClick={()=>navigate('Home')}>HOME</button> / {page.toUpperCase()}</p><h1>{page==='About'?'MEET MANUJA':page.toUpperCase()}</h1></div>}
    {page==='Home'&&<div className="ticker" aria-hidden="true"><div>{Array.from({length:4},(_,i)=><span key={i}><small>CORE_ID</small> CREATIVE DEVELOPER <small>AVAILABILITY</small> OPEN <small>RENDERING</small> WEBGL / THREE.JS </span>)}</div></div>}
    <main id="content" ref={content} tabIndex={-1} className={'content '+(page==='Projects'?'project-scroll':'')} onScroll={e=>{const el=e.currentTarget;setScroll(el.scrollHeight>el.clientHeight?el.scrollTop/(el.scrollHeight-el.clientHeight)*100:0);}}>
      {page==='Home'&&<section className="home-scene">
        <div className="home-intro reveal"><h1>CREATIVE<br/>DEVELOPER</h1><div className="info-log"><i/><div><small>[ INFO_LOG ]</small><p>SCULPTING TECHNICAL PERFORMANCE<br/>INTO IMMERSIVE DIGITAL ART.</p></div></div></div>
        <div className="home-portrait"><Portrait tier={tier} paused={paused} light={light}/></div>
        <aside className="stats reveal"><small>DEVELOPER STATS</small><p className="sync"><b/> STABLE</p><div className="stat"><span>PROJECTS_COMPLETED</span><span>45+</span></div><div className="stat"><span>EXPERIENCE_YEARS</span><span>10+</span></div><div className="terminal"><p>&gt; ACTIVE_STACK: NEXT_THREE_GSAP</p><p>&gt; AVAILABILITY_TYPE: REMOTE/HYBRID</p><p>&gt; STATUS: OPEN_FOR_OFFERS</p><p>&gt; SYSTEM_PERF: [{tier.toUpperCase()}]</p></div></aside>
      </section>}
      {page==='About'&&<section className="about-scene">
        <div className="about-portrait"><img src="/manuja-portrait.webp" alt="Manuja Ravishka"/></div>
        <article className="about-copy"><p className="reveal">Meet Manuja</p><h2 className="reveal">CREATIVE FRONTEND<br/>DEVELOPER</h2><p className="reveal">I explore the connection between design and technology, creating web experiences with personality, thoughtful interactions and attention to detail.</p><p className="reveal">A passion for</p><h2 className="reveal">IMMERSIVE DIGITAL<br/>EXPERIENCES</h2><p className="reveal">My development playground brings together a broad range of tools and technologies:</p><div className="sectors">{sectors.map(([title,...skills],i)=><section key={title}><small>SECTOR_0{i+1}</small><h3>{title}</h3><div>{skills.map((s,j)=><span key={s}><em>0x{j.toString(16).padStart(2,'0')}</em>{s}</span>)}</div></section>)}</div><p>From the first sketch to the final interaction, I enjoy exploring how a digital experience can feel clear, useful and memorable.</p><h2>CONCEPTS INTO<br/>REALITY</h2><p>Let’s bring your next idea to life.</p><button className="outline-button" onClick={()=>navigate('Contact')}>CONTACT <ArrowUpRight size={17}/></button></article>
      </section>}
      {page==='Projects'&&<section className="projects-scene">{selected===null?<>{projects.map((p,i)=><button className="project-row" key={p.slug} onClick={()=>{setSelected(i);history.pushState({},'','/projects/'+projects[i].slug);content.current?.scrollTo(0,0);}}><span className="project-index">{String(i+1).padStart(2,'0')}</span><div className="project-copy"><h2>{p.title}</h2><div className="project-tags"><span>{p.category}</span><span>{p.service}</span></div><p>{p.description}</p></div><div className="project-preview"><img src={p.image} alt={p.title+' preview'} loading={i<3?'eager':'lazy'}/><small>PROJECT_ID: {p.slug.toUpperCase()}<br/>SYSTEM_READY [DATA_STREAM]</small></div></button>)}<p className="project-credit">Reference collection · original projects by <a href="https://www.saifullah.dev/projects" target="_blank" rel="noreferrer">Saifullah Butt ↗</a></p></>:<article className="project-detail reveal"><button className="detail-back outline-button" onClick={()=>navigate('Projects')}>← PROJECTS</button><p className="detail-breadcrumb">HOME / PROJECTS / {projects[selected].title.toUpperCase()}</p><h2>{projects[selected].title}</h2><div className="detail-overview"><h3>Project Overview</h3><p>{projects[selected].description}</p><a className="outline-button" href={'https://www.saifullah.dev/projects/'+projects[selected].slug} target="_blank" rel="noreferrer">Live Site <ArrowUpRight size={18}/></a></div><dl className="project-facts"><div><dt>PROJECT_TYPE</dt><dd>{projects[selected].category}</dd></div><div><dt>TARGET_PLATFORM</dt><dd>{projects[selected].category==='Mobile app'?'MOBILE':'WEB'}</dd></div><div><dt>PRIMARY_ROLE</dt><dd>{projects[selected].service}</dd></div><div><dt>PROJECT_CREDIT</dt><dd>SAIFULLAH BUTT</dd></div></dl><div className="detail-technologies"><small>PROJECT_DISCIPLINES</small><div className="project-tags"><span>{projects[selected].category}</span><span>{projects[selected].service}</span></div></div><div className="detail-marquee">{projects[selected].title} · {projects[selected].title}</div><h3 className="walkthrough-title">PROJECT WALKTHROUGH</h3><p>A closer look at the project’s visual direction and digital experience.</p><img src={projects[selected].image} alt={projects[selected].title}/><div className="detail-concept"><h3>THE CONCEPT</h3><p>{projects[selected].description} Explore the original case study for the complete design process and project walkthrough.</p></div><a className="outline-button" href={'https://www.saifullah.dev/projects/'+projects[selected].slug} target="_blank" rel="noreferrer">FULL CASE STUDY <ArrowUpRight size={16}/></a><button className="next-project" onClick={()=>{const next=(selected+1)%projects.length;setSelected(next);history.pushState({},'','/projects/'+projects[next].slug);content.current?.scrollTo(0,0);}}><small>NEXT PROJECT</small><span>{projects[(selected+1)%projects.length].title} ↗</span></button></article>}</section>}
      {page==='Contact'&&<section className="contact-scene reveal"><span className="contact-label">WANNA SAY HELLO?</span><div className="contact-lines"><a href={profile.github} target="_blank" rel="noreferrer">MANUJA RAVISHKA <ArrowUpRight size={24}/></a><a href={profile.github+'?tab=repositories'} target="_blank" rel="noreferrer">LET’S CONNECT ↗</a></div><p>© 2026 MANUJA RAVISHKA</p><div className="social-links"><a href={profile.github} target="_blank" rel="noreferrer">GITHUB</a><a href={profile.repository} target="_blank" rel="noreferrer">PORTFOLIO SOURCE</a></div></section>}
    </main>
    {page==='Projects'&&<div className="scroll-meter"><span>00</span><i><b style={{top:scroll+'%'}}/></i><span>100</span></div>}
    <div className="fixed-footer"><div><p>Wanna Say Hello?</p><a href={profile.github} target="_blank" rel="noreferrer">Manuja Ravishka ↗</a></div>{page!=='Projects'&&<div><p>Local Time</p><span>Colombo {time}</span></div>}</div>
    <button className="settings-trigger" ref={settingsButton} aria-label="System settings" aria-expanded={settings} onClick={()=>{setSettings(!settings);setMenu(false);}}><Settings size={20}/></button>
    <div className="bottom-controls"><button className="audio-button" aria-label={sound?'Mute audio':'Enable ambient audio'} onClick={toggleSound}>{sound?<Volume2/>:<svg width="40" height="20" viewBox="0 0 40 20" aria-hidden="true"><path d="M0 11Q5 11 10 7T20 10T30 10T40 9" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>}</button><div className="navigation">
      {menu&&<nav className="menu-panel"><div className="panel-title"><h2>Menu</h2><small>NAVIGATION <span>DIR</span></small></div><div className="menu-social"><a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={20}/></a><a href={profile.repository} target="_blank" rel="noreferrer">DEV LABS ↗</a></div>{[...pages].reverse().filter(p=>p!==page).map(p=><button key={p} onClick={()=>navigate(p)}><small>[{pages.indexOf(p)+1}]</small>{p.toUpperCase()}<ArrowUpRight size={22}/></button>)}</nav>}
      <button className="menu-trigger" ref={menuButton} onClick={()=>{setMenu(!menu);setSettings(false);}} aria-label="Toggle menu" aria-expanded={menu}><small>[{pages.indexOf(page)+1}]</small><strong>{page.toUpperCase()}</strong><i>{menu?<X size={21}/>:<Grid2X2 size={19}/>}</i></button>
    </div></div>
    {settings&&<aside className="settings-panel"><div className="panel-title"><h2>System</h2><small>GLOBAL CONFIG <span>SET</span></small><button className="close-settings" aria-label="Close settings" onClick={()=>setSettings(false)}><X size={18}/></button></div><div className="config-label">[01] Core Theme <span>V_1.0</span></div><button className="theme-button" onClick={theme}>{light?<Sun size={17}/>:<Moon size={17}/>} {light?'LIGHT MODE':'DARK MODE'}</button><div className="config-label">[02] Audio Engine <button onClick={toggleSound}>{sound?'ON':'OFF'}</button></div>{['Default','Digital Minimalism','Synthwave / Retro'].map((t,i)=><button key={t} className={'track '+(track===t?'selected':'')} onClick={()=>changeTrack(t)}><span>{t}<small>{['Ambient / Lo-fi','Minimal / Focus','Retro / Electronic'][i]}</small></span><i>{track===t?'●':'○'}</i></button>)}<div className="config-label">[03] Performance Tier <span>SYS</span></div><div className="tier-options">{['High','Medium','Saver'].map(t=><button key={t} className={tier===t?'selected':''} onClick={()=>performance(t)}>{t}</button>)}</div><button className="motion-button" onClick={()=>setPaused(!paused)}>{paused?<Play size={14}/>:<Pause size={14}/>} {paused?'Play animation':'Pause animation'}</button><p className="system-active">● System Active</p></aside>}
    {!entered&&<div className="entry-screen"><span className="entry-grid-label">GRID_L1_R1</span><div className="entry-percent">{ready?'100':'…'}%</div><div className="entry-performance"><small>PERFORMANCE TIER</small><div className="tier-options">{['High','Medium','Saver'].map(t=><button key={t} className={tier===t?'selected':''} onClick={()=>performance(t)}>{t==='Medium'?'MED':t.toUpperCase()}</button>)}</div></div><button className="entry-audio" onClick={toggleSound}>{sound?<Volume2 size={16}/>:<VolumeX size={16}/>} MUSIC {sound?'ON':'OFF'}</button><div className="entry-action"><small>{ready?'SYSTEM_READY':'LOADING_PORTRAIT'} <span>{ready?'100%':'…'}</span></small><button disabled={!ready} onClick={enter}>ENTER {sound?'VIBES ON':'SILENT MODE'}</button></div></div>}
  </div>;
}



