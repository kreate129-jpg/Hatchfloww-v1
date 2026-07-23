import AsyncStorage from '@react-native-async-storage/async-storage';

/** Device-only progress. Never synced to the cloud. */
export const LEVEL_STORAGE_KEY = 'hatchflow.level.v1';

export const DEFAULT_LEVEL = 1;
export const DEFAULT_HATCHES_PER_LEVEL = 1;
export const MIN_HATCHES_PER_LEVEL = 1;
export const MAX_HATCHES_PER_LEVEL = 99;

export type LevelState = {
  level: number;
  /** Hatches earned toward the next level (0 … hatchesPerLevel-1). */
  progress: number;
  hatchesPerLevel: number;
};

export function defaultLevelState(): LevelState {
  return {
    level: DEFAULT_LEVEL,
    progress: 0,
    hatchesPerLevel: DEFAULT_HATCHES_PER_LEVEL,
  };
}

export function clampHatchesPerLevel(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_HATCHES_PER_LEVEL;
  return Math.min(
    MAX_HATCHES_PER_LEVEL,
    Math.max(MIN_HATCHES_PER_LEVEL, Math.floor(n)),
  );
}

/** Apply pending level-ups if progress already meets the threshold. */
export function normalizeLevelState(state: LevelState): LevelState {
  let { level, progress } = state;
  const hatchesPerLevel = clampHatchesPerLevel(state.hatchesPerLevel);
  if (!Number.isFinite(level) || level < 1) level = DEFAULT_LEVEL;
  if (!Number.isFinite(progress) || progress < 0) progress = 0;
  level = Math.floor(level);
  progress = Math.floor(progress);
  while (progress >= hatchesPerLevel) {
    progress -= hatchesPerLevel;
    level += 1;
  }
  return { level, progress, hatchesPerLevel };
}

export function recordHatch(state: LevelState): LevelState {
  return normalizeLevelState({
    ...state,
    progress: state.progress + 1,
  });
}

export function withHatchesPerLevel(
  state: LevelState,
  hatchesPerLevel: number,
): LevelState {
  return normalizeLevelState({
    ...state,
    hatchesPerLevel: clampHatchesPerLevel(hatchesPerLevel),
  });
}

function parseLevelState(raw: string | null): LevelState {
  if (!raw) return defaultLevelState();
  try {
    const parsed = JSON.parse(raw) as Partial<LevelState>;
    return normalizeLevelState({
      level: typeof parsed.level === 'number' ? parsed.level : DEFAULT_LEVEL,
      progress: typeof parsed.progress === 'number' ? parsed.progress : 0,
      hatchesPerLevel:
        typeof parsed.hatchesPerLevel === 'number'
          ? parsed.hatchesPerLevel
          : DEFAULT_HATCHES_PER_LEVEL,
    });
  } catch {
    return defaultLevelState();
  }
}

export async function loadLevelState(): Promise<LevelState> {
  try {
    const raw = await AsyncStorage.getItem(LEVEL_STORAGE_KEY);
    return parseLevelState(raw);
  } catch {
    return defaultLevelState();
  }
}

export async function saveLevelState(state: LevelState): Promise<void> {
  const next = normalizeLevelState(state);
  await AsyncStorage.setItem(LEVEL_STORAGE_KEY, JSON.stringify(next));
}

export async function loadAndRecordHatch(): Promise<LevelState> {
  const next = recordHatch(await loadLevelState());
  await saveLevelState(next);
  return next;
}

export async function setHatchesPerLevel(
  hatchesPerLevel: number,
): Promise<LevelState> {
  const next = withHatchesPerLevel(await loadLevelState(), hatchesPerLevel);
  await saveLevelState(next);
  return next;
}
