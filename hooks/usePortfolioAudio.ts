'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';
import {
  getAudioState,
  initPortfolioAudio,
  playClickFx,
  playHoverFx,
  setMusicEnabled,
  setSoundEnabled,
  startBackgroundMusic,
  subscribeAudio,
  toggleMusicEnabled,
  toggleSoundEnabled,
} from '@/lib/portfolioAudio';

// Reactive view over the single shared audio manager. Multiple consumers
// (Portfolio, PageNav, SystemPanel, SoundPrompt, InitialLoader) always read
// the same two levels of state — System Audio (soundEnabled) and Background
// Music (musicEnabled). There is no second, component-local copy.
export function usePortfolioAudio() {
  const { soundEnabled, musicEnabled, musicReady, preferenceStored } = useSyncExternalStore(
    subscribeAudio,
    getAudioState,
    getAudioState,
  );

  useEffect(() => {
    initPortfolioAudio();
  }, []);

  // deferPlay keeps the preference/state change but leaves the actual play()
  // to a later user gesture (used by the loader until the ENTER tap).
  const setSound = useCallback((on: boolean, deferPlay = false) => setSoundEnabled(on, deferPlay), []);
  const setMusic = useCallback((on: boolean, deferPlay = false) => setMusicEnabled(on, deferPlay), []);
  const toggleSound = useCallback(() => toggleSoundEnabled(), []);
  const toggleMusic = useCallback(() => toggleMusicEnabled(), []);
  // Must be called from a real user gesture (e.g. the loader ENTER tap).
  const startMusic = useCallback(() => startBackgroundMusic(), []);
  const playHover = useCallback(() => playHoverFx(), []);
  const playClick = useCallback(() => playClickFx(), []);

  return { soundEnabled, musicEnabled, musicReady, preferenceStored, setSound, setMusic, toggleSound, toggleMusic, startMusic, playHover, playClick };
}