'use client';

import { useEffect, useState } from 'react';
import { usePortfolioAudio } from '@/hooks/usePortfolioAudio';

export default function SoundPrompt() {
  const { soundEnabled: enabled, preferenceStored, setSound } = usePortfolioAudio();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || preferenceStored) return null;

  return (
    <div className="sound-prompt" role="dialog" aria-label="Sound mode">
      <p className="sound-prompt-title">&gt; SOUND MODE</p>
      <p className="sound-prompt-sub">ENABLE BACKGROUND AUDIO?</p>
      <div className="sound-prompt-actions" role="group" aria-label="Choose sound mode">
        <button type="button" className={!enabled ? 'selected' : ''} onClick={() => setSound(false)}>SILENT</button>
        <button type="button" className={enabled ? 'selected' : ''} onClick={() => setSound(true)}>SOUND</button>
      </div>
    </div>
  );
}