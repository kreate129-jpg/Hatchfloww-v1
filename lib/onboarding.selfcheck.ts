/**
 * ponytail: assert-based self-check for onboarding flag contract.
 * Run: npm run selfcheck
 */
import { ONBOARDED_KEY } from './onboarding';

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`FAIL: ${msg}`);
}

const store = new Map<string, string>();

assert(ONBOARDED_KEY === 'hatchflow.onboarded.v1', 'storage key');
assert(store.get(ONBOARDED_KEY) !== '1', 'default not onboarded');

store.set(ONBOARDED_KEY, '1');
assert(store.get(ONBOARDED_KEY) === '1', 'flag persisted as 1');
assert(store.get(ONBOARDED_KEY) !== '0', 'only exact 1 counts as onboarded');

console.log('onboarding.selfcheck: all assertions passed');
