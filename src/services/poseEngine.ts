import { NormalizedLandmark, PoseAnalysisResult, ExerciseType } from '../types/pose';
import { audioService } from './audioService';

/**
 * Core Pose Engine for PostureLock MVP
 * Calculates 3D landmark geometry, angle vectors, hold durations, and error detection.
 * 100% Client-side and Privacy-preserving.
 */
export class PoseEngine {
  private activeExercise: ExerciseType = 'scapular_squeeze';
  private currentReps = 0;
  private targetReps = 5;

  // Hold timer state for Scapular Squeeze & Chin Tuck
  private holdStartTime: number | null = null;
  private REQUIRED_HOLD_TIME_MS = 1500; // 1.5 seconds hold
  private holdProgress = 0;
  private lastHoldTick = 0;

  // Neck tilt state machine tracker
  private neckTiltState: 'center' | 'tilted_left' | 'returned_from_left' | 'tilted_right' = 'center';
  private hasTiltedLeft = false;
  private hasTiltedRight = false;

  // Cooldown / debounce for rep registration
  private lastRepTimestamp = 0;
  private REP_COOLDOWN_MS = 1200;

  constructor(exercise: ExerciseType = 'scapular_squeeze', targetReps = 5) {
    this.activeExercise = exercise;
    this.targetReps = targetReps;
  }

  public setExercise(exercise: ExerciseType, targetReps = 5) {
    this.activeExercise = exercise;
    this.targetReps = targetReps;
    this.reset();
  }

  public reset() {
    this.currentReps = 0;
    this.holdStartTime = null;
    this.holdProgress = 0;
    this.neckTiltState = 'center';
    this.hasTiltedLeft = false;
    this.hasTiltedRight = false;
  }

  /**
   * Main entry point to analyze a frame's pose landmarks.
   */
  public analyzeFrame(landmarks: NormalizedLandmark[]): PoseAnalysisResult {
    const now = Date.now();

    // 1. Initial Visibility & Distance Check
    const qualityCheck = this.validateLandmarkQuality(landmarks);
    if (!qualityCheck.isValid) {
      this.holdStartTime = null;
      this.holdProgress = 0;
      return {
        exercise: this.activeExercise,
        isFormValid: false,
        isInPosition: false,
        isRepCounted: false,
        currentReps: this.currentReps,
        targetReps: this.targetReps,
        holdProgress: 0,
        feedbackMessage: qualityCheck.feedback,
        errorMessage: qualityCheck.errorMessage,
        metrics: { shoulderVisibility: qualityCheck.shoulderVisibility },
      };
    }

    // Dispatch to specific exercise geometry evaluation logic
    switch (this.activeExercise) {
      case 'scapular_squeeze':
        return this.evaluateScapularSqueeze(landmarks, now);
      case 'neck_tilt':
        return this.evaluateNeckTilt(landmarks, now);
      case 'chin_tuck':
        return this.evaluateChinTuck(landmarks, now);
      default:
        return this.evaluateScapularSqueeze(landmarks, now);
    }
  }

  /**
   * Landmark quality & bounding box check (Error Mode: frame position warnings)
   */
  private validateLandmarkQuality(landmarks: NormalizedLandmark[]): {
    isValid: boolean;
    shoulderVisibility: boolean;
    feedback: string;
    errorMessage?: string;
  } {
    if (!landmarks || landmarks.length < 33) {
      return {
        isValid: false,
        shoulderVisibility: false,
        feedback: 'No body detected in frame',
        errorMessage: 'Step in front of the camera so upper body is visible.',
      };
    }

    const nose = landmarks[0];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];

    const leftVisibility = leftShoulder.visibility ?? 1.0;
    const rightVisibility = rightShoulder.visibility ?? 1.0;
    const noseVisibility = nose.visibility ?? 1.0;

    if (leftVisibility < 0.5 || rightVisibility < 0.5 || noseVisibility < 0.5) {
      return {
        isValid: false,
        shoulderVisibility: false,
        feedback: 'Shoulders or head obstructed',
        errorMessage: 'Ensure shoulders and head are clearly visible in webcam.',
      };
    }

    // Check distance / scale: distance between shoulders in normalized screen space
    const shoulderSpan = Math.hypot(
      rightShoulder.x - leftShoulder.x,
      rightShoulder.y - leftShoulder.y
    );

    if (shoulderSpan < 0.15) {
      return {
        isValid: false,
        shoulderVisibility: true,
        feedback: 'Too far from camera',
        errorMessage: 'Move closer to the camera for accurate posture tracking.',
      };
    }

    if (shoulderSpan > 0.8) {
      return {
        isValid: false,
        shoulderVisibility: true,
        feedback: 'Too close to camera',
        errorMessage: 'Step back slightly so your shoulders fit inside frame.',
      };
    }

    return {
      isValid: true,
      shoulderVisibility: true,
      feedback: 'Good positioning',
    };
  }

  /**
   * Scapular Squeeze / Chest Opener Evaluation
   * Requires: Squeezing shoulder blades back, opening chest, holding for 1.5 seconds.
   */
  private evaluateScapularSqueeze(landmarks: NormalizedLandmark[], now: number): PoseAnalysisResult {
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftElbow = landmarks[13];
    const rightElbow = landmarks[14];
    const leftEar = landmarks[7];
    const rightEar = landmarks[8];

    // Calculate shoulder span
    const shoulderWidth = Math.hypot(rightShoulder.x - leftShoulder.x, rightShoulder.y - leftShoulder.y);

    // Calculate elbow expansion ratio (elbows pulled out and back)
    const elbowSpan = Math.hypot(rightElbow.x - leftElbow.x, rightElbow.y - leftElbow.y);
    const elbowRatio = elbowSpan / shoulderWidth;

    // Calculate z-depth pull back (elbows z vs shoulders z if depth available, else relative horizontal offset)
    const avgElbowY = (leftElbow.y + rightElbow.y) / 2;
    const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
    const verticalAlignment = Math.abs(avgElbowY - avgShoulderY);

    // Head posture alignment: distance between ears midpoint and shoulders midpoint
    const midEarX = (leftEar.x + rightEar.x) / 2;
    const midShoulderX = (leftShoulder.x + rightShoulder.x) / 2;
    const lateralHeadOffset = Math.abs(midEarX - midShoulderX);

    // Form validation check ("Error Mode Twist")
    if (lateralHeadOffset > shoulderWidth * 0.25) {
      this.holdStartTime = null;
      this.holdProgress = 0;
      return {
        exercise: 'scapular_squeeze',
        isFormValid: false,
        isInPosition: false,
        isRepCounted: false,
        currentReps: this.currentReps,
        targetReps: this.targetReps,
        holdProgress: 0,
        feedbackMessage: 'Center your head over shoulders',
        errorMessage: 'Do not lean sideways while squeezing shoulder blades!',
        metrics: { scapularDistanceRatio: elbowRatio, shoulderVisibility: true },
      };
    }

    // Threshold check for Squeeze pose: elbows pulled back (ratio >= 1.35) and level with lower chest
    const isSqueezing = elbowRatio >= 1.32 && verticalAlignment < 0.25;

    let isRepCounted = false;
    let feedbackMessage = 'Pull elbows back & squeeze shoulder blades';
    let errorMessage: string | undefined = undefined;

    if (isSqueezing) {
      if (this.holdStartTime === null) {
        this.holdStartTime = now;
      }

      const elapsed = now - this.holdStartTime;
      this.holdProgress = Math.min(1.0, elapsed / this.REQUIRED_HOLD_TIME_MS);

      // Play subtle tick audio every 400ms during hold
      if (now - this.lastHoldTick > 400 && this.holdProgress < 1.0) {
        audioService.playHoldTick();
        this.lastHoldTick = now;
      }

      if (elapsed >= this.REQUIRED_HOLD_TIME_MS) {
        if (now - this.lastRepTimestamp > this.REP_COOLDOWN_MS) {
          this.currentReps += 1;
          this.lastRepTimestamp = now;
          isRepCounted = true;
          audioService.playRepSuccess();
          feedbackMessage = `REP COMPLETED! (${this.currentReps}/${this.targetReps})`;
        } else {
          feedbackMessage = 'Release squeeze and prepare for next rep';
        }
        this.holdStartTime = null;
        this.holdProgress = 0;
      } else {
        const remainingSec = ((this.REQUIRED_HOLD_TIME_MS - elapsed) / 1000).toFixed(1);
        feedbackMessage = `HOLD POSITION! ${remainingSec}s remaining`;
      }
    } else {
      // Squeeze broke or not deep enough
      if (this.holdStartTime !== null) {
        audioService.playErrorTone();
        errorMessage = 'Squeeze released too early! Hold continuous squeeze for 1.5s.';
      } else if (elbowRatio < 1.15) {
        errorMessage = 'Pull elbows wider and draw shoulders backward.';
      }

      this.holdStartTime = null;
      this.holdProgress = 0;
    }

    return {
      exercise: 'scapular_squeeze',
      isFormValid: isSqueezing,
      isInPosition: isSqueezing,
      isRepCounted,
      currentReps: this.currentReps,
      targetReps: this.targetReps,
      holdProgress: this.holdProgress,
      feedbackMessage,
      errorMessage,
      metrics: {
        scapularDistanceRatio: parseFloat(elbowRatio.toFixed(2)),
        shoulderVisibility: true,
      },
    };
  }

  /**
   * Neck Rotations / Head Tilts Evaluation
   * Requires: Tilt head to Left (>= 22 deg), return to center, then tilt Right (>= 22 deg), return to center = 1 Rep.
   */
  private evaluateNeckTilt(landmarks: NormalizedLandmark[], now: number): PoseAnalysisResult {
    const leftEar = landmarks[7];
    const rightEar = landmarks[8];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];

    // Ear angle in degrees
    const deltaY = rightEar.y - leftEar.y;
    const deltaX = rightEar.x - leftEar.x;
    const rawEarAngleRad = Math.atan2(deltaY, deltaX);
    const earAngleDeg = (rawEarAngleRad * 180) / Math.PI;

    // Shoulder angle to adjust for camera level tilt
    const shoulderDeltaY = rightShoulder.y - leftShoulder.y;
    const shoulderDeltaX = rightShoulder.x - leftShoulder.x;
    const shoulderAngleDeg = (Math.atan2(shoulderDeltaY, shoulderDeltaX) * 180) / Math.PI;

    // Relative head tilt angle (0 is upright)
    const neckRollAngle = earAngleDeg - shoulderAngleDeg;

    const TILT_THRESHOLD_DEG = 18; // Minimum angle for valid tilt
    const CENTER_THRESHOLD_DEG = 7; // Return to center angle

    let isRepCounted = false;
    let feedbackMessage = 'Tilt head left, hold, then right';
    let errorMessage: string | undefined = undefined;
    let currentDirection: 'left' | 'right' | 'center' = 'center';

    // Positive angle = tilting to right side of camera, negative angle = tilting to left side
    if (neckRollAngle > TILT_THRESHOLD_DEG) {
      currentDirection = 'right';
    } else if (neckRollAngle < -TILT_THRESHOLD_DEG) {
      currentDirection = 'left';
    } else if (Math.abs(neckRollAngle) < CENTER_THRESHOLD_DEG) {
      currentDirection = 'center';
    }

    // State machine transitions for complete left-to-right tilt cycle
    if (currentDirection === 'left' && !this.hasTiltedLeft) {
      this.hasTiltedLeft = true;
      audioService.playHoldTick();
      feedbackMessage = 'Great Left Tilt! Now return head to center.';
    } else if (currentDirection === 'right' && !this.hasTiltedRight) {
      this.hasTiltedRight = true;
      audioService.playHoldTick();
      feedbackMessage = 'Great Right Tilt! Now return head to center.';
    }

    // Check if both sides completed and returned to center
    if (this.hasTiltedLeft && this.hasTiltedRight && currentDirection === 'center') {
      if (now - this.lastRepTimestamp > this.REP_COOLDOWN_MS) {
        this.currentReps += 1;
        this.lastRepTimestamp = now;
        isRepCounted = true;
        this.hasTiltedLeft = false;
        this.hasTiltedRight = false;
        audioService.playRepSuccess();
        feedbackMessage = `REP COMPLETED! (${this.currentReps}/${this.targetReps})`;
      }
    } else {
      // Error mode guidance for incomplete movement
      if (this.hasTiltedLeft && !this.hasTiltedRight) {
        if (currentDirection === 'left') {
          errorMessage = 'Bring head back up to center before tilting right.';
        } else {
          feedbackMessage = `Left side done! Now tilt head to the RIGHT side.`;
        }
      } else if (!this.hasTiltedLeft && this.hasTiltedRight) {
        if (currentDirection === 'right') {
          errorMessage = 'Bring head back up to center before tilting left.';
        } else {
          feedbackMessage = `Right side done! Now tilt head to the LEFT side.`;
        }
      } else if (Math.abs(neckRollAngle) > 40) {
        errorMessage = 'Extreme tilt! Move gently without straining your neck.';
      } else if (Math.abs(neckRollAngle) < 10 && !this.hasTiltedLeft && !this.hasTiltedRight) {
        feedbackMessage = 'Slowly tilt your left ear towards your left shoulder...';
      }
    }

    const progressRatio = ((this.hasTiltedLeft ? 0.5 : 0) + (this.hasTiltedRight ? 0.5 : 0));

    return {
      exercise: 'neck_tilt',
      isFormValid: Math.abs(neckRollAngle) >= TILT_THRESHOLD_DEG || this.hasTiltedLeft || this.hasTiltedRight,
      isInPosition: Math.abs(neckRollAngle) >= 10,
      isRepCounted,
      currentReps: this.currentReps,
      targetReps: this.targetReps,
      holdProgress: progressRatio,
      feedbackMessage,
      errorMessage,
      metrics: {
        neckRollAngleDeg: parseFloat(neckRollAngle.toFixed(1)),
        neckTiltDirection: currentDirection,
        shoulderVisibility: true,
      },
    };
  }

  /**
   * Chin Tuck / Neck Retraction Evaluation
   * Retracting chin backward to align cervical spine, holding for 1.5 seconds.
   */
  private evaluateChinTuck(landmarks: NormalizedLandmark[], now: number): PoseAnalysisResult {
    const nose = landmarks[0];
    const leftEar = landmarks[7];
    const rightEar = landmarks[8];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];

    const shoulderSpan = Math.hypot(rightShoulder.x - leftShoulder.x, rightShoulder.y - leftShoulder.y);
    const midEarY = (leftEar.y + rightEar.y) / 2;
    const midShoulderY = (leftShoulder.y + rightShoulder.y) / 2;

    // Pitch ratio: nose relative to ears/shoulders vertical stack
    const pitchOffset = (nose.y - midEarY) / shoulderSpan;
    const isRetracted = pitchOffset > 0.12 && pitchOffset < 0.38;

    let isRepCounted = false;
    let feedbackMessage = 'Glide head straight back (chin tuck)';
    let errorMessage: string | undefined = undefined;

    if (isRetracted) {
      if (this.holdStartTime === null) {
        this.holdStartTime = now;
      }

      const elapsed = now - this.holdStartTime;
      this.holdProgress = Math.min(1.0, elapsed / this.REQUIRED_HOLD_TIME_MS);

      if (now - this.lastHoldTick > 400 && this.holdProgress < 1.0) {
        audioService.playHoldTick();
        this.lastHoldTick = now;
      }

      if (elapsed >= this.REQUIRED_HOLD_TIME_MS) {
        if (now - this.lastRepTimestamp > this.REP_COOLDOWN_MS) {
          this.currentReps += 1;
          this.lastRepTimestamp = now;
          isRepCounted = true;
          audioService.playRepSuccess();
          feedbackMessage = `CHIN TUCK COMPLETED! (${this.currentReps}/${this.targetReps})`;
        }
        this.holdStartTime = null;
        this.holdProgress = 0;
      } else {
        const remainingSec = ((this.REQUIRED_HOLD_TIME_MS - elapsed) / 1000).toFixed(1);
        feedbackMessage = `HOLD CHIN TUCK! ${remainingSec}s`;
      }
    } else {
      if (pitchOffset <= 0.12) {
        errorMessage = 'Tuck chin downward and retract head backward without tilting down.';
      } else if (pitchOffset >= 0.38) {
        errorMessage = 'Keep eyes looking forward, don\'t look down at the floor.';
      }
      this.holdStartTime = null;
      this.holdProgress = 0;
    }

    return {
      exercise: 'chin_tuck',
      isFormValid: isRetracted,
      isInPosition: isRetracted,
      isRepCounted,
      currentReps: this.currentReps,
      targetReps: this.targetReps,
      holdProgress: this.holdProgress,
      feedbackMessage,
      errorMessage,
      metrics: {
        headPitchRatio: parseFloat(pitchOffset.toFixed(2)),
        shoulderVisibility: true,
      },
    };
  }
}
