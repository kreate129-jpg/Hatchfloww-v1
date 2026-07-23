import AsyncStorage from '@react-native-async-storage/async-storage';

/** Device-only focus stats. Gone if the app is deleted. */
export const STATS_STORAGE_KEY = 'hatchflow.stats.v1';

export type FocusStats = {
  /** Sum of completed session durations. */
  totalFocusMs: number;
  /** Completed hatches (sessions finished). */
  hatched: number;
};

export function defaultFocusStats(): FocusStats {
  return { totalFocusMs: 0, hatched: 0 };
}

export function normalizeFocusStats(stats: FocusStats): FocusStats {
  const totalFocusMs =
    Number.isFinite(stats.totalFocusMs) && stats.totalFocusMs > 0
      ? Math.floor(stats.totalFocusMs)
      : 0;
  const hatched =
    Number.isFinite(stats.hatched) && stats.hatched > 0
      ? Math.floor(stats.hatched)
      : 0;
  return { totalFocusMs, hatched };
}

export function recordFocusStats(
  stats: FocusStats,
  durationMs: number,
): FocusStats {
  const add =
    Number.isFinite(durationMs) && durationMs > 0 ? Math.floor(durationMs) : 0;
  return normalizeFocusStats({
    totalFocusMs: stats.totalFocusMs + add,
    hatched: stats.hatched + 1,
  });
}

/** Compact label for the Time stat chip. */
export function formatFocusTime(ms: number): string {
  const totalMin = Math.max(0, Math.floor(ms / 60_000));
  if (totalMin < 60) return totalMin === 0 ? '0h' : `${totalMin}m`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function parseStats(raw: string | null): FocusStats {
  if (!raw) return defaultFocusStats();
  try {
    const parsed = JSON.parse(raw) as Partial<FocusStats>;
    return normalizeFocusStats({
      totalFocusMs:
        typeof parsed.totalFocusMs === 'number' ? parsed.totalFocusMs : 0,
      hatched: typeof parsed.hatched === 'number' ? parsed.hatched : 0,
    });
  } catch {
    return defaultFocusStats();
  }
}

export async function loadFocusStats(): Promise<FocusStats> {
  try {
    const raw = await AsyncStorage.getItem(STATS_STORAGE_KEY);
    return parseStats(raw);
  } catch {
    return defaultFocusStats();
  }
}

export async function saveFocusStats(stats: FocusStats): Promise<void> {
  await AsyncStorage.setItem(
    STATS_STORAGE_KEY,
    JSON.stringify(normalizeFocusStats(stats)),
  );
}

export async function loadAndRecordFocusStats(
  durationMs: number,
): Promise<FocusStats> {
  const next = recordFocusStats(await loadFocusStats(), durationMs);
  await saveFocusStats(next);
  return next;
}
