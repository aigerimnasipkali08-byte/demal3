import { useState, useEffect, useCallback } from 'react';
import { PostureTimerState, ExerciseType } from '../types/pose';
import { audioService } from '../services/audioService';

export function usePostureTimer(initialWorkMinutes = 20) {
  const [timerState, setTimerState] = useState<PostureTimerState>({
    workDurationMinutes: initialWorkMinutes,
    timeRemainingSeconds: initialWorkMinutes * 60,
    isLocked: false,
    isPaused: false,
    snoozeCount: 0,
    completedSessions: 0,
    selectedExercise: 'scapular_squeeze',
    targetReps: 5,
  });

  // Countdown timer effect
  useEffect(() => {
    if (timerState.isPaused || timerState.isLocked) return;

    const interval = setInterval(() => {
      setTimerState((prev) => {
        if (prev.timeRemainingSeconds <= 1) {
          // Trigger screen lock!
          triggerLock();
          return {
            ...prev,
            timeRemainingSeconds: 0,
            isLocked: true,
          };
        }
        return {
          ...prev,
          timeRemainingSeconds: prev.timeRemainingSeconds - 1,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerState.isPaused, timerState.isLocked]);

  // Sync Electron window lock mode if Electron API is present
  const triggerLock = useCallback(() => {
    if (window.postureLockAPI?.setLockMode) {
      window.postureLockAPI.setLockMode(true);
    }
  }, []);

  const triggerUnlock = useCallback(() => {
    audioService.playUnlockFanfare();
    if (window.postureLockAPI?.setLockMode) {
      window.postureLockAPI.setLockMode(false);
    }
    setTimerState((prev) => ({
      ...prev,
      isLocked: false,
      timeRemainingSeconds: prev.workDurationMinutes * 60,
      completedSessions: prev.completedSessions + 1,
    }));
  }, []);

  const setWorkDuration = useCallback((minutes: number) => {
    setTimerState((prev) => ({
      ...prev,
      workDurationMinutes: minutes,
      timeRemainingSeconds: minutes * 60,
    }));
  }, []);

  const setSelectedExercise = useCallback((exercise: ExerciseType) => {
    setTimerState((prev) => ({
      ...prev,
      selectedExercise: exercise,
    }));
  }, []);

  const setTargetReps = useCallback((reps: number) => {
    setTimerState((prev) => ({
      ...prev,
      targetReps: reps,
    }));
  }, []);

  const togglePause = useCallback(() => {
    setTimerState((prev) => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  }, []);

  const snooze = useCallback((addMinutes = 5) => {
    if (window.postureLockAPI?.setLockMode) {
      window.postureLockAPI.setLockMode(false);
    }
    setTimerState((prev) => ({
      ...prev,
      isLocked: false,
      snoozeCount: prev.snoozeCount + 1,
      timeRemainingSeconds: addMinutes * 60,
    }));
  }, []);

  const simulateLockNow = useCallback(() => {
    setTimerState((prev) => ({
      ...prev,
      isLocked: true,
      timeRemainingSeconds: 0,
    }));
    triggerLock();
  }, [triggerLock]);

  return {
    timerState,
    setWorkDuration,
    setSelectedExercise,
    setTargetReps,
    togglePause,
    snooze,
    triggerUnlock,
    simulateLockNow,
  };
}
