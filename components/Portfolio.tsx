'use client';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import gsap from 'gsap';
import { Settings, ArrowUpRight } from 'lucide-react';
import { profile } from '@/lib/profile';
import { usePortfolioAudio } from '@/hooks/usePortfolioAudio';
import { projects } from '@/lib/projects';
import AboutSkills from '@/components/AboutSkills';
import PageNav from '@/components/PageNav';
import SoundPrompt from '@/components/SoundPrompt';
import InitialLoader from '@/components/loader/InitialLoader';
import SystemPanel, { ACCENTS } from '@/components/system/SystemPanel';
const pages = ['Home','About','Projects','Contact'] as const;
type Page = typeof pages[number];
export default function Portfolio({initialPage = 'Home', initialProject = null}: {initialPage?: Page; initialProject?: number | null}) {
  const [page,setPage]=useState<Page>(initialPage);
const [menu,setMenu]=useState(false),[settings,setSettings]=useState(false);
const [tier,setTier]=useState('Medium');
  const [accent,setAccent]=useState('White');
  const [loaderDone,setLoaderDone]=useState(false),[time,setTime]=useState('');
  const [selected,setSelected]=useState<number|null>(initialProject),[scroll,setScroll]=useState(0);
  const content=useRef<HTMLDivElement>(null),menuButton=useRef<HTMLButtonElement>(null),systemPanel=useRef<HTMLDivElement>(null);
  const {soundEnabled:soundOn,musicEnabled:musicOn,toggleSound,toggleMusic}=usePortfolioAudio();
  useEffect(()=>{
    const update=()=>setTime(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Colombo',hour:'numeric',minute:'2-digit',hour12:true}).format(new Date()));
    update(); const clock=setInterval(update,10000);
    const hash=()=>{if(location.hash==='#content')return;const route=location.pathname.split('/').filter(Boolean);const match=pages.find(p=>p.toLowerCase()===(location.hash.slice(1)||route[0]));setPage(match||'Home');const item=route[1]?projects.findIndex(p=>p.slug===route[1]):-1;setSelected(item>=0?item:null);};
    hash();window.addEventListener('hashchange',hash);window.addEventListener('popstate',hash);
try{const saved=localStorage.getItem('portfolio-tier');if(saved&&['High','Medium','Saver'].includes(saved))setTier(saved);const accentSaved=localStorage.getItem('portfolio-accent');if(accentSaved&&ACCENTS[accentSaved])setAccent(accentSaved);}catch{}
    return()=>{clearInterval(clock);window.removeEventListener('hashchange',hash);window.removeEventListener('popstate',hash);};
  },[]);
  useEffect(()=>{
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const context=gsap.context(()=>{gsap.fromTo('.reveal',{opacity:0,y:18,filter:'blur(6px)'},{opacity:1,y:0,filter:'blur(0px)',duration:.85,stagger:.08,ease:'power3.out'});},content);
    return()=>context.revert();
  },[page,selected]);
  useEffect(()=>{const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){setMenu(false);setSettings(false);setSelected(null);menuButton.current?.focus();}};window.addEventListener('keydown',escape);return()=>window.removeEventListener('keydown',escape);},[]);
  useEffect(()=>{
    if(!settings)return;
    const onDown=(e:PointerEvent)=>{
      const node=e.target as Node|null;
      if(!node)return;
      if(systemPanel.current?.contains(node))return;
      if(node instanceof Element&&node.closest('[data-system-toggle]'))return;
      setSettings(false);
    };
    document.addEventListener('pointerdown',onDown);
    return()=>document.removeEventListener('pointerdown',onDown);
  },[settings]);
  function navigate(next:Page){setPage(next);setMenu(false);setSelected(null);setScroll(0);history.pushState({},'',next==='Home'?'/':'/'+next.toLowerCase());content.current?.scrollTo(0,0);}
function performance(next:string){setTier(next);try{localStorage.setItem('portfolio-tier',next);}catch{}}
function applyAccent(next:string){setAccent(next);try{localStorage.setItem('portfolio-accent',next);}catch{}}
return <div className={'portfolio page-'+page.toLowerCase()+(selected!==null?' detail-view':'')} data-tier={tier} style={{'--accent':ACCENTS[accent].hex,'--accent-soft':ACCENTS[accent].soft} as CSSProperties}>
    <InitialLoader onFinish={()=>setLoaderDone(true)} />
    <a className="skip-link" href="#content">Skip to content</a>
    <div className="mesh-background" aria-hidden="true"/>
    {page==='Home'&&<div className="left-glass" aria-hidden="true"/>}
    <header className="wordmark"><a href="#home" onClick={()=>navigate('Home')} aria-label="Manuja Ravishka home"><span>Manuja<br/>Ravishka</span><span>Portfolio<br/>2026</span></a></header>
    {page!=='Home'&&selected===null&&<div className="page-heading"><p><button onClick={()=>navigate('Home')}>HOME</button> / {page.toUpperCase()}</p><h1>{page==='About'?'MEET MANUJA':page.toUpperCase()}</h1></div>}
    {page==='Home'&&<div className="ticker" aria-hidden="true"><div>{Array.from({length:4},(_,i)=><span key={i}><small>CORE_ID</small> CREATIVE DEVELOPER <small>AVAILABILITY</small> OPEN <small>RENDERING</small> WEBGL / THREE.JS </span>)}</div></div>}
    <main id="content" ref={content} tabIndex={-1} className={'content '+(page==='Projects'?'project-scroll':'')} onScroll={e=>{const el=e.currentTarget;setScroll(el.scrollHeight>el.clientHeight?el.scrollTop/(el.scrollHeight-el.clientHeight)*100:0);}}>
      {page==='Home'&&<section className="home-scene">
        <div className="home-intro reveal"><h1>CREATIVE<br/>DEVELOPER</h1><div className="info-log"><i/><div><small>[ INFO_LOG ]</small><p>SCULPTING TECHNICAL PERFORMANCE<br/>INTO IMMERSIVE DIGITAL ART.</p></div></div></div>
        <div className="home-portrait"><img src="/image.png" alt="" draggable={false} decoding="async"/></div>
        <aside className="stats reveal"><small>DEVELOPER STATS</small><p className="sync"><b/> STABLE</p><div className="stat"><span>PROJECTS_COMPLETED</span><span>45+</span></div><div className="stat"><span>EXPERIENCE_YEARS</span><span>10+</span></div><div className="terminal"><p>&gt; ACTIVE_STACK: NEXT_THREE_GSAP</p><p>&gt; AVAILABILITY_TYPE: REMOTE/HYBRID</p><p>&gt; STATUS: OPEN_FOR_OFFERS</p><p>&gt; SYSTEM_PERF: [{tier.toUpperCase()}]</p></div></aside>
      </section>}
{page==='About'&&<section className="about-scene">
        <div className="about-portrait"><img src="/manuja-portrait.webp" alt="Portrait of Manuja Ravishka"/></div>
        <article className="about-copy">
          <p className="reveal">Meet Manuja</p>
          <h2 className="reveal">CREATIVE FRONTEND<br/>DEVELOPER</h2>
          <p className="reveal">I explore the connection between design and technology, creating web experiences with personality, thoughtful interactions and attention to detail.</p>
          <p className="reveal">A passion for</p>
          <h2 className="reveal">IMMERSIVE DIGITAL<br/>EXPERIENCES</h2>
          <p className="reveal">My development playground brings together a broad range of tools and technologies:</p>
          <AboutSkills/>
          <p>From the first sketch to the final interaction, I enjoy exploring how a digital experience can feel clear, useful and memorable.</p>
          <h2>CONCEPTS INTO<br/>REALITY</h2>
          <p>Let’s bring your next idea to life.</p>
          <button className="outline-button" onClick={()=>navigate('Contact')}>CONTACT <ArrowUpRight size={17}/></button>
        </article>
      </section>}
      {page==='Projects'&&<section className="projects-scene">{selected===null?<>{projects.map((p,i)=><button className="project-row" key={p.slug} onClick={()=>{setSelected(i);history.pushState({},'','/projects/'+projects[i].slug);content.current?.scrollTo(0,0);}}><span className="project-index">{String(i+1).padStart(2,'0')}</span><div className="project-copy"><h2>{p.title}</h2><div className="project-tags"><span>{p.category}</span><span>{p.service}</span></div><p>{p.description}</p></div><div className="project-preview"><img src={p.image} alt={p.title+' preview'} loading={i<3?'eager':'lazy'}/><small>PROJECT_ID: {p.slug.toUpperCase()}<br/>SYSTEM_READY [DATA_STREAM]</small></div></button>)}</>:<article className="project-detail reveal"><button className="detail-back outline-button" onClick={()=>navigate('Projects')}>← PROJECTS</button><p className="detail-breadcrumb">HOME / PROJECTS / {projects[selected].title.toUpperCase()}</p><h2>{projects[selected].title}</h2><div className="detail-overview"><h3>Project Overview</h3><p>{projects[selected].description}</p><a className="outline-button" href={projects[selected].url || profile.github} target="_blank" rel="noopener noreferrer">{projects[selected].linkLabel || 'View Project'} <ArrowUpRight size={18}/></a></div><dl className="project-facts"><div><dt>PROJECT_TYPE</dt><dd>{projects[selected].category}</dd></div><div><dt>TARGET_PLATFORM</dt><dd>{projects[selected].category==='Mobile app'?'MOBILE':'WEB'}</dd></div><div><dt>PRIMARY_ROLE</dt><dd>{projects[selected].service}</dd></div><div><dt>PROJECT_CREDIT</dt><dd>{projects[selected].credit || 'SAIFULLAH BUTT'}</dd></div></dl><div className="detail-technologies"><small>PROJECT_DISCIPLINES</small><div className="project-tags"><span>{projects[selected].category}</span><span>{projects[selected].service}</span></div></div><div className="detail-marquee">{projects[selected].title} · {projects[selected].title}</div><h3 className="walkthrough-title">PROJECT WALKTHROUGH</h3><p>A closer look at the project’s visual direction and digital experience.</p><img src={projects[selected].image} alt={projects[selected].title}/><div className="detail-concept"><h3>THE CONCEPT</h3><p>{projects[selected].description} Explore the GitHub repository for the complete architecture, API documentation and project setup.</p></div><a className="outline-button" href={projects[selected].url || 'https://www.saifullah.dev/projects/'+projects[selected].slug} target="_blank" rel="noreferrer">VIEW GITHUB REPOSITORY <ArrowUpRight size={16}/></a><button className="next-project" onClick={()=>{const next=(selected+1)%projects.length;setSelected(next);history.pushState({},'','/projects/'+projects[next].slug);content.current?.scrollTo(0,0);}}><small>NEXT PROJECT</small><span>{projects[(selected+1)%projects.length].title} ↗</span></button></article>}</section>}
      {page==='Contact'&&<section className="contact-scene reveal"><span className="contact-label">WANNA SAY HELLO?</span><div className="contact-lines"><a href={profile.github} target="_blank" rel="noreferrer">MANUJA RAVISHKA <ArrowUpRight size={24}/></a><a href={profile.github+'?tab=repositories'} target="_blank" rel="noreferrer">LET’S CONNECT ↗</a></div><p>© 2026 MANUJA RAVISHKA</p><div className="social-links"><a href={profile.github} target="_blank" rel="noreferrer">GITHUB</a><a href={profile.repository} target="_blank" rel="noreferrer">PORTFOLIO SOURCE</a></div></section>}
    </main>
    {page==='Projects'&&<div className="scroll-meter"><span>00</span><i><b style={{top:scroll+'%'}}/></i><span>100</span></div>}
    <div className="fixed-footer"><div><p>Wanna Say Hello?</p><a href={profile.github} target="_blank" rel="noreferrer">Manuja Ravishka ↗</a></div>{page!=='Projects'&&<div><p>Local Time</p><span>Colombo {time}</span></div>}</div>
<button className="settings-trigger" aria-label="System settings" aria-expanded={settings} data-system-toggle onClick={()=>{setSettings(!settings);setMenu(false);}}><Settings size={20}/></button>
<PageNav
      page={page}
      menu={menu}
      soundOn={soundOn}
      menuButtonRef={menuButton}
      onToggleSound={toggleSound}
      onToggleMenu={() => { setMenu(!menu); setSettings(false); }}
      onCloseMenu={() => { setMenu(false); menuButton.current?.focus(); }}
onNavigate={navigate}
    />
{loaderDone&&<SoundPrompt />}
    {settings&&<div ref={systemPanel}><SystemPanel accent={accent} soundOn={soundOn} musicOn={musicOn} tier={tier} onAccent={applyAccent} onToggleSound={toggleSound} onToggleMusic={toggleMusic} onTier={performance} onClose={()=>setSettings(false)}/></div>}
  </div>;
}



