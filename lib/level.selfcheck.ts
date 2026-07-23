/**
 * ponytail: assert-based self-check for local level math.
 * Run: npm run selfcheck
 */
import {
  clampHatchesPerLevel,
  defaultLevelState,
  normalizeLevelState,
  recordHatch,
  withHatchesPerLevel,
} from './level';

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`FAIL: ${msg}`);
}

assert(clampHatchesPerLevel(0) === 1, 'min 1 hatch per level');
assert(clampHatchesPerLevel(100) === 99, 'max 99');
assert(clampHatchesPerLevel(3.7) === 3, 'floors');

let s = defaultLevelState();
assert(s.level === 1 && s.progress === 0 && s.hatchesPerLevel === 1, 'defaults');

s = recordHatch(s);
assert(s.level === 2 && s.progress === 0, '1 hatch / level → level 2');

s = withHatchesPerLevel(defaultLevelState(), 3);
s = recordHatch(s);
s = recordHatch(s);
assert(s.level === 1 && s.progress === 2, '2 of 3 toward next');
s = recordHatch(s);
assert(s.level === 2 && s.progress === 0, '3rd hatch levels up');

s = normalizeLevelState({ level: 1, progress: 5, hatchesPerLevel: 2 });
assert(s.level === 3 && s.progress === 1, 'normalize burns surplus progress');

s = withHatchesPerLevel({ level: 1, progress: 4, hatchesPerLevel: 5 }, 2);
assert(s.level === 3 && s.progress === 0, 'lowering threshold applies pending levels');

console.log('level.selfcheck: all assertions passed');
