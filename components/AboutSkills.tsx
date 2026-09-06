'use client';

import { useEffect, useRef } from 'react';
import { skillSectors } from '@/lib/skills';

export default function AboutSkills() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const sections = root.querySelectorAll<HTMLElement>('.about-sector');
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      sections.forEach((s) => s.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="about-sector-list" ref={rootRef}>
      {skillSectors.map((sector, i) => (
        <section key={sector.title} className="about-sector">
          <div className="about-sector-head">
            <small>SECTOR_{String(i + 1).padStart(2, '0')}</small>
            <h3>{sector.title}</h3>
          </div>
          <div className="about-sector-cards">
            {sector.skills.map((skill, j) => (
              <span
                key={skill}
                className="about-skill-card"
                style={{ transitionDelay: `${j * 60}ms` }}
              >
                <em>0x{j.toString(16).padStart(2, '0')}</em>
                {skill}
              </span>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}