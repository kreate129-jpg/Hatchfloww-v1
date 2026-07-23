/**
 * ponytail: assert-based self-check for local focus stats.
 * Run: npm run selfcheck
 */
import {
  defaultFocusStats,
  formatFocusTime,
  normalizeFocusStats,
  recordFocusStats,
} from './stats';

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`FAIL: ${msg}`);
}

assert(formatFocusTime(0) === '0h', 'zero → 0h');
assert(formatFocusTime(25 * 60_000) === '25m', '25 min');
assert(formatFocusTime(60 * 60_000) === '1h', 'exact hour');
assert(formatFocusTime(90 * 60_000) === '1h 30m', 'hour + minutes');

let s = defaultFocusStats();
s = recordFocusStats(s, 25 * 60_000);
assert(s.hatched === 1 && s.totalFocusMs === 25 * 60_000, 'one hatch');
s = recordFocusStats(s, 15 * 60_000);
assert(s.hatched === 2 && s.totalFocusMs === 40 * 60_000, 'accumulates');

assert(
  normalizeFocusStats({ totalFocusMs: -5, hatched: 2.7 }).hatched === 2,
  'floors hatched',
);
assert(
  normalizeFocusStats({ totalFocusMs: -5, hatched: 2.7 }).totalFocusMs === 0,
  'clamps negative time',
);

console.log('stats.selfcheck: all assertions passed');
