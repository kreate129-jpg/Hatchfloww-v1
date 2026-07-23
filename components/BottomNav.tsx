import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../constants/theme';

type Tab = 'home' | 'evolution' | 'farm' | 'settings';

type Props = {
  active?: Tab;
  onPress?: (tab: Tab) => void;
};

type TabDef =
  | { id: Tab; label: string; lib: 'material'; icon: keyof typeof MaterialIcons.glyphMap }
  | {
      id: Tab;
      label: string;
      lib: 'community';
      icon: keyof typeof MaterialCommunityIcons.glyphMap;
    };

const TABS: TabDef[] = [
  { id: 'home', label: 'Home', lib: 'material', icon: 'home' },
  { id: 'evolution', label: 'Evolution', lib: 'material', icon: 'pets' },
  { id: 'farm', label: 'Farm', lib: 'community', icon: 'sprout' },
  { id: 'settings', label: 'Settings', lib: 'material', icon: 'settings' },
];

export function BottomNav({ active = 'home', onPress }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {TABS.map((tab) => {
        const selected = tab.id === active;
        const color = selected ? colors.secondary : colors.inkMuted;
        return (
          <Pressable
            key={tab.id}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onPress?.(tab.id)}
            style={styles.item}
          >
            {tab.lib === 'community' ? (
              <MaterialCommunityIcons name={tab.icon} size={24} color={color} />
            ) : (
              <MaterialIcons name={tab.icon} size={24} color={color} />
            )}
            <Text style={[styles.label, { color }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderTopWidth: 2,
    borderTopColor: colors.secondary,
    paddingHorizontal: spacing.lg,
    paddingTop: 8,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    minHeight: 44,
    justifyContent: 'center',
  },
  label: {
    ...typography.micro,
    letterSpacing: 0.3,
  },
});
