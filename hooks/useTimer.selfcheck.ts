/**
 * ponytail: assert-based self-check for wall-clock timer math.
 * Run: npm run selfcheck
 */
import {
  hydrateTimer,
  pauseTimer,
  progressFromState,
  remainingFromState,
  resetTimer,
  resumeTimer,
  startTimer,
} from '../lib/timerMath';

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`FAIL: ${msg}`);
}

const duration = 60_000;
const t0 = 1_000_000;

const started = startTimer(duration, t0);
assert(started.status === 'running', 'start → running');
assert(started.endsAt === t0 + duration, 'endsAt = now + duration');
assert(remainingFromState(started, t0) === duration, 'remaining at start');
assert(remainingFromState(started, t0 + 15_000) === 45_000, 'remaining after 15s');
assert(Math.abs(progressFromState(started, t0 + 15_000) - 0.25) < 1e-9, 'progress 25%');

const paused = pauseTimer(started, t0 + 20_000);
assert(paused.status === 'paused', 'pause → paused');
assert(paused.endsAt === null, 'pause clears endsAt');
assert(paused.remainingMs === 40_000, 'pause stores remaining');

const resumed = resumeTimer(paused, t0 + 50_000);
assert(resumed.status === 'running', 'resume → running');
assert(resumed.endsAt === t0 + 50_000 + 40_000, 'resume recomputes endsAt');
assert(remainingFromState(resumed, t0 + 50_000) === 40_000, 'remaining after resume');

const backgrounded = startTimer(duration, t0);
const afterBg = hydrateTimer(backgrounded, t0 + duration + 5_000);
assert(afterBg.status === 'completed', 'hydrate past endsAt → completed');
assert(afterBg.remainingMs === 0, 'completed remaining is 0');
assert(progressFromState(afterBg) === 1, 'completed progress is 1');

const mid = hydrateTimer(backgrounded, t0 + 30_000);
assert(mid.status === 'running', 'hydrate mid-run stays running');
assert(mid.remainingMs === 30_000, 'hydrate updates remaining');

const idle = resetTimer(duration);
assert(idle.status === 'idle' && idle.remainingMs === duration, 'reset → idle full duration');

console.log('useTimer.selfcheck: all assertions passed');
