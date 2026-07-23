import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_DURATION_MS,
  TIMER_STORAGE_KEY,
  type TimerSnapshot,
  defaultSnapshot,
} from './storage';
import type { TimerState } from './timerMath';

export async function loadTimerSnapshot(): Promise<TimerSnapshot> {
  try {
    const raw = await AsyncStorage.getItem(TIMER_STORAGE_KEY);
    if (!raw) return defaultSnapshot();
    const parsed = JSON.parse(raw) as TimerSnapshot;
    if (
      typeof parsed.durationMs !== 'number' ||
      typeof parsed.remainingMs !== 'number' ||
      typeof parsed.status !== 'string'
    ) {
      return defaultSnapshot();
    }
    return parsed;
  } catch {
    return defaultSnapshot();
  }
}

export async function saveTimerSnapshot(state: TimerState): Promise<void> {
  const snapshot: TimerSnapshot = {
    status: state.status,
    durationMs: state.durationMs,
    endsAt: state.endsAt,
    remainingMs: state.remainingMs,
  };
  await AsyncStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(snapshot));
}

export async function clearTimerSnapshot(): Promise<void> {
  await AsyncStorage.removeItem(TIMER_STORAGE_KEY);
}

export { DEFAULT_DURATION_MS, TIMER_STORAGE_KEY, defaultSnapshot };
export type { TimerSnapshot };
