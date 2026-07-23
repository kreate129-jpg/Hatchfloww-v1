import { StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../constants/theme';

type Props = {
  remainingMs: number;
  caption?: string;
};

export function formatMmSs(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function TimerDisplay({ remainingMs, caption = 'Focus Session' }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.timer}>{formatMmSs(remainingMs)}</Text>
      <Text style={styles.caption}>{caption}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  timer: {
    ...typography.timer,
    color: colors.secondary,
    textAlign: 'center',
  },
  caption: {
    ...typography.micro,
    color: colors.onTertiaryContainer,
    textTransform: 'uppercase',
    opacity: 0.8,
    marginTop: 4,
  },
});
