export const TIMER_STORAGE_KEY = 'hatchflow.timer.v1';
export const DEFAULT_DURATION_MS = 25 * 60_000;

export const DURATION_PRESETS_MS = [
  5 * 60_000,
  15 * 60_000,
  25 * 60_000,
  45 * 60_000,
] as const;

export type TimerSnapshot = {
  status: 'idle' | 'running' | 'paused' | 'completed';
  durationMs: number;
  endsAt: number | null;
  remainingMs: number;
};

export const defaultSnapshot = (durationMs = DEFAULT_DURATION_MS): TimerSnapshot => ({
  status: 'idle',
  durationMs,
  endsAt: null,
  remainingMs: durationMs,
});
