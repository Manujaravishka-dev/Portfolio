// Single-instance, two-level audio manager for the portfolio.
//
// Level 1 — System Audio (soundEnabled): the overall Sound / Silent mode. When
// OFF, UI/menu sounds are disabled AND the background song never plays,
// regardless of musicEnabled.
// Level 2 — Background Music (musicEnabled): the Pufino song. When ON and
// soundEnabled is also ON, the song plays (loop, volume 0.15). When OFF, only
// the song pauses; UI sounds keep working as long as System Audio is ON.
//
// The background element is created ONCE (module scope) and reused for the
// whole session. No component ever calls `new Audio()` on render. Playback
// only ever starts inside a real user interaction (prompt button, Settings
// toggle, or a temporary one-shot window listener after a reload) so the
// browser autoplay policy is never violated.

const LS_SOUND = 'portfolio-sound-enabled';
const LS_MUSIC = 'portfolio-music-enabled';
const MUSIC_SRC = '/sounds/Pufino - Lucifer (freetouse.com).mp3';
const HOVER_SRC = '/sounds/menu-hover.wav';
const CLICK_SRC = '/sounds/menu-click.wav';
const MUSIC_VOLUME = 0.15;
const HOVER_VOLUME = 0.1;
const CLICK_VOLUME = 0.15;
const HOVER_GATE_MS = 90;
const GESTURE_EVENTS = ['pointerdown', 'click', 'touchstart'] as const;

export interface PortfolioAudioState {
  soundEnabled: boolean;
  musicEnabled: boolean;
  musicReady: boolean;
  preferenceStored: boolean;
}

let music: HTMLAudioElement | null = null;
let hoverFx: HTMLAudioElement | null = null;
let clickFx: HTMLAudioElement | null = null;
let lastHover = 0;
let initialized = false;

let state: PortfolioAudioState = { soundEnabled: false, musicEnabled: true, musicReady: false, preferenceStored: false };
const listeners = new Set<() => void>();

export function subscribeAudio(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getAudioState(): PortfolioAudioState {
  return state;
}

function emit(next: Partial<PortfolioAudioState>): void {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

function makeFx(src: string, volume: number): HTMLAudioElement {
  const el = new Audio(src);
  el.preload = 'auto';
  el.volume = volume;
  return el;
}

function ensureFx(): void {
  if (hoverFx && clickFx) return;
  hoverFx = makeFx(HOVER_SRC, HOVER_VOLUME);
  clickFx = makeFx(CLICK_SRC, CLICK_VOLUME);
}

function ensureMusic(): void {
  if (music) return;
  const el = new Audio();
  el.preload = 'auto';
  el.loop = true;
  el.volume = MUSIC_VOLUME;
  el.addEventListener('canplay', () => {
    emit({ musicReady: true });
    console.log('Background music ready:', el.src, 'readyState:', el.readyState);
  });
  el.addEventListener('loadedmetadata', () => {
    emit({ musicReady: true });
    console.log('Background music metadata loaded:', el.src);
  });
  el.addEventListener('error', () => {
    emit({ musicReady: false });
    console.error('Audio element error:', el.error);
  });
  el.src = MUSIC_SRC;
  music = el;
}

// Registers at most one pending retry that fires on the next real user
// interaction and removes itself once it runs, so we never replay on every
// click. Only armed when a direct play() was rejected by the autoplay policy.
function armOnce(fn: () => void): void {
  const attempt = () => {
    for (const ev of GESTURE_EVENTS) window.removeEventListener(ev, attempt);
    fn();
  };
  for (const ev of GESTURE_EVENTS) {
    window.addEventListener(ev, attempt, { once: true });
  }
}

// Starts (or resumes) the song at its last position. Guarded by the two-level
// rules; a no-op if the system is silent or music is disabled. Resolves the
// play() promise explicitly and returns whether playback actually started.
function playMusic(): Promise<boolean> {
  if (!state.soundEnabled || !state.musicEnabled) return Promise.resolve(false);
  const el = music;
  if (!el || !el.paused) return Promise.resolve(true);
  return el.play()
    .then(() => {
      console.log('Pufino background music playing');
      return true;
    })
    .catch((error) => {
      console.warn('Background music play blocked, will retry on next user interaction:', error);
      armOnce(playMusic);
      return false;
    });
}

// Public entry point used by the loader's ENTER tap (a real user gesture) to
// start/resume the song. Reuses the exact same single element and guards.
export function startBackgroundMusic(): Promise<boolean> {
  return playMusic();
}

// Pause preserves currentTime so a later play() resumes from the same spot.
function pauseMusic(): void {
  const el = music;
  if (!el || el.paused) return;
  el.pause();
  console.log('Background music paused at:', el.currentTime);
}

// System Audio (Sound / Silent). OFF disables UI sounds and pauses the song
// unconditionally. ON re-enables UI sounds and, if Background Music is also
// ON, starts the song inside this user gesture (unless playback is deferred
// to a later gesture — used by the loader, which must start audio only on the
// final ENTER tap).
export function setSoundEnabled(on: boolean, deferPlay = false): void {
  if (typeof window === 'undefined') return;
  if (state.soundEnabled === on && state.preferenceStored) return;
  emit({ soundEnabled: on, preferenceStored: true });
  try {
    localStorage.setItem(LS_SOUND, on ? 'on' : 'off');
  } catch {}
  if (on) {
    if (!deferPlay && state.musicEnabled) void playMusic();
  } else {
    pauseMusic();
  }
}

// Background Music only. OFF pauses just the song; UI sounds keep working if
// System Audio is ON. ON resumes only the song, but only when System Audio is
// also ON (otherwise it just updates the preference).
export function setMusicEnabled(on: boolean, deferPlay = false): void {
  if (typeof window === 'undefined') return;
  if (state.musicEnabled === on) return;
  emit({ musicEnabled: on });
  try {
    localStorage.setItem(LS_MUSIC, on ? 'on' : 'off');
  } catch {}
  if (on) {
    if (!deferPlay && state.soundEnabled) void playMusic();
  } else {
    if (!deferPlay && state.soundEnabled) pauseMusic();
  }
}

export function toggleSoundEnabled(): void {
  setSoundEnabled(!state.soundEnabled);
}

export function toggleMusicEnabled(): void {
  setMusicEnabled(!state.musicEnabled);
}

// Must be called from a client effect. Restores both persisted preferences.
// A fresh visitor defaults to Silent System Audio with Background Music
// allowed (ON), so the first SOUND pick can start the song. Full page loads
// always pass through the loader gate, so no autoplay listener is armed here.
export function initPortfolioAudio(): void {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;
  let storedSound: string | null = null;
  let storedMusic: string | null = null;
  try {
    storedSound = localStorage.getItem(LS_SOUND);
    storedMusic = localStorage.getItem(LS_MUSIC);
  } catch {}
  const sound = storedSound === 'on' || storedSound === 'sound';
  const soundChosen = storedSound === 'on' || storedSound === 'sound' || storedSound === 'off' || storedSound === 'silent';
  const music = storedMusic === 'off' || storedMusic === 'silent' ? false : true;
  emit({ soundEnabled: sound, preferenceStored: soundChosen, musicEnabled: music });
  ensureFx();
  ensureMusic();
  // Music is NOT started here, ever. Full page loads always pass through the
  // loader's required gate (choose mode -> ENTER tap), and that ENTER tap is
  // the single user gesture that calls play() (see startBackgroundMusic).
}

// UI / menu sound effects are gated by Sound / Silent mode only, so they keep
// working while Background Music is independently turned off.
export function playHoverFx(): void {
  if (!state.soundEnabled) return;
  const now = performance.now();
  if (now - lastHover < HOVER_GATE_MS) return;
  lastHover = now;
  const el = hoverFx;
  if (!el) return;
  el.currentTime = 0;
  el.play().catch(() => {});
}

export function playClickFx(): void {
  if (!state.soundEnabled) return;
  const el = clickFx;
  if (!el) return;
  el.currentTime = 0;
  el.play().catch(() => {});
}