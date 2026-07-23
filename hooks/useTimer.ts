import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { DEFAULT_DURATION_MS, loadTimerSnapshot, saveTimerSnapshot } from '../lib/persist';
import {
  hydrateTimer,
  pauseTimer,
  progressFromState,
  remainingFromState,
  resetTimer,
  resumeTimer,
  startTimer,
  type TimerState,
  type TimerStatus,
} from '../lib/timerMath';

export type UseTimerOptions = {
  defaultDurationMs?: number;
  onComplete?: () => void;
  /** Called when a running session starts/resumes with a new endsAt. */
  onSchedule?: (endsAt: number) => void;
  /** Called when the scheduled completion should be cancelled. */
  onCancelSchedule?: () => void;
};

export type UseTimerResult = {
  remainingMs: number;
  durationMs: number;
  status: TimerStatus;
  progress: number;
  ready: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  setDuration: (ms: number) => void;
};

const TICK_MS = 250;

export function useTimer(options: UseTimerOptions = {}): UseTimerResult {
  const {
    defaultDurationMs = DEFAULT_DURATION_MS,
    onComplete,
    onSchedule,
    onCancelSchedule,
  } = options;

  const [state, setState] = useState<TimerState>(() => resetTimer(defaultDurationMs));
  const [now, setNow] = useState(() => Date.now());
  const [ready, setReady] = useState(false);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const onScheduleRef = useRef(onSchedule);
  const onCancelRef = useRef(onCancelSchedule);

  onCompleteRef.current = onComplete;
  onScheduleRef.current = onSchedule;
  onCancelRef.current = onCancelSchedule;

  const persist = useCallback((next: TimerState) => {
    void saveTimerSnapshot(next);
  }, []);

  const markComplete = useCallback((prev: TimerState): TimerState => {
    if (completedRef.current) {
      return { ...prev, status: 'completed', endsAt: null, remainingMs: 0 };
    }
    completedRef.current = true;
    onCancelRef.current?.();
    onCompleteRef.current?.();
    return { ...prev, status: 'completed', endsAt: null, remainingMs: 0 };
  }, []);

  // Hydrate from AsyncStorage once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const snap = await loadTimerSnapshot();
      if (cancelled) return;
      let next = hydrateTimer({
        status: snap.status,
        durationMs: snap.durationMs || defaultDurationMs,
        endsAt: snap.endsAt,
        remainingMs: snap.remainingMs,
      });
      if (next.status === 'completed') {
        completedRef.current = true;
      } else if (next.status === 'running' && next.endsAt != null && next.endsAt <= Date.now()) {
        next = markComplete(next);
      }
      setState(next);
      setNow(Date.now());
      setReady(true);
      persist(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [defaultDurationMs, markComplete, persist]);

  // UI tick while running
  useEffect(() => {
    if (state.status !== 'running') return;
    const id = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, [state.status]);

  // Detect completion while ticking
  useEffect(() => {
    if (state.status !== 'running' || state.endsAt == null) return;
    if (state.endsAt > now) return;
    setState((prev) => {
      const done = markComplete(prev);
      persist(done);
      return done;
    });
  }, [now, state.status, state.endsAt, markComplete, persist]);

  // AppState: recompute on foreground
  useEffect(() => {
    const onChange = (next: AppStateStatus) => {
      if (next !== 'active') return;
      setNow(Date.now());
      setState((prev) => {
        const hydrated = hydrateTimer(prev);
        if (hydrated.status === 'completed' && prev.status === 'running') {
          const done = markComplete(hydrated);
          persist(done);
          return done;
        }
        persist(hydrated);
        return hydrated;
      });
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [markComplete, persist]);

  const start = useCallback(() => {
    completedRef.current = false;
    const next = startTimer(state.durationMs);
    setState(next);
    setNow(Date.now());
    persist(next);
    if (next.endsAt != null) onScheduleRef.current?.(next.endsAt);
  }, [state.durationMs, persist]);

  const pause = useCallback(() => {
    setState((prev) => {
      const next = pauseTimer(prev);
      persist(next);
      return next;
    });
    onCancelRef.current?.();
  }, [persist]);

  const resume = useCallback(() => {
    setState((prev) => {
      const next = resumeTimer(prev);
      persist(next);
      if (next.status === 'running' && next.endsAt != null) {
        onScheduleRef.current?.(next.endsAt);
      }
      if (next.status === 'completed') {
        return markComplete(next);
      }
      return next;
    });
    setNow(Date.now());
  }, [persist, markComplete]);

  const reset = useCallback(() => {
    completedRef.current = false;
    const next = resetTimer(state.durationMs);
    setState(next);
    setNow(Date.now());
    persist(next);
    onCancelRef.current?.();
  }, [state.durationMs, persist]);

  const setDuration = useCallback(
    (ms: number) => {
      if (state.status === 'running') return;
      completedRef.current = false;
      const next = resetTimer(ms);
      setState(next);
      persist(next);
      onCancelRef.current?.();
    },
    [state.status, persist],
  );

  const remainingMs = remainingFromState(state, now);
  const progress = progressFromState(state, now);

  return {
    remainingMs,
    durationMs: state.durationMs,
    status: state.status,
    progress,
    ready,
    start,
    pause,
    resume,
    reset,
    setDuration,
  };
}
