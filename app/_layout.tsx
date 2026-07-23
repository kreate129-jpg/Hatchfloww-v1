import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Asset } from 'expo-asset';
import { useFonts } from 'expo-font';
import {
  Quicksand_600SemiBold,
  Quicksand_700Bold,
} from '@expo-google-fonts/quicksand';
import {
  BeVietnamPro_400Regular,
  BeVietnamPro_600SemiBold,
} from '@expo-google-fonts/be-vietnam-pro';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { STAGE_ASSETS } from '../constants/stages';
import { colors } from '../constants/theme';
import { configureAudio, preloadCrow, preloadForest, preloadSuccess } from '../lib/audio';
import { ensureAndroidChannel, ensureNotificationPermissions } from '../lib/notifications';

async function preloadAssets() {
  await Asset.loadAsync([
    ...STAGE_ASSETS,
    require('../assets/images/farmer.png'),
    require('../assets/images/hatchflow-logo.png'),
    require('../assets/images/hatch-egg.png'),
    require('../assets/images/hatch-chick.png'),
    require('../assets/audio/kokarokoo.wav'),
    require('../assets/audio/forest.wav'),
    require('../assets/audio/success.wav'),
  ]);
  await configureAudio();
  await preloadCrow();
  await preloadForest();
  await preloadSuccess();
  await ensureNotificationPermissions();
  await ensureAndroidChannel();
}

export default function RootLayout() {
  const [assetsReady, setAssetsReady] = useState(false);
  const [fontsLoaded, fontError] = useFonts({
    Quicksand_600SemiBold,
    Quicksand_700Bold,
    BeVietnamPro_400Regular,
    BeVietnamPro_600SemiBold,
  });

  useEffect(() => {
    let cancelled = false;
    preloadAssets()
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setAssetsReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const ready = assetsReady && (fontsLoaded || !!fontError);

  if (!ready) {
    return (
      <View style={styles.boot}>
        <StatusBar style="dark" />
        <ActivityIndicator color={colors.secondary} size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <RootNav />
    </GestureHandlerRootView>
  );
}

function RootNav(): ReactNode {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="timer" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
