import AsyncStorage from '@react-native-async-storage/async-storage';

export const ONBOARDED_KEY = 'hatchflow.onboarded.v1';

export async function loadOnboarded(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(ONBOARDED_KEY)) === '1';
  } catch {
    return false;
  }
}

export async function setOnboarded(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDED_KEY, '1');
  } catch {
    // ponytail: onboarding flag is best-effort; timer still works without it
  }
}
