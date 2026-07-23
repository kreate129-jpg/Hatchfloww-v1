import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

const crowSource = require('../assets/audio/kokarokoo.wav');
const forestSource = require('../assets/audio/forest.wav');
const successSource = require('../assets/audio/success.wav');

let crowPlayer: AudioPlayer | null = null;
let forestPlayer: AudioPlayer | null = null;
let successPlayer: AudioPlayer | null = null;
let configured = false;
let crowStopTimer: ReturnType<typeof setTimeout> | null = null;

/** Hatch crow plays this long, then cuts (file may be longer). */
const CROW_PLAY_MS = 4_000;

/** Looping forest ambience level (0–1). */
const FOREST_VOLUME = 0.8;

function clearCrowStopTimer(): void {
  if (crowStopTimer == null) return;
  clearTimeout(crowStopTimer);
  crowStopTimer = null;
}

function stopCrow(): void {
  clearCrowStopTimer();
  if (!crowPlayer) return;
  try {
    crowPlayer.pause();
    void crowPlayer.seekTo(0);
  } catch {
    // player may already be released
  }
}

export async function configureAudio(): Promise<void> {
  if (configured) return;
  await setAudioModeAsync({
    playsInSilentMode: true,
    shouldPlayInBackground: true,
    interruptionMode: 'duckOthers',
  });
  configured = true;
}

export async function preloadCrow(): Promise<void> {
  await configureAudio();
  if (!crowPlayer) {
    crowPlayer = createAudioPlayer(crowSource);
  }
}

export async function preloadForest(): Promise<void> {
  await configureAudio();
  if (!forestPlayer) {
    forestPlayer = createAudioPlayer(forestSource);
    forestPlayer.loop = true;
    forestPlayer.volume = FOREST_VOLUME;
  }
}

export async function preloadSuccess(): Promise<void> {
  await configureAudio();
  if (!successPlayer) {
    successPlayer = createAudioPlayer(successSource);
    successPlayer.volume = 0.85;
  }
}

async function playSuccess(): Promise<void> {
  await preloadSuccess();
  if (!successPlayer) return;
  try {
    await successPlayer.seekTo(0);
    successPlayer.play();
  } catch {
    successPlayer = createAudioPlayer(successSource);
    successPlayer.volume = 0.85;
    successPlayer.play();
  }
}

export async function playCrow(): Promise<void> {
  clearCrowStopTimer();
  await preloadCrow();
  if (!crowPlayer) return;
  try {
    await crowPlayer.seekTo(0);
    crowPlayer.play();
  } catch {
    crowPlayer = createAudioPlayer(crowSource);
    crowPlayer.play();
  }
  crowStopTimer = setTimeout(() => {
    crowStopTimer = null;
    stopCrow();
  }, CROW_PLAY_MS);
}

/** Timer hit zero: success chime + kokarokoo together. */
export async function playHatchComplete(): Promise<void> {
  stopForest();
  await Promise.all([playSuccess(), playCrow()]);
}

/** Loop forest ambience while a focus session is running. */
export async function startForest(): Promise<void> {
  await preloadForest();
  if (!forestPlayer) return;
  try {
    forestPlayer.loop = true;
    forestPlayer.volume = FOREST_VOLUME;
    if (!forestPlayer.playing) {
      forestPlayer.play();
    }
  } catch {
    forestPlayer = createAudioPlayer(forestSource);
    forestPlayer.loop = true;
    forestPlayer.volume = FOREST_VOLUME;
    forestPlayer.play();
  }
}

export function pauseForest(): void {
  if (!forestPlayer?.playing) return;
  forestPlayer.pause();
}

export function stopForest(): void {
  if (!forestPlayer) return;
  try {
    forestPlayer.pause();
    void forestPlayer.seekTo(0);
  } catch {
    // player may already be released
  }
}

export function unloadCrow(): void {
  stopCrow();
  crowPlayer?.remove();
  crowPlayer = null;
}

export function unloadForest(): void {
  forestPlayer?.remove();
  forestPlayer = null;
}

export function unloadSuccess(): void {
  successPlayer?.remove();
  successPlayer = null;
}
