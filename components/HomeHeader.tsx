import { Image, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../constants/theme';

const LOGO = require('../assets/images/hatchflow-logo.png');

type Props = {
  level?: number;
};

export function HomeHeader({ level = 1 }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.brandRow}>
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
          <Text style={styles.brand}>HatchFlow</Text>
        </View>
        <View style={styles.level}>
          <MaterialIcons
            name="workspace-premium"
            size={14}
            color={colors.onSecondaryContainer}
          />
          <Text style={styles.levelText}>Level {level}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: colors.secondary,
    boxShadow: `4px 4px 0px 0px ${colors.secondary}`,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    zIndex: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 48,
    height: 48,
  },
  brand: {
    ...typography.brand,
    color: colors.secondary,
  },
  level: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: colors.secondaryContainer,
    borderWidth: 2,
    borderColor: colors.secondary,
    borderRadius: 999,
  },
  levelText: {
    ...typography.micro,
    fontSize: 12,
    letterSpacing: 0.4,
    color: colors.onSecondaryContainer,
  },
});
