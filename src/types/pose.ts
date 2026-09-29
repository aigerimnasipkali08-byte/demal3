export interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export type ExerciseType = 'scapular_squeeze' | 'neck_tilt' | 'chin_tuck';

export interface ExerciseDefinition {
  id: ExerciseType;
  name: string;
  description: string;
  targetReps: number;
  instructions: string[];
  holdDurationSeconds?: number;
  iconName: string;
}

export interface PoseAnalysisResult {
  exercise: ExerciseType;
  isFormValid: boolean;
  isInPosition: boolean;
  isRepCounted: boolean;
  currentReps: number;
  targetReps: number;
  holdProgress: number; // 0.0 to 1.0 (for exercises requiring hold, like scapular squeeze)
  feedbackMessage: string;
  errorMessage?: string;
  metrics: {
    scapularDistanceRatio?: number;
    neckRollAngleDeg?: number;
    neckTiltDirection?: 'left' | 'right' | 'center';
    headPitchRatio?: number;
    shoulderVisibility: boolean;
  };
}

export interface PostureTimerState {
  workDurationMinutes: number;
  timeRemainingSeconds: number;
  isLocked: boolean;
  isPaused: boolean;
  snoozeCount: number;
  completedSessions: number;
  selectedExercise: ExerciseType;
  targetReps: number;
}

export interface MediaPipeLandmarks {
  NOSE: 0;
  LEFT_EYE_INNER: 1;
  LEFT_EYE: 2;
  LEFT_EYE_OUTER: 3;
  RIGHT_EYE_INNER: 4;
  RIGHT_EYE: 5;
  RIGHT_EYE_OUTER: 6;
  LEFT_EAR: 7;
  RIGHT_EAR: 8;
  MOUTH_LEFT: 9;
  MOUTH_RIGHT: 10;
  LEFT_SHOULDER: 11;
  RIGHT_SHOULDER: 12;
  LEFT_ELBOW: 13;
  RIGHT_ELBOW: 14;
  LEFT_WRIST: 15;
  RIGHT_WRIST: 16;
  LEFT_PINKY: 17;
  RIGHT_PINKY: 18;
  LEFT_INDEX: 19;
  RIGHT_INDEX: 20;
  LEFT_THUMB: 21;
  RIGHT_THUMB: 22;
  LEFT_HIP: 23;
  RIGHT_HIP: 24;
}

declare global {
  interface Window {
    postureLockAPI?: {
      setLockMode: (locked: boolean) => Promise<boolean>;
      isElectron: boolean;
    };
  }
}
