import type { ImageSourcePropType } from 'react-native';
import type { HatchPhase } from '../lib/hatchPhase';

export {
  CRACK_AT,
  FLUFFY_AT,
  HATCH_AT,
  phaseForProgress,
  type HatchPhase,
} from '../lib/hatchPhase';

export const PHASE_ART: Record<HatchPhase, ImageSourcePropType> = {
  egg: require('../assets/images/egg-alone.png'),
  cracked: require('../assets/images/egg-cracked-alone.png'),
  hatching: require('../assets/images/chick-hatching.png'),
  fluffy: require('../assets/images/chick-fluffy-warm.png'),
  chicken: require('../assets/images/hatch-rooster.png'),
};

/** Nest split so the egg can sit between back cup and front rim. */
export const NEST_BACK: ImageSourcePropType = require('../assets/images/nest-back.png');
export const NEST_FRONT: ImageSourcePropType = require('../assets/images/nest-front.png');

export const SHELL_TOP: ImageSourcePropType = require('../assets/images/hatch-shell-top.png');

export const PHASE_LABELS: Record<HatchPhase, string> = {
  egg: 'Warm egg',
  cracked: 'First crack',
  hatching: 'Hello, chick!',
  fluffy: 'All fluffy!',
  chicken: 'All grown up!',
};

export const STAGE_ASSETS: ImageSourcePropType[] = [
  ...Object.values(PHASE_ART),
  NEST_BACK,
  NEST_FRONT,
  SHELL_TOP,
];
