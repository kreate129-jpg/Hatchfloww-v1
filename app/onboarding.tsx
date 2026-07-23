import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  colors,
  hardShadow,
  hardShadowPressed,
  radii,
  spacing,
  typography,
} from '../constants/theme';
import {
  MAX_HATCHES_PER_LEVEL,
  MIN_HATCHES_PER_LEVEL,
  clampHatchesPerLevel,
  setHatchesPerLevel,
} from '../lib/level';
import { setOnboarded } from '../lib/onboarding';

const LOGO = require('../assets/images/hatchflow-logo.png');
const EGG = require('../assets/images/hatch-egg.png');
const CHICK = require('../assets/images/hatch-chick.png');

const PRESETS = [1, 2, 3, 5, 10] as const;
const STEP_COUNT = 4;

type IntroStep = {
  image: ImageSourcePropType;
  title: string;
  subtitle: string;
};

const INTRO_STEPS: IntroStep[] = [
  {
    image: LOGO,
    title: 'Welcome to HatchFlow',
    subtitle: 'Turn focus time into a hatching chick.',
  },
  {
    image: EGG,
    title: 'Start a timer',
    subtitle: 'Your egg stays warm while you focus.',
  },
  {
    image: CHICK,
    title: 'Finish to hatch',
    subtitle: 'Complete a session and your chick hatches.',
  },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [draftN, setDraftN] = useState(1);
  const [draftText, setDraftText] = useState('1');
  const [busy, setBusy] = useState(false);

  const isGoalStep = step === STEP_COUNT - 1;
  const isFirst = step === 0;

  const setDraft = useCallback((n: number) => {
    const next = clampHatchesPerLevel(n);
    setDraftN(next);
    setDraftText(String(next));
  }, []);

  const syncDraftFromText = useCallback(() => {
    const n = Number.parseInt(draftText, 10);
    if (Number.isFinite(n)) setDraft(n);
    else setDraftText(String(draftN));
  }, [draftText, draftN, setDraft]);

  const finish = useCallback(
    async (saveGoal: boolean) => {
      setBusy(true);
      try {
        if (saveGoal) await setHatchesPerLevel(draftN);
        await setOnboarded();
        router.replace('/timer');
      } finally {
        setBusy(false);
      }
    },
    [draftN],
  );

  const onNext = () => {
    if (isGoalStep) {
      void finish(true);
      return;
    }
    setStep((s) => s + 1);
  };

  const onBack = () => {
    if (!isFirst) setStep((s) => s - 1);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      <View style={styles.topBar}>
        {!isFirst ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={onBack}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          >
            <MaterialIcons name="arrow-back" size={22} color={colors.secondary} />
          </Pressable>
        ) : (
          <View style={styles.backSpacer} />
        )}

        {!isGoalStep ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => void finish(false)}
            disabled={busy}
            style={({ pressed }) => [styles.skipBtn, pressed && styles.pressed]}
          >
            <Text style={styles.skipLabel}>Skip</Text>
          </Pressable>
        ) : (
          <View style={styles.backSpacer} />
        )}
      </View>

      <View style={styles.body}>
        {isGoalStep ? (
          <View style={styles.goalCard}>
            <Text style={styles.goalTitle}>Set your goal</Text>
            <Text style={styles.goalHint}>
              How many completed focus sessions before Level goes up?
            </Text>

            <View style={styles.presets}>
              {PRESETS.map((n) => {
                const active = draftN === n;
                return (
                  <Pressable
                    key={n}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => setDraft(n)}
                    style={({ pressed }) => [
                      styles.chip,
                      active && styles.chipActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                      {n}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.stepper}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Decrease hatches per level"
                disabled={draftN <= MIN_HATCHES_PER_LEVEL}
                onPress={() => setDraft(draftN - 1)}
                style={({ pressed }) => [
                  styles.stepBtn,
                  draftN <= MIN_HATCHES_PER_LEVEL && styles.stepDisabled,
                  pressed && styles.pressed,
                ]}
              >
                <MaterialIcons name="remove" size={22} color={colors.secondary} />
              </Pressable>

              <TextInput
                accessibilityLabel="Custom hatches per level"
                keyboardType="number-pad"
                value={draftText}
                onChangeText={setDraftText}
                onBlur={syncDraftFromText}
                onSubmitEditing={syncDraftFromText}
                style={styles.input}
                maxLength={2}
              />

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Increase hatches per level"
                disabled={draftN >= MAX_HATCHES_PER_LEVEL}
                onPress={() => setDraft(draftN + 1)}
                style={({ pressed }) => [
                  styles.stepBtn,
                  draftN >= MAX_HATCHES_PER_LEVEL && styles.stepDisabled,
                  pressed && styles.pressed,
                ]}
              >
                <MaterialIcons name="add" size={22} color={colors.secondary} />
              </Pressable>
            </View>

            <Text style={styles.rangeHint}>
              Range {MIN_HATCHES_PER_LEVEL}–{MAX_HATCHES_PER_LEVEL}
            </Text>
          </View>
        ) : (
          <View style={styles.intro}>
            <Image
              source={INTRO_STEPS[step].image}
              style={styles.hero}
              resizeMode="contain"
            />
            <Text style={styles.title}>{INTRO_STEPS[step].title}</Text>
            <Text style={styles.subtitle}>{INTRO_STEPS[step].subtitle}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {Array.from({ length: STEP_COUNT }, (_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={busy}
          onPress={onNext}
          style={({ pressed }) => [
            styles.primary,
            busy && styles.disabled,
            pressed && !busy && styles.primaryPressed,
          ]}
        >
          {busy ? (
            <ActivityIndicator color={colors.onPrimaryContainer} />
          ) : (
            <Text style={styles.primaryLabel}>
              {isGoalStep ? 'Get started' : 'Next'}
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    minHeight: 44,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backSpacer: {
    width: 44,
    height: 44,
  },
  skipBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  skipLabel: {
    ...typography.bodyMedium,
    color: colors.onSecondaryContainer,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  intro: {
    alignItems: 'center',
    gap: spacing.md,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  hero: {
    width: 220,
    height: 220,
  },
  title: {
    ...typography.headline,
    fontSize: 28,
    lineHeight: 36,
    color: colors.secondary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    fontSize: 18,
    lineHeight: 26,
    color: colors.inkMuted,
    textAlign: 'center',
  },
  goalCard: {
    backgroundColor: colors.surfaceContainer,
    borderWidth: 2,
    borderColor: colors.secondary,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  goalTitle: {
    ...typography.headline,
    color: colors.secondary,
    textAlign: 'center',
  },
  goalHint: {
    ...typography.body,
    color: colors.inkMuted,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  chip: {
    minWidth: 44,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.outlineSoft,
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: colors.secondaryContainer,
    borderColor: colors.secondary,
  },
  chipLabel: {
    ...typography.label,
    fontSize: 14,
    color: colors.inkMuted,
  },
  chipLabelActive: {
    color: colors.onSecondaryContainer,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.secondary,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDisabled: {
    opacity: 0.35,
  },
  input: {
    minWidth: 72,
    textAlign: 'center',
    ...typography.headline,
    color: colors.ink,
    borderBottomWidth: 2,
    borderBottomColor: colors.secondary,
    paddingVertical: 4,
  },
  rangeHint: {
    ...typography.micro,
    color: colors.inkMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.outlineSoft,
  },
  dotActive: {
    backgroundColor: colors.secondary,
    width: 20,
  },
  primary: {
    backgroundColor: colors.primaryContainer,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...hardShadow,
  },
  primaryPressed: {
    ...hardShadowPressed,
  },
  primaryLabel: {
    ...typography.label,
    color: colors.onPrimaryContainer,
    fontSize: 16,
  },
  disabled: { opacity: 0.7 },
  pressed: { opacity: 0.85 },
});
