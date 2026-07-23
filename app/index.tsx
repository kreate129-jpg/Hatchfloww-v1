import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Redirect } from 'expo-router';
import { colors } from '../constants/theme';
import { loadOnboarded } from '../lib/onboarding';

export default function Index() {
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadOnboarded()
      .then((value) => {
        if (!cancelled) setOnboarded(value);
      })
      .catch(() => {
        if (!cancelled) setOnboarded(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (onboarded === null) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.secondary} size="large" />
      </View>
    );
  }

  return <Redirect href={onboarded ? '/timer' : '/onboarding'} />;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
