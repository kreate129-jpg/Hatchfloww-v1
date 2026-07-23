import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from '../components/BottomNav';
import { DurationPicker } from '../components/DurationPicker';
import { EggStage } from '../components/EggStage';
import { FarmerToast, farmerComingSoon, pickFarmerMessage, type FarmerNotice } from '../components/FarmerToast';
import { HomeHeader } from '../components/HomeHeader';
import { StatsBar } from '../components/StatsBar';
import { TimerControls } from '../components/TimerControls';
import { TimerDisplay } from '../components/TimerDisplay';
import { colors, radii, spacing } from '../constants/theme';
import { PHASE_LABELS, phaseForProgress } from '../constants/stages';
import { useTimer } from '../hooks/useTimer';
import { pauseForest, playHatchComplete, startForest, stopForest } from '../lib/audio';
import {
  DEFAULT_LEVEL,
  loadAndRecordHatch,
  loadLevelState,
} from '../lib/level';
import {
  cancelHatchNotification,
  scheduleHatchNotification,
} from '../lib/notifications';
import {
  formatFocusTime,
  loadAndRecordFocusStats,
  loadFocusStats,
} from '../lib/stats';

export default function TimerScreen() {
  const crowPlayedRef = useRef(false);
  const prevStatusRef = useRef<'idle' | 'running' | 'paused' | 'completed'>('idle');
  const durationRef = useRef(25 * 60_000);
  const [level, setLevel] = useState(DEFAULT_LEVEL);
  const [hatched, setHatched] = useState(0);
  const [totalFocusMs, setTotalFocusMs] = useState(0);
  const [farmerNotice, setFarmerNotice] = useState<FarmerNotice | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      void Promise.all([loadLevelState(), loadFocusStats()]).then(
        ([levelState, stats]) => {
          if (cancelled) return;
          setLevel(levelState.level);
          setHatched(stats.hatched);
          setTotalFocusMs(stats.totalFocusMs);
        },
      );
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const handleComplete = useCallback(() => {
    stopForest();
    if (!crowPlayedRef.current) {
      crowPlayedRef.current = true;
      void playHatchComplete();
    }
    void cancelHatchNotification();
    const durationMs = durationRef.current;
    void loadAndRecordHatch().then((s) => setLevel(s.level));
    void loadAndRecordFocusStats(durationMs).then((s) => {
      setHatched(s.hatched);
      setTotalFocusMs(s.totalFocusMs);
    });
  }, []);

  const timer = useTimer({
    onComplete: handleComplete,
    onSchedule: (endsAt) => {
      void scheduleHatchNotification(endsAt);
    },
    onCancelSchedule: () => {
      void cancelHatchNotification();
    },
  });

  durationRef.current = timer.durationMs;

  const phase = phaseForProgress(timer.progress);

  useEffect(() => {
    if (timer.ready && timer.status === 'completed' && !crowPlayedRef.current) {
      crowPlayedRef.current = true;
      stopForest();
      void playHatchComplete();
    }
  }, [timer.ready, timer.status]);

  useEffect(() => {
    if (timer.status === 'idle' || timer.status === 'running') {
      crowPlayedRef.current = false;
      setFarmerNotice((prev) => (prev?.variant === 'card' ? prev : null));
    }
  }, [timer.status]);

  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = timer.status;
    if (
      timer.ready &&
      timer.status === 'completed' &&
      (prev === 'running' || prev === 'paused')
    ) {
      setFarmerNotice({ message: pickFarmerMessage() });
    }
  }, [timer.ready, timer.status]);

  // Forest loop while running; pause on pause; stop when idle/done.
  useEffect(() => {
    if (!timer.ready) return;
    if (timer.status === 'running') {
      void startForest();
      return;
    }
    if (timer.status === 'paused') {
      pauseForest();
      return;
    }
    stopForest();
  }, [timer.ready, timer.status]);

  if (!timer.ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.secondary} size="large" />
      </View>
    );
  }

  const pickerDisabled = timer.status === 'running';
  const caption =
    timer.status === 'completed'
      ? 'Hatched!'
      : timer.status === 'paused'
        ? 'Paused'
        : PHASE_LABELS[phase];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <HomeHeader level={level} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.timerFrame}>
          <EggStage phase={phase} size={190} />
          <TimerDisplay remainingMs={timer.remainingMs} caption={caption} />
        </View>

        <StatsBar
          timeLabel={formatFocusTime(totalFocusMs)}
          hatched={hatched}
        />

        <TimerControls
          status={timer.status}
          onStart={() => {
            crowPlayedRef.current = false;
            timer.start();
          }}
          onPause={timer.pause}
          onResume={timer.resume}
          onReset={() => {
            crowPlayedRef.current = false;
            timer.reset();
          }}
        />

        <DurationPicker
          durationMs={timer.durationMs}
          disabled={pickerDisabled}
          onChange={timer.setDuration}
        />
      </ScrollView>

      <FarmerToast notice={farmerNotice} onDismiss={() => setFarmerNotice(null)} />

      <BottomNav
        active="home"
        onPress={(tab) => {
          if (tab === 'home') return;
          if (tab === 'settings') {
            router.push('/settings');
            return;
          }
          setFarmerNotice({ message: farmerComingSoon(tab), variant: 'card' });
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    alignItems: 'center',
    gap: spacing.lg,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  timerFrame: {
    width: '100%',
    maxWidth: 320,
    aspectRatio: 1,
    backgroundColor: colors.tertiaryContainer,
    borderRadius: radii.squircle,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
});
