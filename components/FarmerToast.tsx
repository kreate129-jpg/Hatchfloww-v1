import { useEffect, useRef } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  colors,
  hardShadow,
  hardShadowPressed,
  radii,
  spacing,
  typography,
} from '../constants/theme';

const FARMER = require('../assets/images/farmer.png');

const FARMER_LINES = [
  'Great focus — another one hatched!',
  "Nice work, that egg's a chick now.",
  'The coop\'s getting busy. Well done!',
  'You did it! Keep that streak going.',
  'Another hatch in the books. Proud of you!',
] as const;

const AUTO_DISMISS_MS = 4_500;
const soft = Easing.bezier(0.33, 0, 0.2, 1);

export type FarmerNotice = {
  message: string;
  variant?: 'toast' | 'card';
};

export function pickFarmerMessage(): string {
  return FARMER_LINES[Math.floor(Math.random() * FARMER_LINES.length)];
}

export function farmerComingSoon(tab: string): string {
  const name = tab[0].toUpperCase() + tab.slice(1);
  return `${name} is hatching next — coming soon!`;
}

type Props = {
  notice: FarmerNotice | null;
  onDismiss: () => void;
};

export function FarmerToast({ notice, onDismiss }: Props) {
  const insets = useSafeAreaInsets();
  const visible = useSharedValue(0);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  const variant = notice?.variant ?? 'toast';
  const message = notice?.message ?? null;

  const dismiss = () => {
    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current);
      dismissTimer.current = null;
    }
    cancelAnimation(visible);
    visible.value = withTiming(0, { duration: 220, easing: soft }, (done) => {
      if (done) onDismissRef.current();
    });
  };

  useEffect(() => {
    if (!message) {
      visible.value = 0;
      if (dismissTimer.current) {
        clearTimeout(dismissTimer.current);
        dismissTimer.current = null;
      }
      return;
    }

    cancelAnimation(visible);
    visible.value = withSpring(1, { damping: 14, stiffness: 160, mass: 0.85 });

    dismissTimer.current = setTimeout(() => {
      dismissTimer.current = null;
      dismiss();
    }, AUTO_DISMISS_MS);

    return () => {
      if (dismissTimer.current) {
        clearTimeout(dismissTimer.current);
        dismissTimer.current = null;
      }
    };
  }, [message, visible]);

  const toastAnimStyle = useAnimatedStyle(() => ({
    opacity: visible.value,
    transform: [
      { translateX: (1 - visible.value) * 120 },
      { scale: 0.92 + visible.value * 0.08 },
    ],
  }));

  const overlayAnimStyle = useAnimatedStyle(() => ({
    opacity: visible.value,
  }));

  const cardAnimStyle = useAnimatedStyle(() => ({
    opacity: visible.value,
    transform: [{ scale: 0.88 + visible.value * 0.12 }],
  }));

  if (!message) return null;

  if (variant === 'card') {
    return (
      <Animated.View pointerEvents="box-none" style={[styles.overlay, overlayAnimStyle]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          style={styles.backdrop}
          onPress={dismiss}
        />
        <Animated.View style={[styles.cardWrap, cardAnimStyle]}>
          <View style={styles.modalCard}>
            <Image source={FARMER} style={styles.modalFarmer} resizeMode="contain" />
            <Text style={styles.modalTitle}>Coming soon</Text>
            <Text style={styles.modalText}>{message}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={dismiss}
              style={({ pressed }) => [
                styles.modalBtn,
                pressed && styles.modalBtnPressed,
              ]}
            >
              <Text style={styles.modalBtnLabel}>Got it</Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.toastWrap,
        { bottom: Math.max(insets.bottom, 8) + 72 },
        toastAnimStyle,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss farmer message"
        onPress={dismiss}
        style={({ pressed }) => [styles.toastRow, pressed && styles.pressed]}
      >
        <Image source={FARMER} style={styles.farmer} resizeMode="contain" />
        <View style={styles.bubble}>
          <Text style={styles.text}>{message}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toastWrap: {
    position: 'absolute',
    right: spacing.md,
    left: spacing.md,
    zIndex: 20,
    alignItems: 'flex-end',
  },
  toastRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
    maxWidth: 340,
  },
  farmer: {
    width: 72,
    height: 88,
  },
  bubble: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.secondary,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    boxShadow: `3px 3px 0px 0px ${colors.secondary}`,
  },
  text: {
    ...typography.body,
    color: colors.ink,
    lineHeight: 22,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 30,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(28, 28, 24, 0.45)',
  },
  cardWrap: {
    width: '100%',
    maxWidth: 340,
    zIndex: 1,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    ...hardShadow,
  },
  modalFarmer: {
    width: 120,
    height: 146,
    marginBottom: spacing.xs,
  },
  modalTitle: {
    ...typography.headline,
    color: colors.secondary,
    textAlign: 'center',
  },
  modalText: {
    ...typography.body,
    color: colors.inkMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  modalBtn: {
    marginTop: spacing.sm,
    width: '100%',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: colors.primaryContainer,
    ...hardShadow,
  },
  modalBtnPressed: {
    ...hardShadowPressed,
  },
  modalBtnLabel: {
    ...typography.label,
    color: colors.onPrimaryContainer,
    fontSize: 16,
  },
  pressed: {
    opacity: 0.9,
  },
});
