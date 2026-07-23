import { useEffect, useRef } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  NEST_BACK,
  NEST_FRONT,
  PHASE_ART,
  type HatchPhase,
} from '../constants/stages';

type Props = {
  phase: HatchPhase;
  size?: number;
};

const soft = Easing.bezier(0.33, 0, 0.2, 1);

const SMOKE_PUFFS = [
  { delay: 0, x: -0.08, y: 0.02, r: 0.22 },
  { delay: 0.05, x: 0.1, y: -0.02, r: 0.26 },
  { delay: 0.1, x: -0.02, y: 0.08, r: 0.2 },
  { delay: 0.08, x: 0.16, y: 0.06, r: 0.18 },
  { delay: 0.14, x: -0.14, y: 0.1, r: 0.24 },
  { delay: 0.12, x: 0.04, y: -0.08, r: 0.28 },
  { delay: 0.18, x: -0.06, y: 0.14, r: 0.2 },
  { delay: 0.16, x: 0.12, y: 0.12, r: 0.22 },
] as const;

function SmokePuff({
  smokeT,
  size,
  delay,
  ox,
  oy,
  r,
}: {
  smokeT: SharedValue<number>;
  size: number;
  delay: number;
  ox: number;
  oy: number;
  r: number;
}) {
  const style = useAnimatedStyle(() => {
    const t = smokeT.value;
    const grow = interpolate(
      t,
      [delay, delay + 0.35, delay + 0.85],
      [0, 1, 1],
      Extrapolation.CLAMP,
    );
    const fade = interpolate(
      t,
      [delay + 0.25, delay + 0.95],
      [1, 0],
      Extrapolation.CLAMP,
    );
    return {
      opacity: grow * fade * 0.5,
      transform: [
        { translateX: ox * size },
        { translateY: oy * size - grow * size * 0.22 },
        { scale: 0.35 + grow * 1.5 },
      ],
    };
  });
  const dim = size * r;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.smoke,
        { width: dim, height: dim, borderRadius: dim, marginLeft: -dim / 2, marginTop: -dim / 2 },
        style,
      ]}
    />
  );
}

/**
 * Timed hatch scene:
 * - "egg"      (0–10%)   warm breath in nest
 * - "cracked"  (10–30%)  crack thrash + restless rock
 * - "hatching" (30–50%)  chick in shell, blinking
 * - "fluffy"   (50–100%) smoke → grounded chick (no nest)
 * - "chicken"  (100%)    grown bird
 */
export function EggStage({ phase, size = 260 }: Props) {
  const prevPhase = useRef<HatchPhase | null>(null);

  const eggSize = size * 0.52;
  const eggLeft = (size - eggSize) / 2;
  const eggTop = size * 0.16;

  const hatchSize = size * 0.58;
  const hatchLeft = (size - hatchSize) / 2;
  const hatchTop = size * 0.12;
  const hatchEyes = [
    { x: 0.36, y: 0.327 },
    { x: 0.559, y: 0.327 },
  ] as const;
  const hatchEyeSize = hatchSize * 0.055;

  const fluffySize = size * 0.72;
  const fluffyLeft = (size - fluffySize) / 2;
  // Plant on the ground plane, not mid-air.
  const fluffyBottom = size * 0.02;
  // Eye centers in chick-fluffy-warm.png (normalized) — same lid trick as hatching.
  const fluffyEyes = [
    { x: 0.339, y: 0.296 },
    { x: 0.539, y: 0.298 },
  ] as const;
  const fluffyEyeSize = fluffySize * 0.072;

  const eggRotate = useSharedValue(0);
  const eggX = useSharedValue(0);
  const eggBreath = useSharedValue(0);
  const eggSquash = useSharedValue(0);
  const eggOpacity = useSharedValue(phase === 'egg' || phase === 'cracked' ? 1 : 0);
  const nestOpacity = useSharedValue(
    phase === 'chicken' || phase === 'fluffy' ? 0 : 1,
  );

  const hatchScale = useSharedValue(phase === 'hatching' ? 1 : 0);
  const hatchY = useSharedValue(0);
  const hatchBlink = useSharedValue(0);
  const hatchBreath = useSharedValue(0);

  const smokeT = useSharedValue(0);
  const fluffyScale = useSharedValue(phase === 'fluffy' ? 1 : 0);
  const fluffyBlink = useSharedValue(0);

  const chickenScale = useSharedValue(phase === 'chicken' ? 1 : 0);

  useEffect(() => {
    const from = prevPhase.current;
    if (from === phase) return;
    prevPhase.current = phase;

    const stopLoops = () => {
      cancelAnimation(eggRotate);
      cancelAnimation(eggX);
      cancelAnimation(eggBreath);
      cancelAnimation(eggSquash);
      cancelAnimation(hatchBlink);
      cancelAnimation(hatchBreath);
      cancelAnimation(hatchY);
      cancelAnimation(smokeT);
      cancelAnimation(fluffyBlink);
      eggRotate.value = 0;
      eggX.value = 0;
      eggBreath.value = 0;
      eggSquash.value = 0;
      hatchBlink.value = 0;
      hatchBreath.value = 0;
      hatchY.value = 0;
      fluffyBlink.value = 0;
    };

    const breathLoop = withRepeat(
      withSequence(
        withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );

    const restlessRock = withRepeat(
      withSequence(
        withSpring(-7, { damping: 5, stiffness: 220, mass: 0.7 }),
        withSpring(6, { damping: 6, stiffness: 200, mass: 0.7 }),
        withSpring(-4, { damping: 7, stiffness: 180 }),
        withSpring(0, { damping: 10, stiffness: 140 }),
        withTiming(0, { duration: 1100 }),
      ),
      -1,
      false,
    );

    const restlessSquash = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 180, easing: soft }),
        withTiming(-0.4, { duration: 220, easing: soft }),
        withTiming(0.3, { duration: 200, easing: soft }),
        withTiming(0, { duration: 280, easing: soft }),
        withTiming(0, { duration: 1100 }),
      ),
      -1,
      false,
    );

    const blinkLoop = withRepeat(
      withSequence(
        withTiming(0, { duration: 1600 }),
        withTiming(1, { duration: 70 }),
        withTiming(0, { duration: 90 }),
        withTiming(1, { duration: 70 }),
        withTiming(0, { duration: 100 }),
        withTiming(0, { duration: 2200 }),
      ),
      -1,
      false,
    );

    const hatchBobLoop = withRepeat(
      withSequence(
        withTiming(0, { duration: 900 }),
        withTiming(-size * 0.018, { duration: 280, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 320, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );

    switch (phase) {
      case 'egg':
        stopLoops();
        eggOpacity.value = withTiming(1, { duration: 220, easing: soft });
        nestOpacity.value = withTiming(1, { duration: 220, easing: soft });
        hatchScale.value = 0;
        fluffyScale.value = 0;
        chickenScale.value = 0;
        smokeT.value = 0;
        eggBreath.value = breathLoop;
        break;

      case 'cracked': {
        stopLoops();
        eggOpacity.value = withTiming(1, { duration: 150 });
        nestOpacity.value = withTiming(1, { duration: 150 });
        hatchScale.value = 0;
        fluffyScale.value = 0;
        chickenScale.value = 0;
        smokeT.value = 0;

        if (from === 'egg') {
          eggSquash.value = withSequence(
            withTiming(1, { duration: 140, easing: Easing.in(Easing.quad) }),
            withTiming(-0.8, { duration: 80 }),
            withTiming(0.6, { duration: 70 }),
            withTiming(-0.3, { duration: 70 }),
            withTiming(0, { duration: 120, easing: soft }),
            restlessSquash,
          );
          eggX.value = withSequence(
            withTiming(-size * 0.035, { duration: 55 }),
            withTiming(size * 0.04, { duration: 55 }),
            withTiming(-size * 0.03, { duration: 50 }),
            withTiming(size * 0.025, { duration: 50 }),
            withTiming(-size * 0.012, { duration: 45 }),
            withSpring(0, { damping: 10, stiffness: 220 }),
          );
          eggRotate.value = withSequence(
            withTiming(-11, { duration: 55 }),
            withTiming(12, { duration: 55 }),
            withTiming(-9, { duration: 50 }),
            withTiming(8, { duration: 50 }),
            withTiming(-4, { duration: 45 }),
            withSpring(0, { damping: 9, stiffness: 200 }),
            restlessRock,
          );
        } else {
          eggRotate.value = restlessRock;
          eggSquash.value = restlessSquash;
        }
        eggBreath.value = breathLoop;
        break;
      }

      case 'hatching': {
        stopLoops();
        chickenScale.value = 0;
        fluffyScale.value = 0;
        smokeT.value = 0;
        nestOpacity.value = withTiming(1, { duration: 200, easing: soft });
        const entering = from === 'egg' || from === 'cracked';

        if (entering) {
          eggSquash.value = withSequence(
            withTiming(1.2, { duration: 90 }),
            withTiming(-1, { duration: 70 }),
            withTiming(0, { duration: 100 }),
          );
          eggRotate.value = withSequence(
            withTiming(-14, { duration: 50 }),
            withTiming(14, { duration: 50 }),
            withTiming(-8, { duration: 40 }),
            withTiming(0, { duration: 40 }),
          );
          eggX.value = withSequence(
            withTiming(-size * 0.03, { duration: 50 }),
            withTiming(size * 0.03, { duration: 50 }),
            withSpring(0, { damping: 12, stiffness: 240 }),
          );
          eggOpacity.value = withDelay(120, withTiming(0, { duration: 220, easing: soft }));

          hatchY.value = size * 0.1;
          hatchScale.value = 0.35;
          hatchY.value = withDelay(
            160,
            withSequence(
              withSpring(0, { damping: 10, stiffness: 140, mass: 0.85 }),
              hatchBobLoop,
            ),
          );
          hatchScale.value = withDelay(
            160,
            withSpring(1, { damping: 8, stiffness: 150, mass: 0.8 }),
          );
        } else {
          eggOpacity.value = 0;
          hatchScale.value = 1;
          hatchY.value = hatchBobLoop;
        }

        hatchBreath.value = withDelay(entering ? 500 : 0, breathLoop);
        hatchBlink.value = withDelay(entering ? 600 : 200, blinkLoop);
        break;
      }

      case 'fluffy': {
        stopLoops();
        chickenScale.value = 0;
        eggOpacity.value = 0;
        hatchScale.value = 0;
        hatchBlink.value = 0;
        const revealing =
          from === 'hatching' || from === 'cracked' || from === 'egg';

        // Drop nest immediately; grounded fluffy only (no snack scene).
        nestOpacity.value = 0;

        if (revealing) {
          smokeT.value = 0;
          smokeT.value = withTiming(1, { duration: 920, easing: soft });
          fluffyScale.value = 0.2;
          fluffyScale.value = withDelay(
            280,
            withSpring(1, { damping: 8, stiffness: 140, mass: 0.85 }),
          );
        } else {
          smokeT.value = 0;
          fluffyScale.value = 1;
        }

        fluffyBlink.value = withDelay(revealing ? 600 : 200, blinkLoop);
        break;
      }

      case 'chicken':
        stopLoops();
        eggOpacity.value = 0;
        nestOpacity.value = withTiming(0, { duration: 220, easing: soft });
        hatchScale.value = 0;
        hatchBlink.value = 0;
        smokeT.value = 0;

        fluffyScale.value = withSequence(
          withTiming(1.08, { duration: 90, easing: Easing.in(Easing.quad) }),
          withTiming(0, { duration: 140, easing: Easing.in(Easing.cubic) }),
        );
        fluffyBlink.value = 0;

        // One spring-in from the feet, then stay put (no bob/tilt).
        chickenScale.value = 0.35;
        chickenScale.value = withDelay(
          120,
          withSpring(1, { damping: 7, stiffness: 130, mass: 0.9 }),
        );
        break;
    }
  }, [
    phase,
    size,
    eggRotate,
    eggX,
    eggBreath,
    eggSquash,
    eggOpacity,
    nestOpacity,
    hatchScale,
    hatchY,
    hatchBlink,
    hatchBreath,
    smokeT,
    fluffyScale,
    fluffyBlink,
    chickenScale,
  ]);

  const nestStyle = useAnimatedStyle(() => ({
    opacity: nestOpacity.value,
  }));

  const eggStyle = useAnimatedStyle(() => {
    const breathX = 1 + eggBreath.value * 0.028;
    const breathY = 1 - eggBreath.value * 0.034;
    const squashX = 1 + eggSquash.value * 0.07;
    const squashY = 1 - eggSquash.value * 0.09;
    return {
      opacity: eggOpacity.value,
      transform: [
        { translateX: eggX.value },
        { rotate: `${eggRotate.value}deg` },
        { scaleX: breathX * squashX },
        { scaleY: breathY * squashY },
      ],
    };
  });

  const hatchStyle = useAnimatedStyle(() => {
    const breath = interpolate(hatchBreath.value, [0, 1], [1, 1.035]);
    const breathY = interpolate(hatchBreath.value, [0, 1], [1, 0.975]);
    return {
      opacity: hatchScale.value > 0.02 ? 1 : 0,
      transform: [
        { translateY: hatchY.value },
        { scaleX: hatchScale.value * breath },
        { scaleY: hatchScale.value * breathY },
      ],
    };
  });

  const hatchLidStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: hatchBlink.value }],
  }));

  const fluffyStyle = useAnimatedStyle(() => ({
    opacity: fluffyScale.value > 0.02 ? 1 : 0,
    transform: [{ scale: fluffyScale.value }],
  }));

  const fluffyLidStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: fluffyBlink.value }],
  }));

  const chickenStyle = useAnimatedStyle(() => ({
    opacity: chickenScale.value > 0.02 ? 1 : 0,
    transform: [{ scale: chickenScale.value }],
  }));

  return (
    <View style={{ width: size, height: size }}>
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.center, nestStyle]}
        pointerEvents="none"
      >
        <Image source={NEST_BACK} style={{ width: size, height: size }} resizeMode="contain" />
      </Animated.View>

      <Animated.View
        style={[
          styles.eggPivot,
          { width: eggSize, height: eggSize, left: eggLeft, top: eggTop },
          eggStyle,
        ]}
      >
        <Image
          source={PHASE_ART[phase === 'egg' || phase === 'cracked' ? phase : 'cracked']}
          style={styles.fill}
          resizeMode="contain"
        />
      </Animated.View>

      {/* In-shell chick (30%) */}
      <Animated.View
        style={[
          styles.eggPivot,
          { width: hatchSize, height: hatchSize, left: hatchLeft, top: hatchTop },
          hatchStyle,
        ]}
      >
        <Image source={PHASE_ART.hatching} style={styles.fill} resizeMode="contain" />
        {hatchEyes.map((eye) => (
          <Animated.View
            key={`${eye.x}-${eye.y}`}
            style={[
              styles.lid,
              {
                width: hatchEyeSize,
                height: hatchEyeSize * 0.85,
                left: hatchSize * eye.x - hatchEyeSize / 2,
                top: hatchSize * eye.y - hatchEyeSize * 0.35,
                borderRadius: hatchEyeSize,
                backgroundColor: '#FBD26C',
              },
              hatchLidStyle,
            ]}
          />
        ))}
      </Animated.View>

      <Animated.View
        style={[StyleSheet.absoluteFill, styles.center, nestStyle]}
        pointerEvents="none"
      >
        <Image source={NEST_FRONT} style={{ width: size, height: size }} resizeMode="contain" />
      </Animated.View>

      {/* Smoke + fluffy reveal (50%) */}
      <View
        pointerEvents="none"
        style={[
          styles.smokeLayer,
          { left: size / 2, top: size * 0.62 },
        ]}
      >
        {SMOKE_PUFFS.map((puff, i) => (
          <SmokePuff
            key={i}
            smokeT={smokeT}
            size={size}
            delay={puff.delay}
            ox={puff.x}
            oy={puff.y}
            r={puff.r}
          />
        ))}
      </View>

      <Animated.View
        style={[
          styles.fluffy,
          {
            width: fluffySize,
            height: fluffySize,
            left: fluffyLeft,
            bottom: fluffyBottom,
          },
          fluffyStyle,
        ]}
      >
        <Image source={PHASE_ART.fluffy} style={styles.fill} resizeMode="contain" />
        {fluffyEyes.map((eye) => (
          <Animated.View
            key={`${eye.x}-${eye.y}`}
            style={[
              styles.lid,
              {
                width: fluffyEyeSize,
                height: fluffyEyeSize * 0.85,
                left: fluffySize * eye.x - fluffyEyeSize / 2,
                top: fluffySize * eye.y - fluffyEyeSize * 0.4,
                borderRadius: fluffyEyeSize,
                backgroundColor: '#FAD272',
                zIndex: 2,
              },
              fluffyLidStyle,
            ]}
          />
        ))}
      </Animated.View>

      <Animated.View
        style={[
          styles.chicken,
          {
            width: size * 0.92,
            height: size * 0.92,
            left: size * 0.04,
            // Pull down by the PNG's bottom pad so feet sit on the ground line.
            bottom: -size * 0.07,
          },
          chickenStyle,
        ]}
      >
        <Image source={PHASE_ART.chicken} style={styles.fill} resizeMode="contain" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  eggPivot: {
    position: 'absolute',
    transformOrigin: '50% 85%',
  },
  fill: {
    width: '100%',
    height: '100%',
  },
  lid: {
    position: 'absolute',
    // Close from the top of the eye, same as hatching chick.
    transformOrigin: '50% 0%',
    overflow: 'hidden',
  },
  smokeLayer: {
    position: 'absolute',
    width: 0,
    height: 0,
    zIndex: 8,
  },
  smoke: {
    position: 'absolute',
    backgroundColor: 'rgba(210, 215, 208, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(160, 170, 158, 0.45)',
  },
  fluffy: {
    position: 'absolute',
    zIndex: 6,
    // Grow/settle from the feet so the chick stays grounded.
    transformOrigin: '50% 100%',
  },
  chicken: {
    position: 'absolute',
    // Scale from the soles so the spring-in doesn't lift the bird.
    transformOrigin: '50% 92%',
  },
});
