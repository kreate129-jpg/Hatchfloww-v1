/**
 * ponytail: assert-based self-check for session mode math.
 * Run: npm run selfcheck
 */
import {
  MAX_SESSION_MODES,
  clampModeMinutes,
  createSessionMode,
  defaultSessionModes,
  minutesToMs,
  normalizeSessionModes,
} from './sessionModes';

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`FAIL: ${msg}`);
}

assert(clampModeMinutes(0) === 1, 'min 1 minute');
assert(clampModeMinutes(200) === 180, 'max 180');
assert(minutesToMs(25) === 25 * 60_000, '25 min → ms');

const defaults = defaultSessionModes();
assert(defaults.length === 4, 'four default modes');

const edited = normalizeSessionModes([
  { id: 'deep-work', label: ' Focus ', durationMs: 30 * 60_000 },
  { id: 'custom', label: 'Gym', durationMs: 40 * 60_000 },
]);
assert(edited.length === 2, 'keeps custom length');
assert(edited[0].label === 'Focus', 'trims label');
assert(edited[1].label === 'Gym', 'keeps custom mode');

const emptyLabel = normalizeSessionModes([
  { id: 'a', label: '   ', durationMs: 10 * 60_000 },
]);
assert(emptyLabel[0].label === 'Session 1', 'empty label → Session N');

const many = normalizeSessionModes(
  Array.from({ length: 20 }, (_, i) => createSessionMode(`M${i}`, 10)),
);
assert(many.length === MAX_SESSION_MODES, 'caps at max modes');

assert(normalizeSessionModes([]).length === 4, 'empty → defaults');

console.log('sessionModes.selfcheck: all assertions passed');
