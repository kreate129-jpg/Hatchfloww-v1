import AsyncStorage from '@react-native-async-storage/async-storage';
import { SESSION_MODES as DEFAULT_SESSION_MODES } from '../constants/theme';

/** Device-only session chips. Gone if the app is deleted. */
export const SESSION_MODES_STORAGE_KEY = 'hatchflow.sessionModes.v1';

export const MIN_MODE_MINUTES = 1;
export const MAX_MODE_MINUTES = 180;
export const MIN_SESSION_MODES = 1;
export const MAX_SESSION_MODES = 12;

export type SessionMode = {
  id: string;
  label: string;
  durationMs: number;
};

export function defaultSessionModes(): SessionMode[] {
  return DEFAULT_SESSION_MODES.map((m) => ({ ...m }));
}

export function clampModeMinutes(n: number): number {
  if (!Number.isFinite(n)) return 25;
  return Math.min(MAX_MODE_MINUTES, Math.max(MIN_MODE_MINUTES, Math.floor(n)));
}

export function minutesToMs(minutes: number): number {
  return clampModeMinutes(minutes) * 60_000;
}

export function msToMinutes(ms: number): number {
  return clampModeMinutes(ms / 60_000);
}

let modeSeq = 0;

/** Stable-enough id for a user-created mode (local only). */
export function newModeId(): string {
  modeSeq += 1;
  return `mode-${Date.now().toString(36)}-${modeSeq}`;
}

export function createSessionMode(
  label = 'New session',
  minutes = 25,
): SessionMode {
  return {
    id: newModeId(),
    label: label.trim().slice(0, 24) || 'New session',
    durationMs: minutesToMs(minutes),
  };
}

export function normalizeSessionModes(modes: SessionMode[]): SessionMode[] {
  if (!Array.isArray(modes) || modes.length === 0) return defaultSessionModes();

  const seen = new Set<string>();
  const out: SessionMode[] = [];

  for (const raw of modes) {
    if (out.length >= MAX_SESSION_MODES) break;
    if (!raw || typeof raw !== 'object') continue;

    let id =
      typeof raw.id === 'string' && raw.id.trim()
        ? raw.id.trim().slice(0, 48)
        : newModeId();
    while (seen.has(id)) id = `${id}-${out.length}`;
    seen.add(id);

    const label =
      typeof raw.label === 'string' && raw.label.trim()
        ? raw.label.trim().slice(0, 24)
        : `Session ${out.length + 1}`;

    const durationMs =
      typeof raw.durationMs === 'number' && raw.durationMs > 0
        ? minutesToMs(raw.durationMs / 60_000)
        : 25 * 60_000;

    out.push({ id, label, durationMs });
  }

  return out.length > 0 ? out : defaultSessionModes();
}

function parseModes(raw: string | null): SessionMode[] {
  if (!raw) return defaultSessionModes();
  try {
    return normalizeSessionModes(JSON.parse(raw) as SessionMode[]);
  } catch {
    return defaultSessionModes();
  }
}

export async function loadSessionModes(): Promise<SessionMode[]> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_MODES_STORAGE_KEY);
    return parseModes(raw);
  } catch {
    return defaultSessionModes();
  }
}

export async function saveSessionModes(modes: SessionMode[]): Promise<SessionMode[]> {
  const next = normalizeSessionModes(modes);
  await AsyncStorage.setItem(SESSION_MODES_STORAGE_KEY, JSON.stringify(next));
  return next;
}
