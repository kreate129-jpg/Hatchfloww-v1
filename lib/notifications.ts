import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';

const CHANNEL_ID = 'hatch-complete';
const NOTIFICATION_ID = 'hatchflow-timer-complete';

/**
 * expo-notifications was removed from Expo Go on Android (SDK 53+).
 * Skip all notification APIs in Expo Go; use a development build to test them.
 */
type NotificationsModule = typeof import('expo-notifications');

let notifications: NotificationsModule | null = null;
let handlerReady = false;

async function getNotifications(): Promise<NotificationsModule | null> {
  if (isRunningInExpoGo()) return null;
  if (notifications) return notifications;
  try {
    notifications = await import('expo-notifications');
    if (!handlerReady) {
      notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
      handlerReady = true;
    }
    return notifications;
  } catch {
    return null;
  }
}

export async function ensureNotificationPermissions(): Promise<boolean> {
  const Notifications = await getNotifications();
  if (!Notifications) return false;
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const asked = await Notifications.requestPermissionsAsync();
    return asked.granted;
  } catch {
    return false;
  }
}

export async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  const Notifications = await getNotifications();
  if (!Notifications) return;
  try {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Hatch complete',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'kokarokoo.wav',
      vibrationPattern: [0, 250, 120, 250],
      lightColor: '#F4A261',
    });
  } catch {
    // unsupported environment — ignore
  }
}

export async function scheduleHatchNotification(endsAt: number): Promise<string | null> {
  const Notifications = await getNotifications();
  if (!Notifications) return null;

  try {
    const granted = await ensureNotificationPermissions();
    if (!granted) return null;

    await ensureAndroidChannel();
    await cancelHatchNotification();

    const seconds = Math.max(1, Math.ceil((endsAt - Date.now()) / 1000));

    return await Notifications.scheduleNotificationAsync({
      identifier: NOTIFICATION_ID,
      content: {
        title: 'HatchFlow',
        body: 'Your egg hatched! Kokarokoo!',
        sound: 'kokarokoo.wav',
        ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
        channelId: CHANNEL_ID,
      },
    });
  } catch {
    return null;
  }
}

export async function cancelHatchNotification(): Promise<void> {
  const Notifications = await getNotifications();
  if (!Notifications) return;
  await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_ID).catch(() => undefined);
  await Notifications.cancelAllScheduledNotificationsAsync().catch(() => undefined);
}
