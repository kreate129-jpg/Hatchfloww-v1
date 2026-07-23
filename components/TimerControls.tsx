import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  colors,
  hardShadow,
  hardShadowPressed,
  radii,
  spacing,
  typography,
} from '../constants/theme';
import type { TimerStatus } from '../lib/timerMath';

type Props = {
  status: TimerStatus;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
};

export function TimerControls({ status, onStart, onPause, onResume, onReset }: Props) {
  const running = status === 'running';
  const paused = status === 'paused';
  const completed = status === 'completed';

  const primaryLabel = running
    ? 'Pause Focus'
    : paused
      ? 'Resume Hatching'
      : completed
        ? 'Start Hatching'
        : 'Start Hatching';

  const primaryIcon = running ? 'pause' : 'play-arrow';

  const onPrimary = running ? onPause : paused ? onResume : onStart;

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        onPress={onPrimary}
        style={({ pressed }) => [
          styles.primary,
          running && styles.primaryRunning,
          pressed && styles.primaryPressed,
        ]}
      >
        <MaterialIcons
          name={primaryIcon}
          size={28}
          color={running ? colors.onErrorContainer : colors.onPrimaryContainer}
        />
        <Text style={[styles.primaryLabel, running && styles.primaryLabelRunning]}>
          {primaryLabel}
        </Text>
      </Pressable>
      {(running || paused || completed) && (
        <Pressable
          accessibilityRole="button"
          onPress={onReset}
          style={({ pressed }) => [styles.reset, pressed && styles.resetPressed]}
        >
          <Text style={styles.resetLabel}>Reset</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    gap: spacing.sm,
  },
  primary: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primaryContainer,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    ...hardShadow,
  },
  primaryRunning: {
    backgroundColor: colors.errorContainer,
  },
  primaryPressed: {
    ...hardShadowPressed,
  },
  primaryLabel: {
    ...typography.headline,
    color: colors.onPrimaryContainer,
    fontSize: 22,
    lineHeight: 28,
  },
  primaryLabelRunning: {
    color: colors.onErrorContainer,
  },
  reset: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  resetPressed: { opacity: 0.7 },
  resetLabel: {
    ...typography.label,
    color: colors.inkMuted,
    textDecorationLine: 'underline',
  },
});
