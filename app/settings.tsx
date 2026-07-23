import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from '../components/BottomNav';
import { FarmerToast, farmerComingSoon, type FarmerNotice } from '../components/FarmerToast';
import { colors, radii, spacing, typography } from '../constants/theme';
import {
  MAX_HATCHES_PER_LEVEL,
  MIN_HATCHES_PER_LEVEL,
  type LevelState,
  clampHatchesPerLevel,
  loadLevelState,
  setHatchesPerLevel,
} from '../lib/level';

const PRESETS = [1, 2, 3, 5, 10] as const;

export default function SettingsScreen() {
  const [state, setState] = useState<LevelState | null>(null);
  const [draftN, setDraftN] = useState(1);
  const [draftText, setDraftText] = useState('1');
  const [saving, setSaving] = useState(false);
  const [farmerNotice, setFarmerNotice] = useState<FarmerNotice | null>(null);

  const hydrate = useCallback(async () => {
    const next = await loadLevelState();
    setState(next);
    setDraftN(next.hatchesPerLevel);
    setDraftText(String(next.hatchesPerLevel));
  }, []);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const pendingN = (() => {
    const parsed = Number.parseInt(draftText, 10);
    return Number.isFinite(parsed) ? clampHatchesPerLevel(parsed) : draftN;
  })();
  const dirty = state != null && pendingN !== state.hatchesPerLevel;

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

  const save = useCallback(async () => {
    const parsed = Number.parseInt(draftText, 10);
    const n = clampHatchesPerLevel(Number.isFinite(parsed) ? parsed : draftN);
    setSaving(true);
    try {
      const next = await setHatchesPerLevel(n);
      setState(next);
      setDraftN(next.hatchesPerLevel);
      setDraftText(String(next.hatchesPerLevel));
    } finally {
      setSaving(false);
    }
  }, [draftText, draftN]);

  if (!state) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.secondary} size="large" />
      </View>
    );
  }

  const remaining = Math.max(0, state.hatchesPerLevel - state.progress);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Level progress</Text>
          <Text style={styles.stat}>Level {state.level}</Text>
          <Text style={styles.hint}>
            {state.progress} / {state.hatchesPerLevel} hatches toward next level
            {remaining > 0 ? ` · ${remaining} to go` : ''}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Hatches per level</Text>
          <Text style={styles.hint}>
            How many completed focus sessions before Level goes up.
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
            Custom range {MIN_HATCHES_PER_LEVEL}–{MAX_HATCHES_PER_LEVEL}
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Save hatches per level"
            disabled={!dirty || saving}
            onPress={() => void save()}
            style={({ pressed }) => [
              styles.saveBtn,
              (!dirty || saving) && styles.saveDisabled,
              pressed && dirty && !saving && styles.pressed,
            ]}
          >
            <Text style={styles.saveLabel}>{saving ? 'Saving…' : 'Save'}</Text>
          </Pressable>
        </View>
      </ScrollView>

      <FarmerToast notice={farmerNotice} onDismiss={() => setFarmerNotice(null)} />

      <BottomNav
        active="settings"
        onPress={(tab) => {
          if (tab === 'settings') return;
          if (tab === 'home') {
            router.replace('/timer');
            return;
          }
          setFarmerNotice({ message: farmerComingSoon(tab), variant: 'card' });
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: colors.secondary,
    backgroundColor: colors.surface,
    gap: 4,
  },
  title: {
    ...typography.headline,
    color: colors.secondary,
  },
  scroll: {
    padding: spacing.lg,
    gap: spacing.md,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  card: {
    backgroundColor: colors.surfaceContainer,
    borderWidth: 2,
    borderColor: colors.secondary,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardTitle: {
    ...typography.label,
    color: colors.ink,
  },
  stat: {
    ...typography.display,
    fontSize: 40,
    lineHeight: 48,
    color: colors.secondary,
  },
  hint: {
    ...typography.body,
    color: colors.inkMuted,
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
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
  },
  saveBtn: {
    marginTop: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: radii.lg,
    backgroundColor: colors.primaryContainer,
    borderWidth: 2,
    borderColor: colors.secondary,
    boxShadow: `3px 3px 0px 0px ${colors.secondary}`,
  },
  saveDisabled: {
    opacity: 0.45,
  },
  saveLabel: {
    ...typography.label,
    color: colors.onPrimaryContainer,
    letterSpacing: 0.3,
  },
  pressed: { opacity: 0.85 },
});
