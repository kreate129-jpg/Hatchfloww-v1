/**
 * Pure hatch-timeline math, kept free of asset requires so the
 * selfcheck can run under tsx.
 */
export const CRACK_AT = 0.1;
export const HATCH_AT = 0.3;
/** Smoke reveal → grounded fluffy chick (no nest / snack scene). */
export const FLUFFY_AT = 0.5;

export type HatchPhase =
  | 'egg'
  | 'cracked'
  | 'hatching'
  | 'fluffy'
  | 'chicken';

export function phaseForProgress(progress: number): HatchPhase {
  const p = Math.min(1, Math.max(0, progress));
  if (p >= 1) return 'chicken';
  if (p >= FLUFFY_AT) return 'fluffy';
  if (p >= HATCH_AT) return 'hatching';
  if (p >= CRACK_AT) return 'cracked';
  return 'egg';
}
