# HatchFlow

Gamified focus timer — hatch an egg into a chicken by finishing your focus session.

## Stack

- **Expo SDK 57** (managed) + Expo Router
- React Native `StyleSheet` (no NativeWind)
- Timestamp-based `useTimer` (AsyncStorage + AppState)
- `expo-audio` + `expo-notifications` for completion alerts
- Local-only progress (level, stats, modes) on device

## Run

```bash
npm install --legacy-peer-deps
npm start
```

**Expo Go note:** SDK 57 may not be on the App Store Expo Go yet (especially iPhone). If you see “requires a newer version of Expo Go”, use an Android emulator with a matching Expo Go, wait for the store update, or create a [development build](https://docs.expo.dev/develop/development-builds/introduction/). Restart Metro after upgrading: `Ctrl+C`, then `npm start`.

Timer math self-check:

```bash
npm run selfcheck
```

## Asset guide

| Asset | Path | Load |
| --- | --- | --- |
| Hatch sprites (egg, cracked egg, shell cap, chick, chicken) | `assets/images/hatch-*.png` | `Asset.loadAsync` in `app/_layout.tsx` |
| Kokarokoo crow | `assets/audio/kokarokoo.wav` | `preloadCrow()` in `lib/audio.ts` |
| Fonts (optional) | `assets/fonts/*` | `expo-font` `useFonts` in `_layout` |

Replace the generated placeholder PNGs with your final vector exports (512–1024px square PNG/WebP). Keep the same filenames so `constants/stages.ts` does not need changes.

## Background completion

1. On **Start/Resume**, the app persists `endsAt` and schedules a local notification.
2. On **Pause/Reset**, the notification is cancelled.
3. Returning to the foreground recomputes remaining time from `endsAt` (timer never freezes).
4. Reliable lock-screen audio/notifications need a **dev client or store build**, not Expo Go alone.

`app.json` enables `UIBackgroundModes: ["audio"]` and the `expo-audio` / `expo-notifications` config plugins.

## Project layout

```
app/                 Expo Router screens
components/          EggStage, timer UI
hooks/               useTimer
lib/                 audio, notifications, timer math, local persist
constants/           theme + stage assets
assets/              images + audio
```
