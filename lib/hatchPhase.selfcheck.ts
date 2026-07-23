/**
 * ponytail: assert-based self-check for the hatch timeline thresholds.
 * Run: npm run selfcheck
 */
import { CRACK_AT, FLUFFY_AT, HATCH_AT, phaseForProgress } from './hatchPhase';

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`FAIL: ${msg}`);
}

assert(
  CRACK_AT === 0.1 && HATCH_AT === 0.3 && FLUFFY_AT === 0.5,
  'spec thresholds 10% / 30% / 50%',
);

assert(phaseForProgress(0) === 'egg', '0% → intact egg');
assert(phaseForProgress(0.1) === 'cracked', '10% → cracked');
assert(phaseForProgress(0.3) === 'hatching', '30% → hatching in shell');
assert(phaseForProgress(0.4999) === 'hatching', 'just under 50% → hatching');
assert(phaseForProgress(0.5) === 'fluffy', '50% → fluffy chick (no nest snack)');
assert(phaseForProgress(0.9999) === 'fluffy', 'just under end → fluffy');
assert(phaseForProgress(1) === 'chicken', '100% → chicken');
assert(phaseForProgress(-0.2) === 'egg', 'clamps below 0');
assert(phaseForProgress(1.5) === 'chicken', 'clamps above 1');

console.log('hatchPhase.selfcheck: all assertions passed');
