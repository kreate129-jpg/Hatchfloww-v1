import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '../constants/theme';

type Props = {
  timeLabel: string;
  hatched: number;
};

export function StatsBar({ timeLabel, hatched }: Props) {
  return (
    <View style={styles.row}>
      <Stat label="Time" value={timeLabel} />
      <Stat label="Hatched" value={String(hatched)} />
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  card: {
    flex: 1,
    backgroundColor: colors.surfaceLow,
    borderWidth: 2,
    borderColor: colors.secondary,
    borderRadius: radii.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
  },
  label: {
    ...typography.micro,
    color: colors.inkMuted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  value: {
    ...typography.headline,
    color: colors.secondary,
    lineHeight: 28,
  },
});
