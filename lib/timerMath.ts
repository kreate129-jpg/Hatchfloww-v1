/**
 * Pure timer math — wall-clock based, no React.
 * remaining = max(0, endsAt - now) while running.
 */

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

export type TimerState = {
  status: TimerStatus;
  durationMs: number;
  endsAt: number | null;
  remainingMs: number;
};

export function remainingFromState(state: TimerState, now = Date.now()): number {
  if (state.status === 'running' && state.endsAt != null) {
    return Math.max(0, state.endsAt - now);
  }
  if (state.status === 'completed') return 0;
  return Math.max(0, state.remainingMs);
}

export function progressFromState(state: TimerState, now = Date.now()): number {
  if (state.durationMs <= 0) return 0;
  if (state.status === 'completed') return 1;
  const remaining = remainingFromState(state, now);
  return Math.min(1, Math.max(0, 1 - remaining / state.durationMs));
}

export function startTimer(durationMs: number, now = Date.now()): TimerState {
  return {
    status: 'running',
    durationMs,
    endsAt: now + durationMs,
    remainingMs: durationMs,
  };
}

export function pauseTimer(state: TimerState, now = Date.now()): TimerState {
  if (state.status !== 'running') return state;
  const remaining = remainingFromState(state, now);
  return {
    ...state,
    status: remaining <= 0 ? 'completed' : 'paused',
    endsAt: null,
    remainingMs: remaining,
  };
}

export function resumeTimer(state: TimerState, now = Date.now()): TimerState {
  if (state.status !== 'paused') return state;
  const remaining = Math.max(0, state.remainingMs);
  if (remaining <= 0) {
    return { ...state, status: 'completed', endsAt: null, remainingMs: 0 };
  }
  return {
    ...state,
    status: 'running',
    endsAt: now + remaining,
    remainingMs: remaining,
  };
}

export function resetTimer(durationMs: number): TimerState {
  return {
    status: 'idle',
    durationMs,
    endsAt: null,
    remainingMs: durationMs,
  };
}

/** Recompute after backgrounding / process death. */
export function hydrateTimer(state: TimerState, now = Date.now()): TimerState {
  if (state.status !== 'running' || state.endsAt == null) return state;
  if (state.endsAt <= now) {
    return { ...state, status: 'completed', endsAt: null, remainingMs: 0 };
  }
  return {
    ...state,
    remainingMs: state.endsAt - now,
  };
}
